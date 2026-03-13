import { booleanIntersects } from "@turf/turf";
import GeoJSON from "ol/format/GeoJSON";
import { Dalle } from "../../assets/@types/types";
import Vector from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import CircleStyle from "ol/style/Circle";
import { isEmpty } from "ol/extent";
import { Polygon } from "ol/geom";
import type { Map } from "ol";

/**
 * Attend que la carte ait fini de rendre (rendercomplete) APRÈS le zoom sur le GeoJSON.
 * 
 * Pourquoi rendercomplete et pas tileloadend ?
 * 
 * selectionProduitLayer est une VectorTileLayer (source MVT).
 * getFeaturesInExtent() sur ce type de couche ne retourne les features QUE
 * si leurs tuiles sont dans le cache de rendu du CanvasVectorTileLayerRenderer.
 * Ce cache est alimenté UNIQUEMENT après un cycle de rendu complet de la carte.
 * 
 * Donc : zoom → tuiles téléchargées → map.rendercomplete → getFeaturesInExtent OK
 */
export const waitForRenderAndSelect = (
  map: Map,
  onReady: () => void,
  timeoutMs = 10000
): void => {
  let done = false;
  let forceTimer: ReturnType<typeof setTimeout> | null = null;

  const triggerReady = () => {
    if (done) return;
    done = true;
    if (forceTimer) clearTimeout(forceTimer);
    map.un("rendercomplete", onRenderComplete);
    onReady();
  };

  const onRenderComplete = () => {
    console.log("[GeoJSON Import] rendercomplete reçu → lancement sélection");
    triggerReady();
  };

  // Écoute UN SEUL rendercomplete (le prochain après le zoom)
  map.once("rendercomplete", onRenderComplete);

  // Timeout de sécurité
  forceTimer = setTimeout(() => {
    console.warn(`[GeoJSON Import] timeout ${timeoutMs}ms → forçage`);
    triggerReady();
  }, timeoutMs);
};

/**
 * Sélectionne les dalles intersectant un GeoJSON dans une VectorTileLayer.
 * À appeler UNIQUEMENT après waitForRenderAndSelect.
 */
export const selectDallesFromGeoJson = (
  geojson: any,
  dallesLayer: any,
  isProduitSelected: (id: string | number | undefined) => boolean,
  addProduit: (produit: any) => void,
  removeProduit?: (id: string | number | undefined) => void
): void => {
  if (!dallesLayer) {
    console.error("[GeoJSON Import] La couche des dalles n'est pas disponible");
    return;
  }

  try {
    const format = new GeoJSON();
    const listAlreadyChecked = new Set<string>();

    // Les GeoJSON sont en WGS84 (EPSG:4326) par spec.
    // La carte et la couche sont en EPSG:2154.
    // Il faut reprojeter pour que l'étendue soit dans le même CRS que getFeaturesInExtent.
    const readOptions = {
      dataProjection: "EPSG:4326",
      featureProjection: "EPSG:2154",
    };

    let geoJsonFeatures: any[] = [];
    if (geojson.type === "FeatureCollection") {
      geoJsonFeatures = format.readFeatures(geojson, readOptions);
    } else if (geojson.type === "Feature") {
      geoJsonFeatures = format.readFeatures(
        { type: "FeatureCollection", features: [geojson] },
        readOptions
      );
    } else {
      throw new Error("Format GeoJSON invalide");
    }

    if (geoJsonFeatures.length === 0) {
      console.warn("[GeoJSON Import] Aucune géométrie valide trouvée");
      return;
    }

    let totalSelected = 0;

    geoJsonFeatures.forEach((geoJsonFeature: any) => {
      const geoJsonGeometry = geoJsonFeature.getGeometry();
      const geoJsonExtent = geoJsonGeometry.getExtent();

      console.log("[GeoJSON Import] geoJsonExtent (EPSG:2154):", geoJsonExtent);
      console.log("[GeoJSON Import] map zoom:", (dallesLayer as any).get?.("map")?.getView?.()?.getZoom?.());
      console.log("[GeoJSON Import] layer type:", dallesLayer.constructor?.name);
      console.log("[GeoJSON Import] layer visible:", dallesLayer.getVisible?.());
      console.log("[GeoJSON Import] layer minZoom:", dallesLayer.getMinZoom?.());
      console.log("[GeoJSON Import] layer maxZoom:", dallesLayer.getMaxZoom?.());

      // Tester aussi sur la source directement
      const src = dallesLayer.getSource?.();
      console.log("[GeoJSON Import] source type:", src?.constructor?.name);
      if (src?.getFeaturesInExtent) {
        const fromSource = src.getFeaturesInExtent(geoJsonExtent);
        console.log("[GeoJSON Import] source.getFeaturesInExtent →", fromSource.length);
      }
      // Inspecter le cache interne de la source VectorTile
      if (src?.tileCache_) {
        console.log("[GeoJSON Import] tileCache_ keys count:", src.tileCache_.count_);
      }

      const dallesInExtent: any[] = dallesLayer.getFeaturesInExtent(geoJsonExtent);
      console.log(`[GeoJSON Import] layer.getFeaturesInExtent → ${dallesInExtent.length} features`);

      if (dallesInExtent.length === 0) {
        console.warn(
          "[GeoJSON Import] Aucune dalle trouvée. " +
          "Vérifier que le zoom courant est dans la plage de la couche (minZoom/maxZoom)."
        );
        return;
      }

      dallesInExtent.forEach((dalleFeature: any) => {
        const properties = dalleFeature.getProperties();
        const dalleId = String(properties.id);

        if (listAlreadyChecked.has(dalleId)) return;
        listAlreadyChecked.add(dalleId);

        try {
          const featureExtent = dalleFeature.getGeometry().getExtent();
          const polygon = new Polygon([[
            [featureExtent[0], featureExtent[1]],
            [featureExtent[0], featureExtent[3]],
            [featureExtent[2], featureExtent[3]],
            [featureExtent[2], featureExtent[1]],
            [featureExtent[0], featureExtent[1]],
          ]]);

          if (
            booleanIntersects(
              format.writeGeometryObject(polygon.getSimplifiedGeometry()),
              format.writeGeometryObject(geoJsonGeometry)
            )
          ) {
            const dalle: Dalle = {
              name: properties.name,
              url: properties.url,
              id: properties.id,
              timestamp: new Date(properties.timestamp).getTime(),
              metadata: properties.metadata,
            };

            if (!isProduitSelected(dalle.id)) {
              addProduit(dalle);
              totalSelected++;
              console.log(`[GeoJSON Import] Dalle sélectionnée: ${dalle.name}`);
            } else if (removeProduit) {
              removeProduit(dalle.id);
              console.log(`[GeoJSON Import] Dalle désélectionnée: ${dalle.name}`);
            }
          }
        } catch (err) {
          console.warn(`[GeoJSON Import] Erreur dalle ${dalleId}:`, err);
        }
      });
    });

    console.log(
      `[GeoJSON Import] Terminé: ${totalSelected} sélectionnée(s), ${listAlreadyChecked.size} vérifiée(s)`
    );
  } catch (error) {
    console.error("[GeoJSON Import] Erreur sélection:", error);
  }
};

/**
 * Ajoute le GeoJSON visuellement sur la carte et zoome dessus.
 * duration:0 pour que le zoom soit instantané et déclenche immédiatement
 * le chargement + rendu des tuiles.
 */
export const addGeoJsonLayerToMap = (geojson: any, map: any): string => {
  const format = new GeoJSON();
  const layerId = `imported-geojson-${Date.now()}`;

  if (!map || !map.getView()) throw new Error("Carte non initialisée");

  const source = new Vector({
    features: format.readFeatures(geojson, {
      featureProjection: map.getView().getProjection(),
    }),
  });

  if (source.getFeatures().length === 0) {
    throw new Error("Aucune géométrie valide trouvée dans le GeoJSON");
  }

  const layer = new VectorLayer({
    source,
    style: new Style({
      fill: new Fill({ color: "rgba(0, 150, 255, 0.15)" }),
      stroke: new Stroke({ color: "#0096FF", width: 3 }),
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({ color: "#0096FF" }),
      }),
    }),
  });

  map.addLayer(layer);

  const extent = source.getExtent();
  if (extent && !isEmpty(extent)) {
    // duration: 0 → zoom instantané → OL déclenche immédiatement le chargement des tuiles
    // → rendercomplete arrive dès que tout est rendu
    map.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 0 });
  }

  console.log(`[GeoJSON Import] Couche ajoutée, zoom sur l'étendue`);
  return layerId;
};
