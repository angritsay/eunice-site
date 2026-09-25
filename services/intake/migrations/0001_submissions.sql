-- Form submissions. Personal data: every row has a purge date, and the service deletes
-- rows past it. The idempotency key makes a retried request a no-op, not a duplicate lead.
create table intake.submissions (
  id              uuid primary key default uuidv7(),
  idempotency_key uuid        not null unique,
  fingerprint     text        not null,
  variant         text        not null,
  desk            text        not null,
  queue           text        not null check (queue in ('leads', 'careers')),
  name            text        not null,
  email           text        not null,
  company         text,
  message         text,
  details         jsonb       not null default '{}'::jsonb,
  entry_page      text        not null,
  entry_placement text        not null,
  entry_audience  text,
  entry_role      text,
  referrer        text,
  utm             jsonb,
  received_at     timestamptz not null,
  purge_after     timestamptz not null,
  constraint purge_after_received check (purge_after > received_at)
);

create index submissions_purge_after on intake.submissions (purge_after);
create index submissions_email on intake.submissions (lower(email));

comment on table intake.submissions is 'Form submissions from the site. Personal data; deleted after purge_after.';

-- The service inserts, reads (to answer retries) and deletes (retention, erasure).
-- It never updates: a submission is a record of what was sent.
grant select, insert, delete on intake.submissions to intake_app;
