import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'creator';
};

type AuthContextType = {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const mapSupabaseUser = (user: User): AuthUser => ({
  id: user.id,
  email: user.email!,
  name: user.user_metadata.name || 'Unknown User',
  role: user.user_metadata.role || 'creator'
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? mapSupabaseUser(session.user) : null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? mapSupabaseUser(session.user) : null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (data.user) {
        setUser(mapSupabaseUser(data.user));
      }
    } catch (err) {
      const authError = err as AuthError;
      console.error('Login error:', authError);
      setError(authError.message);
      throw err;
    }
  };

  const logout = async () => {
    setError(null);
    try {
      // Clear the local user state first
      setUser(null);
      
      // Always sign out to ensure all tokens are cleared
      await supabase.auth.signOut();
      
      // Clear any remaining local storage items related to auth
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('supabase.auth.refreshToken');
    } catch (err) {
      const authError = err as AuthError;
      console.error('Logout error:', authError);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};