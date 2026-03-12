import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

function Navbar({ onMenuClick }) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = window.location.pathname.split('/')[1];
    if (!path) return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left: hamburger + page title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Bars3Icon className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-none">{getPageTitle()}</h1>
              <p className="text-xs text-gray-400 leading-none mt-0.5">Exam Hall Allocation</p>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <button className="relative p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <BellIcon className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 block h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-200 mx-1" />

            {/* Admin info */}
            <div className="flex items-center gap-2.5 px-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm">
                <span className="text-white text-xs font-bold">
                  {(admin?.name || 'A').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-800 leading-tight">{admin?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-400 leading-tight">{admin?.username || 'admin'}</p>
              </div>
            </div>

            {/* Logout */}
            <button
              id="logout-btn"
              onClick={handleLogout}
              title="Logout"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all text-sm font-medium"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              <span className="hidden md:block">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;