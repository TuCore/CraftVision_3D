import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/widgets/cv_top_bar.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/cv_product_card.dart';
import '../../../../core/widgets/cv_button.dart';
import 'package:go_router/go_router.dart';
import '../providers/wishlist_provider.dart';

class WishlistScreen extends ConsumerWidget {
  const WishlistScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final wishlistAsync = ref.watch(wishlistProvider);

    return Scaffold(
      appBar: const CvTopBar(title: 'Sản phẩm yêu thích'),
      body: wishlistAsync.when(
        data: (wishlist) {
          if (wishlist == null || wishlist.items.isEmpty) {
            return const Center(child: Text('Danh sách yêu thích trống.'));
          }
          return GridView.builder(
            padding: const EdgeInsets.all(20),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 0.68,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
            ),
            itemCount: wishlist!.items.length,
            itemBuilder: (context, index) {
              final item = wishlist!.items[index];
              return CvProductCard(
                id: item.product.id,
                imageUrl: item.product.primaryImageUrl,
                name: item.product.name,
                price: '${item.product.price.toStringAsFixed(0)} đ',
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, s) {
          final errorStr = e.toString().toLowerCase();
          if (errorStr.contains('401') || errorStr.contains('unauthorized')) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.lock_outline, size: 64, color: AppColors.neutral400),
                  const SizedBox(height: 16),
                  Text('Vui lòng đăng nhập', style: AppTypography.heading3),
                  const SizedBox(height: 8),
                  Text('Bạn cần đăng nhập để xem sản phẩm yêu thích', style: AppTypography.bodyMedium),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: 200,
                    child: CvButton(
                      text: 'Đăng nhập ngay',
                      onPressed: () => context.push('/auth'),
                    ),
                  ),
                ],
              ),
            );
          }
          return Center(child: Text('Lỗi tải dữ liệu: $e'));
        },
      ),
    );
  }
}
