import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/cv_button.dart';
import '../providers/cart_provider.dart';

class CartScreen extends ConsumerStatefulWidget {
  const CartScreen({super.key});

  @override
  ConsumerState<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends ConsumerState<CartScreen> {
  final Set<String> _selectedProductIds = {};

  void _toggleAll(bool? value, List items) {
    setState(() {
      if (value == true) {
        for (var p in items) {
          _selectedProductIds.add(p.productId);
        }
      } else {
        _selectedProductIds.clear();
      }
    });
  }

  void _toggleProduct(String id, bool? value) {
    setState(() {
      if (value == true) {
        _selectedProductIds.add(id);
      } else {
        _selectedProductIds.remove(id);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final cartAsync = ref.watch(cartProvider);

    return Scaffold(
      backgroundColor: AppColors.surfaceLight,
      appBar: AppBar(
        title: Text('Giỏ hàng', style: AppTypography.heading3.copyWith(color: AppColors.neutral900)),
        backgroundColor: AppColors.white,
        centerTitle: true,
        elevation: 0,
        iconTheme: const IconThemeData(color: AppColors.neutral900),
        actions: [
          TextButton(
            onPressed: () {
              // Edit mode
            },
            child: Text('Sửa', style: AppTypography.bodyMedium.copyWith(color: AppColors.primary)),
          ),
        ],
      ),
      body: cartAsync.when(
        data: (cart) {
          if (cart == null || cart.items.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.shopping_cart_outlined, size: 64, color: AppColors.neutral400),
                  const SizedBox(height: 16),
                  Text('Giỏ hàng trống', style: AppTypography.heading3),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: 200,
                    child: CvButton(
                      text: 'Mua sắm ngay',
                      onPressed: () => context.go('/shop'),
                    ),
                  ),
                ],
              ),
            );
          }

          final isAllSelected = cart!.items.isNotEmpty && _selectedProductIds.length == cart!.items.length;
          
          return Column(
            children: [
              Expanded(
                child: ListView.builder(
                  itemCount: cart!.items.length,
                  itemBuilder: (context, index) {
                    final item = cart!.items[index];
                    return _buildCartItem(item);
                  },
                ),
              ),
              _buildBottomBar(cart!.items, isAllSelected),
            ],
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
                  Text('Bạn cần đăng nhập để xem giỏ hàng', style: AppTypography.bodyMedium),
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
          return Center(child: Text('Lỗi: $e'));
        },
      ),
    );
  }

  Widget _buildCartItem(dynamic item) {
    final isSelected = _selectedProductIds.contains(item.productId);

    return Container(
      margin: const EdgeInsets.only(top: 8),
      color: AppColors.white,
      padding: const EdgeInsets.all(16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Checkbox(
            value: isSelected,
            onChanged: (val) => _toggleProduct(item.productId, val),
            activeColor: AppColors.primary,
          ),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: CachedNetworkImage(
              imageUrl: item.productImageUrl,
              width: 80,
              height: 80,
              fit: BoxFit.cover,
              errorWidget: (context, url, error) => Container(color: Colors.grey, width: 80, height: 80),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item.productName, style: AppTypography.bodyMedium, maxLines: 2, overflow: TextOverflow.ellipsis),
                const SizedBox(height: 4),
                if (item.selectedOptions != null && item.selectedOptions!.isNotEmpty)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceLight,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(item.selectedOptions!, style: AppTypography.bodySmall.copyWith(color: AppColors.neutral600)),
                  ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('${item.price.toStringAsFixed(0)} đ', style: AppTypography.priceText),
                    Row(
                      children: [
                        _buildQtyBtn(Icons.remove, () {
                           // implement quantity decrement
                        }),
                        Container(
                          width: 40,
                          alignment: Alignment.center,
                          child: Text('${item.quantity}', style: AppTypography.bodyMedium),
                        ),
                        _buildQtyBtn(Icons.add, () {
                           // implement quantity increment
                        }),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQtyBtn(IconData icon, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          border: Border.all(color: AppColors.neutral300),
          borderRadius: BorderRadius.circular(4),
        ),
        child: Icon(icon, size: 16, color: AppColors.neutral600),
      ),
    );
  }

  Widget _buildBottomBar(List items, bool isAllSelected) {
    double total = 0;
    int count = 0;
    for (var p in items) {
      if (_selectedProductIds.contains(p.productId)) {
        total += p.price * p.quantity;
        count++;
      }
    }

    return Container(
      padding: EdgeInsets.only(
        left: 16,
        right: 16,
        top: 12,
        bottom: MediaQuery.of(context).padding.bottom > 0 ? MediaQuery.of(context).padding.bottom : 12,
      ),
      decoration: BoxDecoration(
        color: AppColors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            offset: const Offset(0, -2),
            blurRadius: 10,
          ),
        ],
      ),
      child: Row(
        children: [
          Checkbox(
            value: isAllSelected,
            onChanged: (val) => _toggleAll(val, items),
            activeColor: AppColors.primary,
          ),
          Text('Tất cả', style: AppTypography.bodyMedium),
          const Spacer(),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                children: [
                  Text('Tổng thanh toán: ', style: AppTypography.bodyMedium),
                  Text('${total.toStringAsFixed(0)} đ', style: AppTypography.priceText),
                ],
              ),
            ],
          ),
          const SizedBox(width: 16),
          SizedBox(
            width: 130,
            height: 44,
            child: CvButton(
              text: 'Mua Hàng ($count)',
              onPressed: count > 0 ? () {
                context.push('/checkout');
              } : null,
            ),
          ),
        ],
      ),
    );
  }
}
