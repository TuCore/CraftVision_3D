import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/api_providers.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/cv_button.dart';

class ProductReviewsSection extends ConsumerWidget {
  const ProductReviewsSection({super.key, required this.productId});

  final String productId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final reviewsAsync = ref.watch(reviewsProvider(productId));
    final reviews = reviewsAsync.value ?? const <Map<String, dynamic>>[];
    final average = reviews.isEmpty
        ? 0.0
        : reviews.fold<num>(
                0,
                (sum, item) => sum + ((item['rating'] as num?) ?? 0),
              ) /
              reviews.length;
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
                Text(average.toStringAsFixed(1), style: AppTypography.heading2),
              ],
            ),
          ],
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 120,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: reviews.length,
            separatorBuilder: (_, __) => const SizedBox(width: 16),
            itemBuilder: (context, index) {
              final review = reviews[index];
              final rating = (review['rating'] as num?)?.toInt() ?? 0;
              return Container(
                width: 280,
                padding: const EdgeInsets.only(right: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: List.generate(
                        5,
                        (i) => Icon(
                          Icons.star,
                          size: 14,
                          color: i < rating
                              ? Colors.amber
                              : AppColors.neutral300,
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '${review['comment'] ?? ''}',
                      style: AppTypography.bodySmall,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const Spacer(),
                    Text(
                      '${review['userName'] ?? 'Khách hàng'}',
                      style: AppTypography.labelText.copyWith(
                        color: AppColors.neutral600,
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 16),
        SizedBox(
          width: double.infinity,
          child: CvButton(
            text: 'Tất cả đánh giá (${reviews.length})',
            variant: CvButtonVariant.ghost,
            onPressed: () {},
          ),
        ),
      ],
    );
  }
}
