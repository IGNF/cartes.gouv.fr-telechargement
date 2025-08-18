import React from "react";
function ModalWindowCmd() {
    return (
        <>
            <p>
                Entrez la commande : <code>`For /f %a in (liste_liens_mnx.txt) do curl -O -J %a`</code> et appuyez sur <kbd>ENTRÉE</kbd> :
            </p>
            <img
                src={`${process.env.PUBLIC_URL}/dl_lidar_tuto_windows_cmd_3.png`}
                alt="Image indiquant les options proposées au clic droit dans un dossier"
                style={{ width: "100%", maxWidth: 900 }}
            />
            <p>
                La sortie puelle s'arrêtera quand tout sera terminé. Vous devriez avoir tous les fichiers dans votre dossier (vous pouvez supprimer le fichier listant les liens).
            </p>
        </>
    );
}

export default ModalWindowCmd;