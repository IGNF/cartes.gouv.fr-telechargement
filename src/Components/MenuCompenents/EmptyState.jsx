import React from "react";

const EmptyState = () => {
  return (
    <div className="fr-text--lead fr-mb-2w">
      <p>
        Cette interface vous permet de visualiser les données disponibles dans
        votre zone d'intérêt et de récupérer une liste de liens pour les
        télécharger.
      </p>
      <p>
        Cliquez sur une zone d'intérêt pour sélectionner des dalles et voir les
        options de téléchargement.
      </p>
      <p>
        Pour sélectionner les dalles il vous faudra dessiner la zone d'intérêt
        en cliquant sur la carte. Un clic simple permet de commencer le dessin et
        un double clic permet de terminer le dessin.
        Vous pouvez également le terminer en cliquant sur le premier point.
      </p>
    </div>
  );
};

export default EmptyState;