import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/cv_button.dart';

class ProductShippingSection extends StatelessWidget {
  const ProductShippingSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Vận chuyển & chính sách', style: AppTypography.heading2),
        const SizedBox(height: 16),
        _buildRow(Icons.calendar_today, 'Dự kiến giao:', '8 - 12 Th10'),
        const SizedBox(height: 12),
        _buildRow(Icons.local_shipping, 'Giao hàng toàn quốc', ''),
        const SizedBox(height: 12),
        _buildRow(Icons.published_with_changes, 'Đổi trả miễn phí trong 7 ngày', ''),
        const SizedBox(height: 16),
        SizedBox(
          width: double.infinity,
          child: CvButton(
            text: 'Xem chi tiết chính sách',
            variant: CvButtonVariant.ghost,
            onPressed: () {},
          ),
        ),
      ],
    );
  }

  Widget _buildRow(IconData icon, String title, String boldText) {
    return Row(
      children: [
        Icon(icon, size: 20, color: AppColors.neutral900),
        const SizedBox(width: 12),
        Expanded(
          child: RichText(
            text: TextSpan(
              style: AppTypography.bodyMedium.copyWith(color: AppColors.neutral900),
              children: [
                TextSpan(text: '$title '),
                if (boldText.isNotEmpty)
                  TextSpan(
                    text: boldText,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
