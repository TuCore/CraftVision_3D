import 'package:flutter/material.dart';
import '../../../../core/widgets/cv_top_bar.dart';

class AddressScreen extends StatelessWidget {
  const AddressScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CvTopBar(title: 'Sổ địa chỉ'),
      body: Center(
        child: Text('Tính năng quản lý địa chỉ đang được cập nhật.'),
      ),
    );
  }
}
