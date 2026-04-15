import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  name: string;
  avatar: string | null;
  avatarIcon: string;
  email: string;
  country: string;
  location: string;
  phone: string;
  isSeller: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setProfile: (p: UserProfile | null) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  setProfile: () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// Mock profile for demo
const MOCK_PROFILE: UserProfile = {
  id: "me",
  name: "Demo User",
  avatar: null,
  avatarIcon: "User",
  email: "demo@sokomtaani.com",
  country: "Kenya",
  location: "Nairobi",
  phone: "+254700000000",
  isSeller: true,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setProfile(MOCK_PROFILE);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setProfile(MOCK_PROFILE);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      isLoading,
      isAuthenticated: !!session,
      setProfile,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
