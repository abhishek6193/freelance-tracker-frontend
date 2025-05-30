import React from 'react';
import { NavLink } from 'react-router-dom';

const SidebarNav: React.FC = () => {
  return (
    <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-200 min-h-screen p-4">
      <nav className="flex flex-col gap-2 mt-2">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `px-4 py-2 font-medium rounded transition-colors ${
              isActive
                ? 'bg-gray-100 text-primary font-semibold'
                : 'text-gray-700 hover:bg-gray-100'
            }`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/clients"
          className={({ isActive }) =>
            `px-4 py-2 font-medium rounded transition-colors ${
              isActive
                ? 'bg-gray-100 text-primary font-semibold'
                : 'text-gray-700 hover:bg-gray-100'
            }`
          }
        >
          Clients
        </NavLink>
        {/* Add more links as features are implemented */}
      </nav>
    </aside>
  );
};

export default SidebarNav;
