import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/player/$screenId")({
  component: PlayerByScreenRoute,
});

function PlayerByScreenRoute() {
  const { screenId } = Route.useParams();
  return <Navigate to="/player/web" search={{ screenId }} replace />;
}
