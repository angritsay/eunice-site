// NATS JetStream, the way every service uses it: connect, declare what you own, publish
// with the trace attached, consume with retries on a schedule. Services import this
// module rather than the client library, so the conventions live in one place.
import {
  AckPolicy,
  DeliverPolicy,
  type JetStreamClient,
  type JsMsg,
  jetstream,
  jetstreamManager,
  RetentionPolicy,
  StorageType,
} from '@nats-io/jetstream';
import { connect, headers, type MsgHdrs, type NatsConnection, nanos } from '@nats-io/transport-node';
import { context, propagation, ROOT_CONTEXT, SpanKind, SpanStatusCode, trace } from '@opentelemetry/api';
import type { Logger } from './logger.ts';

export type { JetStreamClient, NatsConnection };

export const jetstreamClient = (nc: NatsConnection) => jetstream(nc);

/** Connects and keeps reconnecting for as long as the process lives. */
export const connectNats = (url: string, name: string) =>
  connect({ servers: url, name, maxReconnectAttempts: -1, reconnectTimeWait: 1000 });

export interface StreamSpec {
  name: string;
  subjects: string[];
  /** A message published twice with the same id inside this window is stored once. */
  duplicateWindowMs: number;
  /** Deleted after this even if never consumed, so nothing personal lingers. */
  maxAgeMs: number;
}

/**
 * Declares a work-queue stream, idempotently. A work queue deletes each message as soon
 * as it is acknowledged: the broker holds a message only until it has been handled.
 */
export async function ensureStream(nc: NatsConnection, spec: StreamSpec) {
  const jsm = await jetstreamManager(nc);
  const config = {
    name: spec.name,
    subjects: spec.subjects,
    retention: RetentionPolicy.Workqueue,
    storage: StorageType.File,
    num_replicas: 1,
    duplicate_window: nanos(spec.duplicateWindowMs),
    max_age: nanos(spec.maxAgeMs),
  };
  try {
    await jsm.streams.info(spec.name);
    await jsm.streams.update(spec.name, config);
  } catch {
    await jsm.streams.add(config);
  }
}

const headerSetter = { set: (carrier: MsgHdrs, key: string, value: string) => carrier.set(key, value) };
const headerGetter = {
  get: (carrier: MsgHdrs | undefined, key: string) => carrier?.get(key) || undefined,
  keys: (carrier: MsgHdrs | undefined) => (carrier ? [...carrier.keys()] : []),
};

/**
 * Publishes one event and waits for the stream to store it. The event id is the
 * de-duplication key, so re-publishing after a crash between publish and cleanup is
 * harmless. The span continues the trace saved with the event, however old it is.
 */
export async function publishEvent(
  js: JetStreamClient,
  event: { id: string; subject: string; payload: string; traceparent: string | null },
) {
  const parent = event.traceparent
    ? propagation.extract(ROOT_CONTEXT, { traceparent: event.traceparent })
    : ROOT_CONTEXT;
  const span = trace.getTracer('nats').startSpan(
    `${event.subject} publish`,
    {
      kind: SpanKind.PRODUCER,
      attributes: {
        'messaging.system': 'nats',
        'messaging.operation.type': 'send',
        'messaging.destination.name': event.subject,
        'messaging.message.id': event.id,
      },
    },
    parent,
  );
  const h = headers();
  propagation.inject(trace.setSpan(parent, span), h, headerSetter);
  try {
    const ack = await js.publish(event.subject, event.payload, { msgID: event.id, headers: h });
    if (ack.duplicate) span.setAttribute('messaging.nats.duplicate', true);
    return ack;
  } catch (err) {
    span.setStatus({ code: SpanStatusCode.ERROR, message: err instanceof Error ? err.message : String(err) });
    throw err;
  } finally {
    span.end();
  }
}

export interface ConsumerSpec {
  stream: string;
  durable: string;
  filterSubject: string;
  /** Delays before each redelivery; its length + 1 is the number of attempts. */
  retryDelaysMs: readonly number[];
}

/** What a handler decided about one message. */
export type Handled = 'done' | 'retry' | 'reject';

export interface Delivery {
  data: Uint8Array;
  subject: string;
  /** 1 on the first attempt. */
  attempt: number;
  lastAttempt: boolean;
}

/**
 * Consumes a durable pull consumer until stopped. Each message is handled inside a
 * consumer span that continues the publisher's trace. "retry" redelivers after the next
 * delay in the schedule; "reject" drops the message for good (a message that can never
 * succeed must not block the ones behind it).
 */
export async function consume(
  nc: NatsConnection,
  spec: ConsumerSpec,
  log: Logger,
  handle: (d: Delivery) => Promise<Handled>,
) {
  const jsm = await jetstreamManager(nc);
  await jsm.consumers.add(spec.stream, {
    durable_name: spec.durable,
    filter_subject: spec.filterSubject,
    ack_policy: AckPolicy.Explicit,
    deliver_policy: DeliverPolicy.All,
    ack_wait: nanos(60_000),
    max_deliver: spec.retryDelaysMs.length + 1,
  });
  const consumer = await jetstream(nc).consumers.get(spec.stream, spec.durable);
  const messages = await consumer.consume({ max_messages: 10 });
  const tracer = trace.getTracer('nats');

  const done = (async () => {
    for await (const m of messages) await handleOne(m);
  })();

  async function handleOne(m: JsMsg) {
    const attempt = m.info.deliveryCount;
    const lastAttempt = attempt > spec.retryDelaysMs.length;
    const parent = propagation.extract(ROOT_CONTEXT, m.headers, headerGetter);
    const span = tracer.startSpan(
      `${m.subject} process`,
      {
        kind: SpanKind.CONSUMER,
        attributes: {
          'messaging.system': 'nats',
          'messaging.operation.type': 'process',
          'messaging.destination.name': m.subject,
          'messaging.consumer.group.name': spec.durable,
          'messaging.nats.delivery_count': attempt,
        },
      },
      parent,
    );
    await context.with(trace.setSpan(parent, span), async () => {
      let outcome: Handled;
      try {
        outcome = await handle({ data: m.data, subject: m.subject, attempt, lastAttempt });
      } catch (err) {
        log.error({ err, attempt }, 'message handler failed');
        outcome = 'retry';
      }
      span.setAttribute('messaging.outcome', outcome);
      if (outcome === 'done') m.ack();
      else if (outcome === 'reject' || lastAttempt) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: outcome === 'reject' ? 'rejected' : 'retries exhausted',
        });
        m.term(outcome);
      } else m.nak(spec.retryDelaysMs[attempt - 1]);
      span.end();
    });
  }

  return {
    async stop() {
      messages.stop();
      await done;
    },
  };
}
