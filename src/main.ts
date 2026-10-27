import { createApp } from "vue";
import { createPinia } from "pinia";
import { createAuth } from "authentification-vue-oidc";
import VueDsfr from "@gouvminint/vue-dsfr";
import "ol/ol.css";
import "@gouvfr/dsfr/dist/dsfr.min.css";
import "@gouvfr/dsfr/dist/utility/icons/icons.min.css";
import "@gouvminint/vue-dsfr/styles";
import "cartes.gouv.fr-vue-components/dist/index.css";
import "geopf-extensions-openlayers/css/Dsfr.css";
import "./styles/global.css";
import App from "./App.vue";
import { createAppRouter } from "./router";
import { initializeConfig } from "./config/configService";
import { createAuthOptions } from "./config/authentification-options";

async function bootstrap() {
	await initializeConfig();
	const app = createApp(App);
	app.use(createPinia()).use(createAuth(createAuthOptions())).use(VueDsfr);
	// Le plugin OIDC doit être installé avant la première navigation.
	const router = createAppRouter();
	app.use(router);
	await router.isReady();
	app.mount("#app");
}

void bootstrap().catch((error: unknown) => {
	console.error("[Bootstrap] Échec de l’initialisation", error);
	const root = document.getElementById("app");
	if (root) {
		// Ne jamais injecter le contenu de la configuration dans innerHTML.
		root.textContent = "Impossible de démarrer l’application. Vérifiez la configuration ou réessayez plus tard.";
		root.setAttribute("role", "alert");
	}
});