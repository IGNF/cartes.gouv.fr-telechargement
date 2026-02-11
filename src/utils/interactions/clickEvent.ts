import { FeatureLike } from "ol/Feature";
import { Layer } from "ol/layer";
import { useDalleStore } from "../../hooks/store/useDalleStore";
import useMapStore from "../../hooks/store/useMapStore";
import { Coordinate } from "ol/coordinate";

function getFeaturesAtPixel(event: MapEvent , layerId: string): FeatureLike[] {
    const map = event.map;
    const pixel = map.getEventPixel(event.originalEvent);
    const features: FeatureLike[] = [];
    map.forEachFeatureAtPixel(pixel, (feature, layer) => {
        if (layer?.get("id") === layerId) {
            features.push(feature);
        }
    });
    return features;
}   

function getCoordinatesAtPixel(event: MapEvent): Coordinate {
    const map = event.map;
    const pixel = map.getEventPixel(event.originalEvent);
    return map.getCoordinateFromPixel(pixel);
}  
/**
   * Gère l'événement de clic pour la sélection.
   * @param event - L'événement de clic de la carte.
   * @returns {boolean} - Retourne `true` pour continuer la propagation de l'événement.
   */
export  const handleProduitEvent: vectorTileClickEventHandler = (event, layerId) => {
    console.log("handleChantierEvent called with layerId: ", layerId);
    const { isProduitSelected, addProduit, removeProduit, setIsMetadata } = useDalleStore.getState();
    const features = getFeaturesAtPixel(event, layerId)
    if (features.length === 0) {
        return false;
    }
    features.forEach((feature: FeatureLike) => {
        const properties = feature.getProperties();
        properties.metadata ? setIsMetadata(true) : setIsMetadata(false);
        const dalle : Dalle = {
          name: properties.name,
          url: properties.url,
          id: properties.id,
          timestamp: new Date(properties.timestamp).getTime(),
          metadata: properties.metadata,
        };
        // Ajoute ou retire le produit en fonction de son état
        if (!isProduitSelected(dalle.id)) {
          addProduit(dalle);
          return true;
        } else {
            removeProduit(dalle.id);
          }
        })
        return false;
};

/**
 * La fonction `handleChantierEvent` gère l'événement de clic pour les chantiers. 
 * Si le zoom actuel est inférieur à 12, elle ne fait rien. 
 * Sinon, elle récupère les chantiers au pixel cliqué et recentre la carte sur ces coordonnées et ajuste le zoom à 12.
 * @param event - Event de carte openlayers
 * @param layerId - Id de la couche concernée par l'interaction
 * @returns 
 */
export const handleChantierEvent: vectorTileClickEventHandler = (event, layerId) => {
    let currentZoom = event.map.getView().getZoom()
    if (currentZoom && currentZoom > 12) {
        return false;
    }
    const features = getFeaturesAtPixel(event, layerId)
    if (features.length === 0) {
        return false;
    }
    else {
        event.map.getView().animate({
            center: getCoordinatesAtPixel(event),
            zoom: 12,
            duration: 500
        });
        useMapStore.getState().setZoom(12);
        useMapStore.getState().setCenter(getCoordinatesAtPixel(event));
    }
    return true;
};