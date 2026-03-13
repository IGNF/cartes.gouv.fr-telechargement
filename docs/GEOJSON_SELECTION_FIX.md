# Correction - Sélection des dalles avec GeoJSON

## Problème identifié

❌ Le GeoJSON s'affichait correctement sur la carte, mais les dalles n'étaient pas sélectionnées.

## Cause

La fonction `selectDallesFromGeoJson` tentait de récupérer toutes les features avec `getSource().getFeatures()`, mais :
- La couche des dalles est une **VectorTileLayer** (tuiles vectorielles), pas une VectorLayer classique
- Les VectorTileLayer ne conservent pas les features en mémoire de la même façon
- L'approche manquait du pattern d'intersection utilisé dans `selectedPolygonInteraction`

## Solution implémentée

Réécriture complète de `selectDallesFromGeoJson` en s'inspirant du pattern de `selectedPolygonInteraction`:

### Changements majeurs

1. **Utilisation de `getFeaturesInExtent()`**
   ```typescript
   // Ancien (ne fonctionne pas avec VectorTileLayer)
   const allFeatures = dallesLayer.getSource()?.getFeatures() || [];

   // Nouveau (compatible avec VectorTileLayer)
   const dallesInExtent = dallesLayer.getFeaturesInExtent(geoJsonExtent);
   ```

2. **Lecture correcte du GeoJSON via OpenLayers**
   ```typescript
   // Utiliser le format GeoJSON d'OpenLayers
   const features = format.readFeatures(geojson);
   
   // Puis itérer sur les geometries OL
   features.forEach((geoJsonFeature) => {
     const geoJsonGeometry = geoJsonFeature.getGeometry();
   ```

3. **Intersection via `writeGeometryObject()` (comme selectedPolygonInteraction)**
   ```typescript
   const geoJsonGeoObj = format.writeGeometryObject(geoJsonGeometry);
   const dalleGeoObj = format.writeGeometryObject(dalleBbox);
   const hasIntersection = booleanIntersects(dalleGeoObj, geoJsonGeoObj);
   ```

4. **Gestion d'erreurs robuste et logging détaillé**
   ```typescript
   console.log("Traitement de X géométrie(s)...");
   console.log("X dalle(s) trouvée(s) dans l'étendue");
   console.log(`Dalle sélectionnée: ${dalle.name}`);
   ```

5. **Support du fallback**
   ```typescript
   if (typeof dallesLayer.getFeaturesInExtent === "function") {
     // Utiliser getFeaturesInExtent
   } else if (dallesLayer.getSource && ...) {
     // Fallback sur getSource
   }
   ```

## Fichiers modifiés

- ✅ `src/utils/interactions/geojsonInteraction.ts`
  - Nouvelle implémentation de `selectDallesFromGeoJson`
  - Pattern matching avec `selectedPolygonInteraction`
  - Logs détaillés pour le débogage

- ✅ `src/utils/controls/GeoJsonImportControl.ts`
  - Ajout du paramètre `removeProduit`

## Avantages

✅ **Fonctionne avec VectorTileLayer** - Compatible avec la vraie architecture de la carte  
✅ **Pattern consistant** - Même logique que la sélection par polygone  
✅ **Débogage facile** - Logs détaillés à chaque étape  
✅ **Gestion d'erreurs** - Fallback et try-catch pour chaque étape  
✅ **Support bidirectionnel** - Peut sélectionner ET déselectionner  

## Vérification

Pour tester, importez un GeoJSON et vérifiez les logs console:

```
Ajout du GeoJSON à la carte...
Couche GeoJSON ajoutée à la carte
Traitement de X géométrie(s) GeoJSON...
Recherche des dalles dans l'étendue: [...]
X dalle(s) trouvée(s) dans l'étendue
Dalle sélectionnée: [nom]
Dalle sélectionnée: [nom]
...
Sélection terminée. X dalle(s) vérifiée(s)
Dalles sélectionnées avec succès
```

## Dépannage

| Symptôme | Solution |
|----------|----------|
| Pas de logs de sélection | Vérifier que `dallesLayer` a une méthode `getFeaturesInExtent` |
| "Aucune dalle trouvée" | Le GeoJSON est peut-être en dehors de la zone des dalles |
| Dalle pas sélectionnée | Vérifier que `isProduitSelected` et `addProduit` fonctionnent |
