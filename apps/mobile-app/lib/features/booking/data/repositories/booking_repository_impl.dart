import 'package:dio/dio.dart';
import '../../../../core/network/api_client.dart';
import '../../domain/repositories/booking_repository.dart';
import '../models/business_model.dart';
import '../models/booking_model.dart';

class BookingRepositoryImpl implements BookingRepository {
  final Dio _dio = ApiClient().dio;

  @override
  Future<BusinessModel> getBusinessBySlug(String slug) async {
    try {
      final response = await _dio.get('/businesses/$slug');
      return BusinessModel.fromJson(response.data);
    } catch (e) {
      throw Exception('Impossible de charger le salon : $e');
    }
  }

  @override
  Future<List<String>> getAvailableSlots({
    required String businessId,
    required String staffId,
    required String serviceId,
    required String date,
  }) async {
    try {
      final response = await _dio.get('/availability/slots', queryParameters: {
        'businessId': businessId,
        'staffId': staffId,
        'serviceId': serviceId,
        'date': date,
      });
      return List<String>.from(response.data);
    } catch (e) {
      throw Exception('Impossible de charger les créneaux : $e');
    }
  }

  @override
  Future<BookingModel> createBooking({
    required String businessId,
    required String staffId,
    required String serviceId,
    required String startAt,
  }) async {
    try {
      final response = await _dio.post('/bookings', data: {
        'businessId': businessId,
        'staffId': staffId,
        'serviceId': serviceId,
        'startAt': startAt,
      });
      return BookingModel.fromJson(response.data);
    } catch (e) {
      throw Exception('Impossible de créer la réservation : $e');
    }
  }

  @override
  Future<List<BookingModel>> getMyBookings() async {
    final response = await _dio.get('/bookings/me');
    return (response.data as List)
        .map((json) => BookingModel.fromJson(json as Map<String, dynamic>))
        .toList();
  }
}
