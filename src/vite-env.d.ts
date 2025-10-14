/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV?:
    | "lovable-dev"
    | "lovable"
    | "development"
    | "staging"
    | "production";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
