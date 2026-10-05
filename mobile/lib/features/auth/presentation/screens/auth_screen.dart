import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/widgets/cv_button.dart';
import '../../../../core/widgets/cv_input.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../core/theme/app_colors.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen>
    with SingleTickerProviderStateMixin {
  bool _isLoading = false;
  int _step = 1;
  bool _rememberMe = true;

  late AnimationController _animCtrl;
  late Animation<double> _bgScale;
  late Animation<double> _logoOpacity;
  late Animation<double> _logoScale;
  late Animation<double> _logoMoveProgress;
  late Animation<double> _formOpacity;
  late Animation<Offset> _formSlide;
  late Animation<double> _bgDim;

  @override
  void initState() {
    super.initState();
    _animCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2500),
    );

    // 0.0 - 0.4: Logo fades in and zooms slightly
    _logoOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animCtrl,
        curve: const Interval(0.0, 0.4, curve: Curves.easeOut),
      ),
    );

    _logoScale = Tween<double>(begin: 0.9, end: 1.0).animate(
      CurvedAnimation(
        parent: _animCtrl,
        curve: const Interval(0.0, 0.8, curve: Curves.easeOutCubic),
      ),
    );

    // 0.4 - 0.85: Logo glides smoothly to top
    _logoMoveProgress = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animCtrl,
        curve: const Interval(0.4, 0.85, curve: Curves.easeInOutCubic),
      ),
    );

    // 0.5 - 1.0: Form fades and slides in elegantly
    _formOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animCtrl,
        curve: const Interval(0.55, 1.0, curve: Curves.easeOut),
      ),
    );

    _formSlide = Tween<Offset>(begin: const Offset(0, 0.15), end: Offset.zero)
        .animate(
          CurvedAnimation(
            parent: _animCtrl,
            curve: const Interval(0.55, 1.0, curve: Curves.easeOutCubic),
          ),
        );

    // Background dims gently
    _bgDim = Tween<double>(begin: 0.1, end: 0.6).animate(
      CurvedAnimation(
        parent: _animCtrl,
        curve: const Interval(0.4, 1.0, curve: Curves.easeOut),
      ),
    );

    // Background slow cinematic zoom (Ken Burns effect)
    _bgScale = Tween<double>(begin: 1.1, end: 1.0).animate(
      CurvedAnimation(
        parent: _animCtrl,
        curve: const Interval(0.0, 1.0, curve: Curves.easeOutCubic),
      ),
    );

    WidgetsBinding.instance.addPostFrameCallback((_) {
      precacheImage(
        const AssetImage('assets/images/splash_bg_new.jpg'),
        context,
      ).then((_) {
        if (mounted) _animCtrl.forward();
      });
    });
  }

  @override
  void dispose() {
    _animCtrl.dispose();
    super.dispose();
  }

  void _handleAuth() {
    setState(() => _isLoading = true);
    Future.delayed(const Duration(seconds: 1), () {
      if (mounted) {
        context.go('/home');
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.neutral900,
      body: Stack(
        children: [
          // 1. Full screen background (tap to replay animation)
          Positioned.fill(
            child: GestureDetector(
              onTap: () {
                _animCtrl.forward(from: 0.0);
              },
              child: AnimatedBuilder(
                animation: _animCtrl,
                builder: (context, child) {
                  return Transform.scale(
                    scale: _bgScale.value,
                    child: Image.asset(
                      'assets/images/splash_bg_new.jpg',
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(color: const Color(0xFFFDE4D0));
                      },
                    ),
                  );
                },
              ),
            ),
          ),

          // 2. Animated dark overlay for contrast
          AnimatedBuilder(
            animation: _bgDim,
            builder: (context, child) {
              return Positioned.fill(
                child: Container(color: Colors.black.withOpacity(_bgDim.value)),
              );
            },
          ),

          // 3. Scrollable Content (Logo and Form)
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(
                horizontal: 24.0,
                vertical: 40.0,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // 3.1 Animated Spacer (Pushes logo to center initially, shrinks to 0)
                  AnimatedBuilder(
                    animation: _animCtrl,
                    builder: (context, child) {
                      final screenHeight = MediaQuery.of(context).size.height;
                      final safeAreaTop = MediaQuery.of(context).padding.top;

                      // Center of screen Y = screenHeight / 2
                      // Column content absolute start Y = safeAreaTop + 40
                      // Logo height = 44 (icon size). Center of logo = Y + 22
                      // Target logo Y = screenHeight / 2 - 22
                      // Initial spacer needed = (screenHeight / 2 - 22) - (safeAreaTop + 40)
                      double initialSpacer =
                          (screenHeight / 2) - safeAreaTop - 62;
                      if (initialSpacer < 0) initialSpacer = 0;

                      final currentSpacer =
                          initialSpacer * (1 - _logoMoveProgress.value);
                      return SizedBox(height: currentSpacer);
                    },
                  ),

                  // 3.2 The Animated Logo
                  AnimatedBuilder(
                    animation: _animCtrl,
                    builder: (context, child) {
                      return Opacity(
                        opacity: _logoOpacity.value,
                        child: Transform.scale(
                          scale: _logoScale.value,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                width: 44,
                                height: 44,
                                decoration: const BoxDecoration(
                                  color: AppColors.white,
                                  shape: BoxShape.circle,
                                ),
                                child: ClipOval(
                                  child: Image.asset('assets/images/logoweb.jpg', fit: BoxFit.cover),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Text(
                                'CraftVision 3D',
                                style: TextStyle(
                                  fontFamily: AppTypography.heading1.fontFamily,
                                  fontSize: 28,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.white,
                                  letterSpacing: -0.5,
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),

                  // Fixed spacing between logo and heading
                  const SizedBox(height: 24),

                  // 3.3 The Auth Form (fades and slides up to catch the logo)
                  AnimatedBuilder(
                    animation: _animCtrl,
                    builder: (context, child) {
                      return Opacity(
                        opacity: _formOpacity.value,
                        child: SlideTransition(
                          position: _formSlide,
                          child: IgnorePointer(
                            ignoring: _formOpacity.value < 0.9,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                Text(
                                  _step == 1
                                      ? 'Bắt đầu điều đặc biệt'
                                      : 'Nhập mật khẩu của bạn',
                                  style: TextStyle(
                                    fontFamily:
                                        AppTypography.heading1.fontFamily,
                                    fontSize: 28,
                                    fontWeight: FontWeight.w700,
                                    height: 1.2,
                                    letterSpacing: -0.5,
                                    color: AppColors.white,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                                const SizedBox(height: 32),
                                _buildFormContainer(),
                                const SizedBox(height: 32),

                                Center(
                                  child: TextButton(
                                    onPressed: () => context.go('/home'),
                                    child: Text(
                                      'Tiếp tục với tư cách khách',
                                      style: AppTypography.bodyMedium.copyWith(
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.white,
                                        decoration: TextDecoration.underline,
                                        decorationColor: AppColors.white,
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  'Bằng cách tiếp tục, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của chúng tôi.',
                                  style: AppTypography.bodySmall.copyWith(
                                    color: AppColors.neutral200,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFormContainer() {
    return Theme(
      data: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: Colors.transparent,
        checkboxTheme: CheckboxThemeData(
          fillColor: MaterialStateProperty.resolveWith(
            (states) => states.contains(MaterialState.selected)
                ? AppColors.primary
                : Colors.transparent,
          ),
          side: BorderSide(color: Colors.white.withOpacity(0.5)),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white.withOpacity(0.08),
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 20,
            vertical: 16,
          ),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
          ),
          hintStyle: AppTypography.bodyLarge.copyWith(color: Colors.white38),
        ),
      ),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.2),
              blurRadius: 30,
              offset: const Offset(0, 15),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(24),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 24, sigmaY: 24),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(24),
                border: Border.all(
                  color: Colors.white.withOpacity(0.2),
                  width: 1.2,
                ),
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Colors.white.withOpacity(0.15),
                    Colors.white.withOpacity(0.05),
                  ],
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (_step == 1) ...[
                    const CvInput(
                      labelText: 'Email',
                      hintText: 'Nhập địa chỉ email của bạn',
                    ),
                    const SizedBox(height: 24),
                    CvButton(
                      text: 'Tiếp tục',
                      isLoading: _isLoading,
                      onPressed: () => setState(() => _step = 2),
                    ),
                  ] else ...[
                    Row(
                      children: [
                        GestureDetector(
                          onTap: () => setState(() => _step = 1),
                          child: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.1),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.arrow_back,
                              color: Colors.white70,
                              size: 20,
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'quynhchinguyen.010205@gmail.com',
                                style: AppTypography.bodyMedium.copyWith(
                                  color: Colors.white,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 2),
                              GestureDetector(
                                onTap: () => setState(() => _step = 1),
                                child: Text(
                                  'Sử dụng email khác',
                                  style: AppTypography.bodySmall.copyWith(
                                    color: AppColors.primaryLight,
                                    decoration: TextDecoration.underline,
                                    decorationColor: AppColors.primaryLight,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    const CvInput(
                      labelText: 'Mật khẩu',
                      hintText: 'Nhập mật khẩu',
                      isPassword: true,
                    ),
                    const SizedBox(height: 8),
                    Align(
                      alignment: Alignment.centerRight,
                      child: TextButton(
                        onPressed: () {},
                        style: TextButton.styleFrom(
                          padding: EdgeInsets.zero,
                          minimumSize: Size.zero,
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                        child: Text(
                          'Đặt lại mật khẩu',
                          style: AppTypography.bodySmall.copyWith(
                            color: Colors.white70,
                            decoration: TextDecoration.underline,
                            decorationColor: Colors.white70,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    CvButton(
                      text: 'Đăng nhập',
                      isLoading: _isLoading,
                      onPressed: _handleAuth,
                    ),
                  ],
                  const SizedBox(height: 24),

                  _buildDivider(),
                  const SizedBox(height: 24),
                  _buildSocialButton(
                    _step == 1 ? 'Tiếp tục với Google' : 'Đăng nhập với Google',
                    Icons.g_mobiledata,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDivider() {
    return Row(
      children: [
        Expanded(
          child: Divider(color: Colors.white.withOpacity(0.2), thickness: 1),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Text(
            'hoặc',
            style: AppTypography.bodySmall.copyWith(color: Colors.white70),
          ),
        ),
        Expanded(
          child: Divider(color: Colors.white.withOpacity(0.2), thickness: 1),
        ),
      ],
    );
  }

  Widget _buildSocialButton(String text, IconData iconData) {
    return Container(
      height: 48,
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withOpacity(0.2), width: 1),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(24),
          onTap: () {},
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(iconData, color: Colors.white, size: 24),
              const SizedBox(width: 8),
              Text(
                text,
                style: AppTypography.buttonText.copyWith(color: Colors.white),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
