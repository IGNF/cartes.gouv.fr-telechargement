import { Outlet, createRootRoute } from "@tanstack/react-router";
import AppHeader from "../Components/AppHeader";
import IgnfDsfrHeader from "../Components/Layout/IgnfDsfrHeader";
import { Footer } from "@codegouvfr/react-dsfr/Footer";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {

 
  return (
    <>
      {/* <AppHeader /> */}
         <IgnfDsfrHeader
         minimized={true}


                menuItems={[


                    {


                        label: "Mon espace",


                        icon: "fr-icon-user-line",


                        connectionMenu: true,


                        links: [


                            { label: "Mon profil", href: "/profil", icon: "fr-icon-user-line" },


                            { label: "Mes organisations", href: "/organisations", icon: "fr-icon-group-line" },


                        ],


                    },


                    {


                        label: "Aide",


                        icon: "fr-icon-question-line",


                        links: [


                            { label: "Documentation", href: "/docs", icon: "fr-icon-book-2-line" },


                            { label: "Contact", href: "/contact", icon: "fr-icon-mail-line" },


                        ],


                    },


                ]}


            />
      <Outlet />
      {/* <Footer
        accessibility="partially compliant"
        contentDescription="Le site officiel pour le téléchargement à la dalle des données raster IGN."
        termsLinkProps={{ href: "#" }}
        websiteMapLinkProps={{ href: "#" }}
      /> */}
    </>
  );
}
