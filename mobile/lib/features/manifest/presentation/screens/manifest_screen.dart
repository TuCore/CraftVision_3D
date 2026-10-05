import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/cv_surface.dart';
import '../../../../core/widgets/cv_button.dart';
import '../../../../core/utils/mock_data.dart';
import 'package:go_router/go_router.dart';

class ManifestScreen extends StatelessWidget {
  const ManifestScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // We'll reuse the mock products as items in the Manifest (wishlist)
    final manifestItems = MockData.products.reversed.toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Manifest'),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Chia sẻ Manifest thành công!')),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Góc ước nguyện', style: AppTypography.heading1),
                  const SizedBox(height: 8),
                  Text(
                    'Lưu lại những món quà 3D bạn yêu thích. Chia sẻ với người thương để họ biết bạn đang mong chờ điều gì.',
                    style: AppTypography.bodyLarge.copyWith(color: AppColors.neutral600),
                  ),
                ],
              ),
            ),
            
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 24),
              itemCount: manifestItems.length,
              separatorBuilder: (context, index) => const SizedBox(height: 16),
              itemBuilder: (context, index) {
                final product = manifestItems[index];
                return CvSurface(
                  variant: CvSurfaceVariant.elevated,
                  padding: const EdgeInsets.all(12),
                  onTap: () => context.push('/shop/${product.id}'),
                  child: Row(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.network(
                          product.imageUrl,
                          width: 80,
                          height: 80,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) => Container(
                            width: 80,
                            height: 80,
                            color: AppColors.neutral300,
                            child: const Icon(Icons.image),
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(product.name, style: AppTypography.heading3, maxLines: 1),
                            const SizedBox(height: 4),
                            Text(
                              '${product.price.toStringAsFixed(0)} đ',
                              style: AppTypography.bodyMedium.copyWith(color: AppColors.primary),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.favorite, color: AppColors.primary),
                        onPressed: () {
                          // Mock unlike
                        },
                      ),
                    ],
                  ),
                );
              },
            ),
            
            const SizedBox(height: 32),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: CvButton(
                text: 'Khám phá thêm',
                variant: CvButtonVariant.secondary,
                onPressed: () => context.go('/shop'),
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}
