import 'package:flutter/material.dart';
import '../../../../core/widgets/cv_top_bar.dart';

class HelpScreen extends StatelessWidget {
  const HelpScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CvTopBar(title: 'Trợ giúp'),
      body: Center(
        child: Text('Trợ giúp đang được cập nhật.'),
      ),
    );
  }
}
