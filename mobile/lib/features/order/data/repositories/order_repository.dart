import '../datasources/order_remote_datasource.dart';
import '../models/order_model.dart';

class OrderRepository {
  final OrderRemoteDataSource _remoteDataSource;

  OrderRepository(this._remoteDataSource);

  Future<List<OrderModel>> getOrders() async {
    return await _remoteDataSource.getOrders();
  }

  Future<OrderModel> getOrderDetail(String id) async {
    return await _remoteDataSource.getOrderDetail(id);
  }

  Future<OrderModel> createOrder(Map<String, dynamic> dto) async {
    return await _remoteDataSource.createOrder(dto);
  }
}
