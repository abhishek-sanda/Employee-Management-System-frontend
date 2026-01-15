import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const onLogout = async () => {
    await logout();
    nav('/login', { replace: true });
  };

  return (
    <header className="bg-white border-b p-4 flex items-center justify-between">
      <div className="text-lg font-semibold">Employee Management</div>
      <div className="flex items-center space-x-4">
        <div className="text-sm">{user?.email}</div>
        <button onClick={onLogout} className="text-sm text-red-600">Logout</button>
      </div>
    </header>
  );
}