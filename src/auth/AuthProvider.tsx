import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

export interface AuthAdapter {
  restore(): AuthUser | null;
  login(email: string): AuthUser;
  logout(): void;
}

const demoAdapter: AuthAdapter = {
  restore() {
    try {
      if (sessionStorage.getItem('aster:demo-session') !== 'active') return null;
      const email = sessionStorage.getItem('aster:demo-email') || 'alex@example.com';
      return { id: 'demo-user', name: 'Alex Morgan', email, roles: ['Admin'] };
    } catch {
      return null;
    }
  },
  login(email) {
    try {
      sessionStorage.setItem('aster:demo-session', 'active');
      sessionStorage.setItem('aster:demo-email', email);
    } catch {
      // Demo sessions intentionally degrade to in-memory state.
    }
    return { id: 'demo-user', name: 'Alex Morgan', email, roles: ['Admin'] };
  },
  logout() {
    try {
      sessionStorage.removeItem('aster:demo-session');
      sessionStorage.removeItem('aster:demo-email');
    } catch {
      // Ignore storage failures in the demo adapter.
    }
  },
};

interface AuthContextValue {
  user: AuthUser | null;
  authenticated: boolean;
  login: (email: string) => void;
  logout: () => void;
  can: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextValue>(null!);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children, adapter = demoAdapter }: { children: ReactNode; adapter?: AuthAdapter }) {
  const [user, setUser] = useState<AuthUser | null>(() => adapter.restore());
  const value = useMemo<AuthContextValue>(() => ({
    user,
    authenticated: !!user,
    login: (email) => setUser(adapter.login(email)),
    logout: () => {
      adapter.logout();
      setUser(null);
    },
    can: () => !!user,
  }), [adapter, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
