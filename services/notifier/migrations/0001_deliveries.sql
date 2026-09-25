-- Which events have been emailed to ops. Ids and timestamps only: the notifier keeps no
-- personal data. A row older than the broker's de-dup horizon is no longer needed.
create table notifier.deliveries (
  event_id      uuid        primary key,
  submission_id uuid        not null,
  provider_id   text        not null,
  delivered_at  timestamptz not null,
  created_at    timestamptz not null default now()
);

create index deliveries_delivered_at on notifier.deliveries (delivered_at);

grant select, insert, delete on notifier.deliveries to notifier_app;
