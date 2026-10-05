import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_typography.dart';
import 'pressable.dart';

enum CvButtonVariant { primary, secondary, ghost }
enum CvButtonSize { large, medium }

class CvButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final CvButtonVariant variant;
  final CvButtonSize size;
  final bool isLoading;
  final bool isDisabled;
  final IconData? icon;
  final Color? customBackgroundColor;
  final Color? customForegroundColor;

  const CvButton({
    super.key,
    required this.text,
    this.onPressed,
    this.variant = CvButtonVariant.primary,
    this.size = CvButtonSize.large,
    this.isLoading = false,
    this.isDisabled = false,
    this.icon,
    this.customBackgroundColor,
    this.customForegroundColor,
  });

  @override
  Widget build(BuildContext context) {
    final bool effectiveDisabled = isDisabled || isLoading || onPressed == null;
    
    // Determine colors based on variant and state
    Color backgroundColor;
    Color foregroundColor;
    Color borderColor = Colors.transparent;

    switch (variant) {
      case CvButtonVariant.primary:
        backgroundColor = effectiveDisabled ? AppColors.neutral300 : AppColors.primary;
        foregroundColor = effectiveDisabled ? AppColors.neutral600 : AppColors.white;
        break;
      case CvButtonVariant.secondary:
        backgroundColor = effectiveDisabled ? AppColors.neutral200 : AppColors.surfaceTint;
        foregroundColor = effectiveDisabled ? AppColors.neutral400 : AppColors.neutral900;
        break;
      case CvButtonVariant.ghost:
        backgroundColor = Colors.transparent;
        foregroundColor = effectiveDisabled ? AppColors.neutral400 : AppColors.primary;
        borderColor = effectiveDisabled ? AppColors.neutral300 : AppColors.primary;
        break;
    }
    
    if (customBackgroundColor != null) backgroundColor = customBackgroundColor!;
    if (customForegroundColor != null) foregroundColor = customForegroundColor!;

    // Determine dimensions based on size
    final double height = size == CvButtonSize.large ? 56.0 : 48.0;
    final EdgeInsets padding = size == CvButtonSize.large 
        ? const EdgeInsets.symmetric(horizontal: 32)
        : const EdgeInsets.symmetric(horizontal: 24);

    return Pressable(
      enabled: !effectiveDisabled,
      child: Material(
      color: backgroundColor,
      borderRadius: variant == CvButtonVariant.ghost ? null : BorderRadius.circular(100),
      shape: variant == CvButtonVariant.ghost 
          ? RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(100),
              side: BorderSide(color: borderColor, width: 1.5),
            )
          : null,
      child: InkWell(
        onTap: effectiveDisabled ? null : onPressed,
        borderRadius: BorderRadius.circular(100),
        child: Container(
          height: height,
          padding: padding,
          alignment: Alignment.center,
          child: isLoading
              ? SizedBox(
                  width: 24,
                  height: 24,
                  child: CircularProgressIndicator(
                    strokeWidth: 2.5,
                    valueColor: AlwaysStoppedAnimation<Color>(foregroundColor),
                  ),
                )
              : Row(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (icon != null) ...[
                      Icon(icon, color: foregroundColor, size: 20),
                      const SizedBox(width: 8),
                    ],
                    Text(
                      text,
                      style: AppTypography.buttonText.copyWith(color: foregroundColor),
                    ),
                  ],
                ),
        ),
      ),
      ),
    );
  }
}
