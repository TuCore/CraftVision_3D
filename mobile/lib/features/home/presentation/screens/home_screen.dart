import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/mock_data.dart';
import '../../../../core/widgets/cv_top_bar.dart';
import '../../../../core/widgets/cv_search_bar.dart';
import '../../../../core/widgets/cv_section_header.dart';
import '../../../../core/widgets/cv_product_card.dart';

import '../../../../core/theme/app_motion.dart';
import '../../../../core/widgets/pressable.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedTabIndex = 0;

  void _onTabChanged(int index) {
    if (_selectedTabIndex != index) {
      setState(() {
        _selectedTabIndex = index;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
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

            // 4-Square Cards Carousel
            SizedBox(
              height: 260,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                itemCount: 3,
                separatorBuilder: (context, index) => const SizedBox(width: 12),
                itemBuilder: (context, index) {
                  final titles = ['Recently viewed', 'Our favorites', 'Trending now'];
                  final colors = [const Color(0xFF19444B), const Color(0xFF4B3428), const Color(0xFF2E3944)];
                  final urls = [
                    'https://picsum.photos/200/200?random=${index * 4 + 1}',
                    'https://picsum.photos/200/200?random=${index * 4 + 2}',
                    'https://picsum.photos/200/200?random=${index * 4 + 3}',
                    'https://picsum.photos/200/200?random=${index * 4 + 4}',
                  ];
                  return _buildFourSquareCard(titles[index], urls, colors[index]);
                },
              ),
            ),
            const SizedBox(height: 32),
            
            // Categories
            const CvSectionHeader(title: 'Mua theo danh mục', exploreText: 'Xem thêm'),
            SizedBox(
              height: 100,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                itemCount: MockData.categories.length,
                separatorBuilder: (context, index) => const SizedBox(width: 16),
                itemBuilder: (context, index) {
                  return Column(
                    children: [
                      Container(
                        width: 64,
                        height: 64,
                        decoration: BoxDecoration(
                          color: AppColors.surfaceLight,
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.05),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Icon(
                          _getCategoryIcon(index),
                          color: AppColors.primary,
                          size: 28,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        MockData.categories[index],
                        style: AppTypography.labelText.copyWith(color: AppColors.neutral900),
                      ),
                    ],
                  );
                },
              ),
            ),
            const SizedBox(height: 24),

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

            // Masonry Grid (Mocked with 2 columns)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0),
              child: AnimatedSwitcher(
                duration: AppMotion.normal,
                switchInCurve: AppMotion.standard,
                switchOutCurve: AppMotion.standard,
                child: Row(
                  key: ValueKey(_selectedTabIndex),
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        children: _buildProductList(
                          _selectedTabIndex == 0 
                            ? [for (var i = 0; i < MockData.products.length; i += 2) MockData.products[i]]
                            : [for (var i = MockData.products.length - 1; i >= 0; i -= 2) MockData.products[i]],
                          context,
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        children: _buildProductList(
                          _selectedTabIndex == 0 
                            ? [for (var i = 1; i < MockData.products.length; i += 2) MockData.products[i]]
                            : [for (var i = MockData.products.length - 2; i >= 0; i -= 2) MockData.products[i]],
                          context,
                        ),
                      ),
                    ),
                  ],
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

  List<Widget> _buildProductList(List products, BuildContext context) {
    return products.map((product) {
      return Padding(
        padding: const EdgeInsets.only(bottom: 16.0),
        child: CvProductCard(
          id: product.id,
          imageUrl: product.imageUrl,
          name: product.name,
          price: '${product.price.toStringAsFixed(0)} đ',
          heroTagPrefix: 'home_',
          onTap: () => context.push('/home/product/${product.id}', extra: 'home_'),
        ),
      );
    }).toList();
  }

  IconData _getCategoryIcon(int index) {
    final icons = [
      Icons.card_giftcard,
      Icons.home_outlined,
      Icons.favorite_border,
      Icons.watch_outlined,
      Icons.auto_awesome,
    ];
    return icons[index % icons.length];
  }

  Widget _buildFourSquareCard(String title, List<String> imageUrls, Color bgColor) {
    return Container(
      width: MediaQuery.of(context).size.width * 0.65,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              children: [
                Expanded(
                  child: Row(
                    children: [
                      Expanded(child: _buildSquareImage(imageUrls[0])),
                      const SizedBox(width: 6),
                      Expanded(child: _buildSquareImage(imageUrls[1])),
                    ],
                  ),
                ),
                const SizedBox(height: 6),
                Expanded(
                  child: Row(
                    children: [
                      Expanded(child: _buildSquareImage(imageUrls[2])),
                      const SizedBox(width: 6),
                      Expanded(child: _buildSquareImage(imageUrls[3])),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: AppTypography.bodyMedium.copyWith(color: Colors.white, fontWeight: FontWeight.bold),
              ),
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.arrow_forward, color: Colors.white, size: 14),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSquareImage(String url) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(8),
      child: Image.network(
        url,
        width: double.infinity,
        height: double.infinity,
        fit: BoxFit.cover,
      ),
    );
  }
}
