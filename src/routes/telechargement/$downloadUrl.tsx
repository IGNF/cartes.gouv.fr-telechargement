import { createFileRoute } from "@tanstack/react-router";
import Menu from "../../Components/Menu";
import MapComponent from "../../Components/Map";

export const Route = createFileRoute("/telechargement/$downloadUrl")({
  component: HomeComponent,
});

function HomeComponent() {
    return (
    <>
      <div className="fr-container--fluid fr-grid-row">
        <MapComponent />
        <div className="fr-col-4">
          <Menu />
        </div>
      </div>
    </>
  );
}
