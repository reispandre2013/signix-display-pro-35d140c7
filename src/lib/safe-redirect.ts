/**
 * Evita open redirect: só caminhos relativos internos ("/foo?bar=1").
 * Não permitir "https://", "//" ou "\\\\server".
 */
export function isSafeInternalRedirect(s: string | undefined | null): s is string {
  if (s == null || typeof s !== "string") return false;
  if (!s.startsWith("/") || s.startsWith("//")) return false;
  if (s.includes("://") || s.includes("\\\\")) return false;
  return true;
}
