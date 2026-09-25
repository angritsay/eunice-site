#!/usr/bin/env bash
# Runs on the instance, sent by the deploy workflow through SSM Run Command.
# Fetches one release, renders its environment, pulls its images and brings the stack to
# it. compose applies the migrations first (one-shot jobs, as the schema owners) and
# starts each service only once what it depends on is healthy; --wait fails the deploy
# if anything does not become healthy.
#
# usage: deploy.sh <release> <bucket> <intake image@digest> <notifier image@digest>
set -euo pipefail

RELEASE=${1:?release}
BUCKET=${2:?bucket}
INTAKE_IMAGE=${3:?intake image}
NOTIFIER_IMAGE=${4:?notifier image}
HOME_DIR=/opt/eunice-site
DIR=$HOME_DIR/releases/$RELEASE

install -d -m 0750 "$HOME_DIR/releases"
rm -rf "$DIR" && install -d -m 0750 "$DIR"
aws s3 cp --only-show-errors "s3://$BUCKET/releases/$RELEASE.tgz" - | tar -xz -C "$DIR"

umask 077
"$DIR/deploy/render-env.sh" "$RELEASE" "$INTAKE_IMAGE" "$NOTIFIER_IMAGE" > "$HOME_DIR/.env.next"
mv "$HOME_DIR/.env.next" "$HOME_DIR/.env"

registry=${INTAKE_IMAGE%%/*}
aws ecr get-login-password | docker login --username AWS --password-stdin "$registry" >/dev/null

compose=(docker compose --project-name eunice --env-file "$HOME_DIR/.env" -f "$DIR/deploy/compose.prod.yaml")
"${compose[@]}" pull --quiet
"${compose[@]}" up --detach --wait --wait-timeout 300 --remove-orphans

ln -sfn "$DIR" "$HOME_DIR/current"
install -m 0644 "$DIR"/deploy/systemd/*.service "$DIR"/deploy/systemd/*.timer /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now eunice-backup.timer eunice-restore-check.timer

# Keep the five most recent releases, for rollback without S3.
find "$HOME_DIR/releases" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' | sort -rn | tail -n +6 | cut -d' ' -f2- | xargs -r rm -rf
docker image prune --force >/dev/null
echo "deployed $RELEASE"
