import { createFileRoute } from "@tanstack/react-router";
import MapComponent from "../Components/Map";
import Menu from "../Components/Menu";
import { useState } from "react";

export const Route = createFileRoute("/download/$downloadUrl")({
  component: RouteComponent,
});

function RouteComponent() {
  const { downloadUrl } = Route.useParams();

  return (
    <div>
      <MapComponent />
    </div>
  );
}
