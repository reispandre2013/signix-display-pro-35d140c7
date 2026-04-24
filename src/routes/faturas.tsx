import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/faturas")({
  beforeLoad: () => {
    throw redirect({ to: "/app/faturas" });
  },
});
