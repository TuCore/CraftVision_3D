import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_typography.dart';

class CvSectionHeader extends StatelessWidget {
  final String title;
  final VoidCallback? onExplore;
  final String exploreText;

  const CvSectionHeader({
    super.key,
    required this.title,
    this.onExplore,
    this.exploreText = 'Xem thêm',
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: AppTypography.heading2),
          if (onExplore != null || exploreText.isNotEmpty)
            InkWell(
              onTap: onExplore ?? () {},
              borderRadius: BorderRadius.circular(100),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: AppColors.neutral200,
                  borderRadius: BorderRadius.circular(100),
                ),
                child: Text(
                  exploreText,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: AppColors.neutral900,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
