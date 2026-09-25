#!/usr/bin/env bash
# Dumps the database (every schema, in Postgres's compressed custom format) and stores it
# at the target: s3://bucket/prefix in production (encrypted with KMS), or file:///dir in
# CI. Roles and passwords are not in the dump; infra/postgres/roles.sql recreates them.
#
# usage: backup.sh <s3://bucket/prefix | file:///dir>
set -euo pipefail

TARGET=${1:?target}
PROJECT=${COMPOSE_PROJECT:-eunice}
NAME="eunice-$(date -u +%Y-%m-%dT%H%M%SZ).dump"
dump=$(mktemp)
trap 'rm -f "$dump"' EXIT

docker compose --project-name "$PROJECT" exec -T postgres pg_dump -U postgres -d eunice --format=custom > "$dump"
test -s "$dump"

case "$TARGET" in
  s3://*) aws s3 cp --only-show-errors --sse aws:kms "$dump" "$TARGET/$NAME" ;;
  file://*) install -d "${TARGET#file://}" && cp "$dump" "${TARGET#file://}/$NAME" ;;
  *) echo "unknown target: $TARGET" >&2; exit 2 ;;
esac
echo "backed up $(du -h "$dump" | cut -f1) to $TARGET/$NAME"
