# Spot. Mobile App (Flutter)

Application mobile client pour le système de réservation Spot.

## 🏗️ Architecture

Clean Architecture avec 3 couches :
- **Data Layer** : Modèles, Repositories (implémentation avec Dio)
- **Domain Layer** : Interfaces des repositories (contrats)
- **Presentation Layer** : Screens & Widgets

```
lib/
├── core/
│   └── network/
│       └── api_client.dart          # Configuration Dio + JWT Interceptors
├── features/
│   └── booking/
│       ├── data/
│       │   ├── models/              # BusinessModel, ServiceModel, BookingModel
│       │   └── repositories/        # BookingRepositoryImpl
│       ├── domain/
│       │   └── repositories/        # BookingRepository (interface)
│       └── presentation/
│           └── screens/             # HomeScreen, BusinessDetailScreen
└── main.dart
```

## 📦 Installation Flutter

### 1. Installer Flutter

```bash
# Linux/macOS
git clone https://github.com/flutter/flutter.git -b stable ~/flutter
export PATH="$PATH:$HOME/flutter/bin"

# Vérifier l'installation
flutter doctor
```

### 2. Installer les dépendances Android Studio

```bash
flutter doctor --android-licenses  # Accepter les licences
```

### 3. Installer les packages du projet

```bash
cd apps/mobile-app
flutter pub get
```

## 🚀 Lancement

### Prérequis
- **API NestJS** doit tourner sur `localhost:3000`
- **PostgreSQL** accessible
- **Redis** accessible (pour les notifications)

### Démarrer l'API

```bash
cd /home/test/spot-monorepo
node dist/apps/api/main.js
```

### Lancer l'app mobile

#### Sur Émulateur Android
```bash
# Lancer l'émulateur depuis Android Studio ou :
flutter emulators --launch <emulator_id>

# Puis lancer l'app
cd apps/mobile-app
flutter run
```

#### Sur Émulateur iOS (macOS uniquement)
```bash
open -a Simulator
cd apps/mobile-app
flutter run
```

#### Sur Device Physique
```bash
# Activer le mode développeur sur le téléphone
# Connecter en USB
flutter devices  # Voir la liste
flutter run -d <device_id>
```

## 🌐 Configuration Réseau

### Android Emulator
L'émulateur Android ne peut pas accéder à `localhost` de l'hôte.
Utiliser `10.0.2.2` → Géré automatiquement dans `api_client.dart`

### iOS Simulator
Utilise directement `localhost` → Géré automatiquement

### Device Physique
Modifier `api_client.dart` ligne 17 :
```dart
final String baseUrl = 'http://192.168.X.X:3000/api/v1';  // IP de ton PC
```

## 📱 Fonctionnalités Implémentées

### ✅ Écran d'accueil
- Affichage du salon "Barber King Pristina"
- Card avec nom, adresse, bouton de réservation
- Gestion des erreurs de connexion avec bouton "Réessayer"

### ✅ Détails du salon
- Liste des services (nom, durée, prix)
- Équipe du salon (staff avec avatars)
- Navigation depuis l'écran d'accueil

### ✅ Infrastructure
- Client Dio configuré avec intercepteurs JWT
- Stockage sécurisé du token (flutter_secure_storage)
- Gestion automatique des erreurs 401 (session expirée)
- Modèles de données miroir du backend TypeScript

## 🧪 Test de Connexion API

### Test 1 : Vérifier que l'API est accessible

```bash
# Depuis le terminal
curl http://localhost:3000/api/v1/businesses/barber-king-pristina
```

Si ça fonctionne, l'app devrait afficher le salon.

### Test 2 : Logs Flutter

```bash
flutter run --verbose
```

Chercher dans les logs :
- ✅ `Connection established` → OK
- ❌ `SocketException` → Problème réseau
- ❌ `DioException` → API non accessible

## 🔐 Authentification (À venir)

Le système JWT est prêt dans `api_client.dart` :
```dart
// Sauvegarder le token après login
await ApiClient().saveToken('eyJhbG...');

// Supprimer le token lors du logout
await ApiClient().deleteToken();
```

Tous les appels API ajoutent automatiquement le header `Authorization: Bearer <token>`.

## 📊 État du Projet

- ✅ Structure Clean Architecture
- ✅ Configuration réseau (Android/iOS)
- ✅ Modèles de données
- ✅ Repository pattern
- ✅ Écran d'accueil fonctionnel
- ✅ Détails salon avec services/staff
- ⏳ Flux de réservation (services → staff → slots)
- ⏳ Authentification (login/register)
- ⏳ Historique des réservations

## 🐛 Troubleshooting

### Erreur "Connection refused"
- Vérifier que l'API tourne : `curl http://localhost:3000/api/v1`
- Sur Android : utiliser `10.0.2.2` au lieu de `localhost` (déjà fait)
- Sur device physique : utiliser l'IP locale du PC

### Erreur "Handshake failed"
- L'API utilise HTTP (pas HTTPS) → OK pour le dev
- Vérifier les permissions dans `AndroidManifest.xml`

### Hot Reload ne fonctionne pas
```bash
flutter clean
flutter pub get
flutter run
```

## 📚 Resources

- [Flutter Documentation](https://docs.flutter.dev/)
- [Dio Package](https://pub.dev/packages/dio)
- [Clean Architecture Flutter](https://resocoder.com/flutter-clean-architecture/)

---

**🎉 Prêt à tester !** Lance `flutter run` et vérifie que le salon s'affiche !
