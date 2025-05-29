// src/auth/useAuth.ts
import { useContext } from 'react';
import { AuthContext } from './AuthProvider';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');

  const wpRole = context.claims?.['https://auth.harvest.org/wp_role'] ?? null;
  const group = context.claims?.['https://auth.harvest.org/group'] ?? null;
  const roles = context.claims?.['https://auth.harvest.org/roles'] ?? [];

  return {
    ...context,
    wpRole,
    group,
    roles,
  };
};

