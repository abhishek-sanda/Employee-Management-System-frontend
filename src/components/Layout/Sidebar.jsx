import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const linkCls = ({ isActive }) =>
    `block px-4 py-3 hover:bg-gray-100 ${isActive ? 'bg-gray-100 font-medium' : ''}`;

  return (
    <aside className="w-56 bg-white border-r min-h-screen p-4">
      <nav className="space-y-1">
        <NavLink to="/" className={linkCls} end>Dashboard</NavLink>
        <NavLink to="/employees" className={linkCls}>Employees</NavLink>
      </nav>
    </aside>
  );
}