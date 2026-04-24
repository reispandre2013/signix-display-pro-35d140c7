import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/licencas")({
  beforeLoad: () => {
    throw redirect({ to: "/admin-saas/licencas" });
  },
});
