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

  void _onStepCancel() {
    if (_currentStep > 0) {
      setState(() => _currentStep -= 1);
    } else {
      context.pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Thanh toán')),
      body: Stepper(
        type: StepperType.vertical,
        currentStep: _currentStep,
        onStepContinue: _onStepContinue,
        onStepCancel: _onStepCancel,
        onStepTapped: (step) => setState(() => _currentStep = step),
        controlsBuilder: (context, details) {
          return Padding(
            padding: const EdgeInsets.only(top: 24.0),
            child: Row(
              children: [
                Expanded(
                  child: CvButton(
                    text: _currentStep == 3 ? 'Hoàn tất thanh toán' : 'Tiếp tục',
                    isLoading: _isLoading,
                    onPressed: details.onStepContinue,
                  ),
                ),
                if (_currentStep > 0) ...[
                  const SizedBox(width: 16),
                  Expanded(
                    child: CvButton(
                      text: 'Quay lại',
                      variant: CvButtonVariant.secondary,
                      isDisabled: _isLoading,
                      onPressed: details.onStepCancel,
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
            isActive: _currentStep >= 3,
            state: _currentStep == 3 ? StepState.editing : StepState.indexed,
          ),
        ],
      ),
    );
  }
}
