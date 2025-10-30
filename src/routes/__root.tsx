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

          {
            label: "Aide",

            icon: "fr-icon-question-line",

            links: [
              {
                label: "Documentation",
                href: "/docs",
                icon: "fr-icon-book-2-line",
              },

              { label: "Contact", href: "/contact", icon: "fr-icon-mail-line" },
            ],
          },
        ]}
      />
      <Outlet />
      <AppFooter />
    </>
  );
}
