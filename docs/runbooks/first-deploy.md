# First deploy to AWS

One-time setup of the forms backend in the company's existing AWS account
([ADR-0012](../adr/0012-production-on-existing-vendors.md)). About 30 minutes, most of
it waiting. After this, every merge to `main` deploys itself.

Until step 5 is done, the live site keeps opening the visitor's mail app: nothing is
collected by accident.

## 1. Create the stack (AWS admin, ~10 minutes)

In AWS CloudShell, region **eu-west-2 (London)**:

```sh
git clone https://github.com/angritsay/eunice-site && cd eunice-site
aws cloudformation deploy --region eu-west-2 --stack-name eunice-site \
  --template-file deploy/aws/stack.yaml --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    VpcId=vpc-XXXXXXXX SubnetId=subnet-XXXXXXXX \
    AlertEmail=you@eunice.ai \
    OpsInbox=ops@eunice.ai CareersInbox=careers@eunice.ai \
    MailFrom='Eunice site <notify@eunice.ai>'
# If the account already trusts GitHub Actions (token.actions.githubusercontent.com),
# add: CreateGitHubOidcProvider=false
aws cloudformation describe-stacks --region eu-west-2 --stack-name eunice-site \
  --query 'Stacks[0].Outputs' --output table
```

- Use a **public** subnet of the VPC your product already uses (or the default VPC).
- Confirm the SNS subscription email that arrives at `AlertEmail`, or alerts go nowhere.

## 2. Point the API name at the instance

Add a DNS record: `api.eunice.ai  A  <ElasticIp output>`, TTL 300.

## 3. Let the instance send email (Google Workspace admin)

Admin console → **Apps → Google Workspace → Gmail → Routing → SMTP relay service → Add**:

| Setting | Value |
|---|---|
| Allowed senders | Only addresses in my domains |
| Authentication | **Only accept mail from the specified IP addresses**: the `ElasticIp` output |
| Require SMTP Authentication | Off (the IP is the authentication) |
| Encryption | **Require TLS encryption**: on |

Make sure `notify@eunice.ai` exists as a user or an alias, and that `ops@` and
`careers@` receive mail.

## 4. Connect GitHub to the stack (repository admin)

Repository → Settings → Secrets and variables → Actions → **Variables** (not secrets:
none of these is sensitive):

| Variable | Value |
|---|---|
| `AWS_DEPLOY_ROLE_ARN` | `DeployRoleArn` output |
| `AWS_INSTANCE_ID` | `InstanceId` output |
| `AWS_BUCKET` | `BucketName` output |
| `AWS_REGISTRY` | `RegistryUri` output |
| `API_DOMAIN` | `api.eunice.ai` |

Then Actions → **Deploy services** → Run workflow (leave `release` empty). The run
builds both images, deploys them, and ends with a smoke test of
`https://api.eunice.ai`. The instance creates every password and token itself, in
SSM Parameter Store under `/eunice-site/prod/secret/`.

Recommended, for SOC 2 change management: Settings → Environments → **production** →
Required reviewers. A deploy then waits for a named person.

## 5. Go live on the site (after the privacy notice is approved)

A separate pull request adds the approved privacy page and points the Pages build at
`https://api.eunice.ai`. The build refuses to do the second without the first.

## Check it worked

1. Submit a form on the live site. It should arrive at `ops@` within seconds, from
   `notify@eunice.ai`. Reply-To should be the address you entered.
2. Open the Umami dashboard ([operations.md](operations.md#analytics-dashboard)): the
   visit and the form funnel appear.
3. Erase your test submission ([operations.md](operations.md#erase-a-persons-data)).
4. Rehearse a rollback once ([operations.md](operations.md#deploy-and-roll-back)).
