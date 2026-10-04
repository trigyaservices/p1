import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export default function NotificationsPage() {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications();
      if (res.success) {
        setNotifications(res.data || []);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (err) {
      showToast('Failed to update notification', 'error');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      showToast('All notifications cleared.');
    } catch (err) {
      showToast('Failed to clear notifications', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Alerts & Notifications</h1>
          <p className="text-xs text-slate-500 mt-0.5">Automated notifications for vaccines, meet & greets, and reviews</p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="px-4 py-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 font-bold text-xs hover:bg-teal-100 transition-colors"
        >
          Mark All Read
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {loading ? (
          <LoadingSpinner text="Fetching notification stream..." />
        ) : notifications.length === 0 ? (
          <div className="p-8">
            <EmptyState title="No Notifications" description="You have reviewed all incoming alerts." />
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              className={`p-5 flex items-start justify-between gap-4 transition-colors ${
                !n.is_read ? 'bg-teal-50/40' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div className={`p-2.5 rounded-xl text-lg flex-shrink-0 ${
                  n.type.includes('OVERDUE') ? 'bg-rose-100 text-rose-700' :
                  n.type.includes('DUE') ? 'bg-orange-100 text-orange-700' :
                  n.type.includes('ADOPTION') ? 'bg-blue-100 text-blue-700' :
                  'bg-teal-100 text-teal-700'
                }`}>
                  {n.type.includes('OVERDUE') ? '⚠️' :
                   n.type.includes('DUE') ? '⏰' :
                   n.type.includes('ADOPTION') ? '🏡' :
                   n.type.includes('VISIT') ? '🤝' : '🔔'}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-extrabold text-slate-900 text-sm">{n.title}</h4>
                    {!n.is_read && (
                      <span className="inline-block w-2 h-2 rounded-full bg-teal-600"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{new Date(n.created_at).toLocaleString()}</p>
                </div>
              </div>

              {!n.is_read && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="px-3 py-1 rounded-lg text-xs font-bold text-teal-700 hover:bg-teal-100 flex-shrink-0"
                >
                  Mark Read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
