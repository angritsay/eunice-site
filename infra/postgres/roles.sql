-- One schema per service, and two roles for it:
--   <service>_owner  owns the schema; migrations run as it, and nothing else does.
--   <service>_app    what the running service connects as. It can use the tables its
--                    migrations grant it, and cannot create, alter or drop anything.
-- A service therefore cannot read another service's data, and a compromised service
-- cannot change its own schema. The same script sets up Postgres locally, in CI and
-- in production (run once by an operator with psql; see docs/runbooks).
--
-- psql -v intake_owner_password=... -v intake_app_password=... \
--      -v notifier_owner_password=... -v notifier_app_password=... -f roles.sql
\set ON_ERROR_STOP on

-- Nobody gets to create objects in public; everything lives in a service's schema.
revoke create on schema public from public;

create role intake_owner login password :'intake_owner_password';
create role intake_app login password :'intake_app_password';
create schema intake authorization intake_owner;
grant usage on schema intake to intake_app;

create role notifier_owner login password :'notifier_owner_password';
create role notifier_app login password :'notifier_app_password';
create schema notifier authorization notifier_owner;
grant usage on schema notifier to notifier_app;

-- Table privileges are granted table by table, in the migration that creates the table,
-- so what the service may do to each table is reviewed with the table itself.
