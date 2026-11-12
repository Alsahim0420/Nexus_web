import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router';
import { useAuth } from '@/features/auth/controller/AuthController';
import { LoginScreen } from '@/features/auth/view/LoginScreen';
import { HomeScreen } from '@/features/home/view/HomeScreen';
import { NotFoundScreen } from './NotFoundScreen';

type FromState = { from?: string } | null;

/** Mientras se restaura la sesión: fondo negro, sin parpadeo de pantallas. */
function SessionSplash() {
  return <div aria-busy="true" style={{ minHeight: '100%' }} />;
}

/** Zona privada: sin sesión, al login (recordando a dónde quería ir). */
function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <SessionSplash />;
  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname } satisfies FromState} />;
  }
  return <Outlet />;
}

/** Solo para invitados: con sesión, a donde iba o al inicio. */
function PublicOnly() {
  const { status } = useAuth();
  const from = (useLocation().state as FromState)?.from ?? '/';
  if (status === 'loading') return <SessionSplash />;
  if (status === 'authenticated') return <Navigate to={from} replace />;
  return <Outlet />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicOnly />}>
        <Route path="/login" element={<LoginScreen />} />
      </Route>
      <Route element={<RequireAuth />}>
        <Route index element={<HomeScreen />} />
      </Route>
      <Route path="*" element={<NotFoundScreen />} />
    </Routes>
  );
}
