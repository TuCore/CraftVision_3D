import '../datasources/wishlist_remote_datasource.dart';
import '../models/wishlist_model.dart';

class WishlistRepository {
  final WishlistRemoteDataSource _remoteDataSource;

  WishlistRepository(this._remoteDataSource);

  Future<WishlistModel> getWishlist() async {
    return await _remoteDataSource.getWishlist();
  }

  Future<WishlistModel> addItem(Map<String, dynamic> dto) async {
    return await _remoteDataSource.addItem(dto);
  }

  Future<WishlistModel> removeItem(String productId) async {
    return await _remoteDataSource.removeItem(productId);
  }
}
