import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/api_providers.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/cv_button.dart';
import '../../../../core/widgets/cv_input.dart';

final manifestCountProvider = FutureProvider<int>((ref) async {
  final api = await ref.watch(apiServicesProvider.future);
  return api.manifest.getWishCount();
});

class ManifestScreen extends ConsumerStatefulWidget {
  const ManifestScreen({super.key});

  @override
  ConsumerState<ManifestScreen> createState() => _ManifestScreenState();
}

class _ManifestScreenState extends ConsumerState<ManifestScreen> {
  final _email = TextEditingController();
  final _wish = TextEditingController();
  bool _submitting = false;

  @override
  void dispose() {
    _email.dispose();
    _wish.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_email.text.trim().isEmpty || _wish.text.trim().isEmpty) return;
    setState(() => _submitting = true);
    try {
      final api = await ref.read(apiServicesProvider.future);
      final result = await api.manifest.makeWish(
        email: _email.text.trim(),
        wishText: _wish.text.trim(),
      );
      ref.invalidate(manifestCountProvider);
      _wish.clear();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${result['message'] ?? 'Đã gửi nguyện ước.'}'),
          ),
        );
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('$error')));
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final count = ref.watch(manifestCountProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Manifest')),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          const Icon(Icons.auto_awesome, size: 72, color: AppColors.primary),
          const SizedBox(height: 16),
          Text(
            'Góc ước nguyện',
            style: AppTypography.heading1,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            count.when(
              data: (value) =>
                  'Đã có $value nguyện ước được gửi đến CraftVision.',
              loading: () => 'Đang tải số nguyện ước...',
              error: (_, _) => 'Hãy gửi điều bạn đang mong ước.',
            ),
            style: AppTypography.bodyLarge,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 32),
          CvInput(
            labelText: 'Email',
            hintText: 'email@example.com',
            controller: _email,
          ),
          const SizedBox(height: 16),
          CvInput(
            labelText: 'Lời nguyện ước',
            hintText: 'Điều bạn đang mong chờ...',
            controller: _wish,
          ),
          const SizedBox(height: 24),
          CvButton(
            text: 'Gửi nguyện ước',
            isLoading: _submitting,
            onPressed: _submit,
          ),
        ],
      ),
    );
  }
}
