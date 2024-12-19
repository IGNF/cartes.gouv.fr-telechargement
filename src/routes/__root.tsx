import * as React from "react";
import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Header } from "@codegouvfr/react-dsfr/Header";
import { Footer } from "@codegouvfr/react-dsfr/Footer";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <Header
        brandTop={
          <>
            INTITULE
            <br />
            OFFICIEL
          </>
        }
        homeLinkProps={{
          href: "/",
          title:
            "Téléchargement à la carte",
        }}
        id="fr-header-simple-header-with-service-title-and-tagline"
        serviceTitle={
          <>
            Téléchargement à la carte{" "}
            <Badge as="span" noIcon severity="success">
              Beta
            </Badge>
          </>
        }
      />
      <Outlet />
      <Footer
        accessibility="fully compliant"
        contentDescription="
    Le site officiel pour le téléchargement à la dalle des données raster IGN.
    "
        termsLinkProps={{
          href: "#",
        }}
        websiteMapLinkProps={{
          href: "#",
        }}
      />
    </>
  );
}
