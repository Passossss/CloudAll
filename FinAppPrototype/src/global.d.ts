declare module '*.png';
declare module '*.jpg';
declare module '*.svg';

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_BFF_URL: string;
  readonly VITE_NODE_ENV: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
