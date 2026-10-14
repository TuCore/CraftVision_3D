import '../../../../core/network/api_client.dart';

class AuthService {
  const AuthService(this._api);

  final ApiClient _api;

  Future<JsonMap> login({
    required String email,
    required String password,
    required bool rememberMe,
  }) async {
    final response = Map<String, dynamic>.from(
      await _api.post(
        '/auth/login',
        body: {'email': email, 'password': password},
      ),
    );
    await _saveToken(response, rememberMe);
    return response;
  }

  Future<JsonMap> register({
    required String fullName,
    required String email,
    required String password,
    required bool rememberMe,
  }) async {
    final response = Map<String, dynamic>.from(
      await _api.post(
        '/auth/register',
        body: {'fullName': fullName, 'email': email, 'password': password},
      ),
    );
    await _saveToken(response, rememberMe);
    return response;
  }

  Future<JsonMap> loginWithGoogle(
    String idToken, {
    bool rememberMe = true,
  }) async {
    final response = Map<String, dynamic>.from(
      await _api.post('/auth/google', body: {'idToken': idToken}),
    );
    await _saveToken(response, rememberMe);
    return response;
  }

  Future<void> logout() => _api.tokenStorage.clearToken();

  Future<void> _saveToken(JsonMap response, bool rememberMe) async {
    final token = response['token']?.toString();
    if (token == null || token.isEmpty) {
      throw const ApiException(500, 'Login response does not contain a token.');
    }
    await _api.tokenStorage.saveToken(token, rememberMe: rememberMe);
  }
}
