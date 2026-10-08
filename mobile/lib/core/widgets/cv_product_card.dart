import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:go_router/go_router.dart';
import '../theme/app_colors.dart';
import '../theme/app_typography.dart';
import 'pressable.dart';
import 'cv_skeleton.dart';
import '../theme/app_typography.dart';

class CvProductCard extends StatelessWidget {
  final String id;
  final String imageUrl;
  final String name;
  final String price;
  final String heroTagPrefix;
  final VoidCallback? onFavorite;
  final VoidCallback? onTap;
  final bool isFavorite;

  const CvProductCard({
    super.key,
    required this.id,
    required this.imageUrl,
    required this.name,
    required this.price,
    this.heroTagPrefix = '',
    this.onFavorite,
    this.onTap,
    this.isFavorite = false,
  });

  @override
  Widget build(BuildContext context) {
    return Pressable(
      onTap: onTap ?? () => context.push('/shop/product/$id', extra: heroTagPrefix),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Stack(
              children: [
                AspectRatio(
                  aspectRatio: 1, // You can customize or remove for masonry
                  child: Hero(
                    tag: '${heroTagPrefix}product_$id',
                    child: Image.network(
                      imageUrl,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) => Container(
                        color: AppColors.neutral300,
                        child: const Icon(Icons.image_not_supported, color: AppColors.neutral600),
                      ),
                    ),
                  ),
                ),
                // Favorite Button
                Positioned(
                  top: 8,
                  right: 8,
                  child: GestureDetector(
                    onTap: onFavorite,
                    child: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: const BoxDecoration(
                        color: AppColors.white,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        isFavorite ? Icons.favorite : Icons.favorite_border,
                        size: 16,
                        color: isFavorite ? AppColors.error : AppColors.neutral900,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          // Title
          Text(
            name,
            style: AppTypography.bodyMedium,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 4),
          // Price
          Text(
            price,
            style: AppTypography.priceText,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
