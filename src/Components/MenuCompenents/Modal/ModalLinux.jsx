import React from "react";

function ModalLinux() {
    return (
        <>
            <p>
                Ouvrez l'explorateur de fichiers afin de retrouver le fichier listant les liens que vous venez de télécharger. <br />
                Faites clic-droit et <i>"Ouvrir dans un terminal"</i> pour ouvrir un terminal dans le dossier :
            </p>

            <img
                src={`${process.env.PUBLIC_URL}/dl_lidar_tuto_cmd_linux_1.png`}
                alt="Image indiquant les options proposées au clic droit dans un dossier"
                style={{ width: "100%", maxWidth: 900 }}
            />

            <p>
                Entrez la commande : <p code>`wget --content-disposition --tries=3 -i liste_dalles_mnx.txt`</p>
                Adaptez le nom du fichier si besoin et appuyez sur <kbd>ENTRÉE</kbd> :
            </p>

            <img
                src={`${process.env.PUBLIC_URL}/dl_lidar_tuto_cmd_linux_2.png`}
                alt="Image indiquant les options proposées au clic droit dans un dossier"
                style={{ width: "100%", maxWidth: 900 }}
            />

            <p>
                La sortie textuelle s'arrêtera quand tout sera terminé. Vous devriez avoir tous les fichiers dans votre dossier. Vous pouvez supprimer le fichier listant les liens.
            </p>
        </>
    );
}

export default ModalLinux;