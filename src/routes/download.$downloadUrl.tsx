import { createFileRoute } from "@tanstack/react-router";
import MapComponent from "../Components/Map";
import Menu from "../Components/Menu";

export const Route = createFileRoute("/download/$downloadUrl")({
  component: RouteComponent,
});

function RouteComponent() {
  const { downloadUrl } = Route.useParams();
  return (
    <div className="fr-container--fluid fr-grid-row">
      <MapComponent params={downloadUrl}></MapComponent>
      <Menu></Menu>
    </div>
  );
}
