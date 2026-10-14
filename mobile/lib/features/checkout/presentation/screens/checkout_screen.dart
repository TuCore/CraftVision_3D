import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/network/api_providers.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/cv_button.dart';
import '../../../../core/widgets/cv_input.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  final _name = TextEditingController();
  final _phone = TextEditingController();
  final _address = TextEditingController();
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _loadDefaultAddress();
  }

  Future<void> _loadDefaultAddress() async {
    try {
      final api = await ref.read(apiServicesProvider.future);
      final addresses = await api.addresses.getAddresses();
      if (addresses.isEmpty || !mounted) return;
      final selected = addresses.cast<Map<String, dynamic>>().firstWhere(
        (item) => item['isDefault'] == true,
        orElse: () => addresses.first,
      );
      _name.text = '${selected['receiverName'] ?? ''}';
      _phone.text = '${selected['phone'] ?? ''}';
      _address.text = [
        selected['address'],
        selected['district'],
        selected['province'],
      ].where((value) => value != null && '$value'.isNotEmpty).join(', ');
      setState(() {});
    } catch (_) {
      // The form remains editable when the account has no saved address.
    }
  }

  Future<void> _submit() async {
    if (_name.text.trim().isEmpty ||
        _phone.text.trim().isEmpty ||
        _address.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng nhập đủ thông tin nhận hàng.')),
      );
      return;
    }
    setState(() => _loading = true);
    try {
      final api = await ref.read(apiServicesProvider.future);
      final products = await ref.read(productsProvider.future);
      if (products.isEmpty)
        throw StateError('Không có sản phẩm để tạo đơn hàng.');
      await api.orders.createOrder({
        'receiverName': _name.text.trim(),
        'receiverPhone': _phone.text.trim(),
        'receiverAddress': _address.text.trim(),
        'paymentMethod': 'COD',
        'shippingFee': 0,
        'items': [
          {'productId': products.first.id, 'quantity': 1, 'wantNfc': false},
        ],
      });
      ref.invalidate(ordersProvider);
      if (mounted) context.pushReplacement('/checkout/success');
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('$error')));
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _address.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final products = ref.watch(productsProvider).value ?? const [];
    return Scaffold(
      appBar: AppBar(title: const Text('Thanh toán')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Text('Thông tin giao hàng', style: AppTypography.heading2),
          const SizedBox(height: 16),
          CvInput(labelText: 'Họ và tên', controller: _name),
          const SizedBox(height: 12),
          CvInput(labelText: 'Số điện thoại', controller: _phone),
          const SizedBox(height: 12),
          CvInput(labelText: 'Địa chỉ nhận hàng', controller: _address),
          const SizedBox(height: 28),
          Text('Sản phẩm', style: AppTypography.heading2),
          const SizedBox(height: 8),
          if (products.isNotEmpty)
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: products.first.imageUrl.isEmpty
                  ? const Icon(Icons.inventory_2_outlined)
                  : Image.network(
                      products.first.imageUrl,
                      width: 56,
                      height: 56,
                      fit: BoxFit.cover,
                    ),
              title: Text(products.first.name),
              subtitle: const Text('Số lượng: 1 · COD'),
              trailing: Text('${products.first.price.toStringAsFixed(0)} đ'),
            ),
          const SizedBox(height: 24),
          CvButton(text: 'Đặt hàng', isLoading: _loading, onPressed: _submit),
        ],
      ),
    );
  }
}
