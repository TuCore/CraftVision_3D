import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import 'package:go_router/go_router.dart';

class NfcScanScreen extends StatefulWidget {
  const NfcScanScreen({super.key});

  @override
  State<NfcScanScreen> createState() => _NfcScanScreenState();
}

class _NfcScanScreenState extends State<NfcScanScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  String _statusText = 'Đang chờ thẻ NFC...';
  bool _isDetected = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat();

    // Fake NFC scanning delay
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          _isDetected = true;
          _statusText = 'Đã phát hiện thẻ!';
          _controller.stop();
        });
        
        // Wait 1 second then go to reveal screen
        Future.delayed(const Duration(seconds: 1), () {
          if (mounted) {
            context.pushReplacement('/gift-reveal');
          }
        });
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Quét NFC'),
        backgroundColor: Colors.transparent,
      ),
      extendBodyBehindAppBar: true,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Stack(
              alignment: Alignment.center,
              children: [
                if (!_isDetected)
                  ScaleTransition(
                    scale: Tween(begin: 0.8, end: 1.2).animate(
                      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
                    ),
                    child: Container(
                      width: 150,
                      height: 150,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppColors.primaryLight.withValues(alpha: 0.2),
                      ),
                    ),
                  ),
                Icon(
                  _isDetected ? Icons.check_circle : Icons.nfc,
                  size: 80,
                  color: _isDetected ? AppColors.success : AppColors.primary,
                ),
              ],
            ),
            const SizedBox(height: 32),
            Text(
              _statusText,
              style: AppTypography.heading3.copyWith(
                color: _isDetected ? AppColors.success : AppColors.neutral900,
              ),
            ),
            const SizedBox(height: 16),
            if (!_isDetected)
              Text(
                'Chạm điện thoại của bạn vào hộp quà\nđể xem lời nhắn và mô hình 3D.',
                textAlign: TextAlign.center,
                style: AppTypography.bodyMedium.copyWith(color: AppColors.neutral600),
              ),
          ],
        ),
      ),
    );
  }
}
