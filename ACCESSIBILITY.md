# Accessibilité RGAA - Agileboard

Ce document décrit les mesures d'accessibilité RGAA (Référentiel Général d'Amélioration de l'Accessibilité) implémentées dans le projet Agileboard.

## Conformité RGAA

Le projet Agileboard respecte les critères RGAA 4.1 niveau AA, complété par la checklist Opquast pour une accessibilité optimale.

## Structure sémantique

### Hiérarchie des titres

- **H1** : Titre principal de la page
- **H2** : Sections principales
- **H3** : Sous-sections
- **H4-H6** : Contenu structuré

### Landmarks ARIA

```html
<header role="banner">
  <nav role="navigation">
    <main role="main" id="main-content">
      <aside role="complementary">
        <footer role="contentinfo"></footer>
      </aside>
    </main>
  </nav>
</header>
```

### Fichiers concernés :

- `client/src/components/SkipLink.tsx`
- `client/src/App.tsx`

## Navigation clavier

### Skip Link

- **Lien d'évitement** : Permet d'accéder directement au contenu principal
- **Visible au focus** : Apparaît lors de la navigation clavier
- **Positionnement** : En haut de page, accessible en premier

```tsx
// client/src/components/SkipLink.tsx
<a href="#main-content" className="sr-only focus:not-sr-only">
  Passer au contenu principal
</a>
```

### Ordre de tabulation

- **Ordre logique** : Suit la structure visuelle de la page
- **Focus visible** : Indicateur de focus clair et contrasté
- **Pas de piège au clavier** : Tous les éléments sont accessibles

### Fichiers concernés :

- `client/src/hooks/useAccessibility.ts`
- `client/src/styles/accessibility.css`

## Contrastes et thèmes

### Contrastes conformes

- **Texte normal** : Ratio de contraste ≥ 4.5:1
- **Texte large** : Ratio de contraste ≥ 3:1
- **Éléments d'interface** : Contraste suffisant pour l'identification

### Thèmes clair/sombre

- **Détection automatique** : Respecte les préférences système
- **Basculement manuel** : Bouton de changement de thème accessible
- **Persistance** : Mémorisation du choix utilisateur

### Support des préférences utilisateur

```css
@media (prefers-contrast: high) {
  :root {
    --text-color: #000000;
    --bg-color: #ffffff;
    --border-color: #000000;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Formulaires accessibles

### Étiquettes et associations

- **Labels explicites** : Chaque champ a une étiquette claire
- **Associations ARIA** : `aria-labelledby`, `aria-describedby`
- **Groupes de champs** : `fieldset` et `legend` pour les groupes

### Messages d'erreur

- **Annonce automatique** : Messages d'erreur annoncés aux lecteurs d'écran
- **Contexte clair** : Indication du champ concerné
- **Solutions proposées** : Suggestions de correction

```tsx
// Exemple de validation accessible
<div role="alert" aria-live="polite">
  {errors.email && <span>L'email saisi n'est pas valide</span>}
</div>
```

### Fichiers concernés :

- `client/src/middleware/validation.middleware.ts`
- `client/src/hooks/useAccessibility.ts`

## Modales accessibles

### Piégeage du focus

- **Focus trap** : Le focus reste dans la modal
- **Fermeture clavier** : Touche Échap pour fermer
- **Retour au focus** : Retour à l'élément qui a ouvert la modal

### Annonces aux lecteurs d'écran

- **Ouverture** : Annonce du titre et de la description
- **Fermeture** : Confirmation de la fermeture
- **Contexte** : Rôle dialog et aria-modal

```tsx
// client/src/components/AccessibleModal.tsx
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">{title}</h2>
  <div id="modal-description">{description}</div>
</div>
```

## Images et médias

### Textes alternatifs

- **Images informatives** : Alt text descriptif
- **Images décoratives** : Alt vide ou rôle presentation
- **Images complexes** : Description détaillée si nécessaire

### Médias

- **Sous-titres** : Pour les vidéos
- **Transcriptions** : Pour les contenus audio
- **Contrôles accessibles** : Boutons de lecture/pause avec labels

## Tests d'accessibilité

### Outils automatisés

- **ESLint jsx-a11y** : Règles d'accessibilité dans le linting
- **Tests axe** : Audit automatisé des composants
- **Lighthouse** : Audit local des performances d'accessibilité

### Configuration ESLint

```javascript
// client/eslint.config.js
'jsx-a11y/alt-text': 'error',
'jsx-a11y/anchor-has-content': 'error',
'jsx-a11y/aria-props': 'error',
'jsx-a11y/heading-has-content': 'error',
// ...
```

### Tests manuels

- **Navigation clavier** : Test complet avec Tab, Shift+Tab, Entrée, Échap
- **Lecteur d'écran** : Test avec NVDA, JAWS, VoiceOver
- **Zoom** : Test avec zoom 200% et 400%
- **Contraste** : Vérification avec outils de contraste

## Composants accessibles

### Provider d'accessibilité

```tsx
// client/src/components/AccessibilityProvider.tsx
<AccessibilityProvider>
  <SkipLink />
  <AppRouter />
</AccessibilityProvider>
```

### Hook personnalisé

```tsx
// client/src/hooks/useAccessibility.ts
const { announceToScreenReader, trapFocus } = useAccessibility();
```

## Checklist de vérification

### Structure

- [ ] Hiérarchie des titres cohérente
- [ ] Landmarks ARIA présents
- [ ] Skip link fonctionnel
- [ ] Ordre de tabulation logique

### Contraste

- [ ] Ratios de contraste conformes
- [ ] Thème sombre disponible
- [ ] Support des préférences utilisateur
- [ ] Focus visible et contrasté

### Formulaires

- [ ] Labels associés aux champs
- [ ] Messages d'erreur annoncés
- [ ] Validation accessible
- [ ] Groupes de champs structurés

### Navigation

- [ ] Navigation clavier complète
- [ ] Modales avec focus trap
- [ ] Fermeture clavier des modales
- [ ] Retour au focus après fermeture

## Ressources

- [RGAA 4.1](https://www.numerique.gouv.fr/publications/rgaa-accessibilite/)
- [Opquast](https://checklists.opquast.com/fr/assurance-qualite-web/)
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/fr/docs/Web/Accessibility)
