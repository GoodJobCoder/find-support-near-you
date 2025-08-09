import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import { toast } from "@/components/ui/sonner";

export type OAuthProvider = "google" | "facebook" | "apple";

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  language: string | null;
  theme: string | null;
  notifications: boolean | null;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: Profile | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithProvider: (provider: OAuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Set up auth listener first
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        // Defer fetching profile to avoid blocking the callback
        setTimeout(() => {
          refreshProfile();
        }, 0);
      } else {
        setProfile(null);
      }
    });

    // Then get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        refreshProfile();
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url, bio, language, theme, notifications, created_at, updated_at")
      .eq("id", user.id)
      .maybeSingle();
    if (error) {
      console.error("Error loading profile", error);
      toast.error("Failed to load profile");
    }
    setProfile((data as Profile) ?? null);
    setLoading(false);
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      throw error;
    } else {
      toast.success("Signed in successfully");
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/settings`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl },
    });
    if (error) {
      toast.error(error.message);
      throw error;
    } else {
      toast.success("Check your email to confirm your account");
    }
  };

  const signInWithProvider = async (provider: OAuthProvider) => {
    const redirectUrl = `${window.location.origin}/settings`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: redirectUrl },
    });
    if (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      throw error;
    } else {
      toast.success("Signed out");
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    const payload = {
      ...updates,
      id: user.id,
      updated_at: new Date().toISOString(),
    } as any;
    const { error, data } = await supabase.from("profiles").upsert(payload).select().maybeSingle();
    if (error) {
      toast.error(error.message);
      throw error;
    }
    setProfile(data as Profile);
    toast.success("Settings saved");
  };

  const value: AuthContextType = useMemo(
    () => ({
      user,
      session,
      loading,
      profile,
      signInWithEmail,
      signUpWithEmail,
      signInWithProvider,
      signOut,
      refreshProfile,
      updateProfile,
    }),
    [user, session, loading, profile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
