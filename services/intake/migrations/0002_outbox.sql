-- Events waiting to be published. A row is written in the same transaction as the
-- change it announces and deleted once the broker has it, so personal data in a
-- payload lives here only until delivery.
create table intake.outbox (
  id          uuid        primary key,
  subject     text        not null,
  event_type  text        not null,
  payload     jsonb       not null,
  traceparent text,
  created_at  timestamptz not null default now()
);

create index outbox_created_at on intake.outbox (created_at);

-- The service writes events; the relay reads and deletes them once published.
grant select, insert, delete on intake.outbox to intake_app;
