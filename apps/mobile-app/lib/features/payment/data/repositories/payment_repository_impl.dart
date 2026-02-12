import 'package:dio/dio.dart';
import '../../../../core/network/api_client.dart';
import '../../domain/repositories/payment_repository.dart';

class PaymentRepositoryImpl implements PaymentRepository {
  final Dio _dio = ApiClient().dio;

  @override
  Future<String> createSetupIntent() async {
    final response = await _dio.post('/payments/setup-intent');
    return response.data['clientSecret'] as String;
  }
}
