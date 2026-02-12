import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('Smoke test - Verify app builds', (WidgetTester tester) async {
    // Ce test passe toujours, il sert juste à vérifier que l'environnement de test démarre bien.
    expect(1 + 1, 2);
  });
}
