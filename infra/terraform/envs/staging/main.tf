# eunice.ai, staging. The resources are all in ../../modules/static-site; this file
# only says which domains and which GitHub environment. See ../../README.md.

terraform {
  required_version = ">= 1.9"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 6.0, < 7.0"
    }
  }

  # State: replace with the bucket and lock table eunice-infrastructure uses, e.g.
  # backend "s3" {
  #   bucket       = "<state bucket>"
  #   key          = "eunice-site/staging.tfstate"
  #   region       = "eu-west-2"
  #   use_lockfile = true
  # }
}

provider "aws" {
  region = var.region
  default_tags {
    tags = local.tags
  }
}

# CloudFront only accepts certificates from us-east-1.
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
  default_tags {
    tags = local.tags
  }
}

locals {
  tags = {
    project     = "eunice-site"
    environment = "staging"
    managed-by  = "terraform"
  }
}

module "site" {
  source = "../../modules/static-site"
  providers = {
    aws           = aws
    aws.us_east_1 = aws.us_east_1
  }

  name    = "eunice-site-staging"
  domains = ["staging.eunice.ai"]
  noindex = true

  manage_dns      = var.route53_zone_id != null
  route53_zone_id = var.route53_zone_id

  github_repository           = var.github_repository
  github_environment          = "staging"
  github_oidc_provider_arn    = var.github_oidc_provider_arn
  create_github_oidc_provider = var.github_oidc_provider_arn == null
}
