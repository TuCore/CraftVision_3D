import '../datasources/auth_remote_datasource.dart';
import '../models/auth_response_model.dart';

class AuthRepository {
  final AuthRemoteDataSource remoteDataSource;

  AuthRepository(this.remoteDataSource);

  Future<AuthResponseModel> login(String email, String password) async {
    return await remoteDataSource.login({
      'email': email,
      'password': password,
    });
  }

  Future<AuthResponseModel> register(String fullName, String email, String password) async {
    return await remoteDataSource.register({
      'fullName': fullName,
      'email': email,
      'password': password,
    });
  }
}
