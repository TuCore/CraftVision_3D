import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/cv_button.dart';
import '../../../../core/utils/mock_data.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  // Mock cart items grouped by shop
  final Map<String, List<MockProduct>> _groupedCart = {
    'wynwynstore': [MockData.products[0]],
    'doublefair.vn': [MockData.products[1]],
  };

  final Map<String, int> _quantities = {};
  final Set<String> _selectedProductIds = {};

  @override
  void initState() {
    super.initState();
    for (var products in _groupedCart.values) {
      for (var p in products) {
        _quantities[p.id] = 1;
      }
    }
  }

  int get _totalProductCount {
    int count = 0;
    for (var products in _groupedCart.values) {
      count += products.length;
    }
    return count;
  }

  bool get _isAllSelected {
    final count = _totalProductCount;
    return count > 0 && _selectedProductIds.length == count;
  }

  void _toggleAll(bool? value) {
    setState(() {
      if (value == true) {
        for (var products in _groupedCart.values) {
          for (var p in products) {
            _selectedProductIds.add(p.id);
          }
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

  bool _isShopSelected(String shopName) {
    final products = _groupedCart[shopName] ?? [];
    if (products.isEmpty) return false;
    return products.every((p) => _selectedProductIds.contains(p.id));
  }

  void _toggleShop(String shopName, bool? value) {
    setState(() {
      final products = _groupedCart[shopName] ?? [];
      if (value == true) {
        for (var p in products) _selectedProductIds.add(p.id);
      } else {
        for (var p in products) _selectedProductIds.remove(p.id);
      }
    });
  }

  void _removeProduct(String shop, String id) {
    setState(() {
      _groupedCart[shop]?.removeWhere((p) => p.id == id);
      if (_groupedCart[shop]?.isEmpty ?? true) {
        _groupedCart.remove(shop);
      }
      _quantities.remove(id);
      _selectedProductIds.remove(id);
    });
  }

  void _updateQuantity(String shop, String id, int delta) {
    setState(() {
      final current = _quantities[id] ?? 1;
      final next = current + delta;
      if (next > 0) {
        _quantities[id] = next;
      } else {
        _removeProduct(shop, id);
      }
    });
  }

  double get _selectedTotalPrice {
    double total = 0;
    for (var products in _groupedCart.values) {
      for (var p in products) {
        if (_selectedProductIds.contains(p.id)) {
          total += p.price * (_quantities[p.id] ?? 1);
        }
      }
    }
    return total;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      appBar: AppBar(
        backgroundColor: AppColors.surfaceLight,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.primary),
          onPressed: () => context.pop(),
        ),
        title: Text(
          'Giỏ hàng (${_totalProductCount})',
          style: AppTypography.heading2.copyWith(fontSize: 18),
        ),
        centerTitle: true,
        actions: [
          TextButton(
            onPressed: () {},
            child: Text('Sửa', style: AppTypography.bodyMedium),
          ),
          IconButton(
            icon: const Icon(Icons.chat_bubble_outline),
            color: AppColors.primary,
            onPressed: () {},
          ),
        ],
      ),
      body: _groupedCart.isEmpty
          ? Center(child: Text('Giỏ hàng trống', style: AppTypography.heading3))
          : ListView(
              padding: const EdgeInsets.only(bottom: 120),
              children: _groupedCart.entries.map((entry) {
                return _buildShopCard(entry.key, entry.value);
              }).toList(),
            ),
      bottomSheet: _groupedCart.isEmpty ? null : _buildStickyCheckoutBar(),
    );
  }

  Widget _buildShopCard(String shopName, List<MockProduct> products) {
    return Container(
      margin: const EdgeInsets.only(top: 12),
      color: AppColors.surfaceLight,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Shop Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
            child: Row(
              children: [
                Checkbox(
                  value: _isShopSelected(shopName),
                  onChanged: (val) => _toggleShop(shopName, val),
                  activeColor: AppColors.primary,
                  side: const BorderSide(color: AppColors.neutral400),
                ),
                const Icon(Icons.storefront, size: 20, color: AppColors.neutral600),
                const SizedBox(width: 8),
                Text(
                  shopName,
                  style: AppTypography.bodyLarge.copyWith(fontWeight: FontWeight.bold),
                ),
                const Icon(Icons.chevron_right, size: 20, color: AppColors.neutral400),
                const Spacer(),
                TextButton(
                  onPressed: () {},
                  child: Text('Sửa', style: AppTypography.bodyMedium.copyWith(color: AppColors.neutral600)),
                ),
              ],
            ),
          ),
          
          const Divider(height: 1, thickness: 0.5, color: AppColors.neutral200),
          
          // Products
          ...products.map((p) => _buildProductItem(shopName, p)),
          
          const Divider(height: 1, thickness: 0.5, color: AppColors.neutral200),
          
          // Shop Voucher
          InkWell(
            onTap: () {},
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
                children: [
                  const Icon(Icons.local_activity_outlined, size: 20, color: AppColors.primary),
                  const SizedBox(width: 8),
                  Text('Thêm Shop Voucher', style: AppTypography.bodyMedium),
                  const Spacer(),
                  const Icon(Icons.chevron_right, size: 20, color: AppColors.neutral400),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProductItem(String shopName, MockProduct product) {
    final quantity = _quantities[product.id] ?? 1;
    final isSelected = _selectedProductIds.contains(product.id);

    return Container(
      padding: const EdgeInsets.only(right: 16, top: 12, bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Checkbox(
            value: isSelected,
            onChanged: (val) => _toggleProduct(product.id, val),
            activeColor: AppColors.primary,
            side: const BorderSide(color: AppColors.neutral400),
          ),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: CachedNetworkImage(
              imageUrl: product.imageUrl,
              width: 80,
              height: 80,
              fit: BoxFit.cover,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  product.name, 
                  style: AppTypography.bodyMedium, 
                  maxLines: 2, 
                  overflow: TextOverflow.ellipsis
                ),
                const SizedBox(height: 8),
                // Variant Dropdown (mock)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.neutral100,
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(color: AppColors.neutral200),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('Phân loại hàng', style: AppTypography.bodySmall),
                      const Icon(Icons.keyboard_arrow_down, size: 14, color: AppColors.neutral600),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '${product.price.toStringAsFixed(0)} đ',
                      style: AppTypography.bodyLarge.copyWith(
                        color: AppColors.primary, 
                        fontWeight: FontWeight.bold
                      ),
                    ),
                    // Shopee-style stepper
                    Container(
                      decoration: BoxDecoration(
                        border: Border.all(color: AppColors.neutral300),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          InkWell(
                            onTap: () => _updateQuantity(shopName, product.id, -1),
                            child: Container(
                              width: 28,
                              height: 28,
                              alignment: Alignment.center,
                              child: const Icon(Icons.remove, size: 16, color: AppColors.neutral600),
                            ),
                          ),
                          Container(
                            width: 32,
                            height: 28,
                            alignment: Alignment.center,
                            decoration: const BoxDecoration(
                              border: Border.symmetric(
                                vertical: BorderSide(color: AppColors.neutral300),
                              ),
                            ),
                            child: Text('$quantity', style: AppTypography.bodyMedium),
                          ),
                          InkWell(
                            onTap: () => _updateQuantity(shopName, product.id, 1),
                            child: Container(
                              width: 28,
                              height: 28,
                              alignment: Alignment.center,
                              child: const Icon(Icons.add, size: 16, color: AppColors.neutral600),
                            ),
                          ),
                        ],
                      ),
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

  Widget _buildStickyCheckoutBar() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surfaceLight,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Shopee Voucher Row
            InkWell(
              onTap: () {},
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Row(
                  children: [
                    const Icon(Icons.local_activity_outlined, size: 20, color: AppColors.primary),
                    const SizedBox(width: 8),
                    Text('Shopee Voucher', style: AppTypography.bodyMedium),
                    const Spacer(),
                    Text('Chọn hoặc nhập mã', style: AppTypography.bodyMedium.copyWith(color: AppColors.neutral400)),
                    const Icon(Icons.chevron_right, size: 20, color: AppColors.neutral400),
                  ],
                ),
              ),
            ),
            const Divider(height: 1, thickness: 0.5, color: AppColors.neutral200),
            // Total Row
            Row(
              children: [
                Row(
                  children: [
                    Checkbox(
                      value: _isAllSelected,
                      onChanged: _toggleAll,
                      activeColor: AppColors.primary,
                      side: const BorderSide(color: AppColors.neutral400),
                    ),
                    Text('Tất cả', style: AppTypography.bodyMedium),
                  ],
                ),
                const Spacer(),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text('Tổng thanh toán', style: AppTypography.bodySmall),
                    Text(
                      '${_selectedTotalPrice.toStringAsFixed(0)} đ',
                      style: AppTypography.bodyLarge.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const SizedBox(width: 12),
                InkWell(
                  onTap: () {
                    if (_selectedProductIds.isNotEmpty) {
                      context.push('/checkout');
                    }
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                    color: AppColors.primary,
                    child: Text(
                      'Mua hàng (${_selectedProductIds.length})',
                      style: AppTypography.buttonText.copyWith(color: Colors.white),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
