import React, {useRef } from "react";

import "ol/ol.css";
import "@gouvfr/dsfr/dist/dsfr.css";
import "@gouvfr/dsfr/dist/utility/icons/icons.css";
import "geopf-extensions-openlayers/css/Dsfr.css";
import { getRouteApi } from "@tanstack/react-router";
import { Map, View } from 'react-openlayers';
import SelectedOptions from "./MenuCompenents/SelectedOptions";
import { IgnLayer } from "./Layers/IgnLayer";
import { VectorTile } from "ol";
import { VectorTileLayer } from "./Layers/VectorTileLayer";
import { tmsSource } from "../../utils/maps/Layers";
const route = getRouteApi("/telechargement/$downloadUrl");




export default function MapComponent() {
  const { downloadUrl } = route.useParams();

  return (
    <div id="map">
    <Map 
        controls={[]} >
        <View 
          center={[288074.8449901076, 6247982.515792289]}
          zoom={6}
          maxZoom={16}/>
        <IgnLayer layerName="GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2"/>
        <VectorTileLayer
          source={tmsSource(
              `https://data.geopf.fr/tms/1.0.0/${downloadUrl}-chantier/{z}/{x}/{y}.pbf`,
              10,
            )}
          maxZoom={10}
        />
    </Map>
    </div>
  );
}
