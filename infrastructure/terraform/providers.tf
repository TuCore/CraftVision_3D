# Định nghĩa các Providers (AWS, Azure, GCP, v.v.)
# Dưới đây là ví dụ cấu hình mẫu cho AWS (Amazon Web Services)

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Cấu hình backend để lưu trữ state của Terraform (Khuyên dùng S3 cho AWS)
  # backend "s3" {
  #   bucket         = "craftvision-terraform-state"
  #   key            = "dev/terraform.tfstate"
  #   region         = "ap-southeast-1"
  #   dynamodb_table = "terraform-lock"
  #   encrypt        = true
  # }
}

provider "aws" {
  region = var.aws_region

  # Tags mặc định sẽ được áp dụng cho mọi tài nguyên được tạo ra
  default_tags {
    tags = {
      Project     = "CraftVision_3D"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
