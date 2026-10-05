import 'package:flutter/material.dart';
import '../theme/app_typography.dart';
import 'cv_button.dart';
import 'cv_surface.dart';
import 'cv_input.dart';
import 'cv_ai_bubble.dart';

class WidgetGalleryScreen extends StatefulWidget {
  const WidgetGalleryScreen({super.key});

  @override
  State<WidgetGalleryScreen> createState() => _WidgetGalleryScreenState();
}

class _WidgetGalleryScreenState extends State<WidgetGalleryScreen> {
  bool _isDark = false;

  @override
  Widget build(BuildContext context) {
    // A little hack to force dark mode locally for the gallery
    return Theme(
      data: _isDark ? Theme.of(context).copyWith(brightness: Brightness.dark) : Theme.of(context),
      child: Scaffold(
        appBar: AppBar(
          title: const Text('UI Components'),
          actions: [
            IconButton(
              icon: Icon(_isDark ? Icons.light_mode : Icons.dark_mode),
              onPressed: () => setState(() => _isDark = !_isDark),
            ),
          ],
        ),
        body: ListView(
          padding: const EdgeInsets.all(24.0),
          children: [
            _buildSectionTitle('Typography'),
            Text('Heading 1', style: AppTypography.heading1),
            Text('Heading 2', style: AppTypography.heading2),
            Text('Heading 3', style: AppTypography.heading3),
            const SizedBox(height: 8),
            Text('Body Large - The quick brown fox jumps over the lazy dog.', style: AppTypography.bodyLarge),
            Text('Body Medium - The quick brown fox jumps over the lazy dog.', style: AppTypography.bodyMedium),
            Text('Body Small - The quick brown fox jumps over the lazy dog.', style: AppTypography.bodySmall),
            
            _buildDivider(),
            _buildSectionTitle('CvButton - Primary'),
            const CvButton(text: 'Default Primary'),
            const SizedBox(height: 8),
            const CvButton(text: 'With Icon', icon: Icons.shopping_bag),
            const SizedBox(height: 8),
            const CvButton(text: 'Loading Primary', isLoading: true),
            const SizedBox(height: 8),
            const CvButton(text: 'Disabled Primary', isDisabled: true),
            
            const SizedBox(height: 16),
            _buildSectionTitle('CvButton - Secondary & Ghost'),
            const CvButton(text: 'Secondary Button', variant: CvButtonVariant.secondary),
            const SizedBox(height: 8),
            const CvButton(text: 'Ghost Button', variant: CvButtonVariant.ghost),
            
            _buildDivider(),
            _buildSectionTitle('CvSurface (Cards)'),
            const CvSurface(
              variant: CvSurfaceVariant.flat,
              child: Text('Flat Surface (Default)'),
            ),
            const SizedBox(height: 16),
            const CvSurface(
              variant: CvSurfaceVariant.elevated,
              child: Text('Elevated Surface (Shadow)'),
            ),
            const SizedBox(height: 16),
            const CvSurface(
              variant: CvSurfaceVariant.flat,
              isSelected: true,
              child: Text('Selected Surface'),
            ),
            const SizedBox(height: 16),
            const CvSurface(
              variant: CvSurfaceVariant.flat,
              isDisabled: true,
              child: Text('Disabled Surface'),
            ),

            _buildDivider(),
            _buildSectionTitle('CvInput'),
            const CvInput(
              labelText: 'Email',
              hintText: 'Enter your email',
              prefixIcon: Icon(Icons.email_outlined),
            ),
            const SizedBox(height: 16),
            const CvInput(
              labelText: 'Password',
              hintText: 'Enter your password',
              isPassword: true,
              errorText: 'Password must be at least 8 characters',
            ),
            const SizedBox(height: 16),
            const CvInput(
              labelText: 'Disabled Input',
              hintText: 'Cannot type here',
              isDisabled: true,
            ),

            _buildDivider(),
            _buildSectionTitle('CvAiBubble'),
            const CvAiBubble(
              state: CvAiBubbleState.thinking,
            ),
            const SizedBox(height: 16),
            const CvAiBubble(
              state: CvAiBubbleState.response,
              text: 'Chào bạn! Mình có thể giúp gì cho bạn hôm nay? Bạn muốn tìm quà tặng sinh nhật hay quà kỷ niệm?',
            ),
            const SizedBox(height: 16),
            const CvAiBubble(
              state: CvAiBubbleState.error,
              text: 'Kết nối mạng không ổn định. Vui lòng thử lại.',
            ),
            const SizedBox(height: 48), // Bottom padding
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Text(title, style: AppTypography.heading3),
    );
  }

  Widget _buildDivider() {
    return const Padding(
      padding: EdgeInsets.symmetric(vertical: 32.0),
      child: Divider(),
    );
  }
}
