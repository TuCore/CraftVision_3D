import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/pressable.dart';

class ProductTopActions extends StatefulWidget {
  final VoidCallback onBack;
  final VoidCallback onCart;
  final VoidCallback onFavorite;
  final int cartCount;

  const ProductTopActions({
    super.key,
    required this.onBack,
    required this.onCart,
    required this.onFavorite,
    this.cartCount = 0,
  });

  @override
  State<ProductTopActions> createState() => _ProductTopActionsState();
}

class _ProductTopActionsState extends State<ProductTopActions> {
  Widget _buildGlassButton(IconData icon, VoidCallback onTap, {int badgeCount = 0}) {
    return Pressable(
      onTap: onTap,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColors.white.withValues(alpha: 0.9),
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.1),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Icon(icon, size: 20, color: AppColors.neutral900),
          ),
          if (badgeCount > 0)
            Positioned(
              top: -2,
              right: -2,
              child: TweenAnimationBuilder<double>(
                key: ValueKey(badgeCount),
                tween: Tween<double>(begin: 0.0, end: 1.0),
                duration: const Duration(milliseconds: 400),
                curve: Curves.elasticOut,
                builder: (context, value, child) {
                  return Transform.scale(
                    scale: value,
                    child: child,
                  );
                },
                child: Container(
                  padding: const EdgeInsets.all(5),
                  decoration: const BoxDecoration(
                    color: Colors.red,
                    shape: BoxShape.circle,
                  ),
                  child: Text(
                    badgeCount.toString(),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      height: 1,
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      bottom: false,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _buildGlassButton(Icons.arrow_back, widget.onBack),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildGlassButton(Icons.chat_bubble_outline, () {}),
                const SizedBox(width: 12),
                _buildGlassButton(Icons.favorite_border, widget.onFavorite),
                const SizedBox(width: 12),
                _buildGlassButton(Icons.shopping_cart_outlined, widget.onCart, badgeCount: widget.cartCount),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
