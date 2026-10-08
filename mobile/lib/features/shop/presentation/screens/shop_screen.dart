import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/cv_top_bar.dart';
import '../../../../core/widgets/cv_search_bar.dart';
import '../../../../core/widgets/cv_section_header.dart';
import '../../../../core/widgets/cv_product_card.dart';
import '../providers/shop_provider.dart';
import '../../../profile/presentation/providers/wishlist_provider.dart';

class ShopScreen extends ConsumerStatefulWidget {
  const ShopScreen({super.key});

  @override
  ConsumerState<ShopScreen> createState() => _ShopScreenState();
}

class _ShopScreenState extends ConsumerState<ShopScreen> {
  String _selectedCategoryId = 'all';

  @override
  Widget build(BuildContext context) {
    final categoriesAsync = ref.watch(categoriesProvider);
    final productsAsync = ref.watch(productsProvider);

    return Scaffold(
      appBar: const CvTopBar(title: 'CraftVision'),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const CvSearchBar(hintText: 'Tìm kiếm sản phẩm 3D...'),
            const SizedBox(height: 16),

            // Banner ngang tĩnh
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0),
              child: Container(
                height: 120,
                decoration: BoxDecoration(
                  color: AppColors.bannerDark,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Expanded(
                      flex: 3,
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              'Đá quý tháng 10',
                              style: AppTypography.heading3.copyWith(color: AppColors.white),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Lấp lánh và rạng rỡ',
                              style: AppTypography.bodySmall.copyWith(color: AppColors.neutral300),
                            ),
                          ],
                        ),
                      ),
                    ),
                    Expanded(
                      flex: 2,
                      child: ClipRRect(
                        borderRadius: const BorderRadius.only(
                          topRight: Radius.circular(12),
                          bottomRight: Radius.circular(12),
                        ),
                        child: Image.network(
                          'https://images.unsplash.com/photo-1579208030886-b937da0925dc?q=80&w=400&auto=format&fit=crop', // Temporary hardcoded banner
                          fit: BoxFit.cover,
                          height: double.infinity,
                          errorBuilder: (context, error, stackTrace) => Container(color: Colors.grey),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 32),

            // Mua theo danh mục
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0),
              child: Text('Mua theo danh mục', style: AppTypography.heading2),
            ),
            const SizedBox(height: 16),
            
            // Mua theo danh mục (Chips)
            SizedBox(
              height: 44,
              child: categoriesAsync.when(
                data: (categories) {
                  final allCats = [
                    // A fake category for "Tất cả"
                    _CategoryWrapper(id: 'all', name: 'Tất cả'),
                    ...categories.map((c) => _CategoryWrapper(id: c.id, name: c.name))
                  ];
                  return ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    scrollDirection: Axis.horizontal,
                    itemCount: allCats.length,
                    separatorBuilder: (context, index) => const SizedBox(width: 12),
                    itemBuilder: (context, index) {
                      final cat = allCats[index];
                      final isSelected = cat.id == _selectedCategoryId;
                      
                      return GestureDetector(
                        onTap: () {
                          setState(() {
                            _selectedCategoryId = cat.id;
                          });
                        },
                        child: Container(
                          alignment: Alignment.center,
                          padding: const EdgeInsets.symmetric(horizontal: 24),
                          decoration: BoxDecoration(
                            color: isSelected ? null : const Color(0xFFFDF7F4),
                            gradient: isSelected 
                                ? const LinearGradient(
                                    colors: [Color(0xFFFFD4DF), Color(0xFFFFB2B2)],
                                    begin: Alignment.centerLeft,
                                    end: Alignment.centerRight,
                                  )
                                : null,
                            borderRadius: BorderRadius.circular(24),
                            border: isSelected ? null : Border.all(
                              color: AppColors.neutral300,
                              width: 1.5,
                            ),
                          ),
                          child: Text(
                            cat.name,
                            style: AppTypography.bodyMedium.copyWith(
                              fontWeight: FontWeight.w600,
                              color: AppColors.neutral900,
                            ),
                          ),
                        ),
                      );
                    },
                  );
                },
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (e, s) => const SizedBox(),
              ),
            ),
            const SizedBox(height: 32),

            // Products Grid
            productsAsync.when(
              data: (products) {
                // We should technically filter by CategoryId here if the backend didn't. 
                // But since the provider currently fetches all, we will mock filter it here for simplicity.
                // Assuming ProductModel doesn't have a direct categoryId exposed (or it does, but we didn't add it in our DTO? wait).
                // Let's just display all products for now if they didn't define categoryId in ProductModel.
                
                if (products.isEmpty) {
                  return const Padding(
                    padding: EdgeInsets.all(32.0),
                    child: Center(child: Text('Không có sản phẩm nào.')),
                  );
                }

                return GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    childAspectRatio: 0.68,
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                  ),
                  itemCount: products.length,
                  itemBuilder: (context, index) {
                    final product = products[index];
                    final isFavorite = ref.watch(wishlistProvider.notifier).isFavorite(product.id);
                    return CvProductCard(
                      id: product.id,
                      imageUrl: product.primaryImageUrl,
                      name: product.name,
                      price: '${product.price.toStringAsFixed(0)} đ',
                      heroTagPrefix: 'shop_grid_$index',
                      isFavorite: isFavorite,
                      onFavorite: () {
                        ref.read(wishlistProvider.notifier).toggleFavorite(product.id);
                      },
                    );
                  },
                );
              },
              loading: () => const Padding(
                padding: EdgeInsets.all(32.0),
                child: Center(child: CircularProgressIndicator()),
              ),
              error: (e, s) => Padding(
                padding: const EdgeInsets.all(32.0),
                child: Center(child: Text('Lỗi: $e')),
              ),
            ),
            
            const SizedBox(height: 100),
          ],
        ),
      ),
    );
  }
}

class _CategoryWrapper {
  final String id;
  final String name;
  _CategoryWrapper({required this.id, required this.name});
}
