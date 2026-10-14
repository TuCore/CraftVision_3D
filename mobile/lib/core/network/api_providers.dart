import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/auth/data/services/auth_service.dart';
import '../../features/shop/data/models/product_view_model.dart';
import 'api_services.dart';

final apiServicesProvider = FutureProvider<ApiServices>((ref) async {
  final services = await ApiServices.create();
  ref.onDispose(services.close);
  return services;
});

final productsProvider = FutureProvider<List<ProductViewModel>>((ref) async {
  final services = await ref.watch(apiServicesProvider.future);
  final page = await services.products.getProducts();
  final items = (page['items'] as List<dynamic>? ?? const []);
  return items
      .map(
        (item) =>
            ProductViewModel.fromJson(Map<String, dynamic>.from(item as Map)),
      )
      .toList();
});

final productCategoriesProvider = FutureProvider<List<Map<String, dynamic>>>((
  ref,
) async {
  final services = await ref.watch(apiServicesProvider.future);
  return services.productCategories.getCategories();
});

final userProfileProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final services = await ref.watch(apiServicesProvider.future);
  return services.user.getProfile();
});

final addressesProvider = FutureProvider<List<Map<String, dynamic>>>((
  ref,
) async {
  final services = await ref.watch(apiServicesProvider.future);
  return services.addresses.getAddresses();
});

final ordersProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final services = await ref.watch(apiServicesProvider.future);
  final page = await services.orders.getMyOrders();
  return (page['items'] as List<dynamic>? ?? const [])
      .map((item) => Map<String, dynamic>.from(item as Map))
      .toList();
});

final productProvider = FutureProvider.family<ProductViewModel, String>((
  ref,
  id,
) async {
  final services = await ref.watch(apiServicesProvider.future);
  return ProductViewModel.fromJson(await services.products.getProduct(id));
});

final reviewsProvider =
    FutureProvider.family<List<Map<String, dynamic>>, String>((
      ref,
      productId,
    ) async {
      final services = await ref.watch(apiServicesProvider.future);
      return services.reviews.getProductReviews(productId);
    });

final authServiceProvider = FutureProvider<AuthService>((ref) async {
  final services = await ref.watch(apiServicesProvider.future);
  return services.auth;
});
