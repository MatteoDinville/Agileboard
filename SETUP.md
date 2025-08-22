# Guide de Configuration - Agileboard

Ce guide vous aide à configurer correctement l'environnement de développement et de production pour éviter les warnings Docker Compose.

## Résolution des Warnings Docker Compose

### Problème

Les warnings suivants apparaissent lors du lancement de Docker Compose :

```
WARN[0000] The "DATABASE_URL" variable is not set. Defaulting to a blank string.
WARN[0000] The "JWT_ACCESS_SECRET" variable is not set. Defaulting to a blank string.
WARN[0000] The "JWT_REFRESH_SECRET" variable is not set. Defaulting to a blank string.
WARN[0000] The "CORS_ORIGIN" variable is not set. Defaulting to a blank string.
WARN[0000] The "VITE_API_URL" variable is not set. Defaulting to a blank string.
```

### Solution

#### 1. Créer un fichier .env

Copiez le fichier `env.example` vers `.env` :

```bash
cp env.example .env
```

#### 2. Modifier les variables selon votre environnement

Éditez le fichier `.env` créé :

**Pour le développement :**

```env
# Base de données
POSTGRES_USER=agileboard_user
POSTGRES_PASSWORD=agileboard_password
POSTGRES_DB=agileboard_db
DATABASE_URL=postgresql://agileboard_user:agileboard_password@postgres:5432/agileboard_db?schema=public

# Sécurité JWT (CHANGEZ CES CLÉS EN PRODUCTION !)
JWT_ACCESS_SECRET=dev-super-secret-jwt-access-key
JWT_REFRESH_SECRET=dev-super-secret-jwt-refresh-key

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# Client
VITE_API_URL=http://localhost:4000

# Logging
LOG_LEVEL=debug
```

**Pour la production :**

```env
# Base de données
POSTGRES_USER=agileboard_prod_user
POSTGRES_PASSWORD=your-very-secure-password
POSTGRES_DB=agileboard_prod
DATABASE_URL=postgresql://agileboard_prod_user:your-very-secure-password@postgres:5432/agileboard_prod?schema=public

# Sécurité JWT (GÉNÉREZ DES CLÉS SÉCURISÉES !)
JWT_ACCESS_SECRET=your-production-jwt-access-secret-key
JWT_REFRESH_SECRET=your-production-jwt-refresh-secret-key

# CORS
CORS_ORIGIN=https://agileboard.fr

# Client
VITE_API_URL=https://api.agileboard.fr

# Logging
LOG_LEVEL=info
```

## Lancement de l'Application

### Développement local

```bash
cd server

npm install && npm run dev

cd client

npm install && npm run dev
```

### Avec Docker Compose

```bash
cd Agilebaord

docker compose up -d --build

cd server && npm install

cd client && npm install

```

## Génération de données de tests en développement

Aller dans le server

```bash
cd server
```

Copier le .env.example

```bash
cp .env.example .env
```

Lancer la commande :

```bash
npm run seed
```

## Génération de Clés JWT Sécurisées

Pour la production, générez des clés JWT sécurisées :

```bash
# Générer une clé JWT sécurisée
openssl rand -base64 64

# Ou utiliser Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

## Vérification de la Configuration

Après avoir créé le fichier `.env`, relancez Docker Compose :

```bash
docker compose down
docker compose up -d --build
```

Les warnings devraient disparaître et l'application devrait démarrer correctement.

## Structure des Fichiers

```
Agileboard/
├── .env                    # Variables d'environnement (à créer)
├── env.example            # Exemple de variables d'environnement
├── docker-compose.yml     # Configuration production (avec Traefik)
├── docker-compose.dev.yml # Configuration développement
└── ...
```

## Sécurité

⚠️ **IMPORTANT :**

- Ne committez jamais le fichier `.env` dans Git
- Changez les clés JWT par défaut en production
- Utilisez des mots de passe forts pour la base de données
- Le fichier `.env` est déjà dans `.gitignore`

## Dépannage

### Erreur de connexion à la base de données

Vérifiez que les variables `POSTGRES_USER`, `POSTGRES_PASSWORD`, et `POSTGRES_DB` sont correctement définies.

### Erreur CORS

Assurez-vous que `CORS_ORIGIN` correspond à l'URL de votre frontend.

### Erreur JWT

Vérifiez que `JWT_ACCESS_SECRET` et `JWT_REFRESH_SECRET` sont définis et non vides.
