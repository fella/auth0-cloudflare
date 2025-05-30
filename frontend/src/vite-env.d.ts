/// <reference types="vite/client" />
interface ImportMetaEnv {
    readonly VITE_AUTH0_DOMAIN: string;
    readonly VITE_AUTH0_CLIENT_ID: string;
    readonly VITE_AUTH0_AUDIENCE: string;
    readonly VITE_AUTH0_REDIRECT_URI: string;
    // Add other custom env vars here
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }