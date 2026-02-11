import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../../core/network/api_client.dart';
import '../../domain/repositories/auth_repository.dart';

class AuthRepositoryImpl implements AuthRepository {
  final _dio = ApiClient().dio;
  final _storage = const FlutterSecureStorage();

  @override
  Future<void> login(String email, String password) async {
    final response = await _dio.post('/auth/login', data: {
      'email': email,
      'password': password,
    });
    final token = response.data['access_token'] as String;
    await _storage.write(key: 'jwt_token', value: token);
  }
}
