#!/usr/bin/env bash
# Writes the environment for compose.prod.yaml to stdout, from SSM Parameter Store.
# Configuration was put there by the CloudFormation stack. Secrets are generated here the
# first time they are needed and stored as SecureString: they are never in git, never in
# GitHub, and never leave AWS.
#
# usage: render-env.sh <release> <intake image@digest> <notifier image@digest>
set -euo pipefail

RELEASE=${1:?release}
INTAKE_IMAGE=${2:?intake image}
NOTIFIER_IMAGE=${3:?notifier image}
PREFIX=/eunice-site/prod
REGION=$(TOKEN=$(curl -fsS -X PUT http://169.254.169.254/latest/api/token -H 'X-aws-ec2-metadata-token-ttl-seconds: 60') \
  && curl -fsS -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/placement/region)
export AWS_REGION=$REGION

config() {
  aws ssm get-parameter --name "$PREFIX/config/$1" --query Parameter.Value --output text
}

# A secret, created on first use. put-parameter without --overwrite cannot replace an
# existing value, so two deploys racing cannot rotate a password under a running database.
secret() {
  local name="$PREFIX/secret/$1" value
  if ! value=$(aws ssm get-parameter --with-decryption --name "$name" --query Parameter.Value --output text 2>/dev/null); then
    value=$(openssl rand -hex 32)
    aws ssm put-parameter --name "$name" --type SecureString --value "$value" >/dev/null
  fi
  printf '%s' "$value"
}

admin_token=$(secret INTAKE_ADMIN_TOKEN)
site_url=$(config SITE_URL)

cat <<ENV
AWS_REGION=$REGION
RELEASE=$RELEASE
INTAKE_IMAGE=$INTAKE_IMAGE
NOTIFIER_IMAGE=$NOTIFIER_IMAGE
API_DOMAIN=$(config API_DOMAIN)
ACME_EMAIL=$(config ACME_EMAIL)
ALLOWED_ORIGINS=$(config ALLOWED_ORIGINS)
OPS_INBOX=$(config OPS_INBOX)
MAIL_FROM="$(config MAIL_FROM)"
SITE_URL=$site_url
SITE_DOMAIN=${site_url#https://}
UMAMI_WEBSITE_ID=$(config UMAMI_WEBSITE_ID)
BACKUP_TARGET=s3://$(config BUCKET)/backups
POSTGRES_PASSWORD=$(secret POSTGRES_PASSWORD)
INTAKE_OWNER_PASSWORD=$(secret INTAKE_OWNER_PASSWORD)
INTAKE_APP_PASSWORD=$(secret INTAKE_APP_PASSWORD)
NOTIFIER_OWNER_PASSWORD=$(secret NOTIFIER_OWNER_PASSWORD)
NOTIFIER_APP_PASSWORD=$(secret NOTIFIER_APP_PASSWORD)
UMAMI_DB_PASSWORD=$(secret UMAMI_DB_PASSWORD)
UMAMI_APP_SECRET=$(secret UMAMI_APP_SECRET)
UMAMI_ADMIN_PASSWORD=$(secret UMAMI_ADMIN_PASSWORD)
INTAKE_ADMIN_TOKEN_SHA256=$(printf '%s' "$admin_token" | sha256sum | cut -d' ' -f1)
ENV
