import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/api_providers.dart';
import '../../data/models/product_view_model.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/cv_top_bar.dart';
import '../../../../core/widgets/cv_search_bar.dart';
import '../../../../core/widgets/cv_section_header.dart';
import '../../../../core/widgets/cv_product_card.dart';

class ShopScreen extends ConsumerStatefulWidget {
  const ShopScreen({super.key});

  @override
  ConsumerState<ShopScreen> createState() => _ShopScreenState();
}

class _ShopScreenState extends ConsumerState<ShopScreen> {
  String? _selectedCategory;

  @override
  Widget build(BuildContext context) {
    final productsAsync = ref.watch(productsProvider);
    final categoriesAsync = ref.watch(productCategoriesProvider);
    final allProducts = productsAsync.value ?? const <ProductViewModel>[];
    final categories = categoriesAsync.value ?? const <Map<String, dynamic>>[];
    final products = _selectedCategory == null
        ? allProducts
        : allProducts.where((p) => p.category == _selectedCategory).toList();
    return Scaffold(
      appBar: const CvTopBar(title: 'CraftVision'),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const CvSearchBar(hintText: 'Tìm kiếm sản phẩm 3D...'),
            const SizedBox(height: 16),

            // Banner ngang
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
                              style: AppTypography.heading3.copyWith(
                                color: AppColors.white,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Lấp lánh và rạng rỡ',
                              style: AppTypography.bodySmall.copyWith(
                                color: AppColors.neutral300,
                              ),
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
                          'https://picsum.photos/200/200?random=50',
                          fit: BoxFit.cover,
                          height: double.infinity,
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
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                scrollDirection: Axis.horizontal,
                itemCount: categories.length + 1,
                separatorBuilder: (context, index) => const SizedBox(width: 12),
                itemBuilder: (context, index) {
                  final cat = index == 0
                      ? 'Tất cả'
                      : '${categories[index - 1]['name'] ?? ''}';
                  final isSelected = index == 0
                      ? _selectedCategory == null
                      : _selectedCategory == cat;

                  return GestureDetector(
                    onTap: () => setState(
                      () => _selectedCategory = index == 0 ? null : cat,
                    ),
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
                        border: isSelected
                            ? null
                            : Border.all(
                                color: AppColors.neutral300,
                                width: 1.5,
                              ),
                      ),
                      child: Text(
                        cat,
                        style: AppTypography.bodyMedium.copyWith(
                          fontWeight: FontWeight.w600,
                          color: AppColors.neutral900,
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 32),

            // Sections by category (e.g. Home Decor)
            _buildCategorySection(
              _selectedCategory ?? 'Tất cả sản phẩm',
              products,
              context,
            ),

            const SizedBox(height: 100),
          ],
        ),
      ),
    );
  }

  Widget _buildCategorySection(
    String title,
    List<ProductViewModel> products,
    BuildContext context,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        CvSectionHeader(title: title),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 20),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            childAspectRatio: 0.75,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
          ),
          itemCount: products.length,
          itemBuilder: (context, index) {
            final product = products[index];
            return CvProductCard(
              id: product.id,
              imageUrl: product.imageUrl,
              name: product.name,
              price: '${product.price.toStringAsFixed(0)} đ',
              heroTagPrefix: 'shop_${title.hashCode}_$index',
            );
          },
        ),
        const SizedBox(height: 32),
      ],
    );
  }
}
