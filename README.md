# CodeLearn 🚀

Plateforme d'apprentissage interactive avec validation automatique du code.

## Architecture

```
pages/
  index.js                     → Accueil
  cours/
    index.js                   → Catalogue (filtres, recherche)
    [courseId]/[lessonIdx].js  → Leçon + éditeur + tests de validation
  profil.js                    → Profil (authentification requise)
  xk9-admin/index.js           → Panel admin SECRET (non lié dans l'UI)
  api/
    auth/{register,login,me}   → Auth JWT (cookies HttpOnly)
    courses/index              → Liste + détail cours
    progress/index             → Sauvegarde progression (serveur si connecté)
    admin/{login,courses}      → Admin API
lib/
  db.js                        → Stockage JSON dans /tmp (remplacer par vraie DB)
  auth.js                      → JWT helpers
  useAuth.js                   → Context React auth
  useProgress.js               → Hook progression (localStorage guest, serveur si connecté)
  testRunner.js                → Moteur de tests client (iframe sandboxée)
  seedCourses.js               → Seed des cours initiaux au 1er lancement
```

## Déploiement Vercel

### 1. Variables d'environnement (obligatoire)
Dans Vercel Dashboard → Settings → Environment Variables :

| Variable | Valeur |
|---|---|
| `JWT_SECRET` | Chaîne aléatoire longue (ex: `openssl rand -base64 32`) |
| `ADMIN_SECRET` | Autre chaîne aléatoire |
| `ADMIN_PASSWORD` | Mot de passe de ton panel admin |

### 2. Push sur GitHub + import Vercel
```bash
git init && git add . && git commit -m "init CodeLearn"
git remote add origin https://github.com/TON_USER/codelearn.git
git push -u origin main
# Vercel → Add New Project → importer le repo → Deploy
```

## Panel admin (CONFIDENTIEL)
URL : `/xk9-admin` — **aucune trace dans l'UI publique**

- Connexion avec `ADMIN_PASSWORD`
- Upload de cours en JSON
- Suppression de cours
- Template + documentation des types de tests

## Ajouter un cours
1. Va sur `/xk9-admin`
2. Onglet "Template" → télécharge le template JSON
3. Remplis le JSON avec tes chapitres, leçons et tests
4. Onglet "Ajouter" → colle le JSON → Upload

### Types de tests disponibles
| check | Description |
|---|---|
| `hasTag` | La page contient un élément HTML (ex: `h1`) |
| `tagContainsText` | Un tag contient un texte spécifique |
| `hasAttr` | Un tag possède un attribut (ex: `href`, `alt`) |
| `minCount` | Au moins N éléments d'un type |
| `cssContains` | Le bloc `<style>` contient un texte |
| `codeContains` | Le code source contient un texte |
| `consoleLog` | Un `console.log()` contient un texte |

## Système d'accès
- **Visiteur** : 5 leçons gratuites (stockées en localStorage)
- **Compte gratuit** : accès illimité + progression sauvegardée sur serveur
- **À la 6ème leçon** : mur d'inscription non intrusif (pas de paywall agressif)
- La progression guest est **migrée** vers le serveur après inscription

## Base de données
Actuellement : fichiers JSON dans `/tmp` (éphémère sur Vercel).
Pour production, remplacer `lib/db.js` par :
- **Planetscale** (MySQL serverless)
- **Supabase** (PostgreSQL + auth)
- **Upstash Redis** (clé-valeur ultra-rapide)
