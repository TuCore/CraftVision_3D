import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_provider.dart';
import '../../data/datasources/wishlist_remote_datasource.dart';
import '../../data/repositories/wishlist_repository.dart';
import '../../data/models/wishlist_model.dart';

final wishlistRemoteDataSourceProvider = Provider<WishlistRemoteDataSource>((ref) {
  final dio = ref.watch(dioProvider);
  return WishlistRemoteDataSource(dio);
});

final wishlistRepositoryProvider = Provider<WishlistRepository>((ref) {
  final remote = ref.watch(wishlistRemoteDataSourceProvider);
  return WishlistRepository(remote);
});

class WishlistNotifier extends AsyncNotifier<WishlistModel?> {
  @override
  Future<WishlistModel?> build() async {
    final repo = ref.watch(wishlistRepositoryProvider);
    try {
      return await repo.getWishlist();
    } catch (e) {
      return null;
    }
  }

  Future<void> toggleFavorite(String productId) async {
    final repo = ref.read(wishlistRepositoryProvider);
    final isFav = isFavorite(productId);

    try {
      if (isFav) {
        await repo.removeItem(productId);
      } else {
        await repo.addItem({'productId': productId});
      }
      ref.invalidateSelf();
    } catch (e) {
      // Revert handle error
    }
  }

  bool isFavorite(String productId) {
    if (state.value == null) return false;
    return state.value!.items.any((i) => i.productId == productId);
  }
}

final wishlistProvider = AsyncNotifierProvider<WishlistNotifier, WishlistModel?>(() {
  return WishlistNotifier();
});
