import 'dart:convert';

import 'package:http/http.dart' as http;

import '../storage/secure_storage_service.dart';

typedef JsonMap = Map<String, dynamic>;

class ApiException implements Exception {
  const ApiException(this.statusCode, this.message, [this.body]);

  final int statusCode;
  final String message;
  final dynamic body;

  @override
  String toString() => 'ApiException($statusCode): $message';
}

class ApiClient {
  ApiClient({required this.tokenStorage, http.Client? client, String? baseUrl})
    : _client = client ?? http.Client(),
      baseUrl = (baseUrl ?? _configuredBaseUrl).replaceAll(RegExp(r'/+$'), '');

  static const _configuredBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:5000/api',
  );

  final SecureStorageService tokenStorage;
  final http.Client _client;
  final String baseUrl;

  static Future<ApiClient> create({String? baseUrl}) async => ApiClient(
    tokenStorage: await SecureStorageService.init(),
    baseUrl: baseUrl,
  );

  Future<dynamic> get(String path, {Map<String, dynamic>? query}) =>
      _send('GET', path, query: query);

  Future<dynamic> post(String path, {Object? body}) =>
      _send('POST', path, body: body);

  Future<dynamic> put(String path, {Object? body}) =>
      _send('PUT', path, body: body);

  Future<dynamic> patch(String path, {Object? body}) =>
      _send('PATCH', path, body: body);

  Future<void> delete(String path) async {
    await _send('DELETE', path);
  }

  Future<dynamic> uploadImage(String path, String filePath) async {
    final request = http.MultipartRequest('POST', _uri(path));
    request.headers.addAll(await _headers(includeContentType: false));
    request.files.add(await http.MultipartFile.fromPath('file', filePath));
    final response = await http.Response.fromStream(await request.send());
    return _decode(response);
  }

  Future<dynamic> _send(
    String method,
    String path, {
    Map<String, dynamic>? query,
    Object? body,
  }) async {
    final request = http.Request(method, _uri(path, query));
    request.headers.addAll(await _headers());
    if (body != null) request.body = jsonEncode(body);
    final response = await http.Response.fromStream(
      await _client.send(request).timeout(const Duration(seconds: 30)),
    );
    return _decode(response);
  }

  Uri _uri(String path, [Map<String, dynamic>? query]) {
    final normalizedPath = path.startsWith('/') ? path : '/$path';
    Map<String, String>? values;
    if (query != null) {
      values = query.map(
        (key, value) =>
            MapEntry(key, value is Iterable ? value.join(',') : '$value'),
      );
      values.removeWhere((_, value) => value == 'null');
    }
    return Uri.parse('$baseUrl$normalizedPath')
        .replace(queryParameters: values);
  }

  Future<Map<String, String>> _headers({bool includeContentType = true}) async {
    final token = await tokenStorage.readToken();
    return {
      'Accept': 'application/json',
      if (includeContentType) 'Content-Type': 'application/json',
      if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
    };
  }

  dynamic _decode(http.Response response) {
    dynamic body;
    if (response.body.isNotEmpty) {
      try {
        body = jsonDecode(utf8.decode(response.bodyBytes));
      } on FormatException {
        body = utf8.decode(response.bodyBytes);
      }
    }
    if (response.statusCode < 200 || response.statusCode >= 300) {
      final message = body is Map
          ? '${body['message'] ?? body['Message'] ?? body['title'] ?? 'Request failed'}'
          : '${body ?? 'Request failed'}';
      throw ApiException(response.statusCode, message, body);
    }
    return body;
  }

  void close() => _client.close();
}
