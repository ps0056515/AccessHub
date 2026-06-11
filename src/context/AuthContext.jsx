import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, getStoredToken, setStoredToken } from '../api/client';

const AuthContext = createContext(null);

function applySession(setUser, token, profile) {
  setStoredToken(token);
  setUser(profile);
  return profile;
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsLocation, setNeedsLocation] = useState(false);

  useEffect(() => {
    let cancelled = false;


    async function restoreSession() {
      const token = getStoredToken();
      if (!token) {
        if (!cancelled) {
          setUser(null);
          setLoading(false);
        }
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

    const handleUnauthorized = () => {
      setStoredToken(null);
      setUser(null);
      setNeedsLocation(false);
      navigate('/sign-in', { replace: true, state: { errorToast: 'Your session expired or your account was blocked.' } });
    };

    window.addEventListener('aa-unauthorized', handleUnauthorized);

    restoreSession();
    return () => {
      cancelled = true;
      window.removeEventListener('aa-unauthorized', handleUnauthorized);
    };
  }, [navigate]);

  const signUp = useCallback(async ({ email, password, displayName, country, city, company }) => {
    const response = await authApi.signUp({
      email,
      password,
      displayName,
      country,
      city,
      company,
    });
    // Do not applySession here because the user is not verified yet.
    return response;
  }, []);

  const verifyOtp = useCallback(async ({ email, otp }) => {
    const { token, user: profile } = await authApi.verifyOtp({ email, otp });
    applySession(setUser, token, profile);
    setNeedsLocation(!profile.country || !profile.city);
    return profile;
  }, []);

  const resendOtp = useCallback(async ({ email }) => {
    return await authApi.resendOtp({ email });
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    const { token, user: profile } = await authApi.signIn({ email, password });
    applySession(setUser, token, profile);
    setNeedsLocation(!profile.country || !profile.city);
    return profile;
  }, []);

  const signInWithGoogle = useCallback(async ({ credential, country, city, company } = {}) => {
    const { token, user: profile, needsLocation: missingLocation } = await authApi.signInWithGoogle({
      credential,
      country,
      city,
      company,
    });
    applySession(setUser, token, profile);
    setNeedsLocation(Boolean(missingLocation));
    return profile;
  }, []);

  const updateProfile = useCallback(async (updates) => {
    const { user: profile } = await authApi.updateProfile(updates);
    setUser(profile);
    setNeedsLocation(!profile.country || !profile.city);
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
      verifyOtp,
      resendOtp,
      updateProfile,
      signOut,
      isAuthenticated: !!user,
      isAdmin: !!user?.isAdmin,
    }),
    [user, loading, needsLocation, signUp, signIn, signInWithGoogle, verifyOtp, resendOtp, updateProfile, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
