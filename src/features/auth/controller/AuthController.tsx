import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Credentials } from '@/features/auth/model/Credentials';
import type { Session } from '@/features/auth/model/Session';
import type { AuthRepository } from '@/features/auth/repository/AuthRepository';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export type AuthContextValue = {
  status: AuthStatus;
  session: Session | null;
  signIn(credentials: Credentials): Promise<Session>;
  signOut(): Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthState = { status: AuthStatus; session: Session | null };

/** Controlador de sesión: única fuente de verdad sobre quién está conectado. */
export function AuthProvider({
  repository,
  children,
}: {
  repository: AuthRepository;
  children: ReactNode;
}) {
  const [state, setState] = useState<AuthState>({ status: 'loading', session: null });

  useEffect(() => {
    let active = true;
    repository
      .getCurrentSession()
      .catch(() => null)
      .then((session) => {
        if (!active) return;
        setState(session ? { status: 'authenticated', session } : { status: 'unauthenticated', session: null });
      });
    return () => {
      active = false;
    };
  }, [repository]);

  const signIn = useCallback(
    async (credentials: Credentials) => {
      const session = await repository.login(credentials);
      setState({ status: 'authenticated', session });
      return session;
    },
    [repository],
  );

  const signOut = useCallback(async () => {
    await repository.logout();
    setState({ status: 'unauthenticated', session: null });
  }, [repository]);

  const value = useMemo(() => ({ ...state, signIn, signOut }), [state, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
