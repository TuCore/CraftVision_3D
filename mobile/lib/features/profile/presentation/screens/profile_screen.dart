import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/cv_top_bar.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CvTopBar(title: 'Tài khoản của bạn'),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.all(20.0),
              child: Row(
                children: [
                  const CircleAvatar(
                    radius: 28,
                    backgroundColor: AppColors.surfaceTint,
                    child: Icon(Icons.person, size: 32, color: AppColors.primary),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Nguyễn Văn A', style: AppTypography.heading2),
                        const SizedBox(height: 4),
                        Text('Chào mừng đến CraftVision', style: AppTypography.bodySmall),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // 2x2 Grid
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0),
              child: GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: 16,
                crossAxisSpacing: 16,
                childAspectRatio: 2.5,
                children: [
                  _buildGridCard(Icons.receipt_long, 'Đơn mua', () => context.push('/order')),
                  _buildGridCard(Icons.star_border, 'Đánh giá', () {}),
                  _buildGridCard(Icons.favorite_border, 'Quà tặng', () => context.push('/manifest')),
                  _buildGridCard(Icons.location_on_outlined, 'Địa chỉ', () {}),
                ],
              ),
            ),
            const SizedBox(height: 32),
            const Divider(color: AppColors.neutral300, height: 1),

            // List options
            _buildListTile(Icons.mail_outline, 'Tin nhắn', () {}),
            const Divider(color: AppColors.neutral300, height: 1),
            _buildListTile(Icons.notifications_none, 'Thông báo & ưu đãi', () {}, hasBadge: true),
            const Divider(color: AppColors.neutral300, height: 1),
            _buildListTile(Icons.person_outline, 'Hồ sơ', () {}),
            const Divider(color: AppColors.neutral300, height: 1),
            _buildListTile(Icons.settings_outlined, 'Cài đặt', () {}),
            const Divider(color: AppColors.neutral300, height: 1),
            _buildListTile(Icons.help_outline, 'Trợ giúp', () {}),
            const Divider(color: AppColors.neutral300, height: 1),
            
            const SizedBox(height: 32),
            // Logout
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0),
              child: OutlinedButton(
                onPressed: () => context.go('/auth'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.error,
                  side: const BorderSide(color: AppColors.error),
                  minimumSize: const Size(double.infinity, 48),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                ),
                child: Text('Đăng xuất', style: AppTypography.buttonText),
              ),
            ),
            const SizedBox(height: 120), // Bottom nav padding
          ],
        ),
      ),
    );
  }

  Widget _buildGridCard(IconData icon, String label, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.surfaceLight,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.neutral300),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Row(
          children: [
            Icon(icon, color: AppColors.neutral900, size: 24),
            const SizedBox(width: 12),
            Expanded(
              child: Text(label, style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w600)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildListTile(IconData icon, String title, VoidCallback onTap, {bool hasBadge = false}) {
    return InkWell(
      onTap: onTap,
      child: Container(
        height: 56,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Row(
          children: [
            Icon(icon, color: AppColors.neutral900, size: 24),
            const SizedBox(width: 16),
            Expanded(
              child: Text(title, style: AppTypography.bodyLarge),
            ),
            if (hasBadge)
              Container(
                margin: const EdgeInsets.only(right: 12),
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                ),
              ),
            const Icon(Icons.chevron_right, color: AppColors.neutral400),
          ],
        ),
      ),
    );
  }
}
