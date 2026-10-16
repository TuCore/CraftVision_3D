import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../models/wishlist_model.dart';

part 'wishlist_remote_datasource.g.dart';

@RestApi()
abstract class WishlistRemoteDataSource {
  factory WishlistRemoteDataSource(Dio dio, {String baseUrl}) = _WishlistRemoteDataSource;

  @GET("/api/wishlists")
  Future<WishlistModel> getWishlist();

  @POST("/api/wishlists")
  Future<WishlistModel> addItem(@Body() Map<String, dynamic> dto);

  @DELETE("/api/wishlists/{productId}")
  Future<WishlistModel> removeItem(@Path("productId") String productId);
}
