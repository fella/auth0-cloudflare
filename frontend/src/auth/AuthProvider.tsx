declare global {
  interface Window {
    __auth0_callback_handled__?: boolean;
  }
}

import React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { createAuth0Client, Auth0Client } from '@auth0/auth0-spa-js';
import { authConfig } from './auth.config';
import type { ReactNode } from 'react';
import type { AuthContextType } from './AuthContextType';
import { useNavigate } from 'react-router-dom';

type Props = {
  children: ReactNode;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate(); 
  const [auth0, setAuth0] = useState<Auth0Client | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState<Record<string, any> | undefined>(undefined);

  useEffect(() => {
    const initAuth0 = async () => {
      try {
        const auth0Client = await createAuth0Client({
          domain: authConfig.domain,
          clientId: authConfig.clientId,
          authorizationParams: authConfig.authorizationParams,
        });

        setAuth0(auth0Client);

        // ✅ Only handle the redirect if code + state are present
        if (
          window.location.search.includes('code=') &&
          window.location.search.includes('state=') &&
          !window.__auth0_callback_handled__
        ) {
          window.__auth0_callback_handled__ = true; // ✅ persistent across re-renders
        
          try {
            const { appState } = await auth0Client.handleRedirectCallback();
            console.log('[Auth0] Redirect callback handled', appState);
        
            if (appState?.returnTo) {
              navigate(appState.returnTo);
            }
        
            window.history.replaceState({}, document.title, window.location.pathname);
          } catch (err) {
            console.error('[Auth0] Redirect callback failed:', err);
          }
        }
        

        const isAuthenticated = await auth0Client.isAuthenticated();
        setIsAuthenticated(isAuthenticated);

        if (isAuthenticated) {
          const user = await auth0Client.getUser();
          const token = await auth0Client.getTokenSilently();
          const idTokenClaims = await auth0Client.getIdTokenClaims();

          setUser(user);
          setToken(token);
          setClaims(idTokenClaims);
        }

        setLoading(false);
      } catch (err) {
        console.error('[Auth0] Initialization failed:', err);
        setLoading(false);
      }
    };

    initAuth0();
  }, []);

  const login = () => auth0?.loginWithRedirect({ appState: { returnTo: window.location.pathname } });
  const logout = () =>
    auth0?.logout({ logoutParams: { returnTo: window.location.origin } });

  const wpRole = claims?.['https://auth.harvest.org/wp_role'];
  const group = claims?.['https://auth.harvest.org/group'];
  const roles = claims?.['https://auth.harvest.org/roles'] || [];
  
  return (
    <AuthContext.Provider
      value={{
        auth0,
        isAuthenticated,
        user,
        token,
        loading,
        login,
        logout,
        claims,
        wpRole,
        group,
        roles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
