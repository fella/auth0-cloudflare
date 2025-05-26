// /frontend/src/pages/ClaimsPanel.tsx

import React from 'react';
import { useAuth } from '../auth/AuthProvider';
import { jwtDecode } from 'jwt-decode';

const ClaimsPanel: React.FC = () => {
  const { token, isAuthenticated, login, logout, user } = useAuth();

  const decoded = token ? jwtDecode(token) : null;

  const copyToClipboard = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      alert('ID token copied to clipboard!');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Please log in to view your token claims.</h2>
        <button onClick={login}>Log In</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, fontFamily: 'monospace' }}>
      <h1>🔐 Token Claims</h1>

      <p>Logged in as <strong>{user?.email || user?.name}</strong></p>
      <button onClick={logout} style={{ marginBottom: 12 }}>Log Out</button>

      <h3>ID Token</h3>
      <button onClick={copyToClipboard}>📋 Copy Token</button>
      <pre style={{ maxWidth: '100%', overflowX: 'auto', background: '#eee', padding: 10, borderRadius: 6 }}>
        {token}
      </pre>

      <h3>Decoded Claims</h3>
      <pre style={{ maxWidth: '100%', overflowX: 'auto', background: '#f3f3f3', padding: 10, borderRadius: 6 }}>
        {JSON.stringify(decoded, null, 2)}
      </pre>
    </div>
  );
};

export default ClaimsPanel;
