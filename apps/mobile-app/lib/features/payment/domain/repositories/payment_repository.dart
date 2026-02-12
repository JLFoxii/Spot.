abstract class PaymentRepository {
  /// Crée un SetupIntent Stripe et retourne le clientSecret.
  Future<String> createSetupIntent();
}
