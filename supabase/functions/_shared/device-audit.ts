import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export async function insertPlayerDeviceAudit(
  adminClient: SupabaseClient,
  organizationId: string,
  deviceRowId: string,
  action: string,
  oldData: Record<string, unknown> | null,
  newData: Record<string, unknown> | null,
): Promise<void> {
  const { error } = await adminClient.from("audit_logs").insert({
    organization_id: organizationId,
    actor_profile_id: null,
    entity_type: "player_device",
    entity_id: deviceRowId,
    action,
    old_data: oldData,
    new_data: newData,
  });
  if (error) console.error("[player_device audit]", error.message);
}
