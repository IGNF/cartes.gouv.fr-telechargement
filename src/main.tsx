import React from "react";
import ReactDOM from "react-dom/client";
import {
  RouterProvider,
  createRouter,
  Link,
  type LinkProps,
} from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { startReactDsfr } from "@codegouvfr/react-dsfr/spa";
import Gp from "geoportal-access-lib";

import './styles/global.css' // Import du fichier global ici
import "ol/ol.css";
import "@gouvfr/dsfr/dist/dsfr.css";
import "@gouvfr/dsfr/dist/utility/icons/icons.css";
import "geopf-extensions-openlayers/css/Dsfr.css";


startReactDsfr({ defaultColorScheme: "system", Link });
declare module "@codegouvfr/react-dsfr/spa" {
  interface RegisterLink {
    Link: (props: LinkProps) => JSX.Element;
  }
}
// Set up a Router instance
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  basepath: "", // Set the base path for the router
});

// Register things for typesafety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}


    const getConfig = async () => {
      const config = new Gp.Services.Config({
        customConfigFile:
          "https://raw.githubusercontent.com/IGNF/geoportal-configuration/new-url/dist/fullConfig.json",
        onSuccess: renderApp,
        onFailure: (e) => console.error(e),
      });
      await config.call();
    };

   getConfig();

function renderApp() {  

ReactDOM.createRoot(document.getElementById("app") as HTMLElement).render(
  <React.StrictMode>

    <RouterProvider router={router} />
  </React.StrictMode>
);
}
