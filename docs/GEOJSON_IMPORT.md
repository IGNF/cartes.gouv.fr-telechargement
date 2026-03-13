# Interaction GeoJSON - Guide d'utilisation

## Vue d'ensemble

La nouvelle fonctionnalité d'import GeoJSON permet aux utilisateurs de sélectionner automatiquement les dalles qui intersectent une géométrie GeoJSON importée.

## Composants créés

### 1. **GeoJsonImportModal.tsx**
Modal de sélection et d'import de fichiers GeoJSON avec :
- Interface de glisser-déposer (drag & drop)
- Validation du format GeoJSON
- Gestion des erreurs détaillée
- Message de succès avec fermeture automatique
- Intégration au système de sélection des dalles

### 2. **GeoJsonImportInfo.tsx**
Panneau d'information qui s'affiche après l'import avec :
- Nombre de dalles sélectionnées
- Liste des dalles intersectées
- Design optimisé (coin inférieur droit de l'écran)
- Animations fluides

### 3. **geojsonInteraction.ts**
Fichier utilitaire contenant :
- `selectDallesFromGeoJson()` : Détecte les intersections et sélectionne les dalles
- `addGeoJsonLayerToMap()` : Ajoute la visualisation du GeoJSON sur la carte

## Flux d'interaction

```
1. Utilisateur clique sur le bouton "Importer GeoJSON" → Ouverture de la modal
2. Utilisateur importe un fichier GeoJSON (drag & drop ou clic)
3. Validation du format GeoJSON
4. Visualisation du GeoJSON sur la carte
5. Détection des intersections avec les dalles
6. Sélection automatique des dalles intersectées
7. Affichage du panneau d'information
8. Modal se ferme après 2 secondes
9. Panneau d'info reste visible pour confirmation
```

## Fonctionnalités principales

### Détection d'intersection
- Utilise la bibliothèque Turf.js (`booleanIntersects`)
- Teste chaque dalle contre la géométrie GeoJSON
- Support de Feature et FeatureCollection

### Visualisation
- Affichage du GeoJSON en bleu (#0096FF)
- Couche vectorielle avec style distinct
- Zoom automatique sur la zone importée
- Padding de 50px autour des géométries

### Sélection des dalles
- Intégration avec `useDalleStore`
- Évite les doublons
- Applique les filtres de date existants
- Met à jour l'interface en temps réel

## Utilisation dans le code

### Ouvrir la modal
```typescript
import { geoJsonImportModal } from './GeoJsonImportModal';

geoJsonImportModal.open();
```

### Importer manuellement
```typescript
import { selectDallesFromGeoJson, addGeoJsonLayerToMap } from './utils/interactions/geojsonInteraction';

addGeoJsonLayerToMap(geojson, mapInstance);
selectDallesFromGeoJson(geojson, dallesLayer, isProduitSelected, addProduit);
```

## Formats supportés

- `.geojson` - Format GeoJSON standard
- `.json` - Fichier JSON contenant du GeoJSON valide

Structure attendue:
```json
{
  "type": "Feature" ou "FeatureCollection",
  "geometry": { ... },
  "properties": { ... },
  "features": [ ... ] // Seulement pour FeatureCollection
}
```

## Gestion des erreurs

- Validation stricte du format GeoJSON
- Messages d'erreur clairs et explicites
- Gestion des fichiers corrompus
- Vérification de l'initialisation de la carte et des couches

## Styles et accessibilité

- Classes CSS préfixées par `geojson-import-`
- Support du responsive design
- Icônes DSFR intégrées
- Animations fluides
- Labels ARIA pour accessibilité

## Performance

- Détection d'intersection optimisée avec liste de vérification
- Évite les vérifications multiples sur la même dalle
- Gestion mémoire avec Set pour les IDs déjà vérifiés
- Auto-fermeture de la modal après 2 secondes

## Intégration

La fonctionnalité est intégrée dans :
- `Menu.tsx` - Rendu du composant modal
- `SelectedOptions.jsx` - Bouton d'accès à la modal
