#!/bin/sh
# Runs once, when the local database is first created (docker-entrypoint-initdb.d).
set -eu
psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -v intake_owner_password="$INTAKE_OWNER_PASSWORD" \
  -v intake_app_password="$INTAKE_APP_PASSWORD" \
  -v notifier_owner_password="$NOTIFIER_OWNER_PASSWORD" \
  -v notifier_app_password="$NOTIFIER_APP_PASSWORD" \
  -f /eunice/roles.sql
