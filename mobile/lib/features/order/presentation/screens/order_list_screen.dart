import 'package:flutter/material.dart';
import '../../../../core/widgets/cv_top_bar.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/utils/mock_data.dart';

import 'package:go_router/go_router.dart';

class OrderListScreen extends StatefulWidget {
  const OrderListScreen({super.key});

  @override
  State<OrderListScreen> createState() => _OrderListScreenState();
}

class _OrderListScreenState extends State<OrderListScreen> {
  final List<String> _statuses = [
    'Chờ xác nhận',
    'Chờ lấy hàng',
    'Đang giao',
    'Đã giao',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.neutral100,
      appBar: CvTopBar(
        title: 'Đơn hàng của tôi',
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {},
          ),
        ],
      ),
      body: ListView.separated(
        padding: const EdgeInsets.symmetric(vertical: 12),
        itemCount: 8,
        separatorBuilder: (context, index) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final status = _statuses[index % _statuses.length];
          return _buildOrderCard(status, index);
        },
      ),
    );
  }

  Widget _buildOrderCard(String status, int index) {
    final product = MockData.products[index % MockData.products.length];
    
    // Status color mapping
    Color statusColor = AppColors.neutral600;
    if (status == 'Chờ giao hàng' || status == 'Chờ lấy hàng' || status == 'Đã giao' || status == 'Đang giao') {
      statusColor = AppColors.primary; // Shopee uses red/primary for status text
    }

    return Container(
      color: AppColors.surfaceLight,
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header (Shop name + Status)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(2),
                      ),
                      child: Text(
                        'Yêu thích',
                        style: AppTypography.bodySmall.copyWith(color: AppColors.white, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text('doublefair.vn', style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.bold)),
                  ],
                ),
                Text(
                  status,
                  style: AppTypography.bodyMedium.copyWith(color: statusColor),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          const Divider(height: 1, color: AppColors.neutral200),
          
          // Product Info
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  decoration: BoxDecoration(
                    border: Border.all(color: AppColors.neutral200),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: Image.network(
                      product.imageUrl,
                      width: 80,
                      height: 80,
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Text(
                              product.name,
                              style: AppTypography.bodyMedium,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Text('x2', style: AppTypography.bodyMedium.copyWith(color: AppColors.neutral600)),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Phân loại: Mặc định',
                        style: AppTypography.bodySmall.copyWith(color: AppColors.neutral400),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          Text(
                            '${(product.price * 1.2).toStringAsFixed(0)}đ',
                            style: AppTypography.bodySmall.copyWith(
                              color: AppColors.neutral400,
                              decoration: TextDecoration.lineThrough,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            '${product.price.toStringAsFixed(0)}đ',
                            style: AppTypography.bodyMedium,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.neutral200),
          
          // Total
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Text('Tổng số tiền (2 sản phẩm): ', style: AppTypography.bodyMedium),
                Text(
                  '${(product.price * 2).toStringAsFixed(0)}đ',
                  style: AppTypography.bodyLarge.copyWith(fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),

          // Delivery Status Pill
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFFF0FDF4), // Light green tint
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      'Giao hàng thành công vào 2 Thg 10',
                      style: AppTypography.bodyMedium.copyWith(color: const Color(0xFF16A34A)), // Green text
                    ),
                  ),
                  const Icon(Icons.chevron_right, size: 16, color: Color(0xFF16A34A)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          
          // Action Buttons
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: _buildActionButtons(status, product),
            ),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildActionButtons(String status, MockProduct product) {
    return [
      _buildOutlineButton('Xem chi tiết', false, () {
        context.push('/order/detail/${product.id}');
      }),
      const SizedBox(width: 8),
      if (status == 'Đang giao' || status == 'Chờ lấy hàng')
        _buildOutlineButton('Đã nhận được hàng', true, () {}),
      if (status == 'Đã giao')
        _buildOutlineButton('Mua lại', true, () {}),
    ];
  }

  Widget _buildOutlineButton(String text, bool isPrimary, VoidCallback onPressed) {
    return OutlinedButton(
      onPressed: onPressed,
      style: OutlinedButton.styleFrom(
        foregroundColor: isPrimary ? AppColors.primary : AppColors.neutral900,
        side: BorderSide(color: isPrimary ? AppColors.primary : AppColors.neutral300),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        minimumSize: Size.zero,
      ),
      child: Text(text, style: AppTypography.bodyMedium),
    );
  }


}
