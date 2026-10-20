import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../models/product_model.dart';
import '../models/product_category_model.dart';

part 'shop_remote_datasource.g.dart';

@RestApi()
abstract class ShopRemoteDataSource {
  factory ShopRemoteDataSource(Dio dio, {String baseUrl}) = _ShopRemoteDataSource;

  @GET("/api/product-categories")
  Future<List<ProductCategoryModel>> getCategories();

  @GET("/api/products")
  Future<List<ProductModel>> getProducts({
    @Query("sortBy") String? sortBy,
    @Query("limit") int? limit,
  });

  @GET("/api/products/{id}")
  Future<ProductModel> getProductDetail(@Path("id") String id);
}
