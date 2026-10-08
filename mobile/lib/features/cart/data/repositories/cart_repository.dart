import '../datasources/cart_remote_datasource.dart';
import '../models/cart_model.dart';

class CartRepository {
  final CartRemoteDataSource _remoteDataSource;

  CartRepository(this._remoteDataSource);

  Future<CartModel> getCart() async {
    return await _remoteDataSource.getCart();
  }

  Future<CartModel> addItem(Map<String, dynamic> dto) async {
    return await _remoteDataSource.addItem(dto);
  }

  Future<CartModel> updateItem(String id, Map<String, dynamic> dto) async {
    return await _remoteDataSource.updateItem(id, dto);
  }

  Future<CartModel> removeItem(String id) async {
    return await _remoteDataSource.removeItem(id);
  }
}
