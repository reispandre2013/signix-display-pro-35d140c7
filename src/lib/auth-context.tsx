import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase-client";
import type { Profile } from "@/lib/db-types";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    name: string,
    orgName: string,
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapAuthError(error: unknown, fallback: string): Error {
  if (error instanceof Error) {
    const msg = error.message.trim();
    if (msg.toLowerCase() === "failed to fetch") {
      return new Error(
        "Falha de conexão com o backend de autenticação. Verifique as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no ambiente de preview.",
      );
    }
    return error;
  }
  return new Error(fallback);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (uid: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("auth_user_id", uid)
      .maybeSingle();
    setProfile((data as Profile | null) ?? null);
  };

  useEffect(() => {
    if (!hasSupabaseEnv) {
      console.warn("[auth] Supabase env ausente; autenticação desabilitada neste ambiente.");
      setLoading(false);
      return;
    }

    // 1) Listener PRIMEIRO (regra Supabase)
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        // defer pra evitar deadlock
        setTimeout(() => loadProfile(sess.user.id), 0);
      } else {
        setProfile(null);
      }
    });

    // 2) Depois recupera sessão atual
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
        setUser(data.session?.user ?? null);
        if (data.session?.user) {
          loadProfile(data.session.user.id).finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("[auth] getSession falhou:", err);
        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
      });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn: AuthContextValue["signIn"] = async (email, password) => {
    if (!hasSupabaseEnv) {
      return {
        error: new Error(
          "Configuração Supabase ausente no preview. Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY (ou VITE_SUPABASE_ANON_KEY).",
        ),
      };
    }
    try {
      const emailNorm = email.trim().toLowerCase();
      const { error } = await supabase.auth.signInWithPassword({ email: emailNorm, password });
      return { error };
    } catch (err) {
      return { error: mapAuthError(err, "Não foi possível entrar.") };
    }
  };

  const signUp: AuthContextValue["signUp"] = async (email, password, name, orgName) => {
    if (!hasSupabaseEnv) {
      return {
        error: new Error(
          "Configuração Supabase ausente no preview. Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY (ou VITE_SUPABASE_ANON_KEY).",
        ),
      };
    }
    const redirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/app` : undefined;
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: { name, organization_name: orgName },
        },
      });
      return { error };
    } catch (err) {
      return { error: mapAuthError(err, "Não foi possível criar a conta.") };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (user) await loadProfile(user.id);
  };

  return (
    <AuthContext.Provider
      value={{ session, user, profile, loading, signIn, signUp, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
