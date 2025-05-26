// /frontend/src/pages/DebugPanel.tsx
import React from 'react';
import { useAuth } from '../auth/AuthProvider';

const DebugPanel: React.FC = () => {
  const { isAuthenticated, user, token, logout, login, loading } = useAuth();

  const callProtected = async () => {
    try {
      console.log('[DebugPanel] Calling /api/protected...');
      const res = await fetch('https://auth0-worker.webdept.workers.dev/api/protected', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      console.log('[DebugPanel] Protected API response:', data);
      alert('Protected API call successful — check console');
    } catch (err) {
      console.error('[DebugPanel] Error calling /api/protected:', err);
    }
  };

  const callWhoAmI = async () => {
    try {
      console.log('[DebugPanel] Calling /api/whoami...');
      const res = await fetch('https://auth0-worker.webdept.workers.dev/api/whoami', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      console.log('[DebugPanel] WhoAmI response:', data);
      alert('WhoAmI API call successful — check console');
    } catch (err) {
      console.error('[DebugPanel] Error calling /api/whoami:', err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20, fontFamily: 'monospace' }}>
      <h1>🧪 Debug Panel</h1>

      {!isAuthenticated ? (
        <button onClick={login}>Log In</button>
      ) : (
        <>
          <p>Logged in as: <strong>{user?.email || user?.name}</strong></p>
          <button onClick={logout} style={{ marginRight: 8 }}>Log Out</button>
          <button onClick={callProtected} style={{ marginRight: 8 }}>Call Protected API</button>
          <button onClick={callWhoAmI}>Call WhoAmI</button>

          <div style={{ marginTop: 20, background: '#f9f9f9', padding: 12, borderRadius: 6 }}>
            <h3>User Info</h3>
            <pre>{JSON.stringify(user, null, 2)}</pre>
          </div>
        </>
      )}
    </div>
  );
};

export default DebugPanel;
