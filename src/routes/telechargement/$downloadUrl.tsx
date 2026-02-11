import { createFileRoute } from "@tanstack/react-router";
import MapComponent from "../../components/map/Map";
import Menu from "../../components/menu/Menu";

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
