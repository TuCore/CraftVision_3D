import '../../../../core/network/api_client.dart';

class OrderService {
  const OrderService(this._api);

  final ApiClient _api;

  Future<JsonMap> createOrder(JsonMap data) async =>
      Map<String, dynamic>.from(await _api.post('/orders', body: data));

  Future<JsonMap> getOrder(String id) async =>
      Map<String, dynamic>.from(await _api.get('/orders/$id'));

  Future<JsonMap> getMyOrders({int page = 1, int size = 10}) async =>
      Map<String, dynamic>.from(
        await _api.get('/orders/me', query: {'page': page, 'size': size}),
      );

  Future<JsonMap> getAllOrders({int page = 1, int size = 10}) async =>
      Map<String, dynamic>.from(
        await _api.get('/orders', query: {'page': page, 'size': size}),
      );

  Future<void> updateStatus(String id, String status) async {
    await _api.patch('/orders/$id/status', body: {'status': status});
  }

  Future<void> receiveOrder(String id) async {
    await _api.patch('/orders/$id/receive');
  }

  Future<void> cancelOrder(String id) async {
    await _api.patch('/orders/$id/cancel');
  }
}
