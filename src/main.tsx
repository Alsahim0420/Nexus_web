// Primero los estilos globales, para que los CSS Modules de cada componente puedan sobrescribirlos.
import '@/core/theme/global.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { AppRoutes } from '@/app/AppRoutes';
import { env } from '@/core/config/env';
import { createAuthRepository } from '@/core/di/container';
import { AuthProvider } from '@/features/auth/controller/AuthController';

const authRepository = createAuthRepository(env);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider repository={authRepository}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
