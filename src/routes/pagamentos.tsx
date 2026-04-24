import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Alias amigável: /pagamentos
 * Redireciona para o destino certo conforme o perfil esperado.
 * - Super admin: /admin-saas/pagamentos
 * - Demais: /app/faturas
 *
 * Como o roteamento é determinístico no client, fazemos o redirect default
 * para /app/faturas (cliente final). Super admins podem navegar via sidebar.
 */
export const Route = createFileRoute("/pagamentos")({
  beforeLoad: () => {
    throw redirect({ to: "/app/faturas" });
  },
});
