import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/pressable.dart';

class GreetingOptionCard extends StatelessWidget {
  final String title;
  final String badge;
  final String description;
  final String buttonText;
  final IconData icon;
  final Color themeColor;
  final VoidCallback onTap;

  const GreetingOptionCard({
    super.key,
    required this.title,
    required this.badge,
    required this.description,
    required this.buttonText,
    required this.icon,
    required this.themeColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Pressable(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: Row(
          children: [
            // Icon (minimal)
            Icon(icon, color: themeColor, size: 24),
            const SizedBox(width: 16),
            // Texts
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        title,
                        style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '· $badge',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: themeColor,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    description,
                    style: AppTypography.bodySmall.copyWith(color: AppColors.neutral600),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            // Minimal Chevron instead of heavy button
            Icon(Icons.chevron_right, color: AppColors.neutral400, size: 24),
          ],
        ),
      ),
    );
  }
}
