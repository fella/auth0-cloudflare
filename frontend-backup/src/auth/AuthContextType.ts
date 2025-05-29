import type { Auth0Client } from '@auth0/auth0-spa-js';

export type AuthContextType = {
  auth0: Auth0Client | null;
  isAuthenticated: boolean;
  user: any;
  token: string | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
  claims?: Record<string, any>;
  wpRole?: string;
  group?: string;
  roles?: string[];
};
