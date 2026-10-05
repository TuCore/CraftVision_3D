import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/cv_button.dart';

class ProductInfoSection extends StatelessWidget {
  final String description;

  const ProductInfoSection({super.key, required this.description});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Chi tiết sản phẩm', style: AppTypography.heading2),
        const SizedBox(height: 16),
        Row(
          children: [
            _buildInfoCard(Icons.texture, 'Chất liệu', 'Acrylic cao cấp'),
            const SizedBox(width: 12),
            _buildInfoCard(Icons.aspect_ratio, 'Kích thước', '12x15 cm'),
          ],
        ),
        const SizedBox(height: 16),
        Text(
          description,
          style: AppTypography.bodyLarge.copyWith(height: 1.6),
          maxLines: 3,
          overflow: TextOverflow.ellipsis,
        ),
        const SizedBox(height: 16),
        SizedBox(
          width: double.infinity,
          child: CvButton(
            text: 'Xem đầy đủ mô tả',
            variant: CvButtonVariant.ghost,
            onPressed: () {},
          ),
        ),
      ],
    );
  }

  Widget _buildInfoCard(IconData icon, String title, String value) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 20, color: AppColors.neutral600),
              const SizedBox(width: 8),
              Text(title, style: AppTypography.labelText),
            ],
          ),
          const SizedBox(height: 4),
          Text(value, style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
