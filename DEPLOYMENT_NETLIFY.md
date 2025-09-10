# Guide de Déploiement sur Netlify - SITAB

Ce guide vous aidera à déployer l'application SITAB (Système de Gestion de Cantine) sur Netlify avec succès.

## 🚀 Étapes de Déploiement

### 1. Préparation de la Base de Données

**Option recommandée : Neon Database**
1. Créez un compte sur [Neon.tech](https://neon.tech)
2. Créez une nouvelle base de données PostgreSQL
3. Copiez l'URL de connexion `DATABASE_URL`

**Alternative : Supabase**
1. Créez un compte sur [Supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Récupérez l'URL de connexion PostgreSQL

### 2. Configuration du Repository Git

1. **Depuis Replit :**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - SITAB Application"
   ```

2. **Créez un repository sur GitHub/GitLab :**
   - Créez un nouveau repository public ou privé
   - Ajoutez l'origine remote :
   ```bash
   git remote add origin https://github.com/votre-username/sitab.git
   git push -u origin main
   ```

### 3. Déploiement sur Netlify

1. **Connexion à Netlify :**
   - Allez sur [netlify.com](https://netlify.com)
   - Connectez-vous avec GitHub/GitLab
   - Cliquez sur "New site from Git"

2. **Configuration du Site :**
   - Sélectionnez votre repository SITAB
   - **Build command :** `npm run build`
   - **Publish directory :** `dist`
   - **Functions directory :** `netlify/functions`

3. **Variables d'Environnement :**
   Dans Netlify Dashboard > Site settings > Environment variables, ajoutez :
   ```
   DATABASE_URL=votre_url_postgresql_complete
   SESSION_SECRET=cle-secrete-tres-longue-et-aleatoire-minimum-32-caracteres
   NODE_ENV=production
   ```

### 4. Configuration de la Base de Données

1. **Migration du Schéma :**
   Une fois déployé, lancez depuis votre environnement local :
   ```bash
   DATABASE_URL="votre_url_netlify_db" npm run db:push
   ```

2. **Population des Données :**
   Utilisez le script de population depuis Replit :
   ```bash
   node scripts/populate-via-api.ts
   ```
   (Modifiez l'URL API pour pointer vers votre site Netlify)

### 5. Test du Déploiement

1. **Vérifications :**
   - ✅ Site accessible sur `https://votre-site.netlify.app`
   - ✅ Pages se chargent correctement
   - ✅ API fonctionne : `https://votre-site.netlify.app/api/consommateurs`
   - ✅ Ajout de consommations fonctionne
   - ✅ Génération de rapports fonctionne

### 6. Configuration Post-Déploiement

1. **Domaine Personnalisé (Optionnel) :**
   - Netlify Dashboard > Domain management
   - Ajoutez votre domaine personnalisé

2. **Optimisations :**
   - Activez "Auto-publishing" pour les déploiements automatiques
   - Configurez les notifications Slack/Email si nécessaire

## 🔧 Dépannage Courant

### Erreur de Build
```
Error: Module not found
```
**Solution :** Vérifiez que toutes les dépendances sont dans `package.json`

### Erreur de Base de Données
```
Connection failed
```
**Solution :** 
1. Vérifiez que `DATABASE_URL` est correctement configurée
2. Testez la connexion depuis votre terminal local
3. Assurez-vous que la base de données accepte les connexions externes

### Erreur de Fonctions Netlify
```
Function not found
```
**Solution :**
1. Vérifiez que le dossier `netlify/functions` existe
2. Vérifiez la configuration dans `netlify.toml`
3. Redéployez le site

### Erreur CORS
```
Access-Control-Allow-Origin
```
**Solution :** Les headers CORS sont configurés automatiquement, mais vérifiez que l'URL frontend correspond à l'URL de l'API.

## 📋 Checklist de Déploiement

- [ ] Base de données PostgreSQL créée et accessible
- [ ] Repository Git configuré et pushé
- [ ] Site Netlify créé et connecté au repository
- [ ] Variables d'environnement configurées
- [ ] Premier déploiement réussi
- [ ] Migration de base de données effectuée
- [ ] Tests fonctionnels validés
- [ ] Domaine configuré (si applicable)

## 🎯 URLs Importantes Après Déploiement

- **Application :** `https://votre-site.netlify.app`
- **API :** `https://votre-site.netlify.app/api/`
- **Dashboard Netlify :** `https://app.netlify.com/sites/votre-site`

## 📞 Support

En cas de problème :
1. Vérifiez les logs de déploiement dans Netlify Dashboard
2. Consultez les logs de fonctions pour les erreurs API
3. Testez localement avant de redéployer

**L'application SITAB est maintenant prête pour la production sur Netlify !** 🚀