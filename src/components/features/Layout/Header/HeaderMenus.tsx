
import HeaderMenu from "./HeaderMenu";

export function HeaderMenuHelp() {
    return (
        <HeaderMenu
            openButtonProps={{
                children: "Aide",
                iconId: "fr-icon-question-fill",
            }}
            items={[
                {
                    iconId: "fr-icon-question-mark",
                    children: "Questions fréquentes",
                    linkProps: { href: "https://www.cartes.gouv.fr/aide", target:"_blank"},
                },
                {
                    iconId: "fr-icon-book-2-line",
                    children: "Guide d'utilisation",
                    linkProps: { href: "/aide/fr/guides-utilisateur/rechercher-une-donnee/", target:"_blank"},
                },
                {
                    iconId: "fr-icon-mail-line",
                    children: "Nous contacter",
                    linkProps: { href: "/nous-ecrire", target:"_blank"},
                },
            ]}
        />
    );
}

export function HeaderMenuServices() {
    return (
        <HeaderMenu
            openButtonProps={{
                children: "Services",
                iconId: "fr-icon-grid-fill",
            }}
            items={[
                {
                    iconId: "fr-icon-road-map-line",
                    children: "Explorer les cartes",
                    linkProps: { href: "/explorer-les-cartes"},
                },
                {
                    iconId: "fr-icon-search-line",
                    children: "Rechercher une donnée",
                    linkProps: { href: "/rechercher-une-donne"},
                },
                {
                    iconId: "fr-icon-database-line",
                    children: "Publier une donnée",
                    linkProps: { href: "/publier-une-donnee"},
                },
                // {
                //     iconId: "fr-icon-brush-line",
                //     children: (
                //         <>
                //             Créer une carte{" "}
                //             <Badge severity="success" className={"fr-ml-auto"}>
                //                 Bêta
                //             </Badge>
                //         </>
                //     ),
                //     linkProps: { href: "/creer-une-carte" },
                // },
            ]}
            actionButtonProps={{
                children: "Découvrir cartes.gouv",
                linkProps: { href: "/decouvrir "},
            }}
        />
    );
}

export function HeaderMenuUser() {



    return (
        <HeaderMenu
            openButtonProps={{
                children: "Mon espace",
                iconId: "fr-icon-account-fill",
            }}
            items={[
                {
                    children: "Tableau de bord",
                    iconId: "fr-icon-dashboard-3-line",
                    linkProps: { href: "/tableau-de-bord"},
                },
                {
                    children: "Mon compte",
                    iconId: "fr-icon-user-line",
                    linkProps: { href: "/mon-compte"},
                },
            ]}
        />
    );
}