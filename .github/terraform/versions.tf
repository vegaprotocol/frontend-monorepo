terraform {
  backend "remote" {
    hostname     = "app.terraform.io"
    organization = "vega"
    workspaces {
      name = "frontend-monorepo"
    }
  }
  required_providers {
    dnsimple = {
      source  = "dnsimple/dnsimple"
      version = "0.16.2"
    }
  }
}