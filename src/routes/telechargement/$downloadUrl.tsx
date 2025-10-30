import { createFileRoute } from "@tanstack/react-router";
import MapComponent from "../../components/features/Map";
import Menu from "../../components/features/Menu";

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
