import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/widgets/cv_top_bar.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/cv_button.dart';
import '../providers/order_provider.dart';

class OrderListScreen extends ConsumerWidget {
  const OrderListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ordersAsync = ref.watch(ordersProvider);

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
      body: ordersAsync.when(
        data: (orders) {
          if (orders.isEmpty) {
            return const Center(child: Text('Bạn chưa có đơn hàng nào.'));
          }
          // Sort orders by newest first
          final sortedOrders = List.from(orders)..sort((a, b) => b.createdAt.compareTo(a.createdAt));
          
          return ListView.separated(
            padding: const EdgeInsets.symmetric(vertical: 12),
            itemCount: sortedOrders.length,
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final order = sortedOrders[index];
              return _buildOrderCard(order, context);
            },
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
                  Text('Bạn cần đăng nhập để xem đơn hàng', style: AppTypography.bodyMedium),
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
          return Center(child: Text('Lỗi tải dữ liệu: $e'));
        },
      ),
    );
  }

  Widget _buildOrderCard(dynamic order, BuildContext context) {
    final statusColor = order.status == 'pending' ? AppColors.warning : AppColors.primary;
    
    // We display the first item as a summary or loop through all items
    return InkWell(
      onTap: () {
        // Navigate to order details if implemented
        // context.push('/order/${order.id}');
      },
      child: Container(
        color: AppColors.surfaceLight,
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Đơn hàng #${order.orderNumber}', style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.bold)),
                  Text(
                    order.status.toUpperCase(),
                    style: AppTypography.bodyMedium.copyWith(color: statusColor, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            const Divider(height: 1, color: AppColors.neutral200),
            
            // Items
            if (order.items != null && order.items.isNotEmpty)
              ...order.items.map((item) => Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        color: AppColors.neutral200,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      // If the item had product images, we'd use them, but we only have product name for now
                      child: const Icon(Icons.image_outlined, color: AppColors.neutral400),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(item.productName, style: AppTypography.bodyLarge, maxLines: 2, overflow: TextOverflow.ellipsis),
                          const SizedBox(height: 4),
                          if (item.selectedOptions != null && item.selectedOptions.isNotEmpty)
                            Text(item.selectedOptions, style: AppTypography.bodySmall.copyWith(color: AppColors.neutral600)),
                          const SizedBox(height: 4),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('${item.unitPrice.toStringAsFixed(0)} đ', style: AppTypography.bodyMedium),
                              Text('x${item.quantity}', style: AppTypography.bodyMedium),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              )).toList(),
              
            const Divider(height: 1, color: AppColors.neutral200),
            
            // Footer
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('${order.items?.length ?? 0} sản phẩm', style: AppTypography.bodyMedium.copyWith(color: AppColors.neutral600)),
                  Row(
                    children: [
                      Text('Thành tiền: ', style: AppTypography.bodyMedium),
                      Text('${order.totalAmount.toStringAsFixed(0)} đ', style: AppTypography.priceText),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
