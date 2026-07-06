# File chính để định nghĩa các tài nguyên (Resources)
# Thay vì viết tất cả ở đây, về sau bạn có thể chia nhỏ ra thành các module (network.tf, database.tf, compute.tf...)

# Ví dụ mẫu: Tạo một Resource Group hoặc VPC
# resource "aws_vpc" "main_vpc" {
#   cidr_block           = "10.0.0.0/16"
#   enable_dns_support   = true
#   enable_dns_hostnames = true
#
#   tags = {
#     Name = "${var.project_name}-${var.environment}-vpc"
#   }
# }

# Ví dụ: Database Subnet Group (chuẩn bị cho PostgreSQL Pgvector)
# resource "aws_db_subnet_group" "db_subnet" {
#   name       = "${var.project_name}-db-subnet-${var.environment}"
#   subnet_ids = [] # Thêm ID các subnet vào đây
# 
#   tags = {
#     Name = "Database Subnet Group for CraftVision"
#   }
# }
