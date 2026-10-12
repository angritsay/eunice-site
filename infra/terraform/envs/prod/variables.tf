variable "region" {
  description = "Region for the bucket and the deploy role."
  type        = string
  default     = "eu-west-2"
}

variable "route53_zone_id" {
  description = "The eunice.ai hosted zone. Set it to let this stack write its own records; leave it null to add them in eunice-infrastructure from the outputs."
  type        = string
  default     = null
}

variable "github_repository" {
  description = "owner/name of the repository that deploys the site."
  type        = string
  default     = "angritsay/eunice-site"
}

variable "github_oidc_provider_arn" {
  description = "The account's existing GitHub OIDC provider. Null creates one here (only one stack per account may)."
  type        = string
  default     = null
}
