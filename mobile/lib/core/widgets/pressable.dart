import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../theme/app_motion.dart';

/// Press-scale feedback with a light haptic.
///
/// Uses a [Listener] for the visual press state so it never competes with
/// inner tap handlers (e.g. InkWell). If [onTap] is provided, Pressable also
/// handles the tap itself.
class Pressable extends StatefulWidget {
  final Widget child;
  final VoidCallback? onTap;
  final bool enabled;
  final bool haptic;

  const Pressable({
    super.key,
    required this.child,
    this.onTap,
    this.enabled = true,
    this.haptic = true,
  });

  @override
  State<Pressable> createState() => _PressableState();
}

class _PressableState extends State<Pressable> {
  bool _pressed = false;

  void _set(bool value) {
    if (!widget.enabled || _pressed == value) return;
    setState(() => _pressed = value);
    if (value && widget.haptic) HapticFeedback.selectionClick();
  }

  @override
  Widget build(BuildContext context) {
    Widget content = AnimatedScale(
      scale: _pressed ? AppMotion.pressScale : 1,
      duration: AppMotion.fast,
      curve: AppMotion.standard,
      child: widget.child,
    );

    if (widget.onTap != null) {
      content = GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: widget.enabled ? widget.onTap : null,
        child: content,
      );
    }

    return Listener(
      onPointerDown: (_) => _set(true),
      onPointerUp: (_) => _set(false),
      onPointerCancel: (_) => _set(false),
      child: content,
    );
  }
}
