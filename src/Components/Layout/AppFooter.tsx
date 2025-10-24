import { headerFooterDisplayItem } from "@codegouvfr/react-dsfr/Display";
import Footer from "@codegouvfr/react-dsfr/Footer";
import { memo, useEffect, useState } from "react";
import {
  FooterConsentManagementItem,
  FooterPersonalDataPolicyItem,
} from "../../config/consentMangement";
import Button from "@codegouvfr/react-dsfr/Button";

const AppFooter = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleFooter = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    document.documentElement.style.setProperty('--visible', isExpanded ? 'flex' : 'none');
    document.documentElement.style.setProperty('--visible-toggle', isExpanded ? 'block' : 'none');
    document.documentElement.style.setProperty('--padding', isExpanded ? '2rem' : '0px');
    document.documentElement.style.setProperty('--margin', isExpanded ? '0px' : '-10px');
  }, [isExpanded]);

  return (
    <Footer
      accessibility="partially compliant"
      accessibilityLinkProps={{
        href: "https://www.gouv.fr/accessibilite",
      }}
      brandTop={
        <>
          République
          <br />
          Française
        </>
      }
      contentDescription="
            Cartes.gouv.fr est développé par l’Institut national de l’information géographique et forestière (IGN) et ses partenaires. Le site s’appuie sur la Géoplateforme, la nouvelle infrastructure publique, ouverte et collaborative des données géographiques.
          "
      bottomItems={[
        {
          linkProps: {
            href: "https://cartes.gouv.fr/cgu",
          },
          text: "Conditions générales d’utilisation",
        },
        <FooterPersonalDataPolicyItem key="footer-personal-data-policy-item" />,
        <FooterConsentManagementItem key="footer-consent-management-item" />,
        headerFooterDisplayItem,
        <Button
          key="toggle-footer"
          className="fr-footer__bottom-item--right"
          priority="tertiary no outline"
          iconId={
            isExpanded
              ? "fr-icon-arrow-up-s-line"
              : "fr-icon-arrow-down-s-line"
          }
          onClick={toggleFooter}
        />,
      ]}
      homeLinkProps={{
        href: "https://cartes.gouv.fr/",
        title: "Accueil - cartes.gouv.fr",
      }}
      termsLinkProps={{
        href: "https://cartes.gouv.fr/mentions-legales",
      }}
      websiteMapLinkProps={{
        href: "https://cartes.gouv.fr/plan-du-site",
      }}
      partnersLogos={{
        sub: [
          {
            alt: "IGN",
            href: "https://www.ign.fr",
            imgUrl: "https://data.geopf.fr/annexes/ressources/footer/ign.png",
          },
          {
            alt: "MINISTÈRE DE LA TRANSFORMATION ET DE LA FONCTION PUBLIQUES",
            href: "https://www.transformation.gouv.fr/",
            imgUrl:
              "https://data.geopf.fr/annexes/ressources/footer/min_fp.jpg",
          },
          {
            alt: "MINISTÈRE DE LA TRANSITION ÉCOLOGIQUE ET DE LA COHÉSION DES TERRITOIRES",
            href: "https://www.ecologie.gouv.fr/",
            imgUrl:
              "https://data.geopf.fr/annexes/ressources/footer/min_ecologie.jpg",
          },
          {
            alt: "Conseil National de l’Information Géolocalisée",
            href: "https://cnig.gouv.fr/",
            imgUrl:
              "https://data.geopf.fr/annexes/ressources/footer/rf_cnig.jpg",
          },
        ],
      }}
    />
  );
};

export default memo(AppFooter);
