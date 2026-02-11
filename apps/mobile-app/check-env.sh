#!/bin/bash

# Script de vérification de l'environnement Flutter pour Spot. Mobile

echo "🔍 Vérification de l'environnement Spot. Mobile..."
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteurs
SUCCESS=0
WARNINGS=0
ERRORS=0

# Fonction de test
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
        ((SUCCESS++))
    else
        echo -e "${RED}❌ $1${NC}"
        ((ERRORS++))
    fi
}

check_warning() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
        ((SUCCESS++))
    else
        echo -e "${YELLOW}⚠️  $1${NC}"
        ((WARNINGS++))
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  1. Flutter SDK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

which flutter > /dev/null 2>&1
if [ $? -eq 0 ]; then
    FLUTTER_VERSION=$(flutter --version | head -n 1)
    echo -e "${GREEN}✅ Flutter installé : $FLUTTER_VERSION${NC}"
    ((SUCCESS++))
else
    echo -e "${RED}❌ Flutter n'est pas installé${NC}"
    echo "   → Voir FLUTTER_INSTALLATION.md pour les instructions"
    ((ERRORS++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  2. API Backend (NestJS)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test API sur localhost:3000
curl -s http://localhost:3000/api/v1 > /dev/null 2>&1
check "API accessible sur http://localhost:3000/api/v1"

# Test endpoint business
BUSINESS_RESPONSE=$(curl -s http://localhost:3000/api/v1/businesses/barber-king-pristina)
if echo "$BUSINESS_RESPONSE" | grep -q "Barber King"; then
    echo -e "${GREEN}✅ Endpoint /businesses/barber-king-pristina OK${NC}"
    ((SUCCESS++))
else
    echo -e "${RED}❌ Endpoint /businesses/barber-king-pristina KO${NC}"
    echo "   → Vérifier que le seed a bien été exécuté"
    ((ERRORS++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  3. Base de Données"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test PostgreSQL
nc -z localhost 5432 > /dev/null 2>&1
check "PostgreSQL accessible sur localhost:5432"

# Test Redis
nc -z localhost 6379 > /dev/null 2>&1
check "Redis accessible sur localhost:6379"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  4. Services Docker"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Vérifier Docker
which docker > /dev/null 2>&1
check_warning "Docker installé"

# Vérifier conteneurs
if which docker > /dev/null 2>&1; then
    POSTGRES_RUNNING=$(docker ps | grep postgres | wc -l)
    REDIS_RUNNING=$(docker ps | grep redis | wc -l)
    MAILPIT_RUNNING=$(docker ps | grep mailpit | wc -l)
    
    if [ $POSTGRES_RUNNING -gt 0 ]; then
        echo -e "${GREEN}✅ Conteneur PostgreSQL actif${NC}"
        ((SUCCESS++))
    else
        echo -e "${YELLOW}⚠️  Conteneur PostgreSQL non actif${NC}"
        ((WARNINGS++))
    fi
    
    if [ $REDIS_RUNNING -gt 0 ]; then
        echo -e "${GREEN}✅ Conteneur Redis actif${NC}"
        ((SUCCESS++))
    else
        echo -e "${YELLOW}⚠️  Conteneur Redis non actif${NC}"
        ((WARNINGS++))
    fi
    
    if [ $MAILPIT_RUNNING -gt 0 ]; then
        echo -e "${GREEN}✅ Conteneur Mailpit actif${NC}"
        ((SUCCESS++))
    else
        echo -e "${YELLOW}⚠️  Conteneur Mailpit non actif${NC}"
        ((WARNINGS++))
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  5. Dépendances Flutter"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "pubspec.yaml" ]; then
    echo -e "${GREEN}✅ pubspec.yaml trouvé${NC}"
    ((SUCCESS++))
    
    if [ -d ".dart_tool" ]; then
        echo -e "${GREEN}✅ Packages installés (.dart_tool présent)${NC}"
        ((SUCCESS++))
    else
        echo -e "${YELLOW}⚠️  Packages non installés${NC}"
        echo "   → Exécuter : flutter pub get"
        ((WARNINGS++))
    fi
else
    echo -e "${RED}❌ pubspec.yaml non trouvé${NC}"
    ((ERRORS++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  6. Structure du Projet"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

REQUIRED_FILES=(
    "lib/main.dart"
    "lib/core/network/api_client.dart"
    "lib/features/booking/data/models/business_model.dart"
    "lib/features/booking/data/repositories/booking_repository_impl.dart"
    "lib/features/booking/domain/repositories/booking_repository.dart"
    "lib/features/booking/presentation/screens/home_screen.dart"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
        ((SUCCESS++))
    else
        echo -e "${RED}❌ $file manquant${NC}"
        ((ERRORS++))
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  7. Émulateurs/Devices"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if which flutter > /dev/null 2>&1; then
    DEVICES=$(flutter devices 2>&1 | grep -v "No devices" | grep -v "Waiting" | wc -l)
    if [ $DEVICES -gt 0 ]; then
        echo -e "${GREEN}✅ Devices disponibles :${NC}"
        flutter devices 2>&1 | grep "•" | head -5
        ((SUCCESS++))
    else
        echo -e "${YELLOW}⚠️  Aucun device/émulateur détecté${NC}"
        echo "   → Lancer un émulateur Android ou connecter un device"
        ((WARNINGS++))
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📊 RÉSUMÉ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "  ${GREEN}✅ Succès    : $SUCCESS${NC}"
echo -e "  ${YELLOW}⚠️  Warnings  : $WARNINGS${NC}"
echo -e "  ${RED}❌ Erreurs   : $ERRORS${NC}"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 ENVIRONNEMENT PRÊT !${NC}"
    echo ""
    echo "Prochaines étapes :"
    echo "  1. flutter run"
    echo "  2. Vérifier que le salon 'Barber King Pristina' s'affiche"
    echo "  3. Cliquer sur 'Réserver' pour voir les détails"
    echo ""
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  ENVIRONNEMENT PRESQUE PRÊT${NC}"
    echo ""
    echo "Quelques warnings à corriger (non bloquants)"
    echo ""
elif [ $ERRORS -lt 3 ]; then
    echo -e "${YELLOW}⚠️  QUELQUES PROBLÈMES DÉTECTÉS${NC}"
    echo ""
    echo "Corriger les erreurs ci-dessus avant de lancer l'app"
    echo ""
else
    echo -e "${RED}❌ ENVIRONNEMENT NON PRÊT${NC}"
    echo ""
    echo "Plusieurs problèmes critiques détectés."
    echo "Consulter FLUTTER_INSTALLATION.md"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
