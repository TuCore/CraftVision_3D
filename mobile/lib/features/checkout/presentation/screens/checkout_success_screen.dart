import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/cv_button.dart';
import 'package:go_router/go_router.dart';

class CheckoutSuccessScreen extends StatelessWidget {
  const CheckoutSuccessScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Spacer(),
              const Icon(Icons.check_circle, size: 100, color: AppColors.success),
              const SizedBox(height: 32),
              Text(
                'Đặt hàng thành công!',
                style: AppTypography.heading1,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              Text(
                'Đơn hàng #CV82947 đã được ghi nhận. Chúng tôi sẽ sớm chế tác và gửi đến bạn.',
                style: AppTypography.bodyLarge,
                textAlign: TextAlign.center,
              ),
              const Spacer(),
              CvButton(
                text: 'Theo dõi đơn hàng',
                onPressed: () {
                  // Mocks going to profile/orders
                  context.go('/profile');
                },
              ),
              const SizedBox(height: 16),
              CvButton(
                text: 'Về trang chủ',
                variant: CvButtonVariant.ghost,
                onPressed: () {
                  context.go('/home');
                },
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}
