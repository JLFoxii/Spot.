# Guide de démarrage Frontend (web-business)

## ⚠️ Prérequis : Node.js 20+

Le projet utilise **Next.js 16** qui nécessite **Node.js >= 20.9.0**.

Votre version actuelle : **Node 18.19.1** ❌

### Solution 1 : Installer Node 20 avec nvm (Recommandé)

```bash
# 1. Installer nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash

# 2. Recharger le shell
source ~/.bashrc
# ou
source ~/.zshrc

# 3. Installer Node 20
nvm install 20

# 4. Utiliser Node 20
nvm use 20

# 5. Vérifier la version
node --version  # Devrait afficher v20.x.x

# 6. Lancer le frontend
cd /home/test/spot-monorepo
npx nx serve web-business
```

### Solution 2 : Script de démarrage (Workaround temporaire)

Si vous ne pouvez pas installer Node 20 immédiatement :

```bash
cd /home/test/spot-monorepo
./scripts/start-frontend.sh
```

**Note** : Ce script va essayer de démarrer avec Node 18, mais cela va probablement échouer.

### Solution 3 : Tester avec Postman uniquement

L'API fonctionne parfaitement avec Node 18. Vous pouvez :
- Tester tous les endpoints avec Postman
- Continuer le développement backend
- Installer Node 20 plus tard pour le frontend

## Commandes utiles

```bash
# Lancer l'API (Node 18 compatible ✓)
cd /home/test/spot-monorepo
node dist/apps/api/main.js

# Lancer le frontend (Node 20+ requis)
npx nx serve web-business

# Lancer Prisma Studio
npx prisma studio --schema=libs/db-prisma/prisma/schema.prisma
```

## Prochaines étapes

Une fois Node 20 installé, le frontend devrait démarrer sur :
- **URL** : http://localhost:4200
- **Dashboard** : Affichera "Barber King Pristina" avec les services et le staff
