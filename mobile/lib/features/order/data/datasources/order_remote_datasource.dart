import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../models/order_model.dart';

part 'order_remote_datasource.g.dart';

@RestApi()
abstract class OrderRemoteDataSource {
  factory OrderRemoteDataSource(Dio dio, {String baseUrl}) = _OrderRemoteDataSource;

  @GET("/api/orders/me")
  Future<List<OrderModel>> getOrders();

  @GET("/api/orders/{id}")
  Future<OrderModel> getOrderDetail(@Path("id") String id);

  @POST("/api/orders")
  Future<OrderModel> createOrder(@Body() Map<String, dynamic> createOrderDto);
}
