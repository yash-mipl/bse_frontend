/**
 * Typed access to Vite environment variables.
 * Add new vars to .env.example and src/vite-env.d.ts.
 */
export const env = {
  appName: import.meta.env.VITE_APP_NAME,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  bse: {
    apiUrl: import.meta.env.VITE_BSE_API_URL,
    username: import.meta.env.VITE_BSE_USERNAME,
    password: import.meta.env.VITE_BSE_PASSWORD,
  },
} as const
