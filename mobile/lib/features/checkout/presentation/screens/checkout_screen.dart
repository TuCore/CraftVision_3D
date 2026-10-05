import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/cv_button.dart';
import '../../../../core/widgets/cv_input.dart';
import 'package:go_router/go_router.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  int _currentStep = 0;
  bool _isLoading = false;

  void _onStepContinue() {
    if (_currentStep < 3) {
      setState(() => _currentStep += 1);
    } else {
      // Final step -> Submit
      setState(() => _isLoading = true);
      Future.delayed(const Duration(seconds: 2), () {
        if (mounted) {
          setState(() => _isLoading = false);
          context.pushReplacement('/checkout/success');
        }
      });
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
              children: const [
                CvInput(labelText: 'Họ và tên', hintText: 'Nguyễn Văn A'),
                SizedBox(height: 16),
                CvInput(labelText: 'Số điện thoại', hintText: '0901234567'),
                SizedBox(height: 16),
                CvInput(labelText: 'Địa chỉ nhận hàng', hintText: '123 Đường số 4, TP.HCM'),
              ],
            ),
            isActive: _currentStep >= 0,
            state: _currentStep > 0 ? StepState.complete : StepState.indexed,
          ),
          Step(
            title: Text('Quà tặng & Lời chúc', style: AppTypography.heading3),
            content: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text('Chọn mẫu thiệp', style: TextStyle(fontWeight: FontWeight.bold)),
                SizedBox(height: 8),
                CvInput(hintText: 'Nhập lời chúc của bạn (tuỳ chọn)'),
                SizedBox(height: 16),
                Text('Tùy chọn gói quà: Giấy Kraft Vintage', style: TextStyle(color: AppColors.neutral600)),
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
                  leading: const Icon(Icons.radio_button_checked, color: AppColors.primary),
                  title: const Text('Thanh toán khi nhận hàng (COD)'),
                  onTap: () {},
                ),
                ListTile(
                  leading: const Icon(Icons.radio_button_unchecked, color: AppColors.neutral400),
                  title: const Text('Thẻ tín dụng / Ghi nợ'),
                  onTap: () {},
                ),
                ListTile(
                  leading: const Icon(Icons.radio_button_unchecked, color: AppColors.neutral400),
                  title: const Text('Ví Momo'),
                  onTap: () {},
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
                const Text('Tổng tiền: 1,049,000 đ', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.primary)),
                const SizedBox(height: 8),
                Text('Phí vận chuyển: Miễn phí', style: AppTypography.bodyMedium),
                const SizedBox(height: 8),
                Text('Thời gian giao dự kiến: 2-3 ngày', style: AppTypography.bodyMedium),
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
