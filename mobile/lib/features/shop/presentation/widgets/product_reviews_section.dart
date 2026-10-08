import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/cv_button.dart';

class ProductReviewsSection extends StatelessWidget {
  const ProductReviewsSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Đánh giá', style: AppTypography.heading2),
            Row(
              children: [
                const Icon(Icons.star, color: Colors.amber, size: 24),
                const SizedBox(width: 4),
                Text('0.0', style: AppTypography.heading2),
              ],
            ),
          ],
        ),
        const SizedBox(height: 16),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 32),
          decoration: BoxDecoration(
            color: const Color(0xFFFDF7F4),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.neutral200),
          ),
          child: Column(
            children: [
              const Icon(Icons.rate_review_outlined, size: 48, color: AppColors.neutral400),
              const SizedBox(height: 12),
              Text(
                'Chưa có đánh giá nào',
                style: AppTypography.heading3.copyWith(color: AppColors.neutral600),
              ),
              const SizedBox(height: 4),
              Text(
                'Hãy là người đầu tiên đánh giá sản phẩm này!',
                style: AppTypography.bodySmall.copyWith(color: AppColors.neutral600),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: 200,
                child: CvButton(
                  text: 'Viết đánh giá',
                  onPressed: () {
                    // TODO: Open review dialog or screen
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Tính năng đánh giá đang được cập nhật!')),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
