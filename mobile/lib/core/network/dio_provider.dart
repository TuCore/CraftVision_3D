import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/api_constants.dart';
import 'auth_interceptor.dart';

final secureStorageProvider = Provider<FlutterSecureStorage>((ref) {
  return const FlutterSecureStorage();
});

final dioProvider = Provider<Dio>((ref) {
  final storage = ref.watch(secureStorageProvider);
  final dio = Dio(BaseOptions(
    baseUrl: ApiConstants.baseUrl,
    connectTimeout: const Duration(seconds: 30),
    receiveTimeout: const Duration(seconds: 30),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  ));

  dio.interceptors.add(AuthInterceptor(storage));
  dio.interceptors.add(InterceptorsWrapper(
    onResponse: (response, handler) {
      // Unwrap paginated responses so Retrofit can parse them as List<T>
      if (response.data is Map<String, dynamic> && 
          response.data.containsKey('items') && 
          response.data.containsKey('totalItems')) {
        response.data = response.data['items'];
      }
      return handler.next(response);
    },
  ));
  dio.interceptors.add(LogInterceptor(responseBody: true, requestBody: true));

  return dio;
});
