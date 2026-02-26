import React, { useEffect } from "react";

import { getRouteApi } from "@tanstack/react-router";
import { Map, View } from 'react-openlayers';
import { IgnLayer } from "./Layers/IgnLayer";
import { SelectVectorLayerInteraction } from "./Interactions/selectVectorTileLayerInteraction";
import { VectorTileLayer } from "./Layers/VectorTileLayer";
import { tmsSource } from "../../utils/maps/Layers";
import { useMap } from 'react-openlayers';
import useMapStore from "../../hooks/store/useMapStore";
import useDalleStore from "../../hooks/store/useDalleStore";
import { getStyleForBlocs, getStyleForDalle } from "../../utils/maps/style";
import useFilterStore from "../../hooks/store/useFilterStore";
import { handleProduitEvent, handleChantierEvent } from "../../utils/interactions/clickEvent";
const route = getRouteApi("/telechargement/$downloadUrl");

export default function MapComponent() {
  const { downloadUrl } = route.useParams();

  const map = useMap();
  const center = useMapStore((state) => state.center);
  const zoom = useMapStore((state) => state.zoom);
  const isProduitSelected = useDalleStore((state) => state.isProduitSelected);
  const isProduitFiltered = useDalleStore((state) => state.isProduitFiltered);

  const filter = useFilterStore((state) => state.filter);

  
  const confVectorTileLayer: Record<string, VectorTileLayerConf> = {
    chantierLayer: {
      url: `https://data.geopf.fr/tms/1.0.0/${route.useParams().downloadUrl}-chantier/{z}/{x}/{y}.pbf`,
      maxZoom: 10,
      style: (feature) => {
          if ((filter.dateStart && new Date(feature.getProperties().timestamp).getTime() < filter.dateStart)
          || new Date(feature.getProperties().timestamp).getTime() > filter.dateEnd) {
            return getStyleForDalle("filtered");
          }
          return getStyleForBlocs(feature);
      },
      properties: {id: "chantierLayer"},
      selectInteraction: handleChantierEvent
    },
    produitLayer: {
      url: `https://data.geopf.fr/tms/1.0.0/${route.useParams().downloadUrl}-produit/{z}/{x}/{y}.pbf`,
      maxZoom: 16,
      properties: {id: "produitLayer"},
      selectInteraction: handleProduitEvent,
      style: (feature) => {
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
            if ((filter.dateStart && new Date(feature.getProperties().timestamp).getTime() < filter.dateStart) 
                || new Date(feature.getProperties().timestamp).getTime() > filter.dateEnd) {
              return getStyleForDalle("filtered");
            }
            return getStyleForDalle("default");
      }
    }
  }



  return (
    <div id="map">
    <Map 
        controls={[]} 
        >
        <View 
          center={center}
          zoom={zoom}
          maxZoom={16}/>
        <IgnLayer layerName="GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2"/>
        {Object.entries(confVectorTileLayer).map(([key, layerConf]) => {
          const elements = [];
          if (layerConf.url) {
            elements.push(
              <VectorTileLayer
                key={key}
                source={tmsSource(layerConf.url)}
                maxZoom={layerConf.maxZoom}
                style={layerConf.style}
                properties={layerConf.properties}
              />
            );
          }
          if (layerConf.selectInteraction) {
            elements.push(
              <SelectVectorLayerInteraction
              key={key+'-interaction'}
                layerId={layerConf.properties.id}
                vectorTileClickEventHandler={layerConf.selectInteraction}
              />
            );
          }
          return <React.Fragment key={key}>{elements}</React.Fragment>;
        })}
    </Map>
    </div>
  );
}
