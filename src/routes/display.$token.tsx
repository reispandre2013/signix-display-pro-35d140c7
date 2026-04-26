import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/display/$token")({
  component: DisplayTokenRoute,
});

function DisplayTokenRoute() {
  const { token } = Route.useParams();
  return (
    <Navigate to="/player/web" search={{ token, screenId: undefined, debug: undefined }} replace />
  );
}
