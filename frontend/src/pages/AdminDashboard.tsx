import React from 'react';
import { useAuth } from '../auth/AuthProvider';

const AdminDashboard = () => {
  const { user, logout, roles = [], group } = useAuth();

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Dashboard 🛠️</h1>
      <p>Welcome, {user.name}</p>
      <p>Group: {group}</p>
      <p>Roles: {roles.join(', ')}</p>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <button onClick={logout}>Log Out</button>
    </div>
  );
};

export default AdminDashboard;
