import { useAuth } from "@/lib/auth-context";
import type { AppRole } from "@/lib/db-types";

/**
 * Perfis efetivos do sistema SaaS (mapeamento friendly).
 * - super_admin: dono da plataforma SaaS
 * - master:      usuário principal da empresa cliente (admin_master / gestor)
 * - operador:    operador da empresa
 * - visualizador: somente leitura
 */
export type EffectiveRole = "super_admin" | "master" | "operador" | "visualizador";

export const ROLE_LABEL: Record<EffectiveRole, string> = {
  super_admin: "Super Admin",
  master: "Master da Empresa",
  operador: "Operador",
  visualizador: "Visualizador",
};

export function mapDbRole(role: AppRole | undefined | null): EffectiveRole {
  if (!role) return "visualizador";
  if (role === "super_admin") return "super_admin";
  if (role === "admin_master" || role === "gestor") return "master";
  if (role === "operador") return "operador";
  return "visualizador";
}

/** Módulos do sistema usados para controle de visibilidade/permissões. */
export type ModuleKey =
  | "dashboard"
  | "monitoramento"
  | "telas"
  | "grupos"
  | "midias"
  | "playlists"
  | "campanhas"
  | "agendamentos"
  | "preview"
  | "empresas"
  | "unidades"
  | "usuarios"
  | "relatorios"
  | "alertas"
  | "auditoria"
  | "configuracoes"
  | "assinatura"
  | "faturas"
  // super admin
  | "saas_overview"
  | "saas_clientes"
  | "saas_planos"
  | "saas_assinaturas"
  | "saas_pagamentos"
  | "saas_licencas"
  | "saas_logs";

/** Matriz de permissões padrão por perfil (somente leitura/escrita visual). */
const DEFAULT_PERMISSIONS: Record<EffectiveRole, ModuleKey[]> = {
  super_admin: [
    "dashboard","monitoramento","telas","grupos","midias","playlists","campanhas",
    "agendamentos","preview","empresas","unidades","usuarios","relatorios","alertas",
    "auditoria","configuracoes","assinatura","faturas",
    "saas_overview","saas_clientes","saas_planos","saas_assinaturas","saas_pagamentos",
    "saas_licencas","saas_logs",
  ],
  master: [
    "dashboard","monitoramento","telas","grupos","midias","playlists","campanhas",
    "agendamentos","preview","empresas","unidades","usuarios","relatorios","alertas",
    "auditoria","configuracoes","assinatura","faturas",
  ],
  operador: [
    "dashboard","monitoramento","telas","midias","playlists","campanhas",
    "agendamentos","preview","relatorios","alertas",
  ],
  visualizador: [
    "dashboard","monitoramento","telas","campanhas","relatorios","alertas",
  ],
};

export function useRole() {
  const { profile, user } = useAuth();
  const role: EffectiveRole = mapDbRole(profile?.role as AppRole | undefined);
  const allowed = new Set<ModuleKey>(DEFAULT_PERMISSIONS[role]);

  return {
    role,
    label: ROLE_LABEL[role],
    isSuperAdmin: role === "super_admin",
    isMaster: role === "master",
    isOperador: role === "operador",
    isVisualizador: role === "visualizador",
    can: (m: ModuleKey) => allowed.has(m),
    canEdit: (m: ModuleKey) => {
      if (role === "visualizador") return false;
      if (role === "operador") {
        // operador edita apenas conteúdo operacional
        return ["midias","playlists","campanhas","agendamentos"].includes(m);
      }
      return allowed.has(m);
    },
    profile,
    user,
  };
}
