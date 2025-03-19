import { createFileRoute } from "@tanstack/react-router";
import MapComponent from "../Components/Map";
import Menu from "../Components/Menu";
import { useState } from "react";

export const Route = createFileRoute("/download/$downloadUrl")({
  component: RouteComponent,
});

function RouteComponent() {
  const { downloadUrl } = Route.useParams(); // rename ressourceName

  return (
    <div className="fr-container--fluid fr-grid-row">
      <MapComponent />
      <div className="fr-col-4">
        <Menu />
      </div>
    </div>
  );
}
