# Sécurité OWASP - Agileboard

Ce document décrit les mesures de sécurité OWASP Top 10 implémentées dans le projet Agileboard.

## A01 - Broken Access Control

### Mesures implémentées :

- **Authentification JWT** : Tokens stockés en cookies httpOnly
- **Middleware d'autorisation** : Vérification des rôles et permissions
- **Contrôle d'accès aux ressources** : Vérification d'appartenance sur chaque projet/tâche
- **Middleware `requireProjectAccess`** : Vérifie que l'utilisateur est membre du projet
- **Middleware `requireTaskAccess`** : Vérifie l'accès aux tâches via l'appartenance au projet

### Fichiers concernés :

- `server/src/middleware/auth.middleware.ts`
- `server/src/routes/*.ts`

## A02 - Cryptographic Failures

### Mesures implémentées :

- **HTTPS obligatoire** : Configuration Traefik avec certificats Let's Encrypt
- **HSTS activé** : Headers de sécurité HTTP Strict Transport Security
- **Hash des mots de passe** : Bcrypt avec salt
- **Cookies sécurisés** : Secure, SameSite, httpOnly
- **Clés JWT en variables d'environnement** : Pas de clés hardcodées

### Configuration :

```yaml
# docker-compose.yml
- "traefik.http.middlewares.security-headers.headers.stsIncludeSubdomains=true"
- "traefik.http.middlewares.security-headers.headers.stsPreload=true"
- "traefik.http.middlewares.security-headers.headers.stsSeconds=31536000"
```

## A03 - Injection

### Mesures implémentées :

- **Validation systématique** : Express-validator pour toutes les entrées
- **Prisma ORM** : Requêtes paramétrées, pas de SQL brut
- **Sanitisation des entrées** : Échappement des caractères spéciaux
- **Validation des types** : TypeScript pour la vérification statique

### Fichiers concernés :

- `server/src/middleware/validation.middleware.ts`
- `server/src/middleware/security.middleware.ts`

## A04 - Insecure Design

### Mesures implémentées :

- **Règles métier explicites** : Validation côté serveur
- **Tests unitaires** : Couverture des fonctionnalités critiques
- **Revues de code** : Processus de PR obligatoire
- **Architecture sécurisée** : Séparation des responsabilités

## A05 - Security Misconfiguration

### Mesures implémentées :

- **Helmet.js** : Headers de sécurité automatiques
- **CORS en liste blanche** : Origines autorisées strictement définies
- **x-powered-by désactivé** : Masquage de la technologie
- **Limitation de taille des payloads** : Protection contre les attaques DoS
- **Content Security Policy** : Protection XSS

### Configuration :

```javascript
// server/src/middleware/security.middleware.ts
export const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      // ...
    },
  },
});
```

## A06 - Vulnerable & Outdated Components

### Mesures implémentées :

- **Audit automatique** : npm audit dans le CI/CD
- **Mises à jour régulières** : Workflow GitHub Actions hebdomadaire
- **Échec du CI en cas de vulnérabilités** : Blocage des déploiements
- **Scan de dépendances** : OWASP Dependency Check

### Workflow :

```yaml
# .github/workflows/security-audit.yml
- name: Check for known vulnerabilities
  run: |
    if npm audit --audit-level=high; then
      echo "High or critical vulnerabilities found!"
      exit 1
    fi
```

## A07 - Identification & Authentication Failures

### Mesures implémentées :

- **Sessions stateless** : JWT sans stockage côté serveur
- **Rotation des tokens** : Possibilité de refresh tokens
- **Rate limiting** : Protection contre les attaques par force brute
- **Verrouillage des routes sensibles** : Authentification obligatoire

### Configuration :

```javascript
// server/src/middleware/security.middleware.ts
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Trop de tentatives de connexion",
});
```

## A08 - Software & Data Integrity Failures

### Mesures implémentées :

- **Images Docker signées** : GHCR avec signatures
- **CI reproductible** : Environnements de build identiques
- **Migrations Prisma contrôlées** : Versioning des schémas de base de données
- **Scan des conteneurs** : Trivy pour détecter les vulnérabilités

## A09 - Security Logging & Monitoring

### Mesures implémentées :

- **Logs structurés** : Pino pour le logging JSON
- **Journalisation des actions sensibles** : Auth, CRUD projets/tâches
- **Monitoring des erreurs** : Capture des exceptions
- **Audit trail** : Traçabilité des actions utilisateurs

### Exemple :

```javascript
// server/src/utils/logger.ts
export const logSecurityEvent = (
  event: string,
  details: any,
  userId?: number,
  ip?: string
) => {
  logger.warn({
    event: "SECURITY",
    type: event,
    userId,
    ip,
    details,
    timestamp: new Date().toISOString(),
  });
};
```

## A10 - SSRF

### Mesures implémentées :

- **Aucune requête réseau côté serveur** : Pas d'appels HTTP externes
- **Liste blanche stricte** : Si ajout futur (webhooks, import)
- **Blocage des IP internes** : Protection contre l'accès aux services internes

## Tests de sécurité

### Commandes à exécuter :

```bash
# Audit des dépendances
npm run audit

# Tests de sécurité
npm run test:security

# Scan des conteneurs
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image agileboard-server:latest
```

## Variables d'environnement requises

```env
# Sécurité
JWT_ACCESS_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
CORS_ORIGIN=https://agileboard.com,https://www.agileboard.com

# Base de données
DATABASE_URL=postgresql://user:password@localhost:5432/agileboard

# Logging
LOG_LEVEL=info
```

## Monitoring et alertes

- **Logs de sécurité** : Surveillés pour détecter les tentatives d'intrusion
- **Métriques d'authentification** : Échecs de connexion, tentatives de force brute
- **Alertes automatiques** : En cas de vulnérabilités détectées dans les dépendances
