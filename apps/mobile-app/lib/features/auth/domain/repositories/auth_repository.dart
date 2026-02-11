abstract class AuthRepository {
  /// Login et stocke le JWT. Retourne true si succès.
  Future<void> login(String email, String password);
}
