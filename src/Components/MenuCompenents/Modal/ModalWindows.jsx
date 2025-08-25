import React from "react";
import ModalWindowCmd from "./ModalWindowCmd";
import ModalWindowPs from "./ModalWindowPs";

function ModalWindows() {
    return (
        <>
            <p>
                Ouvrez l'explorateur de fichiers afin de retrouver le fichier listant les liens que vous venez de télécharger.
            </p>

            <p>
                Faites clic-droit : "Ouvrir dans le Terminal". Si l'option n'est pas proposée, cherchez "Afficher d'autres options" :
            </p>

            <img
                src={`${process.env.PUBLIC_URL}/dl_lidar_tuto_windows_1.png`}
                alt="Image indiquant les options proposées au clic droit dans un dossier"
                style={{ width: "100%", maxWidth: 900 }}
            />

            <p>
                Une fois le terminal ouvert, regardez le titre de l'onglet pour voir si vous avez "Invite de commandes" ou "Microsoft PowerShell".
            </p>

            <Accordion
                label="Si vous avez 'Invite de commandes'"
                defaultExpanded={false}
            >
                <ModalWindowCmd />
            </Accordion>

            <Accordion
                label="Si vous avez 'Microsoft PowerShell'"
                defaultExpanded={false}
            >
                <ModalWindowPs />
            </Accordion>
        </>
    );
}

export default ModalWindows;