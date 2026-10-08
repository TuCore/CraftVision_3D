import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/cv_product_card.dart';
import '../providers/shop_provider.dart';
import '../../../profile/presentation/providers/wishlist_provider.dart';

class ProductRelatedSection extends ConsumerWidget {
  final String category;
  final String currentProductId;
  final String heroTagPrefix;

  const ProductRelatedSection({
    super.key, 
    required this.category,
    required this.currentProductId,
    this.heroTagPrefix = '',
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final productsAsync = ref.watch(productsProvider);
    
    return productsAsync.when(
      data: (products) {
        final related = products
            .where((p) => p.categoryName == category && p.id != currentProductId)
            .take(4)
            .toList();
            
        if (related.isEmpty) return const SizedBox.shrink();

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Có thể bạn cũng thích', style: AppTypography.heading2),
            const SizedBox(height: 16),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              padding: EdgeInsets.zero,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 0.68,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
              ),
              itemCount: related.length,
              itemBuilder: (context, index) {
                final product = related[index];
                final isFavorite = ref.watch(wishlistProvider.notifier).isFavorite(product.id);
                return CvProductCard(
                  id: product.id,
                  imageUrl: product.primaryImageUrl,
                  name: product.name,
                  price: '${product.price.toStringAsFixed(0)} đ',
                  heroTagPrefix: heroTagPrefix,
                  isFavorite: isFavorite,
                  onFavorite: () {
                    ref.read(wishlistProvider.notifier).toggleFavorite(product.id);
                  },
                  onTap: () {
                    final basePath = heroTagPrefix == 'home_' ? '/home' : '/shop';
                    context.push('$basePath/product/${product.id}', extra: heroTagPrefix);
                  },
                );
              },
            ),
          ],
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, s) => const SizedBox.shrink(),
    );
  }
}
