import Badge from "@codegouvfr/react-dsfr/Badge";
import Header, { HeaderProps } from "@codegouvfr/react-dsfr/Header";
import { MainNavigationProps } from "@codegouvfr/react-dsfr/MainNavigation/MainNavigation";
import { FC, memo } from "react";

type AppHeaderProps = {
  navItems?: MainNavigationProps.Item[];
};

const AppHeader: FC<AppHeaderProps> = ({ navItems: propNavItems = [] }) => {
  const quickAccessItems: HeaderProps.QuickAccessItem[] = [];

  const geoportailQuickAccessItem: HeaderProps.QuickAccessItem = {
    iconId: "fr-icon-arrow-right-line",
    linkProps: {
      href: "https://www.geoportail.gouv.fr/carte",
      className: "fr-btn--icon-right",
      target: "_blank",
      rel: "noreferrer",
      title: "Accéder au Géoportail - ouvre une nouvelle fenêtre",
    },
    text: "Accéder au Géoportail",
  };

  quickAccessItems.push(geoportailQuickAccessItem);

  quickAccessItems.push({
    iconId: "fr-icon-account-fill",
    linkProps: {
      href: "https://cartes.gouv.fr/tableau-de-bord",
    },
    text: "mon compte",
  });

  // Définition des navItems
  const navItems: MainNavigationProps.Item[] = propNavItems.length > 0 ? propNavItems : [
    {
      menuLinks: [
        {
          linkProps: { href: "https://cartes.gouv.fr/documentation" },
          text: "Documentation",
        },
        {
          linkProps: { href: "https://cartes.gouv.fr/offre" },
          text: "Offre",
        },
        {
          linkProps: { href: "https://cartes.gouv.fr/nous-rejoindre" },
          text: "Nous rejoindre",
        },
      ],
      text: "Commencer avec cartes.gouv.fr",
    },
    {
      text: "Catalogue",
      linkProps: { href: "https://cartes.gouv.fr/catalogue/search" },
    },
    {
      text: "Cartes",
      linkProps: { href: "https://cartes.gouv.fr/cartes" },
    },
    {
      text: "Actualités",
      linkProps: { href: "https://cartes.gouv.fr/actualites" },
    },
    {
      menuLinks: [
        {
          linkProps: { href: "https://cartes.gouv.fr/faq" },
          text: "questions fréquentes",
        },
        {
          linkProps: { href: "https://cartes.gouv.fr/nous-ecrire" },
          text: "nous écrire",
        },
        {
          linkProps: { href: "https://cartes.gouv.fr/niveau-de-service" },
          text: "Niveau de service",
        },
      ],
      text: "Assistance",
    },
    {
      text: "A propos",
      linkProps: { href: "https://cartes.gouv.fr/a-propos" },
    },
  ];

  return (
    <Header
      brandTop={
        <>
          République
          <br />
          Française
        </>
      }
      homeLinkProps={{
        href: "https://cartes.gouv.fr",
        title: "Accueil - cartes.gouv.fr",
      }}
      serviceTitle={
        <>
          cartes.gouv.fr{" "}
          <Badge severity="success" noIcon={true} as="span">
            Bêta
          </Badge>
        </>
      }
      serviceTagline="Le service public des cartes et données du territoire"
      quickAccessItems={quickAccessItems}
      navigation={navItems}
    />
  );
};

export default memo(AppHeader);
