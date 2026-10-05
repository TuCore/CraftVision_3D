import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/theme/app_motion.dart';
import '../../../../core/widgets/cv_button.dart';
import '../../../../core/utils/mock_data.dart';
import '../widgets/product_top_actions.dart';
import '../widgets/product_image_gallery.dart';
import '../widgets/product_action_panel.dart';
import '../widgets/product_reviews_section.dart';
import '../widgets/product_info_section.dart';
import '../widgets/product_shipping_section.dart';
import '../widgets/product_related_section.dart';

class ProductDetailScreen extends StatefulWidget {
  final String productId;
  final String heroTagPrefix;

  const ProductDetailScreen({
    super.key, 
    required this.productId,
    this.heroTagPrefix = '',
  });

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  final ScrollController _scrollController = ScrollController();
  final GlobalKey _actionPanelKey = GlobalKey();
  bool _showStickyCta = false;
  bool _isFavorite = false;
  int _cartCount = 0;

  late final MockProduct product;

  @override
  void initState() {
    super.initState();
    product = MockData.products.firstWhere(
      (p) => p.id == widget.productId,
      orElse: () => MockData.products.first,
    );
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (!_scrollController.hasClients) return;
    
    // Show sticky CTA after scrolling past the main action panel
    // The image takes ~55% of height, so 400 is a safe threshold
    final shouldShow = _scrollController.offset > 400;
    
    if (shouldShow != _showStickyCta) {
      setState(() {
        _showStickyCta = shouldShow;
      });
    }
  }

  void _addToCart() {
    HapticFeedback.lightImpact();
    setState(() => _cartCount++);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Đã thêm "${product.name}" vào giỏ hàng!')),
    );
  }

  void _toggleFavorite() {
    HapticFeedback.selectionClick();
    setState(() => _isFavorite = !_isFavorite);
    if (_isFavorite) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Đã thêm vào mục yêu thích')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surfaceLight,
      body: SafeArea(
        bottom: false,
        child: Stack(
          children: [
          CustomScrollView(
            controller: _scrollController,
            slivers: [
              SliverToBoxAdapter(
                child: ProductImageGallery(
                  heroTag: '${widget.heroTagPrefix}product_${product.id}',
                  imageUrl: product.imageUrl,
                ),
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 24, 20, 100),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Chips
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.bannerDark,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              'Bestseller',
                              style: AppTypography.bodySmall.copyWith(
                                color: AppColors.white,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.surfaceLight,
                              border: Border.all(color: AppColors.neutral300),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              product.category,
                              style: AppTypography.bodySmall,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      
                      // Price and Title
                      Text(
                        '${product.price.toStringAsFixed(0)} đ',
                        style: AppTypography.heading1.copyWith(color: AppColors.primary, fontSize: 28),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        product.name,
                        style: AppTypography.heading2,
                      ),
                      const SizedBox(height: 12),
                      
                      // Rating Mock
                      Row(
                        children: [
                          const Icon(Icons.star, color: Colors.amber, size: 18),
                          const SizedBox(width: 4),
                          Text(
                            '4.9',
                            style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            '(332 đánh giá)',
                            style: AppTypography.bodyMedium.copyWith(color: AppColors.neutral600),
                          ),
                          const SizedBox(width: 4),
                          const Icon(Icons.chevron_right, size: 18, color: AppColors.neutral600),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // Hot Banner
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.amber.shade50,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.amber.shade200),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.local_fire_department, color: Colors.amber.shade700, size: 20),
                            const SizedBox(width: 8),
                            Text(
                              'Đang hot! 3 người mua trong 24h qua',
                              style: AppTypography.bodyMedium.copyWith(
                                color: Colors.amber.shade900,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Actions panel
                      Container(
                        key: _actionPanelKey,
                        child: ProductActionPanel(
                          onAddToCart: _addToCart,
                          onBuyNow: () => context.push('/checkout'),
                        ),
                      ),
                      
                      const SizedBox(height: 32),
                      Divider(height: 1, thickness: 0.5, color: AppColors.neutral300.withValues(alpha: 0.5)),
                      const SizedBox(height: 32),

                      // Reviews
                      const ProductReviewsSection(),
                      
                      const SizedBox(height: 32),
                      Divider(height: 1, thickness: 0.5, color: AppColors.neutral300.withValues(alpha: 0.5)),
                      const SizedBox(height: 32),

                      // Info
                      ProductInfoSection(description: product.description),
                      
                      const SizedBox(height: 32),
                      Divider(height: 1, thickness: 0.5, color: AppColors.neutral300.withValues(alpha: 0.5)),
                      const SizedBox(height: 32),

                      // Shipping
                      const ProductShippingSection(),
                      
                      const SizedBox(height: 32),
                      Divider(height: 1, thickness: 0.5, color: AppColors.neutral300.withValues(alpha: 0.5)),
                      const SizedBox(height: 32),

                      // Related
                      ProductRelatedSection(
                        category: product.category,
                        currentProductId: product.id,
                        heroTagPrefix: widget.heroTagPrefix,
                      ),
                      
                      // Extra space for sticky button
                      const SizedBox(height: 100),
                    ],
                  ),
                ),
              ),
            ],
          ),

          // Top Floating Actions
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: ProductTopActions(
              onBack: () => context.pop(),
              onCart: () => context.push('/cart'),
              onFavorite: _toggleFavorite,
              cartCount: _cartCount,
            ),
          ),

          // Sticky Bottom CTA
          Positioned(
            bottom: 96, // Above bottom nav
            left: 0,
            right: 0,
            child: AnimatedSlide(
              offset: _showStickyCta ? Offset.zero : const Offset(0, 1),
              duration: AppMotion.normal,
              curve: AppMotion.standard,
              child: AnimatedOpacity(
                opacity: _showStickyCta ? 1.0 : 0.0,
                duration: AppMotion.normal,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  decoration: BoxDecoration(
                    color: Theme.of(context).scaffoldBackgroundColor.withValues(alpha: 0.95),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.05),
                        blurRadius: 10,
                        offset: const Offset(0, -4),
                      ),
                    ],
                  ),
                  child: CvButton(
                    text: 'Thêm vào giỏ',
                    onPressed: _addToCart,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
      ),
    );
  }
}
