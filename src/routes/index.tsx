import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import Menu from "../Components/Menu";
import Map from "../Components/Map";
import { fr } from "@codegouvfr/react-dsfr";
import MapComponent from "../Components/Map";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});


function HomeComponent() {
  return (
    <>
      Accueil
    </>
  );
}
