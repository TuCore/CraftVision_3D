import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/api_providers.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/cv_top_bar.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profile = ref.watch(userProfileProvider);
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
                  CircleAvatar(
                    radius: 28,
                    backgroundColor: AppColors.surfaceTint,
                    backgroundImage: profile.value?['avatarUrl'] != null
                        ? NetworkImage('${profile.value!['avatarUrl']}')
                        : null,
                    child: profile.value?['avatarUrl'] == null
                        ? const Icon(
                            Icons.person,
                            size: 32,
                            color: AppColors.primary,
                          )
                        : null,
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${profile.value?['displayName'] ?? profile.value?['fullName'] ?? 'Tài khoản'}',
                          style: AppTypography.heading2,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Chào mừng đến CraftVision',
                          style: AppTypography.bodySmall,
                        ),
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
                  _buildGridCard(
                    Icons.receipt_long,
                    'Đơn mua',
                    () => context.push('/order'),
                  ),
                  _buildGridCard(Icons.star_border, 'Đánh giá', () {}),
                  _buildGridCard(
                    Icons.favorite_border,
                    'Quà tặng',
                    () => context.push('/manifest'),
                  ),
                  _buildGridCard(
                    Icons.location_on_outlined,
                    'Địa chỉ',
                    () => _showAddresses(context, ref),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            const Divider(color: AppColors.neutral300, height: 1),

            // List options
            _buildListTile(Icons.mail_outline, 'Tin nhắn', () {}),
            const Divider(color: AppColors.neutral300, height: 1),
            _buildListTile(
              Icons.notifications_none,
              'Thông báo & ưu đãi',
              () {},
              hasBadge: true,
            ),
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
                onPressed: () async {
                  final auth = await ref.read(authServiceProvider.future);
                  await auth.logout();
                  ref.invalidate(userProfileProvider);
                  if (context.mounted) context.go('/auth');
                },
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.error,
                  side: const BorderSide(color: AppColors.error),
                  minimumSize: const Size(double.infinity, 48),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(24),
                  ),
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

  Future<void> _showAddresses(BuildContext context, WidgetRef ref) async {
    try {
      final services = await ref.read(apiServicesProvider.future);
      final addresses = await services.addresses.getAddresses();
      if (!context.mounted) return;
      await showModalBottomSheet<void>(
        context: context,
        showDragHandle: true,
        builder: (context) => ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Text('Địa chỉ của tôi', style: AppTypography.heading2),
            const SizedBox(height: 12),
            if (addresses.isEmpty) const Text('Chưa có địa chỉ.'),
            for (final address in addresses)
              ListTile(
                leading: Icon(
                  address['isDefault'] == true
                      ? Icons.home
                      : Icons.location_on_outlined,
                  color: AppColors.primary,
                ),
                title: Text(
                  '${address['receiverName'] ?? ''} · ${address['phone'] ?? ''}',
                ),
                subtitle: Text(
                  '${address['address'] ?? ''}, ${address['district'] ?? ''}, ${address['province'] ?? ''}',
                ),
              ),
          ],
        ),
      );
    } catch (error) {
      if (context.mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('$error')));
      }
    }
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
              child: Text(
                label,
                style: AppTypography.bodyMedium.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildListTile(
    IconData icon,
    String title,
    VoidCallback onTap, {
    bool hasBadge = false,
  }) {
    return InkWell(
      onTap: onTap,
      child: Container(
        height: 56,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Row(
          children: [
            Icon(icon, color: AppColors.neutral900, size: 24),
            const SizedBox(width: 16),
            Expanded(child: Text(title, style: AppTypography.bodyLarge)),
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
