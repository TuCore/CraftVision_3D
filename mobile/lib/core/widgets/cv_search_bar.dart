import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_typography.dart';

class CvSearchBar extends StatelessWidget {
  final String hintText;
  final VoidCallback? onTap;

  const CvSearchBar({
    super.key,
    this.hintText = 'Tìm món quà đặc biệt...',
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: AppColors.surfaceLight,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: AppColors.neutral300),
        ),
        child: Row(
          children: [
            const Icon(Icons.search, color: AppColors.neutral900),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                hintText,
                style: AppTypography.bodyMedium.copyWith(color: AppColors.neutral600),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
