import { Map } from "ol";
import { FeatureLike } from "ol/Feature";
import { getStyleForDalle, getStyleForDalles } from "./style";
import { Select } from "ol/interaction";
import { click } from "ol/events/condition";
import { easeOut } from "ol/easing";
import View from "ol/View";

import VectorLayer from "ol/layer/Vector";

/**
 * Génère un style OpenLayers basé sur le type d'interaction ou d'état.
 *
 * @param type - Le type de style à appliquer, correspondant à une clé dans `styleDalle`.
 *               Exemple : "select" ou "pointer_move_dalle_menu".
 * @returns Un objet `Style` configuré pour OpenLayers.
 */
export const addHoveredInteraction = (map: Map) => {
  let lastHoveredFeature: FeatureLike | null = null;

  map.on("pointermove", (event) => {
    const feature = map.forEachFeatureAtPixel(event.pixel, (feature, layerCandidate) => {
      return feature  // Filtre pour la couche cible
    });

    // Si la souris quitte une feature survolée
    if (lastHoveredFeature && lastHoveredFeature !== feature) {
      if (lastHoveredFeature.get('selected')) {
        lastHoveredFeature.setStyle(getStyleForDalle("selected")); // Réinitialise le style
        
        
      }else{
        lastHoveredFeature.setStyle(getStyleForDalle("default")); // Réinitialise le style
        
        

      }
      lastHoveredFeature = null;
    }

    // Si une nouvelle feature est survolée
    if (feature) {
      if (feature.get('selected')) {
        feature.setStyle(getStyleForDalle("selected")); // Applique le style de survol
        
      }else{
        feature.setStyle(getStyleForDalle("hovered")); // Applique le style de survol

      }
      lastHoveredFeature = feature;
    }
  });
};

/**
 * Ajoute une interaction de zoom à la carte.
 * @param map - L'instance OpenLayers de la carte.
 * @param layer - La couche sur laquelle appliquer l'interaction.
 * @param zoomToGo - Le niveau de zoom à atteindre.
 */
export const addZoomInteraction = (map:Map,layer:VectorLayer,zoomToGo:number)=>{
  map.on("singleclick", (event) => {
    const feature = map.forEachFeatureAtPixel(event.pixel, (feature, layerCandidate)=>{
      return layerCandidate === layer ? feature : null;
    })
    if(feature){
      const geometry = feature.getGeometry(); // on vérifie qu'on a une géométrie pour zoomer dessus
      if(!geometry)return;
      const extent = geometry.getExtent();
      const view = map.getView();
      view.fit(extent, {
        duration:1000,
        easing: easeOut,
        maxZoom:zoomToGo
      })
    }
  })
}

/**
 * Ajoute une interaction de sélection à une carte OpenLayers.
 * @param map - L'instance OpenLayers de la carte.
 * @param layer - La couche vectorielle sur laquelle appliquer la sélection.
 * @param setSelectedDalles - Fonction pour mettre à jour les dalles sélectionnées.
 */
export const addSelectedInteraction = (
  map: Map,
  layer: VectorLayer,
  setSelectedDalles: (dalles: any[]) => void
) => {
  const selectInteraction = new Select({
    condition: click, // Sélection au clic
    layers: [layer], // Applique la sélection uniquement à cette couche
  });

  // Gestion de l'événement de sélection
  selectInteraction.on("select", (event) => {
    const { selected, deselected } = event;

    // Met à jour l'état des dalles
    setSelectedDalles((prevDalles: any) => {
      const updated = [...prevDalles];

      // Ajoute les nouvelles sélections
      selected.forEach((feature) => {
        const featureProps = feature.getProperties();
        const index = updated.findIndex((f) => f.name === featureProps.name);
        if (index !== -1) {
          updated.splice(index, 1);
          feature.set('selected',false,false)
        } else {
          updated.push(featureProps);
          feature.setStyle(getStyleForDalle("selected"))
          feature.set('selected',true,false)
        }

      });

      return updated;
    });
  });

  map.addInteraction(selectInteraction);

  return selectInteraction; // Retourne l'interaction pour un éventuel nettoyage
};
