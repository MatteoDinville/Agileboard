# Configuration des Variables d'Environnement

## Architecture Recommandée

**Un seul fichier `.env` à la racine du projet** qui sera utilisé par :

- Docker Compose (pour les conteneurs)
- L'application serveur (via dotenv)

## Configuration

### 1. Créer le fichier `.env` à la racine

```bash
# À la racine du projet Agileboard
cp env.example .env
```

### 2. Contenu du fichier `.env`

```env
# ========================================
# CONFIGURATION AGILEBOARD
# ========================================

# Base de données PostgreSQL
POSTGRES_USER=agileboard_user
POSTGRES_PASSWORD=agileboard_password
POSTGRES_DB=agileboard_db
DATABASE_URL=postgresql://agileboard_user:agileboard_password@postgres:5432/agileboard_db?schema=public

# Sécurité JWT (CHANGEZ EN PRODUCTION !)
JWT_ACCESS_SECRET=dev-super-secret-jwt-access-key-change-in-production
JWT_REFRESH_SECRET=dev-super-secret-jwt-refresh-key-change-in-production

# Configuration CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# Configuration Client
VITE_API_URL=http://localhost:4000

# Logging
LOG_LEVEL=debug

# Ports (optionnel, valeurs par défaut)
PORT=4000
CLIENT_PORT=5173
```

## Utilisation

### Développement local

```bash
cd server && npm run dev

cd client && npm run dev
```

### Avec Docker Compose

```bash
# Développement
cd Agilebaord

docker compose up -d --build

```

## Variables utilisées par

### Docker Compose

- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- `DATABASE_URL`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `CORS_ORIGIN`
- `VITE_API_URL`

### Application Serveur

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `CORS_ORIGIN`
- `LOG_LEVEL`
- `PORT`

### Application Client

- `VITE_API_URL` (via Vite)

## Sécurité

⚠️ **IMPORTANT :**

- Ne committez jamais le fichier `.env`
- Changez les clés JWT en production
- Utilisez des mots de passe forts
- Le fichier `.env` est déjà dans `.gitignore`
