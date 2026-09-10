import { createApp } from "vue";
import { createPinia } from "pinia";
import VueDsfr from "@gouvminint/vue-dsfr";
import "ol/ol.css";
import "@gouvfr/dsfr/dist/dsfr.min.css";
import "@gouvfr/dsfr/dist/utility/icons/icons.min.css";
import "@gouvminint/vue-dsfr/styles";
import "cartes.gouv.fr-vue-components/dist/index.css";
import "geopf-extensions-openlayers/css/Dsfr.css";
import "./styles/global.css";
import App from "./App.vue";
import { router } from "./router";

createApp(App).use(createPinia()).use(router).use(VueDsfr).mount("#app");