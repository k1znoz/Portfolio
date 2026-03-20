# Deploiement et exploitation

## Prerequis
- Node.js 20+
- npm

## Installation
- npm install

## Lancement local
- Frontend: npm run dev
- API SQL: npm run dev:api

## Verification qualite locale
- npm run check

## Build
- npm run build

## Preview locale
- npm run preview

## CI/CD
Le workflow GitHub Actions execute automatiquement:
1. Installation des dependances.
2. Execution des tests.
3. Build de production.

## Variables d'environnement API
- API_PORT (defaut: 8787)
- ADMIN_API_KEY (defaut dev: change-me-in-production)

## Checklist avant mise en production
- Tests verts.
- Build valide.
- En-tetes de securite verifies sur la cible d'hebergement.
- Mention du traitement des donnees de contact dans la documentation projet.

## Retour arriere
- Redeployer le dernier commit/stable tag valide.
- Verifier l'integrite des assets statiques apres rollback.
