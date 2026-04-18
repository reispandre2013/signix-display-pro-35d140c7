import { a1 as TSS_SERVER_FUNCTION } from "./worker-entry-CFvqOeOX.js";
import { c as createClient } from "./index-Cf78ubZ7.js";
var createServerRpc = (serverFnMeta, splitImportFn) => {
  const url = "/_serverFn/" + serverFnMeta.id;
  return Object.assign(splitImportFn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const SUPABASE_URL = process.env.SUPABASE_URL ?? "https://auhwylnhqmdgphsvjszr.supabase.co";
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "[supabaseAdmin] SUPABASE_URL ou SERVICE_ROLE_KEY ausentes no ambiente do servidor."
  );
}
const supabaseAdmin = createClient(SUPABASE_URL ?? "", SERVICE_ROLE_KEY ?? "", {
  auth: { autoRefreshToken: false, persistSession: false }
});
export {
  createServerRpc as c,
  supabaseAdmin as s
};
