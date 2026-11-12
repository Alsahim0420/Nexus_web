import { useCallback, useRef, useState } from 'react';
import { authErrorMessage } from '@/features/auth/model/AuthError';
import {
  validateCredentials,
  type Credentials,
  type CredentialsErrors,
} from '@/features/auth/model/Credentials';
import type { Session } from '@/features/auth/model/Session';

export type LoginState = {
  email: string;
  password: string;
  fieldErrors: CredentialsErrors;
  formError: string | null;
  isSubmitting: boolean;
  isPasswordVisible: boolean;
};

export type LoginActions = {
  changeEmail(value: string): void;
  changePassword(value: string): void;
  togglePasswordVisibility(): void;
  submit(): Promise<void>;
};

export type LoginController = { state: LoginState; actions: LoginActions };

const INITIAL_STATE: LoginState = {
  email: '',
  password: '',
  fieldErrors: {},
  formError: null,
  isSubmitting: false,
  isPasswordVisible: false,
};

/**
 * Controlador del formulario de acceso. No sabe nada de la vista ni de la red:
 * recibe `signIn` (del AuthController) y expone estado + acciones para la vista.
 */
export function useLoginController({
  signIn,
}: {
  signIn: (credentials: Credentials) => Promise<Session>;
}): LoginController {
  const [state, setState] = useState<LoginState>(INITIAL_STATE);
  const inFlight = useRef(false);

  const changeField = useCallback((field: keyof Credentials, value: string) => {
    setState((s) => {
      const { [field]: _removed, ...fieldErrors } = s.fieldErrors;
      return { ...s, [field]: value, fieldErrors, formError: null };
    });
  }, []);

  const changeEmail = useCallback((v: string) => changeField('email', v), [changeField]);
  const changePassword = useCallback((v: string) => changeField('password', v), [changeField]);

  const togglePasswordVisibility = useCallback(() => {
    setState((s) => ({ ...s, isPasswordVisible: !s.isPasswordVisible }));
  }, []);

  const submit = useCallback(async () => {
    if (inFlight.current) return;

    const validation = validateCredentials({ email: state.email, password: state.password });
    if (!validation.ok) {
      setState((s) => ({ ...s, fieldErrors: validation.errors, formError: null }));
      return;
    }

    inFlight.current = true;
    setState((s) => ({ ...s, fieldErrors: {}, formError: null, isSubmitting: true }));
    try {
      await signIn(validation.credentials);
      setState((s) => ({ ...s, isSubmitting: false }));
    } catch (error) {
      setState((s) => ({ ...s, isSubmitting: false, formError: authErrorMessage(error) }));
    } finally {
      inFlight.current = false;
    }
  }, [signIn, state.email, state.password]);

  return {
    state,
    actions: { changeEmail, changePassword, togglePasswordVisibility, submit },
  };
}
