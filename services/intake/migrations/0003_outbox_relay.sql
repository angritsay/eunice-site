-- The outbox relay claims rows with SELECT ... FOR UPDATE SKIP LOCKED, so two relays
-- never publish the same batch. Postgres requires an UPDATE privilege to take row locks;
-- it is granted on one column that nothing ever updates, so the role still cannot
-- change an event.
grant update (created_at) on intake.outbox to intake_app;
