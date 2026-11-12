export type Credentials = {
  email: string;
  password: string;
};

export type CredentialsField = keyof Credentials;
export type CredentialsErrors = Partial<Record<CredentialsField, string>>;

export type CredentialsValidation =
  | { ok: true; credentials: Credentials }
  | { ok: false; errors: CredentialsErrors };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCredentials(input: Credentials): CredentialsValidation {
  const email = input.email.trim().toLowerCase();
  const { password } = input;
  const errors: CredentialsErrors = {};

  if (email.length === 0) errors.email = 'Escribe tu correo.';
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'Ese correo no parece válido.';

  if (password.length === 0) errors.password = 'Escribe tu contraseña.';

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, credentials: { email, password } };
}
