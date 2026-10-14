import 'api_client.dart';

class UploadService {
  const UploadService(this._api);

  final ApiClient _api;

  Future<JsonMap> uploadImage(String filePath) async =>
      Map<String, dynamic>.from(await _api.uploadImage('/uploads', filePath));
}
