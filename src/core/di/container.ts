import { FetchHttpClient } from '@/core/http/FetchHttpClient';
import type { AuthRepository } from '@/features/auth/repository/AuthRepository';
import { DemoAuthRepository } from '@/features/auth/repository/DemoAuthRepository';
import { HttpAuthRepository } from '@/features/auth/repository/HttpAuthRepository';
import { LocalStorageSessionStorage } from '@/features/auth/repository/SessionStorage';

type Config = { apiUrl: string | undefined; isDev: boolean };

/** Raíz de composición: el único lugar que conoce las implementaciones concretas. */
export function createAuthRepository({ apiUrl, isDev }: Config): AuthRepository {
  const storage = new LocalStorageSessionStorage();
  if (apiUrl) return new HttpAuthRepository(new FetchHttpClient(apiUrl), storage);
  if (isDev) return new DemoAuthRepository(storage);
  throw new Error('Falta VITE_API_URL: configúrala para compilar en producción.');
}
