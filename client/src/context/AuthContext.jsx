import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  fetchMe,
  forgotPassword,
  logout as logoutRequest,
  resetPassword,
  signIn,
  signInWithGoogle,
  signUp,
  updateProfile,
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('orion_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await fetchMe();
        if (active) {
          setUser(currentUser);
        }
      } catch (error) {
        localStorage.removeItem('orion_token');
        if (active) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    bootstrap();

    return () => {
      active = false;
    };
  }, [token]);

  async function authenticate(result) {
    localStorage.setItem('orion_token', result.token);
    setToken(result.token);
    setUser(result.user);
    return result.user;
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user),
      signIn: async (payload) => authenticate(await signIn(payload)),
      signUp: async (payload) => authenticate(await signUp(payload)),
      signInWithGoogle: async (payload) => authenticate(await signInWithGoogle(payload)),
      forgotPassword,
      resetPassword,
      updateProfile: async (payload) => {
        const updatedUser = await updateProfile(payload);
        setUser(updatedUser);
        return updatedUser;
      },
      logout: async () => {
        try {
          await logoutRequest();
        } catch {
          // Clear local auth state even if the server request fails.
        }
        localStorage.removeItem('orion_token');
        setToken(null);
        setUser(null);
      },
      setUser,
    }),
    [loading, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
