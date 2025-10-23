# 📱 Guide Complet : Conversion SITAB en Application Mobile Android

## 🎯 Vue d'ensemble

Ce guide vous explique comment convertir votre application web SITAB en application mobile Android native qui fonctionne 100% en local avec SQLite.

## ✅ Ce qui a été Préparé

### 1. **Configuration Capacitor** ✅
- `capacitor.config.ts` créé
- Packages installés : `@capacitor/core`, `@capacitor/android`, `@capacitor-community/sqlite`
- Plugins ajoutés : Filesystem, Share, SplashScreen

### 2. **Base de Données SQLite Locale** ✅
- `client/src/lib/database.ts` - Gestionnaire de base SQLite
- `client/src/lib/mobile-storage.ts` - Couche de stockage mobile
- `client/public/assets/seed-data.json` - Données exportées (1 consommateur actuellement)

### 3. **API Mobile** ✅
- `client/src/services/mobile-api.ts` - API locale sans serveur
- `client/src/lib/platform.ts` - Détection automatique web/mobile
- Génération de rapports Word adaptée pour mobile

### 4. **Scripts d'Export** ✅
- `scripts/export-data-for-mobile.ts` - Export PostgreSQL vers JSON

## 🚀 **IMPORTANT : Limites de Replit**

⚠️ **Replit ne peut pas builder directement les APK Android** car cela nécessite Android SDK et Gradle.

Vous devez :
1. Télécharger le projet depuis Replit
2. Builder l'APK sur votre ordinateur local OU utiliser un service de build cloud

## 📋 Étapes Complètes pour Générer l'APK

### **Étape 1 : Préparation dans Replit**

#### A. Exporter toutes les données actuelles
```bash
# Dans Replit, exécutez :
tsx scripts/export-data-for-mobile.ts
```

Cela créera `client/public/assets/seed-data.json` avec tous vos consommateurs.

#### B. Builder le projet pour production
```bash
npm run build
```

#### C. Initialiser Capacitor Android
```bash
npx cap add android
npx cap sync
```

### **Étape 2 : Télécharger le Projet**

1. **Dans Replit** : Cliquez sur les 3 points → "Download as ZIP"
2. **Décompressez** le fichier sur votre ordinateur
3. **Ouvrez un terminal** dans le dossier décompressé

### **Étape 3 : Configuration Locale (Sur Votre Ordinateur)**

#### A. Installer les prérequis

**Sur Windows :**
1. Installez [Node.js](https://nodejs.org/) (v20+)
2. Installez [Java JDK 17](https://adoptium.net/)
3. Installez [Android Studio](https://developer.android.com/studio)
4. Dans Android Studio :
   - Ouvrez SDK Manager
   - Installez Android SDK Platform 34 (ou supérieur)
   - Installez Android SDK Build-Tools
   - Installez Android SDK Command-line Tools

**Sur Mac :**
```bash
# Installer Homebrew si nécessaire
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Installer Node.js et Java
brew install node@20
brew install openjdk@17

# Télécharger et installer Android Studio manuellement
```

**Sur Linux :**
```bash
# Installer Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installer Java
sudo apt-get install openjdk-17-jdk

# Télécharger Android Studio
wget https://redirector.gvt1.com/edgedl/android/studio/ide-zips/2024.1.1.12/android-studio-2024.1.1.12-linux.tar.gz
```

#### B. Configurer les variables d'environnement

**Windows :**
```
JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.x
ANDROID_HOME=C:\Users\VotreNom\AppData\Local\Android\Sdk
Path=%Path%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\cmdline-tools\latest\bin
```

**Mac/Linux :**
```bash
# Ajoutez dans ~/.bashrc ou ~/.zshrc
export ANDROID_HOME=$HOME/Library/Android/sdk  # Mac
# OU
export ANDROID_HOME=$HOME/Android/Sdk  # Linux

export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
```

### **Étape 4 : Build de l'Application**

#### A. Installer les dépendances
```bash
npm install
```

#### B. Builder le frontend
```bash
npm run build
```

#### C. Synchroniser Capacitor
```bash
npx cap sync android
```

#### D. Ouvrir dans Android Studio
```bash
npx cap open android
```

### **Étape 5 : Générer l'APK dans Android Studio**

1. **Android Studio s'ouvre** avec votre projet
2. **Attendez** que Gradle finisse de synchroniser (barre de progression en bas)
3. **Menu** : Build → Build Bundle(s) / APK(s) → Build APK(s)
4. **Attendez** la compilation (3-10 minutes la première fois)
5. **Cliquez** sur "locate" quand la notification apparaît
6. **Trouvez** l'APK dans : `android/app/build/outputs/apk/debug/app-debug.apk`

### **Étape 6 : Signer l'APK pour Release (Optionnel)**

Pour une version signée (nécessaire pour Google Play) :

1. **Générer une clé** :
```bash
keytool -genkey -v -keystore sitab-release-key.keystore -alias sitab -keyalg RSA -keysize 2048 -validity 10000
```

2. **Créer** `android/key.properties` :
```properties
storePassword=VOTRE_MOT_DE_PASSE
keyPassword=VOTRE_MOT_DE_PASSE
keyAlias=sitab
storeFile=../sitab-release-key.keystore
```

3. **Build Release APK** dans Android Studio :
   - Build → Generate Signed Bundle / APK
   - Choisir APK
   - Sélectionner votre keystore
   - Build

### **Étape 7 : Installer sur Android**

#### Option A : Via câble USB
1. Activez le mode développeur sur votre téléphone
2. Connectez via USB
3. Dans Android Studio : Run → Run 'app'

#### Option B : Via APK direct
1. Transférez `app-debug.apk` sur votre téléphone
2. Installez (autorisez les sources inconnues si nécessaire)

## 🎯 **Alternative : Build Cloud (Plus Simple)**

Si vous ne voulez pas installer Android Studio, utilisez **GitHub Actions** :

### Configuration GitHub Actions

1. **Poussez** votre code sur GitHub
2. **Créez** `.github/workflows/android-build.yml` :

```yaml
name: Build Android APK

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
    
    - name: Setup Java
      uses: actions/setup-java@v3
      with:
        distribution: 'adopt'
        java-version: '17'
    
    - name: Install dependencies
      run: npm install
    
    - name: Build web app
      run: npm run build
    
    - name: Sync Capacitor
      run: npx cap sync android
    
    - name: Build Android APK
      run: |
        cd android
        ./gradlew assembleDebug
    
    - name: Upload APK
      uses: actions/upload-artifact@v3
      with:
        name: app-debug
        path: android/app/build/outputs/apk/debug/app-debug.apk
```

3. **Allez** dans Actions → Téléchargez l'APK généré

## 📊 Vérification des Données

### Vérifier que toutes les données sont exportées :

```bash
# Dans Replit, vérifiez le fichier seed-data.json
cat client/public/assets/seed-data.json | jq '.totalConsumers'
```

Si vous n'avez qu'1 consommateur, il faut :
1. Vérifier que la base de données contient bien vos 256 consommateurs
2. Re-exécuter l'export : `tsx scripts/export-data-for-mobile.ts`

## 🔧 Dépannage

### Problème : "SDK location not found"
**Solution :** Configurez `ANDROID_HOME` correctement

### Problème : "Gradle build failed"
**Solution :** 
```bash
cd android
./gradlew clean
./gradlew build
```

### Problème : "Database not initialized"
**Solution :** Vérifiez que `seed-data.json` existe dans `client/public/assets/`

### Problème : APK trop gros
**Solution :** Activez ProGuard dans `android/app/build.gradle`

## 📱 Fonctionnalités de l'App Mobile

✅ Gestion des consommateurs (CRUD complet)
✅ Enregistrement des présences quotidiennes
✅ Gestion des consommations (700F / 1000F)
✅ Génération de rapports Word
✅ Partage de rapports via apps Android
✅ Fonctionnement 100% offline
✅ Base de données SQLite locale
✅ Toutes les données préchargées

## 🎉 Résumé des Fichiers Créés

```
capacitor.config.ts                      # Configuration Capacitor
client/src/lib/database.ts              # Gestionnaire SQLite
client/src/lib/mobile-storage.ts        # Couche storage mobile
client/src/lib/platform.ts              # Détection plateforme
client/src/services/mobile-api.ts       # API locale
client/public/assets/seed-data.json     # Données exportées
scripts/export-data-for-mobile.ts       # Script d'export
```

## 📞 Support

En cas de problème :
1. Vérifiez les logs Android Studio
2. Consultez les logs Capacitor : `npx cap run android --livereload`
3. Vérifiez la base SQLite : les données doivent être dans `seed-data.json`

**Votre application SITAB est prête à être convertie en application mobile Android ! 🚀**
