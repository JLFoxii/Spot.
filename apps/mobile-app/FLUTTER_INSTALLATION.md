# 📱 Installation Flutter - Guide Complet

## ⚠️ Flutter n'est pas installé sur ce système

Pour tester l'application mobile, tu dois installer Flutter.

## 🚀 Installation Rapide (Linux/Ubuntu)

### Méthode 1 : Via Snap (Recommandé - Plus Simple)

```bash
sudo snap install flutter --classic
flutter sdk-path
```

### Méthode 2 : Installation Manuelle

```bash
# 1. Télécharger Flutter
cd ~
wget https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.16.0-stable.tar.xz

# 2. Extraire
tar xf flutter_linux_3.16.0-stable.tar.xz

# 3. Ajouter au PATH (ajouter cette ligne dans ~/.bashrc ou ~/.zshrc)
export PATH="$PATH:$HOME/flutter/bin"

# 4. Recharger le shell
source ~/.bashrc  # ou source ~/.zshrc

# 5. Vérifier l'installation
flutter doctor
```

## 📋 Dépendances Requises

### Pour Android Development

```bash
# Installer les dépendances système
sudo apt-get update
sudo apt-get install -y \
  curl \
  git \
  unzip \
  xz-utils \
  zip \
  libglu1-mesa \
  openjdk-11-jdk

# Installer Android Studio (Recommandé)
# Télécharger depuis : https://developer.android.com/studio
# Ou via snap :
sudo snap install android-studio --classic
```

### Configuration Android Studio

1. Ouvrir Android Studio
2. **Settings** → **Plugins** → Installer "Flutter" et "Dart"
3. **Settings** → **Appearance & Behavior** → **System Settings** → **Android SDK**
4. Installer les SDK Platform tools
5. Accepter les licences :

```bash
flutter doctor --android-licenses
```

### Créer un Émulateur Android

```bash
# Dans Android Studio :
# Tools → Device Manager → Create Device
# Choisir : Pixel 7 Pro (ou autre)
# System Image : API 33 (Android 13)

# Ou en ligne de commande :
flutter emulators --launch Pixel_7_API_33
```

## 🍎 Pour macOS (iOS Development)

```bash
# Installer Xcode depuis l'App Store
xcode-select --install

# Installer CocoaPods
sudo gem install cocoapods

# Accepter les licences Xcode
sudo xcodebuild -license accept
```

## ✅ Vérification Complète

```bash
flutter doctor -v
```

### Résultat Attendu :

```
[✓] Flutter (Channel stable, 3.16.0)
[✓] Android toolchain - develop for Android devices (Android SDK 33.0.0)
[✓] Chrome - develop for the web
[✓] Android Studio (version 2023.1)
[✓] Connected device (1 available)
```

Si des `[✗]` apparaissent, suivre les instructions de `flutter doctor`.

## 🧪 Test de l'Installation

```bash
# 1. Créer un projet test
flutter create test_app
cd test_app

# 2. Vérifier les devices disponibles
flutter devices

# 3. Lancer l'app
flutter run
```

## 🎯 Lancer Spot Mobile App

Une fois Flutter installé :

```bash
cd /home/test/spot-monorepo/apps/mobile-app

# 1. Installer les dépendances
flutter pub get

# 2. Vérifier que l'API NestJS tourne
curl http://localhost:3000/api/v1

# 3. Lancer l'émulateur (Android Studio > Device Manager > Play)

# 4. Lancer l'app
flutter run

# Ou pour un device spécifique :
flutter run -d chrome  # Web
flutter run -d <device_id>  # Device/Emulator
```

## ⏱️ Temps d'Installation Estimé

- Installation Flutter : **5-10 minutes**
- Android Studio + SDK : **20-30 minutes** (téléchargement dépend de la connexion)
- Premier build Android : **5-10 minutes** (compilation initiale)

**Total : ~45 minutes**

## 🐛 Problèmes Courants

### "cmdline-tools component is missing"

```bash
# Ouvrir Android Studio
# SDK Manager → SDK Tools
# Cocher "Android SDK Command-line Tools"
# Apply
```

### "Unable to locate Android SDK"

```bash
flutter config --android-sdk /home/user/Android/Sdk
```

### "Android license status unknown"

```bash
flutter doctor --android-licenses
# Taper 'y' pour tout accepter
```

## 📚 Resources

- [Flutter Official Installation](https://docs.flutter.dev/get-started/install/linux)
- [Android Studio Download](https://developer.android.com/studio)
- [Flutter DevTools](https://docs.flutter.dev/tools/devtools/overview)

---

## 🚀 Alternative : Tester Sans Installer Flutter

Si tu ne veux pas installer Flutter maintenant, tu peux :

1. **Tester via le Web** (nécessite Flutter Web support) :
   ```bash
   flutter run -d chrome
   ```

2. **Utiliser Flutter Web dans un container Docker** (avancé)

3. **Continuer avec les clients Web existants** :
   - Dashboard Business : http://localhost:4200
   - Marketplace Client : http://localhost:4201

Le backend est déjà complet et fonctionnel ! 🎉
