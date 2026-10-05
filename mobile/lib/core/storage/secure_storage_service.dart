import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SecureStorageService {
  final FlutterSecureStorage _secureStorage;
  final SharedPreferences _prefs;

  static const String _tokenKey = 'access_token';
  static const String _rememberMeKey = 'remember_me';

  SecureStorageService(this._secureStorage, this._prefs);

  static Future<SecureStorageService> init() async {
    const secureStorage = FlutterSecureStorage();
    final prefs = await SharedPreferences.getInstance();
    return SecureStorageService(secureStorage, prefs);
  }

  Future<void> saveToken(String token, {required bool rememberMe}) async {
    await _prefs.setBool(_rememberMeKey, rememberMe);
    if (rememberMe) {
      await _secureStorage.write(key: _tokenKey, value: token);
    } else {
      // If not remember me, we can just keep in memory in the provider,
      // but to simplify the token management logic across app restart vs kill:
      // When rememberMe is false, we save it here, but we clear it upon app start
      // OR we just return null on next cold start. Let's write it but track rememberMe.
      await _secureStorage.write(key: _tokenKey, value: token);
    }
  }

  Future<String?> readToken() async {
    final rememberMe = _prefs.getBool(_rememberMeKey) ?? false;
    if (!rememberMe) {
      // App was restarted but user didn't check remember me.
      await clearToken();
      return null;
    }
    return await _secureStorage.read(key: _tokenKey);
  }

  Future<void> clearToken() async {
    await _secureStorage.delete(key: _tokenKey);
    await _prefs.remove(_rememberMeKey);
  }
}
