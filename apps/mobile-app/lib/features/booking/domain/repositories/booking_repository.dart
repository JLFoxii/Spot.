import '../../data/models/business_model.dart';
import '../../data/models/booking_model.dart';

abstract class BookingRepository {
  /// Récupérer un salon par son slug
  Future<BusinessModel> getBusinessBySlug(String slug);
  
  /// Récupérer les créneaux disponibles
  Future<List<String>> getAvailableSlots({
    required String businessId,
    required String staffId,
    required String serviceId,
    required String date,
  });
  
  /// Créer une réservation
  Future<BookingModel> createBooking({
    required String businessId,
    required String staffId,
    required String serviceId,
    required String startAt,
  });
  
  /// Récupérer mes réservations
  Future<List<BookingModel>> getMyBookings();
}
