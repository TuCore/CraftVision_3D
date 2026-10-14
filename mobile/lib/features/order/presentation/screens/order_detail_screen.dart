import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/api_providers.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/cv_top_bar.dart';

final orderDetailProvider = FutureProvider.family<Map<String, dynamic>, String>(
  (ref, id) async {
    final api = await ref.watch(apiServicesProvider.future);
    return api.orders.getOrder(id);
  },
);

class OrderDetailScreen extends ConsumerWidget {
  const OrderDetailScreen({super.key, required this.orderId});
  final String orderId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final order = ref.watch(orderDetailProvider(orderId));
    return Scaffold(
      backgroundColor: AppColors.neutral100,
      appBar: const CvTopBar(title: 'Chi tiết đơn hàng'),
      body: order.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) =>
            Center(child: Text('Không thể tải đơn hàng: $error')),
        data: (data) {
          final items = data['items'] as List<dynamic>? ?? const [];
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Card(
                color: AppColors.primary,
                child: ListTile(
                  title: Text(
                    '${data['orderStatus'] ?? ''}',
                    style: AppTypography.heading2.copyWith(color: Colors.white),
                  ),
                  subtitle: Text(
                    '${data['orderCode'] ?? ''}',
                    style: const TextStyle(color: Colors.white70),
                  ),
                ),
              ),
              Card(
                child: Column(
                  children: [
                    for (final raw in items)
                      Builder(
                        builder: (_) {
                          final item = Map<String, dynamic>.from(raw as Map);
                          return ListTile(
                            leading: '${item['productImageUrl'] ?? ''}'.isEmpty
                                ? const Icon(Icons.inventory_2_outlined)
                                : Image.network(
                                    '${item['productImageUrl']}',
                                    width: 56,
                                    height: 56,
                                    fit: BoxFit.cover,
                                  ),
                            title: Text('${item['productName'] ?? ''}'),
                            subtitle: Text('x${item['quantity'] ?? 0}'),
                            trailing: Text('${item['subTotal'] ?? 0} đ'),
                          );
                        },
                      ),
                  ],
                ),
              ),
              Card(
                child: ListTile(
                  leading: const Icon(Icons.location_on_outlined),
                  title: Text(
                    '${data['receiverName'] ?? ''} · ${data['receiverPhone'] ?? ''}',
                  ),
                  subtitle: Text('${data['receiverAddress'] ?? ''}'),
                ),
              ),
              Card(
                child: ListTile(
                  title: const Text('Tổng thanh toán'),
                  trailing: Text(
                    '${data['totalAmount'] ?? 0} đ',
                    style: AppTypography.priceText,
                  ),
                ),
              ),
              if ('${data['orderStatus'] ?? ''}'.toLowerCase().contains(
                'pending',
              ))
                OutlinedButton(
                  onPressed: () async {
                    final api = await ref.read(apiServicesProvider.future);
                    await api.orders.cancelOrder(orderId);
                    ref.invalidate(orderDetailProvider(orderId));
                    ref.invalidate(ordersProvider);
                  },
                  child: const Text('Hủy đơn'),
                ),
            ],
          );
        },
      ),
    );
  }
}
