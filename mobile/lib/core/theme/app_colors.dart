import 'package:flutter/material.dart';

class AppColors {
  // Brand Colors (Coral)
  static const Color primary = Color(0xFFFF6F61); // Coral
  static const Color primaryLight = Color(0xFFFF958A);
  static const Color primaryDark = Color(0xFFE5584A);

  static const Color bannerDark = Color(0xFF3A2A3F); // Dark purple for banners
  static const Color surfaceTint = Color(0xFFFFE6DC); // Peach tint for active states
  
  static const Gradient primaryGradient = LinearGradient(
    colors: [Color(0xFFFF2A5F), Color(0xFFFF7A00)], // Vibrant Pink to Orange
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );


  // Neutrals & Peach Theme
  static const Color neutral100 = Color(0xFFFFF4EF); // Peach background
  static const Color neutral200 = Color(0xFFFFFFFF); // Surface
  static const Color neutral300 = Color(0xFFF1D9CF); // Borders (peach)
  static const Color neutral400 = Color(0xFFBDBDBD); // Disabled text/icons
  static const Color neutral600 = Color(0xFF7A6A66); // Subtitle/TextSecondary
  static const Color neutral800 = Color(0xFF424242); // Body text
  static const Color neutral900 = Color(0xFF2B2024); // Heading/TextPrimary

  static const Color white = Colors.white;
  static const Color black = Colors.black;

  // Semantic Colors
  static const Color success = Color(0xFF81C784);
  static const Color error = Color(0xFFE57373);
  static const Color warning = Color(0xFFFFB74D);
  static const Color info = Color(0xFF64B5F6);

  // Backgrounds
  static const Color backgroundLight = neutral100;
  static const Color surfaceLight = white;
  
  static const Color backgroundDark = Color(0xFF121212);
  static const Color surfaceDark = Color(0xFF1E1E1E);
}
