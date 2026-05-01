import type { ModuleKey } from "@/lib/use-role";

/**
 * Mapeia prefixos de rota para o módulo correspondente.
 * Usado pelo guard central em /app para bloquear acesso direto por URL
 * a páginas que o perfil atual não pode visualizar.
 *
 * Regras:
 * - Match por prefixo mais longo primeiro (ordem importa).
 * - Rotas não listadas são consideradas livres dentro de /app
 *   (ex: /app raiz redireciona conforme perfil).
 */
const ROUTE_MODULE_MAP: Array<{ prefix: string; module: ModuleKey }> = [
  { prefix: "/app/monitoramento", module: "monitoramento" },
  { prefix: "/app/telas", module: "telas" },
  { prefix: "/app/grupos", module: "grupos" },
  { prefix: "/app/midias", module: "midias" },
  { prefix: "/app/playlists", module: "playlists" },
  { prefix: "/app/campanhas", module: "campanhas" },
  { prefix: "/app/agendamentos", module: "agendamentos" },
  { prefix: "/app/preview", module: "preview" },
  { prefix: "/app/empresas", module: "empresas" },
  { prefix: "/app/unidades", module: "unidades" },
  { prefix: "/app/usuarios", module: "usuarios" },
  { prefix: "/app/relatorios", module: "relatorios" },
  { prefix: "/app/alertas", module: "alertas" },
  { prefix: "/app/auditoria", module: "auditoria" },
  { prefix: "/app/configuracoes", module: "configuracoes" },
  { prefix: "/app/assinatura", module: "assinatura" },
  { prefix: "/app/faturas", module: "faturas" },
  { prefix: "/app/operador", module: "dashboard" },
  { prefix: "/app/visualizacao", module: "dashboard" },
];

export function getModuleForPath(pathname: string): ModuleKey | null {
  // ordena do mais específico (mais longo) para o mais curto
  const sorted = [...ROUTE_MODULE_MAP].sort((a, b) => b.prefix.length - a.prefix.length);
  for (const entry of sorted) {
    if (pathname === entry.prefix || pathname.startsWith(entry.prefix + "/")) {
      return entry.module;
    }
  }
  return null;
}
