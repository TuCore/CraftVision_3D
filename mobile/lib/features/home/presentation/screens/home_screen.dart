import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/cv_top_bar.dart';
import '../../../../core/widgets/cv_search_bar.dart';
import '../../../../core/widgets/cv_section_header.dart';
import '../../../../core/widgets/cv_product_card.dart';
import '../../../../core/theme/app_motion.dart';
import '../../../../core/widgets/pressable.dart';
import '../../../shop/presentation/providers/shop_provider.dart';

import '../../../profile/presentation/providers/wishlist_provider.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  int _selectedTabIndex = 0;
  String _selectedCategoryId = 'all';

  void _onTabChanged(int index) {
    if (_selectedTabIndex != index) {
      setState(() {
        _selectedTabIndex = index;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final categoriesAsync = ref.watch(categoriesProvider);
    final popularProductsAsync = ref.watch(popularProductsProvider);
    final newArrivalsAsync = ref.watch(newArrivalsProvider);
    
    return Scaffold(
      appBar: const CvTopBar(title: 'CraftVision'),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Greeting
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 8.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Chào bạn,', style: AppTypography.labelText),
                  const SizedBox(height: 4),
                  FittedBox(
                    fit: BoxFit.scaleDown,
                    alignment: Alignment.centerLeft,
                    child: Text(
                      'Hôm nay bạn muốn mua gì?',
                      style: AppTypography.heading1,
                    ),
                  ),
                ],
              ),
            ),
            
            // Search Bar
            const CvSearchBar(),
            const SizedBox(height: 24),

            // Banner tĩnh (Hardcode)
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
                          'https://images.unsplash.com/photo-1579208030886-b937da0925dc?q=80&w=400&auto=format&fit=crop', // Temporary hardcoded banner image until API provides it
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
            
            // Categories
            const CvSectionHeader(title: 'Mua theo danh mục', exploreText: 'Xem thêm'),
            const SizedBox(height: 16),
            SizedBox(
              height: 44,
              child: categoriesAsync.when(
                data: (categories) {
                  final allCats = [
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
                error: (e, s) => Center(child: Text('Lỗi: $e')),
              )
            ),
            const SizedBox(height: 32),

            // Featured Products
            const CvSectionHeader(title: 'Sản phẩm nổi bật'),
            
            // Tab-like selection
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0),
              child: Row(
                children: [
                  _buildTab(0, 'Dành cho bạn'),
                  const SizedBox(width: 24),
                  _buildTab(1, 'Mới về'),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Masonry Grid
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0),
              child: AnimatedSwitcher(
                duration: AppMotion.normal,
                switchInCurve: AppMotion.standard,
                switchOutCurve: AppMotion.standard,
                child: Builder(
                  key: ValueKey(_selectedTabIndex),
                  builder: (context) {
                    final asyncValue = _selectedTabIndex == 0 ? popularProductsAsync : newArrivalsAsync;
                    return asyncValue.when(
                      data: (products) {
                         if (products.isEmpty) {
                            return const Padding(
                              padding: EdgeInsets.all(32.0),
                              child: Center(child: Text('Chưa có sản phẩm nào.')),
                            );
                         }
                         return Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: Column(
                                children: _buildProductList(
                                  [for (var i = 0; i < products.length; i += 2) products[i]],
                                  context,
                                  ref,
                                ),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                children: _buildProductList(
                                  [for (var i = 1; i < products.length; i += 2) products[i]],
                                  context,
                                  ref,
                                ),
                              ),
                            ),
                          ],
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
                    );
                  },
                ),
              ),
            ),
            const SizedBox(height: 100), // spacing for bottom nav
          ],
        ),
      ),
    );
  }

  Widget _buildTab(int index, String title) {
    final isSelected = _selectedTabIndex == index;
    return Pressable(
      onTap: () => _onTabChanged(index),
      child: Column(
        children: [
          AnimatedDefaultTextStyle(
            duration: AppMotion.fast,
            style: AppTypography.buttonText.copyWith(
              color: isSelected ? AppColors.primary : AppColors.neutral600,
            ),
            child: Text(title),
          ),
          const SizedBox(height: 4),
          AnimatedContainer(
            duration: AppMotion.fast,
            height: 2,
            width: isSelected ? 32 : 0,
            color: AppColors.primary,
          ),
        ],
      ),
    );
  }

  List<Widget> _buildProductList(List products, BuildContext context, WidgetRef ref) {
    return products.map((product) {
      final isFavorite = ref.watch(wishlistProvider.notifier).isFavorite(product.id);
      return Padding(
        padding: const EdgeInsets.only(bottom: 16.0),
        child: CvProductCard(
          id: product.id,
          imageUrl: product.primaryImageUrl,
          name: product.name,
          price: '${product.price.toStringAsFixed(0)} đ',
          heroTagPrefix: 'home_',
          isFavorite: isFavorite,
          onFavorite: () {
            ref.read(wishlistProvider.notifier).toggleFavorite(product.id);
          },
          onTap: () => context.push('/home/product/${product.id}', extra: 'home_'),
        ),
      );
    }).toList();
  }
}

class _CategoryWrapper {
  final String id;
  final String name;
  _CategoryWrapper({required this.id, required this.name});
}
