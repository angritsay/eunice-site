output "bucket" {
  value = module.site.bucket
}

output "distribution_id" {
  value = module.site.distribution_id
}

output "distribution_domain" {
  value = module.site.distribution_domain
}

output "distribution_hosted_zone_id" {
  value = module.site.distribution_hosted_zone_id
}

output "deploy_role_arn" {
  value = module.site.deploy_role_arn
}

output "validation_records" {
  value = module.site.validation_records
}
