import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/cv_button.dart';
import 'package:go_router/go_router.dart';

class GiftRevealScreen extends StatefulWidget {
  const GiftRevealScreen({super.key});

  @override
  State<GiftRevealScreen> createState() => _GiftRevealScreenState();
}

class _GiftRevealScreenState extends State<GiftRevealScreen> {
  bool _isOpened = false;

  void _openGift() {
    setState(() {
      _isOpened = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundDark, // Dark theme for immersive reveal
      body: SafeArea(
        child: _isOpened ? _buildGiftContent() : _buildClosedBox(),
      ),
    );
  }

  Widget _buildClosedBox() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            'Bạn nhận được một món quà!',
            style: AppTypography.heading2.copyWith(color: AppColors.white),
          ),
          const SizedBox(height: 64),
          GestureDetector(
            onTap: _openGift,
            child: const Icon(
              Icons.card_giftcard,
              size: 150,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 64),
          const Text(
            'Chạm vào hộp quà để mở',
            style: TextStyle(color: AppColors.neutral400, fontSize: 16),
          ),
        ],
      ),
    );
  }

  Widget _buildGiftContent() {
    return Column(
      children: [
        // 3D Viewer Mock
        Expanded(
          flex: 3,
          child: Container(
            width: double.infinity,
            color: AppColors.black,
            child: Stack(
              alignment: Alignment.center,
              children: [
                Image.network(
                  'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop',
                  fit: BoxFit.cover,
                  width: double.infinity,
                  height: double.infinity,
                  opacity: const AlwaysStoppedAnimation(0.7),
                ),
                Text(
                  '(3D Viewer Interactive)',
                  style: AppTypography.bodySmall.copyWith(color: AppColors.white),
                ),
              ],
            ),
          ),
        ),
        
        // Greeting Card
        Expanded(
          flex: 2,
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.all(32),
            decoration: const BoxDecoration(
              color: AppColors.surfaceLight,
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(32),
                topRight: Radius.circular(32),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Người gửi: Nguyễn Văn A', style: AppTypography.labelText),
                const SizedBox(height: 16),
                Text(
                  '"Chúc mừng sinh nhật! Hy vọng món quà nhỏ này sẽ làm bạn mỉm cười. Mãi trân trọng!"',
                  style: AppTypography.heading3.copyWith(
                    fontStyle: FontStyle.italic,
                    height: 1.5,
                  ),
                ),
                const Spacer(),
                CvButton(
                  text: 'Đóng',
                  variant: CvButtonVariant.secondary,
                  onPressed: () {
                    // Go back to wherever they came from, maybe home
                    context.go('/home');
                  },
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
