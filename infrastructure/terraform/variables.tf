# Chứa định nghĩa các biến (variables) có thể truyền vào khi chạy Terraform

variable "aws_region" {
  description = "Region của AWS để deploy tài nguyên"
  type        = string
  default     = "ap-southeast-1" # Ví dụ: Singapore
}

variable "environment" {
  description = "Môi trường deploy (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Tên dự án"
  type        = string
  default     = "craftvision-3d"
}
