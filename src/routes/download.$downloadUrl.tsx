import { createFileRoute } from "@tanstack/react-router";
import MapComponent from "../Components/Map";
import Menu from "../Components/Menu";
import { useState } from "react";

export const Route = createFileRoute("/download/$downloadUrl")({
  component: RouteComponent,
});

function RouteComponent() {
  const { downloadUrl } = Route.useParams();

  const [selectedDalles, setSelectedDalles] = useState<any[]>([]);
   // Fonction pour supprimer une dalle par son nom ou ID
   const handleDeleteDalle = (dalleName: string) => {
    setSelectedDalles((prevDalles) => prevDalles.filter((dalle) => dalle.name !== dalleName));
  };

  return (
    <div className="fr-container--fluid fr-grid-row">
      <MapComponent selectedDalles={selectedDalles} setSelectedDalles={setSelectedDalles} />
      <div className="fr-col-4" >
      <Menu selectedDalles={selectedDalles} onDeleteDalle={handleDeleteDalle}></Menu>
      </div>
    </div>
  );
}
