#!/bin/bash
# Script pour lancer le frontend web-business avec Node 18 (workaround)

echo "⚠️  ATTENTION: Next.js 16 nécessite Node 20+, mais vous utilisez Node 18"
echo "Le serveur pourrait ne pas démarrer correctement."
echo ""
echo "Pour une solution permanente, installez Node 20 :"
echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash"
echo "  source ~/.bashrc"
echo "  nvm install 20"
echo "  nvm use 20"
echo ""
echo "Tentative de démarrage avec Node 18..."
echo ""

cd "$(dirname "$0")/../apps/web-business"

# Essayer avec next directement
npx next dev -p 4200 --hostname 0.0.0.0
