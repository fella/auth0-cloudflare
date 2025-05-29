// src/auth/roles.ts

export function getRoles(token: string, namespace: string = 'https://auth.harvest.org/roles'): string[] {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const rolesClaim = payload[namespace] || '';
      return rolesClaim.split(',').map(role => role.trim());
    } catch (err) {
      console.error('❌ Failed to decode token:', err);
      return [];
    }
  }
  
  export function hasRole(token: string, roleToCheck: string | string[], namespace?: string): boolean {
    const roles = getRoles(token, namespace);
    if (Array.isArray(roleToCheck)) {
      return roleToCheck.some(role => roles.includes(role));
    }
    return roles.includes(roleToCheck);
  }
  