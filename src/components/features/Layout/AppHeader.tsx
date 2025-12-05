import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Header from "@codegouvfr/react-dsfr/Header";
import { MainNavigationProps } from "@codegouvfr/react-dsfr/MainNavigation/MainNavigation";
import { useIsDark } from "@codegouvfr/react-dsfr/useIsDark";
import { FC, memo } from "react";

import { HeaderMenuHelp, HeaderMenuServices, HeaderMenuUser } from "./Header/HeaderMenus";


type AppHeaderProps = {
    navItems?: MainNavigationProps.Item[];
};
const AppHeader: FC<AppHeaderProps> = ({ navItems = [] }) => {
    const { isDark } = useIsDark();

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
                href: "/",
                title: "Accueil - cartes.gouv.fr",
            }}
            operatorLogo={{
                imgUrl: isDark
                    ? "https://data.geopf.fr/annexes/ressources/header/cartes-gouv-logo-dark.svg"
                    : "https://data.geopf.fr/annexes/ressources/header/cartes-gouv-logo.svg",
                orientation: "horizontal",
                alt: "",
            }}
            serviceTitle={
                <>
                    cartes.gouv.fr{" "}
                    <Badge severity="info" noIcon={true} as="span" small={true}>
                        <span className={fr.cx("fr-icon--sm", "fr-icon-search-fill", "fr-mr-1v")} />
                        RECHERCHER
                    </Badge>
                </>
            }
            serviceTagline="Le service public des cartes et données du territoire"
            quickAccessItems={[
                <HeaderMenuHelp key="header-menu-help" />,
                <HeaderMenuServices key="header-menu-services" />,
                <HeaderMenuUser key="header-menu-user" />,
            ]}
            // renderSearchInput={({ className, id, name, placeholder, type }) => (
            //     <input className={className} id={id} name={name} placeholder={placeholder} type={type} />
            // )}
            navigation={navItems}
        />
    );
};

export default memo(AppHeader);