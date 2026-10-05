import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/mock_data.dart';
import '../../../../core/widgets/cv_product_card.dart';

class ProductRelatedSection extends StatelessWidget {
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
  Widget build(BuildContext context) {
    // Mock filtering by category
    final related = MockData.products
        .where((p) => p.category == category && p.id != currentProductId)
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
            childAspectRatio: 0.75,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
          ),
          itemCount: related.length,
          itemBuilder: (context, index) {
            final product = related[index];
            return CvProductCard(
              id: product.id,
              imageUrl: product.imageUrl,
              name: product.name,
              price: '${product.price.toStringAsFixed(0)} đ',
              heroTagPrefix: heroTagPrefix,
              onTap: () {
                final basePath = heroTagPrefix == 'home_' ? '/home' : '/shop';
                // push another product detail on the current branch
                context.push('$basePath/product/${product.id}', extra: heroTagPrefix);
              },
            );
          },
        ),
      ],
    );
  }
}
