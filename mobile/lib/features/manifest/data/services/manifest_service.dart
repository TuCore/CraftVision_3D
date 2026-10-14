import '../../../../core/network/api_client.dart';

class ManifestService {
  const ManifestService(this._api);

  final ApiClient _api;

  Future<int> getWishCount() async {
    final response = Map<String, dynamic>.from(
      await _api.get('/manifest/count'),
    );
    return response['count'] as int;
  }

  Future<JsonMap> makeWish({
    required String email,
    required String wishText,
  }) async => Map<String, dynamic>.from(
    await _api.post('/manifest', body: {'email': email, 'wishText': wishText}),
  );
}
