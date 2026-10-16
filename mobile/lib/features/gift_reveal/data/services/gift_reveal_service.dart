import '../../../../core/network/api_client.dart';

class GiftRevealService {
  const GiftRevealService(this._api);

  final ApiClient _api;

  Future<JsonMap> revealGift(String secretKey) async =>
      Map<String, dynamic>.from(
        await _api.get('/gifts', query: {'secretKey': secretKey}),
      );
}
