/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base del backend de Nexus. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
