terraform {
  required_version = ">= 1.9"

  required_providers {
    aws = {
      source = "hashicorp/aws"
      # CloudFront certificates must live in us-east-1: the caller passes that region as
      # aws.us_east_1, everything else uses the default provider.
      version               = ">= 6.0, < 7.0"
      configuration_aliases = [aws.us_east_1]
    }
  }
}
