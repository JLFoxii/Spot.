import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  late Dio dio;
  final _storage = const FlutterSecureStorage();

  factory ApiClient() {
    return _instance;
  }

  ApiClient._internal() {
    // URL injectable via --dart-define=API_URL=https://api.spot.ks/api/v1
    const envUrl = String.fromEnvironment('API_URL');
    final String baseUrl = envUrl.isNotEmpty
        ? envUrl
        : Platform.isAndroid
            ? 'http://10.0.2.2:3000/api/v1'
            : 'http://localhost:3000/api/v1';

    dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 5),
      receiveTimeout: const Duration(seconds: 3),
      headers: {'Content-Type': 'application/json'},
    ));

    _setupInterceptors();
  }

  void _setupInterceptors() {
    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        // Injection du Token s'il existe
        final token = await _storage.read(key: 'jwt_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (DioException e, handler) {
        // Gestion centralisée des erreurs (ex: 401 Logout)
        if (e.response?.statusCode == 401) {
          // TODO: Rediriger vers LoginScreen
          print("Session expirée");
        }
        return handler.next(e);
      },
    ));
  }

  // Helper pour sauvegarder le token
  Future<void> saveToken(String token) async {
    await _storage.write(key: 'jwt_token', value: token);
  }

  // Helper pour supprimer le token
  Future<void> deleteToken() async {
    await _storage.delete(key: 'jwt_token');
  }
}
