#!/bin/bash

echo "🚀 Préparation du build mobile Android pour SITAB..."

# Vérification des prérequis
echo "📋 Vérification des prérequis..."

if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé"
    exit 1
fi

# Export des données
echo "📊 Export des données PostgreSQL vers SQLite..."
tsx scripts/export-data-for-mobile.ts

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'export des données"
    exit 1
fi

# Installation des dépendances
echo "📦 Installation des dépendances..."
npm install

# Build du frontend
echo "🏗️ Build du frontend pour production..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du build"
    exit 1
fi

echo "✅ Build réussi !"

# Initialisation Capacitor Android
echo "📱 Initialisation de Capacitor Android..."
npx cap add android 2>/dev/null || echo "Android déjà initialisé"
npx cap sync android

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de la synchronisation Capacitor"
    exit 1
fi

echo ""
echo "🎉 Préparation terminée !"
echo ""
echo "📋 Prochaines étapes :"
echo "1. Si vous êtes sur Replit :"
echo "   - Téléchargez le projet (Download as ZIP)"
echo "   - Décompressez sur votre ordinateur"
echo "   - Installez Android Studio"
echo "   - Ouvrez le projet : npx cap open android"
echo "   - Build → Build APK"
echo ""
echo "2. Si vous utilisez GitHub Actions :"
echo "   - Poussez ce code sur GitHub"
echo "   - Le workflow .github/workflows/android-build.yml générera l'APK automatiquement"
echo "   - Téléchargez l'APK depuis l'onglet Actions"
echo ""
echo "📖 Consultez GUIDE_APPLICATION_MOBILE_ANDROID.md pour les instructions complètes"
