import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/network/api_providers.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/cv_button.dart';
import '../../../../core/widgets/cv_input.dart';

class NfcScanScreen extends ConsumerStatefulWidget {
  const NfcScanScreen({super.key});

  @override
  ConsumerState<NfcScanScreen> createState() => _NfcScanScreenState();
}

class _NfcScanScreenState extends ConsumerState<NfcScanScreen> {
  final _tagCode = TextEditingController();
  bool _loading = false;

  @override
  void dispose() {
    _tagCode.dispose();
    super.dispose();
  }

  Future<void> _lookup() async {
    if (_tagCode.text.trim().isEmpty) return;
    setState(() => _loading = true);
    try {
      final api = await ref.read(apiServicesProvider.future);
      final tag = await api.nfc.getTag(_tagCode.text.trim());
      final secretKey = '${tag['secretKey'] ?? ''}';
      if (secretKey.isEmpty)
        throw StateError('Thẻ NFC chưa được liên kết với quà.');
      if (mounted) context.pushReplacement('/gift-reveal', extra: secretKey);
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
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Quét NFC')),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          const SizedBox(height: 80),
          const Icon(Icons.nfc, size: 100, color: AppColors.primary),
          const SizedBox(height: 32),
          CvInput(
            labelText: 'Mã NFC',
            hintText: 'Nhập mã đọc được từ thẻ NFC',
            controller: _tagCode,
          ),
          const SizedBox(height: 20),
          CvButton(
            text: 'Kiểm tra thẻ',
            isLoading: _loading,
            onPressed: _lookup,
          ),
        ],
      ),
    );
  }
}
