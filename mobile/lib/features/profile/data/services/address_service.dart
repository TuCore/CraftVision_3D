import '../../../../core/network/api_client.dart';

class AddressService {
  const AddressService(this._api);

  final ApiClient _api;

  Future<List<JsonMap>> getAddresses() async => (await _api.get('/user/addresses') as List)
      .map((item) => Map<String, dynamic>.from(item as Map))
      .toList();

  Future<JsonMap> createAddress(JsonMap data) async =>
      Map<String, dynamic>.from(await _api.post('/user/addresses', body: data));

  Future<JsonMap> updateAddress(String id, JsonMap data) async => Map<String, dynamic>.from(
    await _api.put('/user/addresses/$id', body: data),
  );

  Future<void> deleteAddress(String id) => _api.delete('/user/addresses/$id');

  Future<void> setDefaultAddress(String id) async {
    await _api.put('/user/addresses/$id/default');
  }
}
