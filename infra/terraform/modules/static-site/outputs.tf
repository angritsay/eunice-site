output "bucket" {
  description = "The bucket the deploy workflow syncs dist/ into (GitHub variable <ENV>_SITE_BUCKET)."
  value       = aws_s3_bucket.site.bucket
}

output "distribution_id" {
  description = "The CloudFront distribution to invalidate after a deploy (GitHub variable <ENV>_CLOUDFRONT_DISTRIBUTION_ID)."
  value       = aws_cloudfront_distribution.site.id
}

output "distribution_domain" {
  description = "Point the site's domains at this (alias A and AAAA records) when DNS is managed in eunice-infrastructure."
  value       = aws_cloudfront_distribution.site.domain_name
}

output "distribution_hosted_zone_id" {
  description = "The hosted zone id to use in those alias records."
  value       = aws_cloudfront_distribution.site.hosted_zone_id
}

output "deploy_role_arn" {
  description = "The role GitHub Actions assumes to deploy (GitHub variable <ENV>_AWS_ROLE_ARN)."
  value       = aws_iam_role.deploy.arn
}

output "validation_records" {
  description = "Certificate validation records to add in eunice-infrastructure when manage_dns is false."
  value = [for o in aws_acm_certificate.site.domain_validation_options : {
    name  = o.resource_record_name
    type  = o.resource_record_type
    value = o.resource_record_value
  }]
}
