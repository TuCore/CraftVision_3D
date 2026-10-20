import 'package:flutter/material.dart';
import '../../../../core/widgets/cv_top_bar.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CvTopBar(title: 'Cài đặt'),
      body: Center(
        child: Text('Cài đặt ứng dụng đang được cập nhật.'),
      ),
    );
  }
}
