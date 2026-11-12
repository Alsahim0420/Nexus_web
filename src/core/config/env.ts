/** Variables públicas de entorno. Vite solo expone las que empiezan por `VITE_`. */
export const env = {
  apiUrl: import.meta.env.VITE_API_URL,
  isDev: import.meta.env.DEV,
};
