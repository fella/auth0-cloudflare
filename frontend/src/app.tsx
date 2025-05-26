// /frontend/src/App.tsx

import React, { useEffect } from 'react';
import { useAuth } from './auth/AuthProvider';
import { useNavigate, useLocation } from 'react-router-dom';

function App() {
  const { isAuthenticated, user, login, logout, token, loading, wpRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();


  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated && wpRole) {
        if (location.pathname === '/debug') return; // ✅ Skip redirect on /debug
        console.log(`[Frontend] Detected wp_role: ${wpRole}`);
          switch (wpRole) {
            case 'administrator':
              navigate('/admin');
              break;
            case 'viewer':
              navigate('/viewer');
              break;
            case 'contributor':
              navigate('/contributor');
              break;
            case 'harvestplus_registrant':
              navigate('/registrant');
              break;
            default:
              navigate('/no-role');
              break;
          }
      }
  }, 100);
  return () => clearTimeout(timer);
  }, 
  [isAuthenticated, wpRole, navigate]);

  const callProtected = async () => {
    console.log('[Frontend] Calling /protected API...');
    const res = await fetch('/api/protected', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    console.log('[Frontend] Received from backend:', data);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>🌱 Auth0 + Vite + Express</h1>

      {!isAuthenticated ? (
        <button onClick={login}>Log In</button>
      ) : (
        <>
          <p>Welcome, {user.name}</p>
          <button onClick={logout}>Log Out</button>
          <button onClick={callProtected}>Call Protected API</button>

          {/* 🧪 Debug: Show full user object */}
          <div style={{ marginTop: '1rem', background: '#f3f3f3', padding: '1rem', borderRadius: 8 }}>
            <h3>User Debug Info</h3>
            <pre style={{ fontSize: '0.8rem' }}>{JSON.stringify(user, null, 2)}</pre>
          </div>
        </>
      )}
    </div>
  );
}

export default App;

