import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/cv_button.dart';
import 'greeting_option_card.dart';

class ProductActionPanel extends StatefulWidget {
  final VoidCallback onAddToCart;
  final VoidCallback onBuyNow;

  const ProductActionPanel({
    super.key,
    required this.onAddToCart,
    required this.onBuyNow,
  });

  @override
  State<ProductActionPanel> createState() => _ProductActionPanelState();
}

class _ProductActionPanelState extends State<ProductActionPanel> {
  int quantity = 1;
  bool _isAdding = false;
  bool _isAdded = false;

  void _decrease() {
    if (quantity > 1) {
      setState(() => quantity--);
    }
  }

  void _increase() {
    setState(() => quantity++);
  }

  void _handleAddToCart() async {
    if (_isAdding || _isAdded) return;
    setState(() => _isAdding = true);
    
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 600));
    
    if (!mounted) return;
    setState(() {
      _isAdding = false;
      _isAdded = true;
    });
    
    widget.onAddToCart();
    
    // Reset after a while
    await Future.delayed(const Duration(seconds: 2));
    if (!mounted) return;
    setState(() => _isAdded = false);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Quantity Stepper
        Row(
          children: [
            Text('Số lượng:', style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w600)),
            const SizedBox(width: 16),
            Container(
              decoration: BoxDecoration(
                color: AppColors.surfaceLight,
                border: Border.all(color: AppColors.neutral300),
                borderRadius: BorderRadius.circular(100),
              ),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.remove, size: 20),
                    onPressed: _decrease,
                    color: AppColors.neutral900,
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
                  ),
                  SizedBox(
                    width: 32,
                    child: Text(
                      '$quantity',
                      textAlign: TextAlign.center,
                      style: AppTypography.bodyLarge.copyWith(fontWeight: FontWeight.bold),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.add, size: 20),
                    onPressed: _increase,
                    color: AppColors.neutral900,
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),

        // Main action buttons
        Row(
          children: [
            Expanded(
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 300),
                transitionBuilder: (child, animation) => ScaleTransition(
                  scale: animation,
                  child: child,
                ),
                child: _isAdded 
                  ? CvButton(
                      key: const ValueKey('added'),
                      text: '✓ Đã thêm',
                      onPressed: () {},
                      customBackgroundColor: Colors.green.shade600,
                    )
                  : CvButton(
                      key: const ValueKey('add'),
                      text: _isAdding ? '...' : 'Thêm vào giỏ',
                      onPressed: _handleAddToCart,
                    ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: CvButton(
                text: 'Mua ngay',
                variant: CvButtonVariant.secondary,
                onPressed: widget.onBuyNow,
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),

        // Greeting cards
        GreetingOptionCard(
          title: 'Thiết kế câu chúc riêng',
          badge: 'Mẫu mặc định',
          description: 'Dùng mẫu thiệp cố định ban đầu',
          buttonText: 'Thiết kế',
          icon: Icons.auto_awesome,
          themeColor: AppColors.primary,
          onTap: () => context.push('/create/greeting-ai'),
        ),
        const SizedBox(height: 12),
        GreetingOptionCard(
          title: 'Chọn mẫu từ thư viện',
          badge: '16 mẫu 3D',
          description: 'Kho mẫu thiệp phong phú (Sinh nhật, Tình yêu...)',
          buttonText: 'Chọn mẫu',
          icon: Icons.grid_view,
          themeColor: Colors.amber.shade700,
          onTap: () => context.push('/create/studio'),
        ),
      ],
    );
  }
}
