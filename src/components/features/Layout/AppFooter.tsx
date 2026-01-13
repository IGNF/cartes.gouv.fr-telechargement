import { headerFooterDisplayItem } from "@codegouvfr/react-dsfr/Display";
import Footer from "@codegouvfr/react-dsfr/Footer";
import { memo, useEffect, useState } from "react";
import {
  FooterConsentManagementItem,
  FooterPersonalDataPolicyItem,
} from "../../../config/consentMangement";
import { createPortal } from "react-dom";
import { Button } from "@codegouvfr/react-dsfr/Button";

const AppFooter = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [footerBodyElement, setFooterBodyElement] =
    useState<HTMLElement | null>(null);
  const [partnersMainElement, setPartnersMainElement] =
    useState<HTMLElement | null>(null);

  const toggleFooter = () => {
    setIsExpanded(!isExpanded);
  };

  // Récupérer la div .fr-footer du DOM
  useEffect(() => {
    const footer = document.querySelector(".fr-footer") as HTMLElement | null;
    if (footer) {
      // créer ou récupérer un conteneur pour le toggle (en haut à droite)
      let toggleContainer = footer.querySelector(
        ".fr-footer__toggle-container"
      ) as HTMLElement | null;
      if (!toggleContainer) {
        toggleContainer = document.createElement("div");
        toggleContainer.className = "fr-footer__toggle-container";
        footer.appendChild(toggleContainer);
      }
      setFooterBodyElement(toggleContainer);

      // créer ou récupérer un conteneur pour le logo principal IGN
      let partnersMain = footer.querySelector(
        ".fr-footer__partners-main"
      ) as HTMLElement | null;
      if (!partnersMain) {
        partnersMain = document.createElement("div");
        partnersMain.className = "fr-footer__partners-main";
        const partnersSection = footer.querySelector(
          ".fr-footer__partners-logos"
        );
        if (partnersSection) {
          partnersSection.insertBefore(
            partnersMain,
            partnersSection.firstChild
          );
        }
      }
      setPartnersMainElement(partnersMain);
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--visible",
      isExpanded ? "flex" : "none"
    );
    document.documentElement.style.setProperty(
      "--visible-toggle",
      isExpanded ? "block" : "none"
    );
    document.documentElement.style.setProperty(
      "--padding",
      isExpanded ? "2rem" : "0px"
    );
    document.documentElement.style.setProperty(
      "--margin",
      isExpanded ? "0px" : "-10px"
    );
  }, [isExpanded]);

  const toggleButton = (
    <Button
      key="toggle-footer"
      className="fr-footer__toggle-btn"
      priority="tertiary no outline"
      iconId={isExpanded ? "fr-icon-close-line" : "fr-icon-arrow-down-s-line"}
      onClick={toggleFooter}
      title="Fermer"
    >
      {isExpanded ? "Fermer" : null}
    </Button>
  );

  const ignLogo = (
    <a
      href="https://www.ign.fr"
      title="Institut national de l'information géographique et forestière"
      className="fr-footer__partners-link fr-raw-link"
    >
      <img
        src="https://data.geopf.fr/annexes/ressources/footer/ign.png"
        alt="IGN"
        className="fr-footer__partner-logo"
        style={{ height: "5.625rem" }}
      />
    </a>
  );

  return (
    <>
      <Footer
        accessibility="partially compliant"
        accessibilityLinkProps={{
          href: "https://www.gouv.fr/accessibilite",
          target: "_self",
        }}
        brandTop={
          <>
            République
            <br />
            Française
          </>
        }
        contentDescription="
            Cartes.gouv.fr est le service public des cartes et données du territoire français. Porté par l'IGN et ses partenaires, il offre à tous un accès à la référence de la cartographie publique et permet à chacun de créer, d'héberger et de publier ses propres données et représentations.
          "
        bottomItems={[
          {
            linkProps: { href: "https://cartes.gouv.fr/cgu", target: "_self" },
            text: "Conditions générales d’utilisation",
          },
          <FooterPersonalDataPolicyItem key="footer-personal-data-policy-item" />,
          <FooterConsentManagementItem key="footer-consent-management-item" />,
          headerFooterDisplayItem,
        ]}
        homeLinkProps={{
          href: "https://cartes.gouv.fr/",
          title: "Accueil - cartes.gouv.fr",
          target: "_self",
        }}
        termsLinkProps={{
          href: "https://cartes.gouv.fr/mentions-legales",
          target: "_self",
        }}
        websiteMapLinkProps={{
          href: "https://cartes.gouv.fr/plan-du-site",
          target: "_self",
        }}
        cguLinkProps={{
          href: "https://cartes.gouv.fr/conditions-generales-dutilisation",
          target: "_self",
        }}
        partnersMainLogos={[]}
        partnersLogos={{
          sub: [
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
              alt: "Conseil National de l'Information Géolocalisée",
              href: "https://cnig.gouv.fr/",
              imgUrl:
                "https://data.geopf.fr/annexes/ressources/footer/rf_cnig.jpg",
            },
          ],
        }}
      />

      {/* Ajouter le bouton toggle en haut à droite via portal */}
      {footerBodyElement && createPortal(toggleButton, footerBodyElement)}

      {/* Ajouter le logo IGN via portal */}
      {partnersMainElement && createPortal(ignLogo, partnersMainElement)}
    </>
  );
};

export default memo(AppFooter);
