import 'package:flutter/material.dart';
import '../theme/app_typography.dart';

class CvInput extends StatelessWidget {
  final String? hintText;
  final String? labelText;
  final String? errorText;
  final bool isPassword;
  final TextEditingController? controller;
  final ValueChanged<String>? onChanged;
  final bool isDisabled;
  final Widget? prefixIcon;
  final Widget? suffixIcon;
  final Color? textColor;
  final Color? labelColor;

  const CvInput({
    super.key,
    this.hintText,
    this.labelText,
    this.errorText,
    this.isPassword = false,
    this.controller,
    this.onChanged,
    this.isDisabled = false,
    this.prefixIcon,
    this.suffixIcon,
    this.textColor,
    this.labelColor,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final finalTextColor = textColor ?? (isDark ? Colors.white : AppTypography.bodyLarge.color);
    final finalLabelColor = labelColor ?? (isDark ? Colors.white70 : AppTypography.labelText.color);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (labelText != null) ...[
          Text(
            labelText!,
            style: AppTypography.labelText.copyWith(color: finalLabelColor),
          ),
          const SizedBox(height: 4),
        ],
        TextFormField(
          controller: controller,
          onChanged: onChanged,
          obscureText: isPassword,
          enabled: !isDisabled,
          style: AppTypography.bodyLarge.copyWith(color: finalTextColor),
          decoration: InputDecoration(
            hintText: hintText,
            errorText: errorText,
            prefixIcon: prefixIcon,
            suffixIcon: suffixIcon,
            // Uses the global inputDecorationTheme from app_theme.dart (or overridden in Theme)
          ),
        ),
      ],
    );
  }
}
