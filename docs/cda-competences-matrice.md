# Matrice de competences CDA (RNCP37873)

## Bloc 1 - Developper une application securisee

### 1) Installer et configurer son environnement de travail en fonction du projet
- Preuves dans ce projet:
  - Scripts npm standardises (dev, build, test, coverage, check).
  - Configuration Vite centralisee et reproductible.
  - Verification du formatage et des tests via commande unique.
- Demonstration orale:
  - Lancer npm run check et expliquer la chaine qualite.

### 2) Developper des interfaces utilisateur
- Preuves dans ce projet:
  - Composants Svelte modularises (hero, projets, cv, contact, mini-jeux).
  - Interface responsive et theming.
  - Formulaire de contact avec etats utilisateur (envoi, succes, erreur).
- Demonstration orale:
  - Parcourir l'application sur desktop et mobile.

### 3) Developper des composants metier
- Preuves dans ce projet:
  - Module metier dedie pour le formulaire de contact (validation, sanitation, persistance locale).
  - Regles explicites: anti-spam honeypot, validation email, longueur minimale, consentement obligatoire.
- Demonstration orale:
  - Montrer les regles dans src/lib/contact-form.js et executer les tests unitaires.

### 4) Contribuer a la gestion d'un projet informatique
- Preuves dans ce projet:
  - Documentation de decisions techniques et deploiement.
  - Matrice de couverture des competences.
  - Strategie de tests formalisee.
- Demonstration orale:
  - Expliquer les choix techniques et leur impact (qualite, delai, securite).

## Bloc 2 - Concevoir et developper une application securisee organisee en couches

### 5) Analyser les besoins et maquetter une application
- Preuves dans ce projet:
  - Besoin cible: portfolio professionnel evaluant des competences de developpement.
  - Parcours utilisateur: decouverte, preuve de realisations, prise de contact.
- Demonstration orale:
  - Expliquer le besoin initial et la priorisation fonctionnelle.

### 6) Definir l'architecture logicielle d'une application
- Preuves dans ce projet:
  - Separation claire presentation / logique metier / donnees locales.
  - Documentation d'architecture dediee.
- Demonstration orale:
  - Presenter le schema de couches et le chemin d'une soumission de contact.

### 7) Concevoir et mettre en place une base de donnees relationnelle
- Preuves dans ce projet:
  - Base SQLite relationnelle avec schema SQL (tables projects et contact_messages).
  - Contraintes clef primaire, unicite sur le nom projet, timestamps de creation/mise a jour.
  - Seed initial des projets depuis les donnees portfolio.

### 8) Developper des composants d'acces aux donnees SQL et NoSQL
- Preuves dans ce projet:
  - API Express avec acces SQL pour recuperer les projets et enregistrer les messages de contact.
  - Endpoints CRUD projets (admin) et endpoint public de contact.
  - Fallback localStorage en mode degradation si API indisponible.

## Bloc 3 - Preparer le deploiement d'une application securisee

### 9) Preparer et executer les plans de tests d'une application
- Preuves dans ce projet:
  - Plan de tests documente.
  - Tests unitaires de logique metier (validation + persistance).
  - Couverture executable via npm run coverage.
- Demonstration orale:
  - Lancer npm run test puis npm run coverage.

### 10) Preparer et documenter le deploiement d'une application
- Preuves dans ce projet:
  - Guide de deploiement dedie.
  - Scripts build et preview.
  - Variables et points de vigilance securite documentes.
- Demonstration orale:
  - Presenter le pipeline local de build et la checklist de deploiement.

### 11) Contribuer a la mise en production dans une demarche DevOps
- Preuves dans ce projet:
  - Workflow CI automatisant tests et build.
- Demonstration orale:
  - Montrer le fichier .github/workflows/ci.yml et decrire le flux de controle qualite.

## Elements transverses couverts
- Securite: en-tetes anti-embedding/cross-origin, validation des entrees, anti-spam, sanitation.
- RGPD: consentement explicite sur le formulaire de contact, minimisation des donnees stockees.
- Accessibilite: messages de statut et erreurs exposes aux technologies d'assistance.
- Anglais technique: lecture et utilisation de documentations techniques pour outillage tests/CI.
