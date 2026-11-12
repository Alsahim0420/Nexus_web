import { useAuth } from '@/features/auth/controller/AuthController';
import { useLoginController } from '@/features/auth/controller/useLoginController';
import { LoginView } from './LoginView';

/** Une el controlador con la vista. La navegación tras el login vive en `src/app`. */
export function LoginScreen() {
  const { signIn } = useAuth();
  const { state, actions } = useLoginController({ signIn });
  return <LoginView state={state} actions={actions} />;
}
