import Map from "ol/Map";

//utils
import { tmsLayer } from "../../utils/maps/Layers";
import { getStyleForBlocs, getStyleForDalle } from "../../utils/maps/style";

//import store
import VectorTileLayer from "ol/layer/VectorTile";
import useDalleStore from "../store/useDalleStore";
import useFilterStore from "../store/useFilterStore";
import useMapStore from "../store/useMapStore";

//import interactions
import { addZoomInteraction } from "../../utils/maps/interactions";
import { SelectedPolygonInteraction } from "../../utils/interactions/selectedPolygonInteraction";
import { SelectedClickInteraction } from "../../utils/interactions/selectedClickInteraction";
import { HoverPopupInteraction } from "../../utils/interactions";


//To DO une fonction qui gère le style en global

export const useLayers = (map: Map, downloadUrl: string) => {
  const isProduitFiltered = useDalleStore((state) => state.isProduitFiltered);
  const isProduitSelected = useDalleStore((state) => state.isProduitSelected);
  const addProduitLayer = useDalleStore((state) => state.addProduitLayer);
  const addChantierLayer = useDalleStore((state) => state.addChantierLayer);
  const addProduit = useDalleStore((state) => state.addProduit);
  const removeProduit = useDalleStore((state) => state.removeProduit);
  const setIsMetadata = useDalleStore((state) => state.setIsMetadata);

  const chantierLayer = tmsLayer(
    `https://data.geopf.fr/tms/1.0.0/${downloadUrl}-chantier/{z}/{x}/{y}.pbf`,
    10,
  );
  chantierLayer.setStyle((feature) => {
    const filter = useFilterStore.getState().filter;
    if (
      new Date(feature.getProperties().timestamp).getTime() <
        filter.dateStart ||
      new Date(feature.getProperties().timestamp).getTime() > filter.dateEnd
    ) {
      return getStyleForDalle("filtered");
    }
    return getStyleForBlocs(feature);
  });

  const produitLayer = tmsLayer(
    `https://data.geopf.fr/tms/1.0.0/${downloadUrl}-produit/{z}/{x}/{y}.pbf`,
    16,
  );
  produitLayer.setVisible(false); // a voir si on garde

  const selectionProduitLayer = new VectorTileLayer({
    renderMode: "vector",
    source: produitLayer.getSource(),
    style: (feature) => {
      const filter = useFilterStore.getState().filter;
      const isDalleHovered = useDalleStore.getState().isDalleHovered;
      if (isDalleHovered(feature.getProperties().id)) {
        return getStyleForDalle("hovered");
      }
      if (isProduitSelected(feature.getProperties().id)) {
        return getStyleForDalle("selected");
      }
      if (isProduitFiltered(feature.getProperties().id)) {
        return getStyleForDalle("filtered");
      }
      if (
        new Date(feature.getProperties().timestamp).getTime() <
          filter.dateStart ||
        new Date(feature.getProperties().timestamp).getTime() > filter.dateEnd
      ) {
        return getStyleForDalle("filtered");
      }
      return getStyleForDalle("default");
    },
  });

  map.getLayers().extend([chantierLayer, produitLayer, selectionProduitLayer]);

  addProduitLayer(selectionProduitLayer);
  addChantierLayer(chantierLayer);

  addZoomInteraction(map, chantierLayer, 11);
  // createSelectionControls(map, selectionProduitLayer);

  // ajout interactions
  const polygonInteraction = new SelectedPolygonInteraction(
    selectionProduitLayer,
    isProduitSelected,
    addProduit,
    removeProduit,
  ).getDrawInteraction();
  map.addInteraction(polygonInteraction);
  polygonInteraction.setActive(false);

  const clickInteraction = new SelectedClickInteraction(
    selectionProduitLayer,
    10,
    isProduitSelected,
    addProduit,
    removeProduit,
    setIsMetadata,
  );
  map.addInteraction(clickInteraction);
  clickInteraction.setActive(true);

  const hoverInteractionChantier = new HoverPopupInteraction({
    layer: chantierLayer,
  });
  map.addInteraction(hoverInteractionChantier);

  const hoverInteractionProduit = new HoverPopupInteraction({
    layer: produitLayer,
  });
  map.addInteraction(hoverInteractionProduit);

  // ⚡ bascule entre les interactions selon selectionMode
  useMapStore.subscribe((state) => {
    if (state.selectionMode === "polygon") {
      polygonInteraction.setActive(true);
      clickInteraction.setActive(false);
    } else if (state.selectionMode === "click") {
      polygonInteraction.setActive(false);
      clickInteraction.setActive(true);
    } else {
      polygonInteraction.setActive(false);
      clickInteraction.setActive(true);
    }
  });
};
