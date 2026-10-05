import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/mock_data.dart';
import '../../../../core/widgets/cv_top_bar.dart';
import '../../../../core/widgets/cv_search_bar.dart';
import '../../../../core/widgets/cv_section_header.dart';
import '../../../../core/widgets/cv_product_card.dart';

class ShopScreen extends StatelessWidget {
  const ShopScreen({super.key});

  @override
  Widget build(BuildContext context) {
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
                itemCount: MockData.categories.length,
                separatorBuilder: (context, index) => const SizedBox(width: 12),
                itemBuilder: (context, index) {
                  final cat = MockData.categories[index];
                  final isSelected = index == 0;
                  
                  return Container(
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
                      cat,
                      style: AppTypography.bodyMedium.copyWith(
                        fontWeight: FontWeight.w600,
                        color: AppColors.neutral900,
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 32),

            // Sections by category (e.g. Home Decor)
            _buildCategorySection('Trang trí nhà', context),
            _buildCategorySection('Trang sức', context),
            
            const SizedBox(height: 100),
          ],
        ),
      ),
    );
  }

  Widget _buildCategorySection(String title, BuildContext context) {
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
          itemCount: 4,
          itemBuilder: (context, index) {
            final product = MockData.products[index % MockData.products.length];
            return CvProductCard(
              id: product.id,
              imageUrl: 'https://picsum.photos/300/400?random=${index + title.hashCode}',
              name: '${product.name} $title',
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
