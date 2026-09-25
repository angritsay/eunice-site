# Operations

Everyday tasks for the forms backend on AWS. The instance has no SSH: every shell is an
SSM Session Manager session, and every session is logged by AWS.

```sh
aws ssm start-session --region eu-west-2 --target <InstanceId>
sudo -i && cd /opt/eunice-site
alias dc='docker compose --project-name eunice --env-file .env -f current/deploy/compose.prod.yaml'
```

## Deploy and roll back

- **Deploy:** merge to `main`. When CI passes, **Deploy services** runs on its own and
  ends with a smoke test.
- **Roll back:** Actions → Deploy services → Run workflow, with `release` = the commit
  SHA of the last good release. Its images are already in ECR, so it takes about a
  minute. Migrations only ever add; a rollback never undoes one.
- **See what is running:** `dc ps`, and `readlink current`, which shows the release.

## When the alert fires: "a lead could not be emailed"

The notifier gave up on an email after about two hours of retries. The lead itself is
safe in intake.

1. Find out why: CloudWatch Logs → `/eunice-site/prod` → search `notification abandoned`.
   The line gives the submission id and the SMTP server's reason.
2. The usual causes:
   - The Workspace relay rule no longer lists the Elastic IP.
   - TLS is not offered.
   - The ops inbox address has changed (update the stack parameter, then redeploy).
3. Read the lead and contact the person by hand:
   `dc exec postgres psql -U postgres -d eunice -c "select * from intake.submissions where id = '<submission id>'"`

## Analytics dashboard

The Umami dashboard is not on the internet. Forward it to your machine:

```sh
aws ssm start-session --region eu-west-2 --target <InstanceId> \
  --document-name AWS-StartPortForwardingSession --parameters portNumber=3001,localPortNumber=3001
```

Open http://localhost:3001. The user is `admin`; the password is in Parameter Store,
`/eunice-site/prod/secret/UMAMI_ADMIN_PASSWORD`. To build the funnel report, see
[analytics-funnel.md](analytics-funnel.md).

## Erase a person's data

GDPR Art. 17 ([ADR-0007](../adr/0007-personal-data-in-intake.md)). On the instance:

```sh
token=$(aws ssm get-parameter --with-decryption --name /eunice-site/prod/secret/INTAKE_ADMIN_TOKEN \
  --query Parameter.Value --output text)
dc exec -T intake node -e "fetch('http://127.0.0.1:3000/v1/admin/erasures',{method:'POST',
  headers:{'content-type':'application/json',authorization:'Bearer '+process.argv[1]},
  body:JSON.stringify({email:process.argv[2]})}).then(r=>r.text()).then(console.log)" "$token" 'person@example.com'
```

Then delete the matching emails from the ops inbox. Backups age out
after 35 days.

## Backups and restore

- **Daily, 02:15 UTC:** `pg_dump` → S3 `backups/`, encrypted, kept 35 days. EBS
  snapshots are also taken daily and kept for 7 days.
- **Weekly, Sunday 04:00 UTC:** the latest dump is restored into a throwaway database
  and every table is counted: `systemctl status eunice-restore-check`. CI does the same
  on every pull request and compares the counts with the live database.
- **Restore for real** (after data loss):
  1. `dc stop intake notifier umami`
  2. Get the dump: `aws s3 cp s3://<bucket>/backups/<file>.dump /tmp/restore.dump`
  3. `dc exec -T postgres pg_restore -U postgres -d eunice --clean --if-exists < /tmp/restore.dump`
  4. `dc up -d --wait`

## Rotate a secret

Passwords and the admin token live in Parameter Store, under `/eunice-site/prod/secret/`.

- **Admin token:** delete the parameter and redeploy. A new one is generated and
  intake takes its hash.
- **Database password:** change it in Postgres first
  (`alter role intake_app password '…'`), then write the same value to the parameter
  with `--overwrite`, and redeploy.

## Patching

Security updates install automatically (`dnf-automatic`). Container images move by
pull request: Dependabot proposes, CI tests, merge deploys. For a kernel update, reboot
in a quiet hour with `sudo reboot`. The stack comes back on its own, because every
service is `restart: unless-stopped`.
