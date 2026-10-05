import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/app_theme.dart';
import 'core/router/app_router.dart';

void main() {
  runApp(
    const ProviderScope(
      child: CraftVisionApp(),
    ),
  );
}

class CraftVisionApp extends StatelessWidget {
  const CraftVisionApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'CraftVision 3D',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.light, // Default to light theme per plan
      routerConfig: appRouter,
      debugShowCheckedModeBanner: false,
    );
  }
}
