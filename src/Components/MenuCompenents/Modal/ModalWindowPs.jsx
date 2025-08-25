import React from "react";

const textCode1 = `Function Get-File {
    param ( [parameter(position=0)]$uri )
    $u = [uri]$uri
    $fileName = $(Split-Path -path $u.AbsolutePath -leaf)
    If ($fileName.Contains(".copc.laz")) {
      echo $fileName
      Invoke-WebRequest "$uri" -OutFile $fileName
    } else {
      $response = Invoke-WebRequest "$uri"
      $fileNameMnx = $(If ($response.headers."content-disposition") {$response.Headers.'Content-Disposition'.Split('=',2)[-1].replace('"','')} else {$fileName})
      echo $fileNameMnx
      $fullPath = Join-Path -Path $PWD -ChildPath $fileNameMnx
      $file = [System.IO.FileStream]::new($fullPath, [System.IO.FileMode]::Create)
      $file.write($response.Content, 0, $response.RawContentLength)
      $file.close()
    }
  }`;

const textCode2 = `ForEach ($url in Get-Content .\\liste_liens_mnx.txt) {Get-File $url}`;

function ModalWindowPs() {
    return (
        <>
            <p>
                Copiez-collez le code suivant puis appuyez sur <kbd>ENTRÉE</kbd> :
            </p>
            <p>
                <pre style={{ backgroundColor: "#f5f5f5", padding: "10px", borderRadius: "5px" }}>
                    {textCode1}
                </pre>
            </p>
            <p>
                Entrez la commande : <code>{textCode2}</code> puis appuyez sur <kbd>ENTRÉE</kbd> :
            </p>
            <img
                src={`${process.env.PUBLIC_URL}/dl_lidar_tuto_windows_ps_3.png`}
                alt="Image indiquant les options proposées au clic droit dans un dossier"
                style={{ width: "100%", maxWidth: 900 }}
            />
            <p>
                La sortie textuelle s'arrêtera quand tout sera terminé. Vous devriez avoir tous les fichiers dans votre dossier (vous pouvez supprimer le fichier listant les liens).
            </p>
        </>
    );
}

export default ModalWindowPs;