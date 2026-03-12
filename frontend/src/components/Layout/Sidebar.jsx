import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  BuildingOfficeIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  XMarkIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Students', href: '/students', icon: UsersIcon },
  { name: 'Rooms', href: '/rooms', icon: BuildingOfficeIcon },
  { name: 'Allocations', href: '/allocations', icon: ClipboardDocumentListIcon },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon },
];

function Sidebar({ onClose }) {
  return (
    <div className="h-full w-64 flex flex-col" style={{
      background: 'linear-gradient(160deg, #1e3a5f 0%, #0f2540 60%, #0a1929 100%)'
    }}>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-lg shadow-lg">
            <AcademicCapIcon className="h-5 w-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">ExamHall</span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <p className="px-3 mb-3 text-xs font-semibold uppercase tracking-widest text-blue-300/60">
          Main Menu
        </p>
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={onClose}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                ? 'bg-blue-500/20 text-white border border-blue-400/30 shadow-sm'
                : 'text-blue-100/70 hover:bg-white/8 hover:text-white'
              }`
            }
          >
            <item.icon className="h-5 w-5 flex-shrink-0 opacity-80" aria-hidden="true" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow">
            EH
          </div>
          <div>
            <p className="text-white/50 text-xs">v1.0.0 · © 2024 ExamHall</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;