# Portfolio CDA - RNCP37873

Projet principal de presentation des competences pour le titre professionnel Concepteur Developpeur d'Applications.

## Demarrage rapide

- npm install
- npm run dev
- npm run dev:api

## Qualite

- npm run format:check
- npm run test
- npm run coverage
- npm run check

## Build

- npm run build
- npm run preview

## Dossier de preuves CDA

- Matrice competences: docs/cda-competences-matrice.md
- Architecture: docs/architecture.md
- Plan de tests: docs/test-plan.md
- Deploiement/DevOps: docs/deployment.md
- RGPD/RGAA: docs/rgpd-rgaa.md

## Points techniques deja couverts

- Frontend Svelte modulaire et responsive.
- API Express + base SQLite relationnelle pour projets et messages de contact.
- Formulaire de contact avec validation metier, consentement RGPD et protection anti-spam.
- Tests unitaires Vitest sur logique metier critique.
- Pipeline CI GitHub Actions (tests, build).
- En-tetes de securite configures en dev/preview via Vite.

## Limites et extension recommandee

Pour une cible de production, remplacer SQLite par PostgreSQL/MySQL et ajouter des migrations versionnees + authentification admin plus robuste (JWT/roles).
