import React, { forwardRef, useState } from "react";

function Menu() {
  return (
    <>
      <div className="fr-col-2 fr--blue-cumulus-975-75-hover">
        <div className="fr-text--lg">
        Cette interface vous permet de visualiser les données disponibles
        dans votre zone d'intérêt et de récupérer une liste de liens pour les
        télécharger.
        </div>
        <div className="fr-text--bold">
        Cliquez sur la zone d'intérêt souhaitée pour consulter les
        données disponibles.
        </div>
      </div>
    </>
  );
}

export default Menu;
