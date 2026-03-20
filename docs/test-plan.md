# Plan de tests

## Portee
Valider les regles metier critiques du formulaire de contact et la stabilite du build.

## Types de tests
- Tests unitaires:
  - Validation des donnees de contact.
  - Nettoyage/sanitation des donnees.
  - Persistance locale des messages.
- Tests de non regression:
  - Build Vite reussi.

## Cas critiques
1. Refus sans consentement.
2. Refus email invalide.
3. Refus message trop court.
4. Refus si honeypot renseigne.
5. Acceptation avec payload propre et persistance locale.

## Commandes
- npm run test
- npm run coverage
- npm run build

## Criteres de succes
- Tous les tests passent.
- Build sans erreur.
- Rapport de couverture genere.
