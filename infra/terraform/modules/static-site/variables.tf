variable "name" {
  description = "Short name for this environment's resources, e.g. eunice-site-prod."
  type        = string
}

variable "domains" {
  description = "Host names the site answers on. The first is canonical; any www. name redirects to the name without it."
  type        = list(string)
}

variable "route53_zone_id" {
  description = "Hosted zone for the domains (it lives in eunice-infrastructure). Used only when manage_dns is true."
  type        = string
  default     = null
}

variable "manage_dns" {
  description = "Write the certificate validation and alias records into route53_zone_id. False: output them for eunice-infrastructure to add instead."
  type        = bool
  default     = false
}

variable "noindex" {
  description = "Send X-Robots-Tag: noindex on every response (staging)."
  type        = bool
  default     = false
}

variable "extra_connect_src" {
  description = "Origins the pages may send data to besides themselves and Google Analytics, e.g. the contact form's receiver."
  type        = list(string)
  default     = []
}

variable "price_class" {
  description = "CloudFront price class. PriceClass_100 serves Europe and North America from their own edges."
  type        = string
  default     = "PriceClass_100"
}

variable "github_repository" {
  description = "owner/name of the repository whose workflow deploys this site."
  type        = string
}

variable "github_environment" {
  description = "The GitHub Actions environment allowed to assume the deploy role (e.g. staging, production)."
  type        = string
}

variable "github_oidc_provider_arn" {
  description = "The account's GitHub OIDC provider (one per account; it may already exist in eunice-infrastructure). Null with create_github_oidc_provider = true creates it here."
  type        = string
  default     = null
}

variable "create_github_oidc_provider" {
  description = "Create the account's GitHub OIDC provider here. Only one environment in an account may do this."
  type        = bool
  default     = false
}

variable "tags" {
  description = "Tags for every resource."
  type        = map(string)
  default     = {}
}
