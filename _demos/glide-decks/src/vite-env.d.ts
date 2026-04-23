/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SHOW_DATASERIES_DEBUG_KEBAB?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
