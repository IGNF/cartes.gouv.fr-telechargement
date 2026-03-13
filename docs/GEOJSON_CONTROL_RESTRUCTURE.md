# Restructuration - Contrôle GeoJSON sur la carte

## Problème initial

L'import GeoJSON était géré via une modal React qui causait une erreur "carte n'est pas initialisée" car :
- La modal s'ouvrait avant que la carte soit complètement initialisée
- L'instance de la carte n'était pas toujours disponible au moment du clic

## Solution implémentée

**Transformer l'import GeoJSON en contrôle OpenLayers natif** plutôt qu'un composant React.

### Avantages

✅ **Garantit l'initialisation** - Le contrôle est ajouté APRÈS que la carte soit instanciée  
✅ **Intégration native** - Fonctionne directement avec OpenLayers  
✅ **Meilleures performances** - Pas de re-render React inutiles  
✅ **UX cohérente** - S'intègre avec les autres contrôles de la carte (zoom, recherche, etc.)  
✅ **Drag & drop natif** - Fonctionne directement sur le contrôle  

## Composants créés

### GeoJsonImportControl.ts
Contrôle OpenLayers personnalisé qui :
- Crée un bouton uploadable sur la carte
- Gère le drag & drop de fichiers
- Valide le format GeoJSON
- Accède directement à la carte via `setMap()`
- Affiche les notifications
- Intègre les dalles sélectionnées

### GeoJsonImportControl.css
Styles du contrôle :
- Bouton uploadable (36x36px)
- Effets hover et drag-over
- Notifications toast (bottom-right)
- Design DSFR compatible

## Architecture

```
Map.tsx
  ↓
useMap hook
  ↓
addControls(map) [controls.ts]
  ↓
addGeoJsonImportControl(map)
  ↓
GeoJsonImportControl (attaché à la carte)
  ├─ Drag & drop
  ├─ File input
  ├─ Validation GeoJSON
  ├─ selectDallesFromGeoJson()
  └─ addGeoJsonLayerToMap()
```

## Intégration

### 1. Contrôle automatiquement ajouté
```typescript
// Dans controls.ts
export const addControls = (map: Map) => {
  // ... autres contrôles ...
  addGeoJsonImportControl(map, { position: "top-right" });
};
```

### 2. CSS importé
```typescript
// Dans Map.tsx
import "../../utils/controls/GeoJsonImportControl.css";
```

### 3. Interaction avec le store
Le contrôle récupère dynamiquement l'état du store :
```typescript
const storeState = useDalleStore.getState();
selectDallesFromGeoJson(
  geojson,
  this.produitLayer,
  storeState.isProduitSelected,
  storeState.addProduit
);
```

## Utilisation

L'utilisateur :
1. Voit un petit bouton upload dans le coin top-right de la carte
2. Clique dessus ou drag-drop un fichier GeoJSON
3. Le fichier est validé et traité
4. Une notification apparaît (succès ou erreur)
5. Les dalles sont automatiquement sélectionnées

## Fichiers modifiés

- ✅ `src/utils/controls/GeoJsonImportControl.ts` - Nouveau contrôle
- ✅ `src/utils/controls/GeoJsonImportControl.css` - Nouveau style
- ✅ `src/utils/maps/controls.ts` - Import et ajout du contrôle
- ✅ `src/components/features/Map.tsx` - Import du CSS
- ✅ `src/components/features/MenuCompenents/SelectedOptions.jsx` - Suppression de l'import modal
- ✅ `src/components/features/Menu.tsx` - Suppression du composant modal

## Suppression des anciens fichiers (optionnel)

Si vous n'utilisez plus la modal React, vous pouvez supprimer :
- `src/components/features/MenuCompenents/GeoJsonImportModal.tsx`
- `src/components/features/MenuCompenents/GeoJsonImportInfo.tsx`
- `src/components/features/MenuCompenents/styles/GeoJsonImportModal.css`
- `src/components/features/MenuCompenents/styles/GeoJsonImportInfo.css`

## Avantages maintenant

✅ Plus d'erreur "carte non initialisée"  
✅ Contrôle toujours disponible directement sur la carte  
✅ Feedback utilisateur immédiat (notifications toast)  
✅ Compatible avec tous les navigateurs  
✅ Meilleure intégration avec OpenLayers  
