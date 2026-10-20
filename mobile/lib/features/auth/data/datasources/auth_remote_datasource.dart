import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/auth_response_model.dart';

part 'auth_remote_datasource.g.dart';

@RestApi()
abstract class AuthRemoteDataSource {
  factory AuthRemoteDataSource(Dio dio, {String baseUrl}) = _AuthRemoteDataSource;

  @POST("/api/auth/login")
  Future<AuthResponseModel> login(@Body() Map<String, dynamic> request);

  @POST("/api/auth/register")
  Future<AuthResponseModel> register(@Body() Map<String, dynamic> request);
}
