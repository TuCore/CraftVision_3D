import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

enum CvSurfaceVariant { flat, elevated, glass }

class CvSurface extends StatelessWidget {
  final Widget child;
  final CvSurfaceVariant variant;
  final EdgeInsetsGeometry padding;
  final double borderRadius;
  final bool isSelected;
  final bool isDisabled;
  final VoidCallback? onTap;

  const CvSurface({
    super.key,
    required this.child,
    this.variant = CvSurfaceVariant.flat,
    this.padding = const EdgeInsets.all(16.0),
    this.borderRadius = 16.0,
    this.isSelected = false,
    this.isDisabled = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final bool isDark = theme.brightness == Brightness.dark;

    Color backgroundColor;
    List<BoxShadow>? shadows;
    Border? border;

    // Disabled state overrides
    if (isDisabled) {
      backgroundColor = isDark ? AppColors.neutral800.withValues(alpha: 0.5) : AppColors.neutral200;
      border = null;
    } else {
      switch (variant) {
        case CvSurfaceVariant.flat:
          backgroundColor = theme.colorScheme.surface;
          border = Border.all(
            color: isSelected ? AppColors.primary : (isDark ? AppColors.neutral800 : AppColors.neutral200),
            width: isSelected ? 2.0 : 1.0,
          );
          break;
        case CvSurfaceVariant.elevated:
          backgroundColor = theme.colorScheme.surface;
          shadows = [
            BoxShadow(
              color: isDark ? Colors.black45 : AppColors.neutral300.withValues(alpha: 0.5),
              blurRadius: 16,
              offset: const Offset(0, 4),
            )
          ];
          border = isSelected ? Border.all(color: AppColors.primary, width: 2.0) : null;
          break;
        case CvSurfaceVariant.glass:
          backgroundColor = theme.colorScheme.surface.withValues(alpha: 0.7);
          border = Border.all(
            color: isSelected ? AppColors.primary : theme.colorScheme.onSurface.withValues(alpha: 0.1),
            width: isSelected ? 2.0 : 1.0,
          );
          // Note: Full glass effect would typically use BackdropFilter. 
          // For simplicity in the component gallery, we just use opacity.
          break;
      }
    }

    final surface = Container(
      padding: padding,
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(borderRadius),
        boxShadow: shadows,
        border: border,
      ),
      child: child,
    );

    if (onTap != null && !isDisabled) {
      return GestureDetector(
        onTap: onTap,
        child: surface,
      );
    }

    return surface;
  }
}
