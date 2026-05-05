import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import supabase from '../services/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error && data) setProfile(data);
    } catch {
      // profile may not exist yet
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        fetchProfile(u.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        fetchProfile(u.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates) => {
    if (!user) return { error: new Error('Not authenticated') };
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single();
    if (!error && data) setProfile(data);
    return { data, error };
  };

  const refreshProfile = () => user && fetchProfile(user.id);

  const role = profile?.role ?? 'user';
  const isAdmin = role === 'admin';
  const isManager = role === 'manager' || isAdmin;
  const canEditInternalStatus = isManager;
  const canManageUsers = isAdmin;

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      role,
      isAdmin,
      isManager,
      canEditInternalStatus,
      canManageUsers,
      signIn,
      signOut,
      updateProfile,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
