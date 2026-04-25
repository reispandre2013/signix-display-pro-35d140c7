import { supabase } from "@/integrations/supabase/client";

/**
 * Executa uma chamada de server function injetando o header Authorization
 * com o access_token da sessão Supabase atual. TanStack server functions são
 * invocadas via fetch interno; este helper garante que o token chegue ao
 * `getRequestHeader("authorization")` do servidor.
 */
export async function withAuthHeader<T>(call: () => Promise<T>): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Sem sessão. Faça login novamente.");

  const original = window.fetch;
  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers ?? {});
    if (!headers.has("authorization")) headers.set("authorization", `Bearer ${token}`);
    return original(input, { ...init, headers });
  }) as typeof window.fetch;
  try {
    return await call();
  } finally {
    window.fetch = original;
  }
}
