#!/bin/bash

# Script de préparation pour le déploiement Netlify de SITAB
# Ce script prépare l'application pour un déploiement sur Netlify

echo "🚀 Préparation du déploiement Netlify pour SITAB..."

# Vérification des prérequis
echo "📋 Vérification des prérequis..."

if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé"
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo "❌ git n'est pas installé"
    exit 1
fi

# Installation des dépendances si nécessaire
echo "📦 Installation des dépendances..."
npm install

# Vérification TypeScript
echo "🔍 Vérification TypeScript..."
npm run check

# Test de build local
echo "🏗️ Test de build local..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build réussi !"
else
    echo "❌ Erreur de build. Vérifiez les erreurs ci-dessus."
    exit 1
fi

# Vérification de la configuration Netlify
echo "⚙️ Vérification de la configuration Netlify..."

if [ ! -f "netlify.toml" ]; then
    echo "❌ netlify.toml manquant"
    exit 1
fi

if [ ! -f "netlify/functions/api.ts" ]; then
    echo "❌ Fonction Netlify manquante"
    exit 1
fi

if [ ! -f ".env.example" ]; then
    echo "❌ .env.example manquant"
    exit 1
fi

echo "✅ Configuration Netlify validée"

# Préparation Git
echo "📝 Préparation Git..."

# Vérification du statut Git
if [ ! -d ".git" ]; then
    echo "⚠️ Repository Git non initialisé. Initialisation..."
    git init
    git add .
    git commit -m "Initial commit - SITAB Application ready for Netlify"
else
    echo "✅ Repository Git existant"
    
    # Vérification des changements
    if [[ `git status --porcelain` ]]; then
        echo "📝 Changements détectés. Commit en cours..."
        git add .
        git commit -m "Update configuration for Netlify deployment"
    else
        echo "✅ Aucun changement à commiter"
    fi
fi

echo ""
echo "🎉 Application SITAB prête pour le déploiement Netlify !"
echo ""
echo "📋 Étapes suivantes :"
echo "1. Poussez votre code vers GitHub/GitLab :"
echo "   git remote add origin https://github.com/votre-username/sitab.git"
echo "   git push -u origin main"
echo ""
echo "2. Créez un site sur Netlify connecté à votre repository"
echo ""
echo "3. Configurez les variables d'environnement dans Netlify :"
echo "   - DATABASE_URL"
echo "   - SESSION_SECRET"
echo "   - NODE_ENV=production"
echo ""
echo "4. Consultez DEPLOYMENT_NETLIFY.md pour les instructions détaillées"
echo ""
echo "🚀 Bon déploiement !"