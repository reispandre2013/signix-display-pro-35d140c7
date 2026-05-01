/**
 * CORS configurável por ambiente (opcional — não altera comportamento até definir env).
 *
 * FUNCTIONS_ALLOWED_ORIGINS:
 * - omitido ou "*": equivale ao histórico (Access-Control-Allow-Origin: *)
 * - um ou mais origins separados por vírgula: em pedidos com cabeçalho `Origin`,
 *   só esse valor será ecoado se estiver na lista; sem `Origin`, usa o primeiro da lista.
 */
export function accessControlHeaders(
  req: Request,
  methods: string,
  extraAllowedHeaders?: string,
): Record<string, string> {
  const baseHeaders =
    "authorization, x-client-info, apikey, content-type" +
    (extraAllowedHeaders ? ", " + extraAllowedHeaders : "");

  const raw = (Deno.env.get("FUNCTIONS_ALLOWED_ORIGINS") ?? "").trim();
  const allowWildcard = raw === "" || raw === "*";
  let allowOrigin = "*";

  if (!allowWildcard) {
    const list = raw.split(",").map((s) => s.trim()).filter(Boolean);
    const reqOrigin = req.headers.get("Origin");
    if (reqOrigin && list.includes(reqOrigin)) {
      allowOrigin = reqOrigin;
    } else if (!reqOrigin && list.length === 1) {
      allowOrigin = list[0]!;
    } else if (!reqOrigin) {
      allowOrigin = list[0] ?? "*";
    } else {
      allowOrigin = "null";
    }
  }

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": baseHeaders,
    "Access-Control-Allow-Methods": methods,
  };
}
