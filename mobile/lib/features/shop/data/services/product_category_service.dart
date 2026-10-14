import '../../../../core/network/api_client.dart';

class ProductCategoryService {
  const ProductCategoryService(this._api);

  final ApiClient _api;

  Future<List<JsonMap>> getCategories() async => (await _api.get('/product-categories') as List)
      .map((item) => Map<String, dynamic>.from(item as Map))
      .toList();

  Future<JsonMap> getCategory(String id) async =>
      Map<String, dynamic>.from(await _api.get('/product-categories/$id'));

  Future<JsonMap> createCategory(JsonMap data) async => Map<String, dynamic>.from(
    await _api.post('/product-categories', body: data),
  );

  Future<JsonMap> updateCategory(String id, JsonMap data) async => Map<String, dynamic>.from(
    await _api.put('/product-categories/$id', body: data),
  );

  Future<void> deleteCategory(String id) => _api.delete('/product-categories/$id');
}
