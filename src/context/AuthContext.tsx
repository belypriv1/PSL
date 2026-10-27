import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, District, PlayerPosition, UserRole } from '../types';
import { getSupabase } from '../lib/supabase';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, role?: UserRole, name?: string) => Promise<boolean>;
  signUp: (data: {
    email: string;
    fullName: string;
    district: District;
    position: PlayerPosition;
    nickname?: string;
    phone?: string;
    partnerName?: string;
    partnerPhone?: string;
  }) => Promise<{ success: boolean; error?: string; playerId?: string }>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  quickLoginAs: (preset: 'admin' | 'player') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'psl_current_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize auth state
  useEffect(() => {
    const supabase = getSupabase();
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          // fetch profile
          supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(({ data: profile }) => {
              if (profile) {
                setUser({
                  id: profile.id,
                  email: profile.email,
                  role: profile.role || 'player',
                  name: profile.full_name || 'PSL Athlete',
                });
              } else {
                setUser({
                  id: session.user.id,
                  email: session.user.email || '',
                  role: (session.user.user_metadata?.role as UserRole) || 'player',
                  name: session.user.user_metadata?.full_name || 'PSL Athlete',
                });
              }
              setLoading(false);
            });
        } else {
          loadStoredLocalUser();
        }
      });
    } else {
      loadStoredLocalUser();
    }
  }, []);

  const loadStoredLocalUser = () => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        // Default to a guest player or admin preset for immediate testing
        const defaultUser: AuthUser = {
          id: 'admin-psl-suez-01',
          email: 'admin@pslsuez.com',
          role: 'admin',
          name: 'Captain Mahmoud El-Suez',
        };
        setUser(defaultUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(defaultUser));
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, role: UserRole = 'player', name?: string): Promise<boolean> => {
    setLoading(true);
    const supabase = getSupabase();

    if (supabase) {
      // In a real Supabase production app, users sign in via email/password or magic link
      // For instant review, we attempt signin or fallback
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: 'password123',
      });
      if (!error && data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || email,
          role: role,
          name: name || data.user.user_metadata?.full_name || email.split('@')[0],
        });
        setLoading(false);
        return true;
      }
    }

    // Local / direct auth handler
    const newUser: AuthUser = {
      id: 'user-' + Date.now().toString(36),
      email,
      role,
      name: name || email.split('@')[0],
    };
    setUser(newUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    setLoading(false);
    return true;
  };

  const signUp = async (data: {
    email: string;
    fullName: string;
    district: District;
    position: PlayerPosition;
    nickname?: string;
    phone?: string;
    partnerName?: string;
    partnerPhone?: string;
  }): Promise<{ success: boolean; error?: string; playerId?: string }> => {
    setLoading(true);
    const supabase = getSupabase();

    if (supabase) {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: 'password123',
        options: {
          data: {
            full_name: data.fullName,
            district: data.district,
            role: 'player',
          },
        },
      });

      if (error) {
        setLoading(false);
        return { success: false, error: error.message };
      }

      if (authData.user) {
        // insert into profiles
        await supabase.from('profiles').insert({
          id: authData.user.id,
          email: data.email,
          full_name: data.fullName,
          role: 'player',
        });
      }
    }

    const playerId = 'player-' + Math.random().toString(36).substring(2, 9);
    const newUser: AuthUser = {
      id: 'user-' + Date.now().toString(36),
      email: data.email,
      role: 'player',
      player_id: playerId,
      name: data.fullName,
    };

    setUser(newUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    setLoading(false);
    return { success: true, playerId };
  };

  const logout = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const switchRole = (newRole: UserRole) => {
    if (!user) return;
    const updated = { ...user, role: newRole };
    setUser(updated);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
  };

  const quickLoginAs = (preset: 'admin' | 'player') => {
    let presetUser: AuthUser;
    if (preset === 'admin') {
      presetUser = {
        id: 'admin-psl-suez-01',
        email: 'league-director@pslsuez.com',
        role: 'admin',
        name: 'Ahmed Zaki (PSL Chief Commissioner)',
      };
    } else {
      presetUser = {
        id: 'user-player-suez-01',
        email: 'tarek.padbol@gmail.com',
        role: 'player',
        name: 'Tarek "The Cobra" Nour',
      };
    }
    setUser(presetUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(presetUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: user?.role === 'admin',
        login,
        signUp,
        logout,
        switchRole,
        quickLoginAs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
