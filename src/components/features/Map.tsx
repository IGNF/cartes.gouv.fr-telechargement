import React, { useEffect, useState } from "react";
import { OSM } from "ol/source";
import { Map, View, TileLayer } from "react-openlayers";
import "react-openlayers/dist/index.css";


import Gp from "geoportal-access-lib";
import { LayerWMTS } from "geopf-extensions-openlayers";

import "ol/ol.css";
import "@gouvfr/dsfr/dist/dsfr.css";
import "@gouvfr/dsfr/dist/utility/icons/icons.css";
import "geopf-extensions-openlayers/css/Dsfr.css";
import { getRouteApi } from "@tanstack/react-router";
const route = getRouteApi("/telechargement/$downloadUrl");

const MapComponent = () => {
  const { downloadUrl } = route.useParams();
  const [isConfigLoaded, setIsConfigLoading] =useState(false)

  const getConfig = async () => {
    const config = new Gp.Services.Config({
      customConfigFile:
        "https://raw.githubusercontent.com/IGNF/geoportal-configuration/new-url/dist/fullConfig.json",
      onSuccess: ()=> {setIsConfigLoading(true)},
      onFailure: (e) => console.error(e),
    });
    await config.call();
  };

  useEffect(() => {
    getConfig();
  },[]);
if (isConfigLoaded) {
  

  return (
    <>
    
      <div
        id="map"
        className="map-container fr-col-8"
        style={{ height: "80vh", width: "100%" }}
      >
        <Map controls={[]}>
          <TileLayer
            source={
              new LayerWMTS({
                layer: "GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2",
              })
            }
          />
          <View
            center={[288074.8449901076, 6247982.515792289]}
            zoom={6}
            maxZoom={16}
          />
        </Map>
      </div>
    </>
  );}
  else{
    
  return(
        <>
    
      <div
        id="map"
        className="map-container fr-col-8"
        style={{ height: "80vh", width: "100%" }}
      >
        
      </div>
    </>

  )}
};

export default MapComponent;
