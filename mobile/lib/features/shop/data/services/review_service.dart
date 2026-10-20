import '../../../../core/network/api_client.dart';

class ReviewService {
  const ReviewService(this._api);

  final ApiClient _api;

  Future<List<JsonMap>> getProductReviews(String productId) async =>
      (await _api.get('/products/$productId/reviews') as List)
          .map((item) => Map<String, dynamic>.from(item as Map))
          .toList();

  Future<JsonMap> createReview(JsonMap data) async =>
      Map<String, dynamic>.from(await _api.post('/reviews', body: data));

  Future<void> deleteReview(String id) => _api.delete('/reviews/$id');
}
