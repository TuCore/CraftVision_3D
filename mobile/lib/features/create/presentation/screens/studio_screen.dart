import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

import 'dart:typed_data';

import '../../../../core/network/api_providers.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/widgets/cv_button.dart';

class StudioScreen extends ConsumerStatefulWidget {
  const StudioScreen({super.key});

  @override
  ConsumerState<StudioScreen> createState() => _StudioScreenState();
}

class _StudioScreenState extends ConsumerState<StudioScreen> {
  final _picker = ImagePicker();
  Uint8List? _preview;
  String? _uploadedUrl;
  bool _uploading = false;

  Future<void> _pickAndUpload() async {
    final image = await _picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 88,
      maxWidth: 2048,
    );
    if (image == null) return;
    setState(() {
      _uploading = true;
      _preview = null;
    });
    try {
      final bytes = await image.readAsBytes();
      final api = await ref.read(apiServicesProvider.future);
      final result = await api.uploads.uploadImage(image.path);
      if (!mounted) return;
      setState(() {
        _preview = bytes;
        _uploadedUrl = '${result['cloudinaryUrl'] ?? ''}';
      });
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Tải ảnh lên thành công.')));
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('$error')));
      }
    } finally {
      if (mounted) setState(() => _uploading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('3D Studio')),
      body: Column(
        children: [
          // 3D Viewer Placeholder
          Expanded(
            child: Container(
              color: AppColors.neutral200,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  if (_preview != null)
                    Image.memory(
                      _preview!,
                      fit: BoxFit.cover,
                      width: double.infinity,
                      height: double.infinity,
                    )
                  else
                    const Icon(
                      Icons.add_photo_alternate_outlined,
                      size: 100,
                      color: AppColors.primary,
                    ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.black.withValues(alpha: 0.5),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      _uploadedUrl == null
                          ? 'Chọn ảnh để bắt đầu'
                          : 'Ảnh đã được tải lên',
                      style: AppTypography.bodySmall.copyWith(
                        color: AppColors.white,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Controls
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -5),
                ),
              ],
            ),
            child: SafeArea(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Tuỳ chỉnh mô hình', style: AppTypography.heading3),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildControlBtn(Icons.color_lens, 'Màu sắc'),
                      _buildControlBtn(Icons.text_fields, 'Khắc chữ'),
                      _buildControlBtn(Icons.texture, 'Chất liệu'),
                    ],
                  ),
                  const SizedBox(height: 24),
                  CvButton(
                    text: _uploadedUrl == null
                        ? 'Chọn & tải ảnh lên'
                        : 'Chọn ảnh khác',
                    isLoading: _uploading,
                    onPressed: _pickAndUpload,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildControlBtn(IconData icon, String label) {
    return Column(
      children: [
        CircleAvatar(
          radius: 24,
          backgroundColor: AppColors.primaryLight.withValues(alpha: 0.2),
          child: Icon(icon, color: AppColors.primary),
        ),
        const SizedBox(height: 8),
        Text(label, style: AppTypography.bodySmall),
      ],
    );
  }
}
