import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'app_shell_scaffold.dart';
import 'page_transitions.dart';

// Import screens
import '../../features/landing/presentation/screens/landing_screen.dart';
import '../../features/auth/presentation/screens/auth_screen.dart';
import '../../features/home/presentation/screens/home_screen.dart';
import '../../features/shop/presentation/screens/shop_screen.dart';
import '../../features/shop/presentation/screens/product_detail_screen.dart';
import '../../features/cart/presentation/screens/cart_screen.dart';
import '../../features/create/presentation/screens/gift_ai_screen.dart';
import '../../features/create/presentation/screens/greeting_ai_screen.dart';
import '../../features/create/presentation/screens/studio_screen.dart';
import '../../features/profile/presentation/screens/profile_screen.dart';
import '../../features/gift_reveal/presentation/screens/nfc_scan_screen.dart';
import '../../features/gift_reveal/presentation/screens/gift_reveal_screen.dart';
import '../../features/checkout/presentation/screens/checkout_screen.dart';
import '../../features/checkout/presentation/screens/checkout_success_screen.dart';
import '../../features/chat/presentation/screens/chat_list_screen.dart';
import '../../features/order/presentation/screens/order_list_screen.dart';
import '../../features/order/presentation/screens/order_detail_screen.dart';

CustomTransitionPage heroPage(GoRouterState state, Widget child) {
  return CustomTransitionPage(
    key: state.pageKey,
    child: child,
    transitionDuration: const Duration(milliseconds: 600),
    reverseTransitionDuration: const Duration(milliseconds: 600),
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      return FadeTransition(
        opacity: CurveTween(curve: Curves.easeInOutCubic).animate(animation),
        child: child,
      );
    },
  );
}

final GlobalKey<NavigatorState> _rootNavigatorKey = GlobalKey<NavigatorState>();
final GlobalKey<NavigatorState> _shellNavigatorHomeKey =
    GlobalKey<NavigatorState>(debugLabel: 'shellHome');
final GlobalKey<NavigatorState> _shellNavigatorChatKey =
    GlobalKey<NavigatorState>(debugLabel: 'shellChat');
final GlobalKey<NavigatorState> _shellNavigatorShopKey =
    GlobalKey<NavigatorState>(debugLabel: 'shellShop');
final GlobalKey<NavigatorState> _shellNavigatorOrderKey =
    GlobalKey<NavigatorState>(debugLabel: 'shellOrder');
final GlobalKey<NavigatorState> _shellNavigatorProfileKey =
    GlobalKey<NavigatorState>(debugLabel: 'shellProfile');

final appRouter = GoRouter(
  navigatorKey: _rootNavigatorKey,
  initialLocation: '/splash',
  routes: [
    GoRoute(
      path: '/splash',
      pageBuilder: (context, state) => fadePage(state, const AuthScreen()),
    ),
    GoRoute(
      path: '/landing',
      pageBuilder: (context, state) => fadePage(state, const LandingScreen()),
    ),
    GoRoute(
      path: '/auth',
      pageBuilder: (context, state) => fadePage(state, const AuthScreen()),
    ),
    GoRoute(
      path: '/nfc-scan',
      pageBuilder: (context, state) =>
          slideFadePage(state, const NfcScanScreen()),
    ),
    GoRoute(
      path: '/gift-reveal',
      pageBuilder: (context, state) =>
          fadePage(state, const GiftRevealScreen()),
    ),
    GoRoute(
      path: '/cart',
      pageBuilder: (context, state) => slideFadePage(state, const CartScreen()),
    ),
    GoRoute(
      path: '/checkout',
      pageBuilder: (context, state) =>
          slideFadePage(state, const CheckoutScreen()),
    ),
    GoRoute(
      path: '/checkout/success',
      pageBuilder: (context, state) =>
          fadePage(state, const CheckoutSuccessScreen()),
    ),

    GoRoute(
      path: '/create/gift-ai',
      pageBuilder: (context, state) =>
          slideFadePage(state, const GiftAiScreen()),
    ),
    GoRoute(
      path: '/create/greeting-ai',
      pageBuilder: (context, state) =>
          slideFadePage(state, const GreetingAiScreen()),
    ),
    GoRoute(
      path: '/create/studio',
      pageBuilder: (context, state) =>
          slideFadePage(state, const StudioScreen()),
    ),

    // Stateful nested navigation based on:
    // https://github.com/flutter/packages/blob/main/packages/go_router/example/lib/stateful_shell_route.dart
    StatefulShellRoute(
      navigatorContainerBuilder: (context, navigationShell, children) {
        return AppShellScaffold(navigationShell: navigationShell, children: children);
      },
      builder: (context, state, navigationShell) => navigationShell,
      branches: [
        StatefulShellBranch(
          navigatorKey: _shellNavigatorHomeKey,
          routes: [
            GoRoute(
              path: '/home',
              pageBuilder: (context, state) =>
                  const NoTransitionPage(child: HomeScreen()),
              routes: [
                GoRoute(
                  path: 'product/:id',
                  pageBuilder: (context, state) {
                    final id = state.pathParameters['id']!;
                    final prefix = state.extra as String? ?? '';
                    return heroPage(state, ProductDetailScreen(productId: id, heroTagPrefix: prefix));
                  },
                ),
              ],
            ),
          ],
        ),
        StatefulShellBranch(
          navigatorKey: _shellNavigatorChatKey,
          routes: [
            GoRoute(
              path: '/chat',
              pageBuilder: (context, state) =>
                  const NoTransitionPage(child: ChatListScreen()),
            ),
          ],
        ),
        StatefulShellBranch(
          navigatorKey: _shellNavigatorShopKey,
          routes: [
            GoRoute(
              path: '/shop',
              pageBuilder: (context, state) =>
                  const NoTransitionPage(child: ShopScreen()),
              routes: [
                GoRoute(
                  path: 'product/:id',
                  pageBuilder: (context, state) {
                    final id = state.pathParameters['id']!;
                    final prefix = state.extra as String? ?? '';
                    return heroPage(state, ProductDetailScreen(productId: id, heroTagPrefix: prefix));
                  },
                ),
              ],
            ),
          ],
        ),
        StatefulShellBranch(
          navigatorKey: _shellNavigatorOrderKey,
          routes: [
            GoRoute(
              path: '/order',
              pageBuilder: (context, state) =>
                  const NoTransitionPage(child: OrderListScreen()),
              routes: [
                GoRoute(
                  path: 'detail/:id',
                  pageBuilder: (context, state) {
                    final id = state.pathParameters['id']!;
                    return slideFadePage(state, OrderDetailScreen(orderId: id));
                  },
                ),
              ],
            ),
          ],
        ),
        StatefulShellBranch(
          navigatorKey: _shellNavigatorProfileKey,
          routes: [
            GoRoute(
              path: '/profile',
              pageBuilder: (context, state) =>
                  const NoTransitionPage(child: ProfileScreen()),
            ),
          ],
        ),
      ],
    ),
  ],
);
