import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activePage, onNavigate }) {
  const { user, hasPermission, logout, isAdmin } = useAuth();

  // Navigation Items matching the required 13 modules + dashboard + notifications
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', requiredPermission: null },
    { id: 'pets', label: 'Pet Management', icon: '🐶', requiredPermission: 'VIEW_PETS' },
    { id: 'rescue', label: 'Rescue Operations', icon: '🚑', requiredPermission: 'VIEW_PETS' },
    { id: 'medical', label: 'Medical Records', icon: '🩺', requiredPermission: 'MEDICAL' },
    { id: 'vaccinations', label: 'Vaccination Alerts', icon: '💉', requiredPermission: 'VACCINATION' },
    { id: 'monthly-reports', label: 'Monthly Reports', icon: '📋', requiredPermission: 'MONTHLY_REPORTS' },
    { id: 'adoptions', label: 'Adoption Pipeline', icon: '🏡', requiredPermission: 'ADOPTION' },
    { id: 'visits', label: 'Visit Management', icon: '🤝', requiredPermission: 'VISITS' },
    { id: 'foster', label: 'Foster Care', icon: '🌿', requiredPermission: 'VIEW_PETS' },
    { id: 'users', label: 'User & Permissions', icon: '👥', requiredPermission: 'USER_MANAGEMENT' },
    { id: 'reports', label: 'System Reports', icon: '📈', requiredPermission: 'REPORTS' },
    { id: 'notifications', label: 'Notifications', icon: '🔔', requiredPermission: null },
    { id: 'activity-logs', label: 'Audit Trail', icon: '📜', adminOnly: true },
    { id: 'settings', label: 'Shelter Settings', icon: '⚙️', requiredPermission: 'SETTINGS' }
  ];

  const visibleItems = navItems.filter(item => {
    if (isAdmin) return true;
    if (item.adminOnly) return false;
    if (!item.requiredPermission) return true;
    return hasPermission(item.requiredPermission);
  });

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col justify-between min-h-[calc(100vh-4rem)] border-r border-slate-800">
      <div className="p-4 space-y-6">
        {/* User Card */}
        <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center text-base shadow-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-bold text-white truncate">{user?.name}</h4>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className={`inline-block w-2 h-2 rounded-full ${user?.role === 'ADMIN' ? 'bg-amber-400' : 'bg-teal-400'}`}></span>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Management Modules</p>
          {visibleItems.map(item => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-800/80">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
        >
          <span className="text-lg">🚪</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
