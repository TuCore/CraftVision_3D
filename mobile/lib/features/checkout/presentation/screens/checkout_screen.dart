import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/cv_button.dart';
import '../../../../core/widgets/cv_input.dart';
import '../../../order/presentation/providers/order_provider.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  int _currentStep = 0;
  bool _isLoading = false;

  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _addressController = TextEditingController();
  final TextEditingController _noteController = TextEditingController();
  
  String _paymentMethod = 'COD';

  Future<void> _submitOrder() async {
    setState(() => _isLoading = true);
    
    try {
      final repository = ref.read(orderRepositoryProvider);
      // Constructing a payload that backend expects. 
      // The backend has `CreateOrderDto` which probably expects shipping information.
      await repository.createOrder({
        'shippingAddress': _addressController.text.trim(),
        'shippingPhone': _phoneController.text.trim(),
        'notes': _noteController.text.trim(),
        // paymentMethod etc. might be needed depending on API
      });

      setState(() => _isLoading = false);
      
      // Navigate directly to Order History and invalidate so it fetches the new order.
      ref.invalidate(ordersProvider);
      context.go('/order');
      
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Lỗi khi đặt hàng: $e')),
      );
    }
  }

  void _onStepContinue() {
    if (_currentStep < 3) {
      setState(() => _currentStep += 1);
    } else {
      _submitOrder();
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
                  ),
                ],
              ],
            ),
          );
        },
        steps: [
          Step(
            title: Text('Giao hàng', style: AppTypography.heading3),
            content: Column(
              children: [
                CvInput(
                  controller: _nameController,
                  labelText: 'Họ và tên', 
                  hintText: 'Nguyễn Văn A'
                ),
                const SizedBox(height: 16),
                CvInput(
                  controller: _phoneController,
                  labelText: 'Số điện thoại', 
                  hintText: '0901234567'
                ),
                const SizedBox(height: 16),
                CvInput(
                  controller: _addressController,
                  labelText: 'Địa chỉ nhận hàng', 
                  hintText: '123 Đường số 4, TP.HCM'
                ),
              ],
            ),
            isActive: _currentStep >= 0,
            state: _currentStep > 0 ? StepState.complete : StepState.indexed,
          ),
          Step(
            title: Text('Quà tặng & Lời chúc', style: AppTypography.heading3),
            content: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Chọn mẫu thiệp', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                CvInput(
                  controller: _noteController,
                  hintText: 'Nhập lời chúc của bạn (tuỳ chọn)'
                ),
                const SizedBox(height: 16),
                const Text('Tùy chọn gói quà: Giấy Kraft Vintage', style: TextStyle(color: AppColors.neutral600)),
              ],
            ),
            isActive: _currentStep >= 1,
            state: _currentStep > 1 ? StepState.complete : StepState.indexed,
          ),
          Step(
            title: Text('Thanh toán', style: AppTypography.heading3),
            content: Column(
              children: [
                ListTile(
                  leading: Icon(
                    _paymentMethod == 'COD' ? Icons.radio_button_checked : Icons.radio_button_unchecked, 
                    color: _paymentMethod == 'COD' ? AppColors.primary : AppColors.neutral400
                  ),
                  title: const Text('Thanh toán khi nhận hàng (COD)'),
                  onTap: () => setState(() => _paymentMethod = 'COD'),
                ),
                ListTile(
                  leading: Icon(
                    _paymentMethod == 'PAYOS' ? Icons.radio_button_checked : Icons.radio_button_unchecked, 
                    color: _paymentMethod == 'PAYOS' ? AppColors.primary : AppColors.neutral400
                  ),
                  title: const Text('Thanh toán PayOS'),
                  onTap: () => setState(() => _paymentMethod = 'PAYOS'),
                ),
              ],
            ),
            isActive: _currentStep >= 2,
            state: _currentStep > 2 ? StepState.complete : StepState.indexed,
          ),
          Step(
            title: Text('Xác nhận', style: AppTypography.heading3),
            content: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Ideally calculate total from CartProvider here, but for now we just show a static summary.
                const Text('Vui lòng kiểm tra lại thông tin đơn hàng.', style: TextStyle(fontSize: 16)),
                const SizedBox(height: 8),
                Text('Phương thức thanh toán: $_paymentMethod', style: AppTypography.bodyMedium),
              ],
            ),
          const SizedBox(height: 24),
          CvButton(text: 'Đặt hàng', isLoading: _loading, onPressed: _submit),
        ],
      ),
    );
  }
}
