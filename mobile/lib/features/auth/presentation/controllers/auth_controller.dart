import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../../../../core/network/dio_provider.dart';
import '../../data/repositories/auth_repository.dart';

class AuthState {
  final bool isLoading;
  final String? error;
  final bool isSuccess;

  AuthState({this.isLoading = false, this.error, this.isSuccess = false});

  AuthState copyWith({bool? isLoading, String? error, bool? isSuccess}) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      isSuccess: isSuccess ?? this.isSuccess,
    );
  }
}

class AuthController extends Notifier<AuthState> {
  final GoogleSignIn _googleSignIn = GoogleSignIn(
    clientId: '373813565947-9h1d2cv0fmb6t329ifro13t795gmdah1.apps.googleusercontent.com',
    serverClientId: kIsWeb ? null : '373813565947-9h1d2cv0fmb6t329ifro13t795gmdah1.apps.googleusercontent.com',
  );

  @override
  AuthState build() {
    return AuthState();
  }

  AuthRepository get _repository => ref.read(authRepositoryProvider);
  FlutterSecureStorage get _secureStorage => ref.read(secureStorageProvider);

  Future<void> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final res = await _repository.login(email, password);
      await _saveTokenAndUser(res);
      state = state.copyWith(isLoading: false, isSuccess: true);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> register(String email, String password, String fullName) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final res = await _repository.register(email, password, fullName);
      await _saveTokenAndUser(res);
      state = state.copyWith(isLoading: false, isSuccess: true);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> loginWithGoogle() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      // Prompt user to choose Google Account
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) {
        state = state.copyWith(isLoading: false, error: 'Đăng nhập Google bị hủy.');
        return;
      }
      
      // Obtain auth details
      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final String? idToken = googleAuth.idToken;

      if (idToken == null) {
        state = state.copyWith(isLoading: false, error: 'Không lấy được Google Token.');
        return;
      }

      final res = await _repository.googleLogin(idToken);
      await _saveTokenAndUser(res);
      state = state.copyWith(isLoading: false, isSuccess: true);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> logout() async {
    await _secureStorage.deleteAll();
    await _googleSignIn.signOut();
    state = AuthState(); // Reset state
  }

  Future<void> _saveTokenAndUser(Map<String, dynamic> data) async {
    final token = data['token'] as String?;
    final userId = data['userId']?.toString();
    final email = data['email']?.toString();
    final fullName = data['fullName']?.toString();

    if (token != null) {
      await _secureStorage.write(key: 'token', value: token);
    }
    if (userId != null) {
      await _secureStorage.write(key: 'userId', value: userId);
    }
    if (email != null) {
      await _secureStorage.write(key: 'email', value: email);
    }
    if (fullName != null) {
      await _secureStorage.write(key: 'fullName', value: fullName);
    }
  }
}

final authControllerProvider = NotifierProvider<AuthController, AuthState>(() {
  return AuthController();
});

