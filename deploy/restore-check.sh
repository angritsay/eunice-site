#!/usr/bin/env bash
# Proves the latest backup restores: loads it into a throwaway Postgres and counts the
# rows in every table. A backup that has never been restored is a hope, not a backup.
#
# usage: restore-check.sh <s3://bucket/prefix | file:///dir> [--match-live]
#   --match-live  also require each count to equal the live database's (only meaningful
#                 when nothing is writing, as in CI right after the backup)
set -euo pipefail

TARGET=${1:?target}
MATCH_LIVE=${2:-}
PROJECT=${COMPOSE_PROJECT:-eunice}
IMAGE=postgres:18.6-alpine
NAME=eunice-restore-check-$$
dump=$(mktemp)
trap 'rm -f "$dump"; docker rm -f "$NAME" >/dev/null 2>&1 || true' EXIT

case "$TARGET" in
  s3://*)
    latest=$(aws s3 ls "$TARGET/" | awk '{print $4}' | grep '\.dump$' | sort | tail -n 1)
    aws s3 cp --only-show-errors "$TARGET/$latest" "$dump" ;;
  file://*)
    latest=$(find "${TARGET#file://}" -maxdepth 1 -name '*.dump' -printf '%f\n' | sort | tail -n 1)
    cp "${TARGET#file://}/$latest" "$dump" ;;
  *) echo "unknown target: $TARGET" >&2; exit 2 ;;
esac
test -n "$latest"

docker run -d --rm --name "$NAME" -e POSTGRES_PASSWORD=check -e POSTGRES_DB=eunice "$IMAGE" >/dev/null
until docker exec "$NAME" pg_isready -U postgres -d eunice >/dev/null 2>&1; do sleep 1; done
sleep 2
# Ownership and grants name roles that exist only in production; the data is what counts.
docker exec -i "$NAME" pg_restore -U postgres -d eunice --no-owner --no-privileges --exit-on-error < "$dump"

count_sql="select table_schema || '.' || table_name from information_schema.tables
           where table_schema in ('intake','notifier','umami') and table_type = 'BASE TABLE' order by 1"
tables=$(docker exec "$NAME" psql -U postgres -d eunice -Atc "$count_sql")
for schema in intake notifier umami; do
  grep -q "^$schema\." <<<"$tables" || { echo "restore is missing schema $schema" >&2; exit 1; }
done

status=0
for t in $tables; do
  restored=$(docker exec "$NAME" psql -U postgres -d eunice -Atc "select count(*) from $t")
  line="$t: $restored rows"
  if [ "$MATCH_LIVE" = "--match-live" ]; then
    live=$(docker compose --project-name "$PROJECT" exec -T postgres psql -U postgres -d eunice -Atc "select count(*) from $t")
    line="$line (live $live)"
    [ "$restored" = "$live" ] || status=1
  fi
  echo "$line"
done
[ $status -eq 0 ] && echo "restore of $latest verified" || echo "restore of $latest does not match the live database" >&2
exit $status
