import { DefaultApi } from "@/api-client"; // Généré automatiquement

const api = new DefaultApi();
api.getChantier({
  service: "TMS",
  version: "2.0.0",
  apiKey: "interface_catalogue",
  request: "GetFeature",
  typeNames: "IGNF_LIDAR-HD",
  outputFormat: "application/json",
  srsName: "EPSG:4326",
}).then(data => console.log(data));
