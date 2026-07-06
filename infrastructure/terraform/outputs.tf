# Định nghĩa các giá trị output xuất ra sau khi Terraform chạy thành công
# Rất hữu ích để lấy URL, IP, hoặc ID của tài nguyên để sử dụng cho CI/CD

output "environment" {
  description = "Môi trường đang được deploy"
  value       = var.environment
}

# Ví dụ về output:
# output "vpc_id" {
#   description = "ID của VPC vừa tạo"
#   value       = aws_vpc.main_vpc.id
# }

# output "database_endpoint" {
#   description = "Endpoint kết nối của Database PostgreSQL"
#   value       = aws_db_instance.postgres.endpoint
# }
