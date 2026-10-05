import 'package:flutter/material.dart';
import '../../../../core/widgets/cv_top_bar.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/mock_data.dart';
import 'package:go_router/go_router.dart';

class OrderDetailScreen extends StatelessWidget {
  final String orderId;
  const OrderDetailScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context) {
    // Find product or use first as fallback
    final product = MockData.products.firstWhere(
      (p) => p.id == orderId, 
      orElse: () => MockData.products.first
    );

    return Scaffold(
      backgroundColor: AppColors.neutral100,
      appBar: const CvTopBar(title: 'Chi tiết đơn hàng'),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status Section (Gradient)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: AppColors.primaryGradient,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: 0.3), 
                    blurRadius: 10, 
                    offset: const Offset(0, 4)
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Đang giao hàng', style: AppTypography.heading2.copyWith(color: AppColors.white)),
                  const SizedBox(height: 8),
                  Text('Đơn hàng dự kiến giao vào ngày mai', style: AppTypography.bodyMedium.copyWith(color: AppColors.white.withValues(alpha: 0.9))),
                ],
              ),
            ),
            const SizedBox(height: 16),
            
            // Product Info Section
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surfaceLight,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.neutral900.withValues(alpha: 0.05), 
                    blurRadius: 10, 
                    offset: const Offset(0, 2)
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.shopping_bag, color: AppColors.primary),
                      const SizedBox(width: 8),
                      Text('Sản phẩm đã đặt', style: AppTypography.heading3),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.network(product.imageUrl, width: 80, height: 80, fit: BoxFit.cover),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              product.name, 
                              style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.bold), 
                              maxLines: 2, 
                              overflow: TextOverflow.ellipsis
                            ),
                            const SizedBox(height: 4),
                            Text('Phân loại: Mặc định', style: AppTypography.bodySmall.copyWith(color: AppColors.neutral600)),
                            const SizedBox(height: 8),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text('${product.price.toStringAsFixed(0)}đ', style: AppTypography.bodyMedium.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold)),
                                Text('x2', style: AppTypography.bodyMedium),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const Divider(height: 32, color: AppColors.neutral200),
                  Row(
                    children: [
                      Expanded(
                        child: Text('Thành tiền (2 sản phẩm)', style: AppTypography.bodyMedium),
                      ),
                      Text('${(product.price * 2).toStringAsFixed(0)}đ', style: AppTypography.heading3),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Shipping Timeline
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surfaceLight,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.neutral900.withValues(alpha: 0.05), 
                    blurRadius: 10, 
                    offset: const Offset(0, 2)
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.local_shipping, color: AppColors.primary),
                      const SizedBox(width: 8),
                      Text('Thông tin vận chuyển', style: AppTypography.heading3),
                    ],
                  ),
                  const SizedBox(height: 24),
                  _buildTimelineItem('Đang giao hàng', 'Shipper đang trên đường giao hàng.', '09:00, 2 Thg 10', true, isFirst: true),
                  _buildTimelineItem('Đã lấy hàng', 'Đơn hàng đã được bàn giao cho đơn vị vận chuyển.', '15:30, 1 Thg 10', false),
                  _buildTimelineItem('Đã xác nhận', 'Người bán đang chuẩn bị hàng.', '08:00, 1 Thg 10', false, isLast: true),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Address
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surfaceLight,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.neutral900.withValues(alpha: 0.05), 
                    blurRadius: 10, 
                    offset: const Offset(0, 2)
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.location_on, color: AppColors.primary),
                      const SizedBox(width: 8),
                      Text('Địa chỉ nhận hàng', style: AppTypography.heading3),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text('Nguyễn Văn A', style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text('0123456789', style: AppTypography.bodyMedium),
                  const SizedBox(height: 4),
                  Text('Số 1, Đường 2, Phường 3, Quận 4, TP.HCM', style: AppTypography.bodyMedium.copyWith(color: AppColors.neutral600)),
                ],
              ),
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () {
                  context.pop();
                },
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.primary,
                  side: const BorderSide(color: AppColors.primary),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: Text('Quay lại', style: AppTypography.buttonText),
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildTimelineItem(String title, String desc, String time, bool isCurrent, {bool isFirst = false, bool isLast = false}) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          SizedBox(
            width: 24,
            child: Column(
              children: [
                // Top line
                Container(
                  width: 2,
                  height: 6,
                  color: isFirst ? Colors.transparent : AppColors.neutral300,
                ),
                // Dot
                Icon(
                  isCurrent ? Icons.check_circle : Icons.circle,
                  size: 16,
                  color: isCurrent ? AppColors.primary : AppColors.neutral300,
                ),
                // Bottom line
                Expanded(
                  child: Container(
                    width: 2,
                    color: isLast ? Colors.transparent : AppColors.neutral300,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: AppTypography.bodyMedium.copyWith(fontWeight: isCurrent ? FontWeight.bold : FontWeight.normal, color: isCurrent ? AppColors.primary : AppColors.neutral900)),
                  const SizedBox(height: 4),
                  Text(desc, style: AppTypography.bodySmall.copyWith(color: AppColors.neutral600)),
                  const SizedBox(height: 4),
                  Text(time, style: AppTypography.bodySmall.copyWith(color: AppColors.neutral400)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
