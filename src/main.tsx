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
});

// Register things for typesafety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById("app") as HTMLElement).render(
  <React.StrictMode>

    <RouterProvider router={router} />
  </React.StrictMode>
);
