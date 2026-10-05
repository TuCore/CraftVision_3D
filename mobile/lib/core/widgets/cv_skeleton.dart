import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class CvSkeleton extends StatefulWidget {
  final double? width;
  final double? height;
  final BorderRadiusGeometry? borderRadius;
  final BoxShape shape;

  const CvSkeleton({
    super.key,
    this.width,
    this.height,
    this.borderRadius,
    this.shape = BoxShape.rectangle,
  });

  @override
  State<CvSkeleton> createState() => _CvSkeletonState();
}

class _CvSkeletonState extends State<CvSkeleton> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Container(
          width: widget.width,
          height: widget.height,
          decoration: BoxDecoration(
            color: AppColors.neutral200.withOpacity(
              0.5 + 0.5 * (0.5 * (1 + (1 - 2 * _controller.value).abs() * -1)), // simple pulse
            ),
            borderRadius: widget.shape == BoxShape.circle ? null : (widget.borderRadius ?? BorderRadius.circular(8)),
            shape: widget.shape,
          ),
        );
      },
    );
  }
}
