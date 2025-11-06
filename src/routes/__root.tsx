import { Outlet, createRootRoute } from "@tanstack/react-router";
import IgnfDsfrHeader from "../components/features/Layout/IgnfDsfrHeader.tsx";
import AppFooter from "../components/features/Layout/AppFooter";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <IgnfDsfrHeader
        minimized={true}
        menuItems={[
          {
            label: "Aide",
            icon: "fr-icon-question-line",
            links: [
              {
                label: "Documentation",
                href: "/docs",
                icon: "fr-icon-book-2-line",
              },
              { 
                label: "Contact", 
                href: "/contact", 
                icon: "fr-icon-mail-line" 
              },
            ],
          },
          {
            label: "Services",
            icon: "fr-icon-grid-fill",
            links: [
              {
                label: "Explorer les cartes",
                href: "/cartes",
                icon: "fr-icon-road-map-line",
              },
              {
                label: "Rechercher une donnée",
                href: "/catalogue/search",
                icon: "fr-icon-search-line",
              },
              {
                label: "Publier une donnée",
                href: "/tableau-de-bord",
                icon: "fr-icon-database-line",
              },
              {
                label: "Découvrir cartes.gouv",
                href: "https://cartes.gouv.fr",
                icon: "fr-icon-external-link-line",
                target: "/",
                
              },
            ],
          },
          {
            label: "Mon espace",
            icon: "fr-icon-user-line",
            connectionMenu: true,
            links: [
              {
                label: "Mon profil",
                href: "/profil",
                icon: "fr-icon-user-line",
              },
              {
                label: "Mes organisations",
                href: "/organisations",
                icon: "fr-icon-group-line",
              },
            ],
          },
        ]}
      />
      <Outlet />
      <AppFooter />
    </>
  );
}
