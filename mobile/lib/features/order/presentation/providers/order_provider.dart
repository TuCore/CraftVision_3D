import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_provider.dart';
import '../../data/datasources/order_remote_datasource.dart';
import '../../data/repositories/order_repository.dart';
import '../../data/models/order_model.dart';

final orderRemoteDataSourceProvider = Provider<OrderRemoteDataSource>((ref) {
  final dio = ref.watch(dioProvider);
  return OrderRemoteDataSource(dio);
});

final orderRepositoryProvider = Provider<OrderRepository>((ref) {
  final remote = ref.watch(orderRemoteDataSourceProvider);
  return OrderRepository(remote);
});

final ordersProvider = FutureProvider<List<OrderModel>>((ref) async {
  final repository = ref.watch(orderRepositoryProvider);
  return await repository.getOrders();
});

final orderDetailProvider = FutureProvider.family<OrderModel, String>((ref, id) async {
  final repository = ref.watch(orderRepositoryProvider);
  return await repository.getOrderDetail(id);
});
