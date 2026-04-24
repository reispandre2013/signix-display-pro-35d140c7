import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/assinatura")({
  beforeLoad: () => {
    throw redirect({ to: "/app/assinatura" });
  },
});
