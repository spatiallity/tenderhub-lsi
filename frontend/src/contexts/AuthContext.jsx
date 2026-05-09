import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import supabase from '../services/supabase';

const AuthContext = createContext(null);

// Guest user constants
const GUEST_USER = { id: 'guest', email: 'guest@local' };
const GUEST_PROFILE = { id: 'guest', name: 'Guest User', role: 'guest', is_active: true, unit_kerja: null };

// Dev mode fake unit_kerja so the claim/badge UI is exercisable in `npm run dev`.
const DEV_PROFILE = { id: 'dev-user', name: 'Developer', role: 'admin', is_active: true, unit_kerja: 'SBU LSI', unit_kerja_region: 'Pusat' };

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
      if (!error && data) {
        setProfile(data);
      } else {
        // If profile doesn't exist, create a default one
        console.warn('Profile not found, using default');
        setProfile({ id: userId, role: 'user', is_active: true });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setProfile({ id: userId, role: 'user', is_active: true });
    }
  }, []);

  useEffect(() => {
    // DEV MODE: Auto-login for development (when SKIP_AUTH=true in backend)
    const isDevelopment = import.meta.env.DEV;
    if (isDevelopment) {
      console.log('[Auth] Development mode - auto-login as dev user');
      const devUser = { id: 'dev-user', email: 'dev@tenderhub.local' };
      setUser(devUser);
      setProfile(DEV_PROFILE);
      setLoading(false);
      return;
    }

    // Check for guest session in sessionStorage
    const guestSession = sessionStorage.getItem('lsi-guest-session');
    if (guestSession) {
      setUser(GUEST_USER);
      setProfile(GUEST_PROFILE);
      setLoading(false);
      return;
    }

    // Check Supabase session
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
    if (!error && data.user) {
      // Clear guest session if exists
      sessionStorage.removeItem('lsi-guest-session');
    }
    return { data, error };
  };

  const signInAsGuest = () => {
    sessionStorage.setItem('lsi-guest-session', 'true');
    setUser(GUEST_USER);
    setProfile(GUEST_PROFILE);
  };

  const signOut = async () => {
    // Clear local user keywords (per-user keywords in TenderPage)
    localStorage.removeItem('lsi-user-keywords');
    
    // Check if guest mode
    const guestSession = sessionStorage.getItem('lsi-guest-session');
    if (guestSession) {
      sessionStorage.removeItem('lsi-guest-session');
      setUser(null);
      setProfile(null);
      return;
    }

    // Regular sign out
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates) => {
    if (!user || user.id === 'guest') return { error: new Error('Not authenticated') };
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single();
    if (!error && data) setProfile(data);
    return { data, error };
  };

  const refreshProfile = () => user && user.id !== 'guest' && fetchProfile(user.id);

  const isGuest = user?.id === 'guest';
  const role = profile?.role ?? 'user';
  const unitKerja = profile?.unit_kerja ?? null;
  const unitKerjaRegion = profile?.unit_kerja_region ?? null;
  const isAdmin = !isGuest && role === 'admin';
  const isPusat = !isGuest && (role === 'pusat' || unitKerja === 'SBU LSI');
  const isCabang = !isGuest && role === 'cabang';
  const isManager = !isGuest && (role === 'manager' || isAdmin);
  // Branch users (cabang/pusat/admin/manager) can edit their owned tenders.
  const canEditInternalStatus = !isGuest && (isAdmin || isManager || isCabang || isPusat);
  const canManageUsers = isAdmin;
  const canAddReview = !isGuest;
  const canAddHistory = !isGuest;

  // Returns true if caller can mutate a watchlist row claimed by `claimUnit`.
  // null/undefined claim = unclaimed → anyone with edit rights can claim.
  const canEditClaim = (claimUnit) => {
    if (isGuest) return false;
    if (isAdmin) return true;
    if (!claimUnit) return canEditInternalStatus;  // unclaimed → first claimer wins
    return claimUnit === unitKerja;
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      isGuest,
      role,
      unitKerja,
      unitKerjaRegion,
      isAdmin,
      isPusat,
      isCabang,
      isManager,
      canEditInternalStatus,
      canManageUsers,
      canAddReview,
      canAddHistory,
      canEditClaim,
      signIn,
      signInAsGuest,
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
