import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, getStoredToken, setStoredToken } from '../api/client';

const AuthContext = createContext(null);

function applySession(setUser, token, profile) {
  setStoredToken(token);
  setUser(profile);
  return profile;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsLocation, setNeedsLocation] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const token = getStoredToken();
      if (!token) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const { user: profile, needsLocation: missingLocation } = await authApi.me();
        if (!cancelled) {
          setUser(profile);
          setNeedsLocation(Boolean(missingLocation));
        }
      } catch {
        setStoredToken(null);
        if (!cancelled) {
          setUser(null);
          setNeedsLocation(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const signUp = useCallback(async ({ email, password, displayName, country, city }) => {
    const { token, user: profile } = await authApi.signUp({
      email,
      password,
      displayName,
      country,
      city,
    });
    applySession(setUser, token, profile);
    setNeedsLocation(false);
    return profile;
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    const { token, user: profile } = await authApi.signIn({ email, password });
    applySession(setUser, token, profile);
    setNeedsLocation(!profile.country || !profile.city);
    return profile;
  }, []);

  const signInWithGoogle = useCallback(async ({ credential, country, city } = {}) => {
    const { token, user: profile, needsLocation: missingLocation } = await authApi.signInWithGoogle({
      credential,
      country,
      city,
    });
    applySession(setUser, token, profile);
    setNeedsLocation(Boolean(missingLocation));
    return profile;
  }, []);

  const updateProfile = useCallback(async ({ country, city }) => {
    const { user: profile } = await authApi.updateProfile({ country, city });
    setUser(profile);
    setNeedsLocation(false);
    return profile;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authApi.signOut();
    } catch {
      /* token may already be invalid */
    }
    setStoredToken(null);
    setUser(null);
    setNeedsLocation(false);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      needsLocation,
      signUp,
      signIn,
      signInWithGoogle,
      updateProfile,
      signOut,
      isAuthenticated: !!user,
      isAdmin: !!user?.isAdmin,
    }),
    [user, loading, needsLocation, signUp, signIn, signInWithGoogle, updateProfile, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
