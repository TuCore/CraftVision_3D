import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/network/api_providers.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/cv_button.dart';

final giftRevealProvider = FutureProvider.family<Map<String, dynamic>, String>((
  ref,
  secretKey,
) async {
  final api = await ref.watch(apiServicesProvider.future);
  return api.giftReveal.revealGift(secretKey);
});

class GiftRevealScreen extends ConsumerWidget {
  const GiftRevealScreen({super.key, required this.secretKey});
  final String secretKey;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final gift = ref.watch(giftRevealProvider(secretKey));
    return Scaffold(
      backgroundColor: AppColors.backgroundDark,
      body: SafeArea(
        child: gift.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, _) => Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Text(
                'Không thể mở quà: $error',
                style: const TextStyle(color: Colors.white),
              ),
            ),
          ),
          data: (data) => Column(
            children: [
              Expanded(
                flex: 3,
                child: SizedBox.expand(
                  child: '${data['previewImageUrl'] ?? ''}'.isEmpty
                      ? const Icon(
                          Icons.view_in_ar,
                          size: 120,
                          color: AppColors.primary,
                        )
                      : Image.network(
                          '${data['previewImageUrl']}',
                          fit: BoxFit.cover,
                        ),
                ),
              ),
              Expanded(
                flex: 2,
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(28),
                  decoration: const BoxDecoration(
                    color: AppColors.surfaceLight,
                    borderRadius: BorderRadius.vertical(
                      top: Radius.circular(32),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${data['giftTitle'] ?? 'Món quà dành cho bạn'}',
                        style: AppTypography.heading2,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Người gửi: ${data['senderName'] ?? ''}',
                        style: AppTypography.labelText,
                      ),
                      const SizedBox(height: 16),
                      Expanded(
                        child: SingleChildScrollView(
                          child: Text(
                            '${data['message'] ?? ''}',
                            style: AppTypography.bodyLarge,
                          ),
                        ),
                      ),
                      CvButton(
                        text: 'Đóng',
                        variant: CvButtonVariant.secondary,
                        onPressed: () => context.go('/home'),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
