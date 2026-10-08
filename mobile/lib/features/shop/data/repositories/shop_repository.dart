import '../datasources/shop_remote_datasource.dart';
import '../models/product_model.dart';
import '../models/product_category_model.dart';

class ShopRepository {
  final ShopRemoteDataSource _remoteDataSource;

  ShopRepository(this._remoteDataSource);

  Future<List<ProductCategoryModel>> getCategories() async {
    return await _remoteDataSource.getCategories();
  }

  Future<List<ProductModel>> getProducts({String? sortBy, int? limit}) async {
    return await _remoteDataSource.getProducts(sortBy: sortBy, limit: limit);
  }

  Future<ProductModel> getProductDetail(String id) async {
    return await _remoteDataSource.getProductDetail(id);
  }
}
