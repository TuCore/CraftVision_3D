import '../../../../core/network/api_client.dart';

class NfcService {
  const NfcService(this._api);

  final ApiClient _api;

  Future<JsonMap> getTag(String tagCode) async =>
      Map<String, dynamic>.from(await _api.get('/nfc-tags/$tagCode'));

  Future<List<JsonMap>> importTags(JsonMap data) async =>
      (await _api.post('/nfc-tags/batch', body: data) as List)
          .map((item) => Map<String, dynamic>.from(item as Map))
          .toList();

  Future<List<JsonMap>> generateTags(int count) async =>
      (await _api.post('/nfc-tags/generate', body: {'count': count}) as List)
          .map((item) => Map<String, dynamic>.from(item as Map))
          .toList();

  Future<List<JsonMap>> getAdminTags() async =>
      (await _api.get('/nfc-tags/admin') as List)
          .map((item) => Map<String, dynamic>.from(item as Map))
          .toList();

  Future<void> updateStatus(String id, String status) async {
    await _api.patch('/nfc-tags/$id/status', body: {'status': status});
  }

  Future<void> updateStatusByCode(String tagCode, String status) async {
    await _api.patch('/nfc-tags/$tagCode/status-by-code', body: {'status': status});
  }

  Future<void> simulateScan(String tagCode) async {
    await _api.post('/nfc-tags/$tagCode/simulate');
  }

  Future<void> resetScanCount(String tagCode) async {
    await _api.post('/nfc-tags/$tagCode/reset-scan');
  }
}
