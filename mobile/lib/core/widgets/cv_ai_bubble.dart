import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_typography.dart';
import 'cv_surface.dart';

enum CvAiBubbleState { thinking, response, error }

class CvAiBubble extends StatelessWidget {
  final String text;
  final CvAiBubbleState state;

  const CvAiBubble({
    super.key,
    this.text = '',
    this.state = CvAiBubbleState.response,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // AI Avatar Placeholder
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: AppColors.primaryLight,
            shape: BoxShape.circle,
          ),
          child: const Icon(Icons.auto_awesome, color: AppColors.white, size: 16),
        ),
        const SizedBox(width: 12),
        // Bubble Content
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('CraftVision AI', style: AppTypography.labelText),
              const SizedBox(height: 4),
              CvSurface(
                variant: CvSurfaceVariant.flat,
                padding: const EdgeInsets.all(12),
                child: _buildContent(context),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildContent(BuildContext context) {
    switch (state) {
      case CvAiBubbleState.thinking:
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary),
            ),
            const SizedBox(width: 8),
            Text('Đang suy nghĩ...', style: AppTypography.bodyMedium.copyWith(color: AppColors.neutral600)),
          ],
        );
      case CvAiBubbleState.error:
        return Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Icon(Icons.error_outline, color: AppColors.error, size: 20),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                text.isNotEmpty ? text : 'Đã có lỗi xảy ra. Vui lòng thử lại.',
                style: AppTypography.bodyMedium.copyWith(color: AppColors.error),
              ),
            ),
          ],
        );
      case CvAiBubbleState.response:
        return Text(
          text,
          style: AppTypography.bodyMedium,
        );
    }
  }
}
