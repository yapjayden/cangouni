// src/lib/auth.tsx
// Client-side auth context backed by Supabase. Exposes the current user plus
// sign-in/up/out helpers. On sign-in it pulls the saved profile from the cloud
// into localStorage; on sign-out it clears the local cache. If Supabase isn't
// configured, everything resolves to "guest" and the app works locally.

"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase, isSupabaseEnabled } from "@/lib/supabase";
import { setCloudUser, pullFromCloud, clearLocalCache } from "@/lib/storage";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  enabled: boolean;
  signInEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpEmail: (email: string, password: string) => Promise<{ error?: string; needsConfirmation?: boolean }>;
  signInGoogle: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Adopt a signed-in user: register them for cloud sync and pull their data.
  const adopt = useCallback(async (u: User | null) => {
    setUser(u);
    setCloudUser(u?.id ?? null);
    if (u) await pullFromCloud(u.id);
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(async ({ data }) => {
      await adopt(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await adopt(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [adopt]);

  const signInEmail = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: "Sign-in is not configured." };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { error: error.message } : {};
  }, []);

  const signUpEmail = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: "Sign-up is not configured." };
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    // If email confirmation is on, there's no active session yet.
    return { needsConfirmation: !data.session };
  }, []);

  const signInGoogle = useCallback(async () => {
    if (!supabase) return { error: "Sign-in is not configured." };
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined },
    });
    return error ? { error: error.message } : {};
  }, []);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setCloudUser(null);
    clearLocalCache();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, enabled: isSupabaseEnabled, signInEmail, signUpEmail, signInGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
