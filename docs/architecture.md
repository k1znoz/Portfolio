# Architecture applicative

## Objectif
Ce projet est une application portfolio fullstack: frontend Svelte (Vite), API Express et base relationnelle SQLite.

## Couches

### 1. Presentation (UI)
- Emplacement: src/components, src/styles
- Role: affichage, interactions utilisateur, accessibilite et navigation.

### 2. Metier
- Emplacement: src/lib/contact-form.js
- Role: validation des donnees, sanitation, regles anti-spam, controle du consentement RGPD, orchestration de soumission.

### 3. Donnees
- Emplacement: server/db.js + fichier SQLite (portfolio.db)
- Role: persistance relationnelle des projets et messages de contact.

### 4. API
- Emplacement: server/index.js
- Role: exposition des endpoints /api/projects et /api/contact, controle d'acces admin sur les routes sensibles.

## Flux principal: soumission de contact
1. L'utilisateur renseigne le formulaire dans ContactSection.
2. La couche metier valide les champs et applique les regles (email, longueur, consentement, honeypot).
3. Le frontend envoie la demande a l'API (/api/contact).
4. L'API valide et persiste en SQL dans contact_messages.
5. En cas d'indisponibilite API, fallback localStorage cote navigateur.
6. L'interface remonte un message de succes ou d'erreur.

## Securite appliquee
- En-tetes de securite sur environnement Vite dev/preview.
- Validation stricte des entrees en front.
- Validation et nettoyage des donnees avant persistance SQL.
- Champ honeypot pour limiter les soumissions automatisees.
- Protection des routes admin via x-admin-key.

## Limites connues et extension recommandee
- La base actuelle est SQLite locale (pertinente pour la preuve SQL, mais non distribuee).
- Extension naturelle: passer a PostgreSQL/MySQL avec migrations versionnees pour une production multi-instance.
