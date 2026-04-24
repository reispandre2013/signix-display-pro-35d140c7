import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/assinaturas")({
  beforeLoad: () => {
    throw redirect({ to: "/admin-saas/assinaturas" });
  },
});
