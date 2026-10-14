import '../../../../core/network/api_client.dart';

class ProductService {
  const ProductService(this._api);

  final ApiClient _api;

  Future<JsonMap> getProducts({
    int page = 1,
    int pageSize = 20,
    String? keyword,
    String? categoryId,
    String? type,
    num? minPrice,
    num? maxPrice,
    String? sortBy,
    String? sortDirection,
  }) async => Map<String, dynamic>.from(
    await _api.get(
      '/products',
      query: {
        'page': page,
        'pageSize': pageSize,
        'keyword': keyword,
        'categoryId': categoryId,
        'type': type,
        'minPrice': minPrice,
        'maxPrice': maxPrice,
        'sortBy': sortBy,
        'sortDirection': sortDirection,
      },
    ),
  );

  Future<JsonMap> getProduct(String id) async =>
      Map<String, dynamic>.from(await _api.get('/products/$id'));

  Future<JsonMap> createProduct(JsonMap data) async =>
      Map<String, dynamic>.from(await _api.post('/products', body: data));

  Future<JsonMap> updateProduct(String id, JsonMap data) async =>
      Map<String, dynamic>.from(await _api.put('/products/$id', body: data));

  Future<void> deleteProduct(String id) => _api.delete('/products/$id');
}
