import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/network/api_providers.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/cv_top_bar.dart';

class OrderListScreen extends ConsumerWidget {
  const OrderListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orders = ref.watch(ordersProvider);
    return Scaffold(
      backgroundColor: AppColors.neutral100,
      appBar: const CvTopBar(title: 'Đơn hàng của tôi'),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(ordersProvider);
          await ref.read(ordersProvider.future);
        },
        child: orders.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, _) => ListView(
            children: [
              const SizedBox(height: 160),
              Center(child: Text('Không thể tải đơn hàng: $error')),
            ],
          ),
          data: (items) => items.isEmpty
              ? ListView(
                  children: const [
                    SizedBox(height: 160),
                    Center(child: Text('Bạn chưa có đơn hàng.')),
                  ],
                )
              : ListView.separated(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  itemCount: items.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 12),
                  itemBuilder: (_, index) => _OrderCard(order: items[index]),
                ),
        ),
      ),
    );
  }
}

class _OrderCard extends ConsumerWidget {
  const _OrderCard({required this.order});
  final Map<String, dynamic> order;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final items = order['items'] as List<dynamic>? ?? const [];
    final first = items.isEmpty
        ? const <String, dynamic>{}
        : Map<String, dynamic>.from(items.first as Map);
    final status = '${order['orderStatus'] ?? ''}';
    return Material(
      color: AppColors.surfaceLight,
      child: InkWell(
        onTap: () => context.push('/order/detail/${order['id']}'),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '${order['orderCode'] ?? 'Đơn hàng'}',
                    style: AppTypography.heading3,
                  ),
                  Text(
                    status,
                    style: const TextStyle(color: AppColors.primary),
                  ),
                ],
              ),
              const Divider(height: 24),
              Row(
                children: [
                  if ('${first['productImageUrl'] ?? ''}'.isNotEmpty)
                    Image.network(
                      '${first['productImageUrl']}',
                      width: 72,
                      height: 72,
                      fit: BoxFit.cover,
                    )
                  else
                    const SizedBox(
                      width: 72,
                      height: 72,
                      child: Icon(Icons.inventory_2_outlined),
                    ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      '${first['productName'] ?? '${items.length} sản phẩm'}',
                    ),
                  ),
                  Text(
                    '${order['totalAmount'] ?? 0} đ',
                    style: AppTypography.priceText,
                  ),
                ],
              ),
              if (status.toLowerCase().contains('shipping'))
                Align(
                  alignment: Alignment.centerRight,
                  child: OutlinedButton(
                    onPressed: () async {
                      final api = await ref.read(apiServicesProvider.future);
                      await api.orders.receiveOrder('${order['id']}');
                      ref.invalidate(ordersProvider);
                    },
                    child: const Text('Đã nhận hàng'),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
