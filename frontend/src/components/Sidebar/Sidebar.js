import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-4 flex flex-col">
      {/* Title and Description */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-white">CRM App</h2>
        <p className="text-sm text-gray-400">Manage your appointments</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-grow"> {/* Use flex-grow to push the menu down */}
        <ul className="space-y-4">
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive
                  ? "text-blue-400 font-bold block py-2 px-4 rounded-md"
                  : "text-white block py-2 px-4 rounded-md hover:bg-gray-700"
              }
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/clients"
              className={({ isActive }) =>
                isActive
                  ? "text-blue-400 font-bold block py-2 px-4 rounded-md"
                  : "text-white block py-2 px-4 rounded-md hover:bg-gray-700"
              }
            >
              Clients
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/calendar"
              className={({ isActive }) =>
                isActive
                  ? "text-blue-400 font-bold block py-2 px-4 rounded-md"
                  : "text-white block py-2 px-4 rounded-md hover:bg-gray-700"
              }
            >
              Calendar
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/appointments"
              className={({ isActive }) =>
                isActive
                  ? "text-blue-400 font-bold block py-2 px-4 rounded-md"
                  : "text-white block py-2 px-4 rounded-md hover:bg-gray-700"
              }
            >
              Appointments
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
