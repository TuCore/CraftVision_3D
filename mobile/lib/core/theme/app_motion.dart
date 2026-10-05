import 'package:flutter/material.dart';

/// Centralized motion tokens. Never hardcode durations/curves in features.
abstract final class AppMotion {
  // Durations: small motion is fast, large motion is slower.
  static const Duration fast = Duration(milliseconds: 150);
  static const Duration normal = Duration(milliseconds: 280);
  static const Duration slow = Duration(milliseconds: 450);
  static const Duration staggerStep = Duration(milliseconds: 80);

  // Curves.
  static const Curve standard = Curves.easeInOut;
  static const Curve enter = Curves.easeOutCubic;
  static const Curve exit = Curves.easeInCubic;
  static const Curve overshoot = Curves.easeOutBack;

  // Interaction values.
  static const double pressScale = 0.97;
}
