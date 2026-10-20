import '../../../../core/network/api_client.dart';

class UserService {
  const UserService(this._api);

  final ApiClient _api;

  Future<JsonMap> getProfile() async =>
      Map<String, dynamic>.from(await _api.get('/user/profile'));

  Future<JsonMap> updateProfile(JsonMap data) async =>
      Map<String, dynamic>.from(await _api.put('/user/profile', body: data));

  Future<void> deleteAccount() => _api.delete('/user/account');
}
