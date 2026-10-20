import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_provider.dart';
import '../../data/datasources/cart_remote_datasource.dart';
import '../../data/repositories/cart_repository.dart';
import '../../data/models/cart_model.dart';

final cartRemoteDataSourceProvider = Provider<CartRemoteDataSource>((ref) {
  final dio = ref.watch(dioProvider);
  return CartRemoteDataSource(dio);
});

final cartRepositoryProvider = Provider<CartRepository>((ref) {
  final remote = ref.watch(cartRemoteDataSourceProvider);
  return CartRepository(remote);
});

class CartNotifier extends AsyncNotifier<CartModel?> {
  @override
  Future<CartModel?> build() async {
    final repo = ref.watch(cartRepositoryProvider);
    try {
      return await repo.getCart();
    } catch (e) {
      return null;
    }
  }

  Future<void> addToCart(String productId, int quantity, {String? selectedOptions}) async {
    final repo = ref.read(cartRepositoryProvider);
    try {
      await repo.addItem({
        'productId': productId,
        'quantity': quantity,
        'selectedOptions': selectedOptions,
      });
      ref.invalidateSelf();
    } catch (e) {
      // error
    }
  }
}

final cartProvider = AsyncNotifierProvider<CartNotifier, CartModel?>(() {
  return CartNotifier();
});
