
import { Outlet, createRootRoute } from "@tanstack/react-router";
import AppHeader from "../components/AppHeader";
import { Footer } from "@codegouvfr/react-dsfr/Footer";


export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      
      <AppHeader />
      <Outlet />
      <Footer
        accessibility="partially compliant"
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
