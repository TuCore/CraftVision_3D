import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../models/cart_model.dart';

part 'cart_remote_datasource.g.dart';

@RestApi()
abstract class CartRemoteDataSource {
  factory CartRemoteDataSource(Dio dio, {String baseUrl}) = _CartRemoteDataSource;

  @GET("/api/cart")
  Future<CartModel> getCart();

  @POST("/api/cart/items")
  Future<CartModel> addItem(@Body() Map<String, dynamic> dto);

  @PUT("/api/cart/items/{id}")
  Future<CartModel> updateItem(@Path("id") String id, @Body() Map<String, dynamic> dto);

  @DELETE("/api/cart/items/{id}")
  Future<CartModel> removeItem(@Path("id") String id);
}
