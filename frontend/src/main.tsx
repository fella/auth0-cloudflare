// /frontend/src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import AdminDashboard from './pages/AdminDashboard';
import ViewerDashboard from './pages/ViewerDashboard';
import DebugPanel from './pages/DebugPanel';
import { AuthProvider } from './auth/AuthProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/viewer" element={<ViewerDashboard />} />
          <Route path="/debug" element={<DebugPanel />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

