import type { ModuleKey, EffectiveRole } from "@/lib/use-role";
import { ROLE_LABEL } from "@/lib/use-role";
import type { AppRole } from "@/lib/db-types";

type CanFn = (m: ModuleKey) => boolean;

/**
 * Helpers alinhados ao desenho SaaS. Use `useRole().can` como `canModule` para
 * a matriz base; afinamentos por módulo podem vir de `user_permissions` (Postgres)
 * de futuras iterações.
 */
export const permission = {
  canView(canModule: CanFn, m: ModuleKey): boolean {
    return canModule(m);
  },

  canCreate(effective: EffectiveRole): boolean {
    return effective !== "visualizador";
  },

  canEdit(effective: EffectiveRole): boolean {
    return effective !== "visualizador";
  },

  canDelete(effective: EffectiveRole): boolean {
    return effective !== "visualizador";
  },

  canManageUsers(effective: EffectiveRole, role: AppRole | null | undefined): boolean {
    if (role === "super_admin") return true;
    return effective === "master";
  },

  canManageBilling(effective: EffectiveRole, role: AppRole | null | undefined): boolean {
    if (role === "super_admin") return true;
    if (role === "admin_master" || role === "gestor") return true;
    return false;
  },

  canManageScreens(effective: EffectiveRole, canModule: CanFn): boolean {
    return canModule("telas") && effective !== "visualizador";
  },

  canManagePlaylists(effective: EffectiveRole, canModule: CanFn): boolean {
    return canModule("playlists") && effective !== "visualizador";
  },

  canManageCampaigns(effective: EffectiveRole, canModule: CanFn): boolean {
    return canModule("campanhas") && effective !== "visualizador";
  },

  canViewReports(canModule: CanFn): boolean {
    return canModule("relatorios");
  },

  label(effective: EffectiveRole): string {
    return ROLE_LABEL[effective];
  },
};
