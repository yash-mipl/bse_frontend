/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_BSE_API_URL: string
  readonly VITE_BSE_USERNAME: string
  readonly VITE_BSE_PASSWORD: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
