import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/cv_surface.dart';
import 'package:go_router/go_router.dart';

class CreateHubScreen extends StatelessWidget {
  const CreateHubScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Create & AI Hub'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Bạn muốn sáng tạo gì hôm nay?', style: AppTypography.heading2),
            const SizedBox(height: 8),
            Text('Khám phá sức mạnh của AI để tạo ra món quà độc nhất.', style: AppTypography.bodyMedium),
            const SizedBox(height: 32),
            
            _buildAiCard(
              context,
              title: 'Gift AI',
              subtitle: 'Gợi ý món quà 3D dựa trên mô tả, sở thích, tính cách người nhận.',
              icon: Icons.card_giftcard,
              color: AppColors.primary,
              route: '/create/gift-ai',
            ),
            const SizedBox(height: 16),
            _buildAiCard(
              context,
              title: 'Greeting AI',
              subtitle: 'Viết thiệp chúc mừng đầy cảm xúc với đa dạng giọng văn.',
              icon: Icons.edit_note,
              color: AppColors.surfaceTint,
              route: '/create/greeting-ai',
            ),
            const SizedBox(height: 16),
            _buildAiCard(
              context,
              title: '3D Studio',
              subtitle: 'Tuỳ chỉnh, xem trước và tương tác với mô hình 3D của bạn.',
              icon: Icons.view_in_ar,
              color: AppColors.neutral400,
              route: '/create/studio',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAiCard(BuildContext context, {
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required String route,
  }) {
    return CvSurface(
      variant: CvSurfaceVariant.elevated,
      onTap: () => context.push(route),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(icon, color: color, size: 32),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: AppTypography.heading3),
                const SizedBox(height: 4),
                Text(subtitle, style: AppTypography.bodySmall),
              ],
            ),
          ),
          const SizedBox(width: 8),
          const Icon(Icons.chevron_right, color: AppColors.neutral400),
        ],
      ),
    );
  }
}
