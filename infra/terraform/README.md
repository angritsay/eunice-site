# Hosting on AWS

The site is static files: S3 holds them, CloudFront serves them. Decided with engineering in October 2026 ([ADR-0014](../../docs/adr/0014-static-site-on-aws.md)). This is a first draft for the engineering team to take over and fold into `eunice-infrastructure`. It has passed `terraform validate` but has not been applied anywhere yet.

```
modules/static-site/   one environment: bucket, CloudFront, certificate, headers, deploy role
envs/staging/          staging.eunice.ai, noindex
envs/prod/             eunice.ai and www.eunice.ai (www redirects to eunice.ai)
```

## What one environment is

- **S3 bucket**: private, encrypted, versioned (old versions kept 30 days, so a bad deploy can be rolled back). Only its own CloudFront distribution can read it (origin access control).
- **CloudFront**: HTTPS only, HTTP/2 and 3, compression, `404.html` for missing pages. A CloudFront Function serves `/path/` from `/path/index.html`, redirects `/path` to `/path/` and redirects `www.` to the bare domain, keeping the query string so UTM tags survive.
- **Certificate**: ACM in us-east-1, as CloudFront requires, validated by DNS.
- **Security headers** on every response, including the Content-Security-Policy. The pages load only their own files, plus Google Analytics once a visitor accepts cookies. A new third-party script or connection (the contact form's receiver, for example) has to be added in `main.tf` (`extra_connect_src` for connections), or the browser blocks it. Staging also sends `X-Robots-Tag: noindex`.
- **Deploy role** for GitHub Actions through OIDC, with no stored keys. Only jobs in the matching GitHub environment of this repository can assume it, and it can only write to the bucket and invalidate the distribution.

## DNS

DNS for eunice.ai lives in `eunice-infrastructure`. There are two ways to connect it:

- **Leave `route53_zone_id` unset (default).** Apply, then add the records from the outputs in `eunice-infrastructure`: `validation_records` for the certificate, and alias A and AAAA records pointing each domain at `distribution_domain` / `distribution_hosted_zone_id`. The apply waits on the certificate until the validation records exist.
- **Set `route53_zone_id`**: this stack writes those records into the zone itself.

Switching `eunice.ai` to CloudFront takes the live site off its current host, so do it only at launch.

## First apply

1. Fill in the `backend "s3"` block in each `envs/*/main.tf` with the state bucket `eunice-infrastructure` uses.
2. The GitHub OIDC provider is one per AWS account. If it already exists, pass its ARN as `github_oidc_provider_arn`. If not, apply one stack without it (that stack creates the provider), then give the other stack its ARN. If staging and prod are in different accounts, each creates its own.
3. `terraform -chdir=envs/staging init && terraform -chdir=envs/staging apply`, then the same for prod.
4. In the repository settings, create the GitHub environments `staging` and `production` (add required reviewers to production), and set these variables from the outputs:

   | Variable | From |
   |---|---|
   | `AWS_ROLE_ARN` | `deploy_role_arn` |
   | `SITE_BUCKET` | `bucket` |
   | `CLOUDFRONT_DISTRIBUTION_ID` | `distribution_id` |
   | `GA_MEASUREMENT_ID` | the GA4 property for that environment (optional; without it there is no analytics and no cookie banner) |

5. Push to main or run **Deploy** by hand. See `.github/workflows/deploy.yml`.

## Deploys

- **Staging**: every time CI passes on main, including the daily rebuild that moves past events off the upcoming list.
- **Production**: by hand from main (Actions → Deploy → Run workflow → production). Re-run it now and then if dated content should stay current, or add a schedule once the team is happy with it.
- **Pull request previews**: still on GitHub Pages (`pages.yml`). They are separate from AWS.

## Checks

CI runs `terraform fmt -check` and `terraform validate` on both environments (no credentials, no state). The provider lock files pin the AWS provider for Linux and macOS. After changing the version, run `terraform providers lock -platform=linux_amd64 -platform=darwin_arm64 -platform=darwin_amd64` in each env.

## Not here yet

- The contact form's receiver (the form into Attio): see the handover doc. When it is built, add its origin to `extra_connect_src`, or serve it from this distribution under `/api/`.
- Logging and alarms: CloudFront standard logs and a 5xx alarm are worth adding in `eunice-infrastructure`'s usual way.
- WAF: not needed for static files; consider it when the form's endpoint arrives.
