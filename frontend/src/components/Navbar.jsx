import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function Navbar({ onNavigate, activePage }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      api.getNotifications()
        .then(res => {
          if (res.success) {
            setUnreadCount(res.unreadCount || 0);
            setNotifications(res.data || []);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="w-10 h-10 rounded-xl bg-teal-700 flex items-center justify-center text-white font-black text-xl shadow-md">
              🐾
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">Paws & Care</span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700 rounded-full">
                Sanctuary & Rescue
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => onNavigate('home')}
              className={`text-sm font-semibold transition-colors ${
                activePage === 'home' ? 'text-teal-700 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('public-pets')}
              className={`text-sm font-semibold transition-colors ${
                activePage === 'public-pets' ? 'text-teal-700 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Adopt a Pet
            </button>
            <button
              onClick={() => onNavigate('home', 'how-it-works')}
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              How Adoption Works
            </button>
            <button
              onClick={() => onNavigate('home', 'contact')}
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Contact Us
            </button>
          </div>

          {/* Right Action Area */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                    className="relative p-2 rounded-xl text-slate-600 hover:text-teal-700 hover:bg-slate-100 transition-colors"
                    title="Notifications"
                  >
                    <span className="text-xl">🔔</span>
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-100 py-3 z-50 animate-fadeIn">
                      <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                        <span className="font-bold text-sm text-slate-800">Notifications ({unreadCount} unread)</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-teal-700 hover:underline font-semibold"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                        {notifications.length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-6">No notifications yet.</p>
                        ) : (
                          notifications.slice(0, 6).map(n => (
                            <div
                              key={n.id}
                              onClick={() => {
                                api.markNotificationRead(n.id);
                                setUnreadCount(prev => Math.max(0, prev - 1));
                                setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, is_read: 1 } : item));
                              }}
                              className={`p-3 text-left hover:bg-slate-50 cursor-pointer transition-colors ${
                                !n.is_read ? 'bg-teal-50/50' : ''
                              }`}
                            >
                              <p className="text-xs font-bold text-slate-800">{n.title}</p>
                              <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                              <p className="text-[9px] text-slate-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="pt-2 px-3 border-t border-slate-100 text-center">
                        <button
                          onClick={() => {
                            setNotifDropdownOpen(false);
                            onNavigate('notifications');
                          }}
                          className="text-xs font-bold text-teal-700 hover:text-teal-900"
                        >
                          View All Notifications &rarr;
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Dashboard Shortcut */}
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-700 text-white font-semibold text-sm hover:bg-teal-800 shadow-sm transition-colors flex items-center space-x-1.5"
                >
                  <span>Portal</span>
                  <span className="text-xs opacity-75">({user?.role})</span>
                </button>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="px-4 py-2 rounded-xl bg-teal-700 text-white font-bold text-sm hover:bg-teal-800 shadow-sm transition-colors flex items-center space-x-2"
              >
                <span>Staff / User Login</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900"
              >
                <span className="text-xl">&#9776;</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
          <button
            onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
            className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Home
          </button>
          <button
            onClick={() => { onNavigate('public-pets'); setMobileMenuOpen(false); }}
            className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Adopt a Pet
          </button>
          {isAuthenticated ? (
            <>
              <button
                onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false); }}
                className="block w-full text-left px-3 py-2 rounded-lg text-base font-bold text-teal-700 bg-teal-50"
              >
                Portal Dashboard
              </button>
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-rose-600 hover:bg-rose-50"
              >
                Logout ({user?.username})
              </button>
            </>
          ) : (
            <button
              onClick={() => { onNavigate('login'); setMobileMenuOpen(false); }}
              className="block w-full text-left px-3 py-2 rounded-lg text-base font-bold text-teal-700 hover:bg-teal-50"
            >
              Sign In
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
