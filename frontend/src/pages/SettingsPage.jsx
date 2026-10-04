import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function SettingsPage() {
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    shelter_name: '',
    phone: '',
    email: '',
    address: '',
    website_info: '',
    currency: 'INR',
    admin_username: '',
    admin_new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await api.getSettings();
        if (res.success && res.data) {
          setFormData(prev => ({
            ...prev,
            shelter_name: res.data.shelter_name || '',
            phone: res.data.phone || '',
            email: res.data.email || '',
            address: res.data.address || '',
            website_info: res.data.website_info || '',
            currency: res.data.currency || 'INR',
            admin_username: user?.username || ''
          }));
        }
      } catch (err) {
        showToast(err.message || 'Failed to load settings', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.admin_new_password && formData.admin_new_password !== formData.confirm_password) {
      showToast('Admin password confirmation does not match.', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await api.updateSettings(formData);
      if (res.success) {
        showToast('Shelter profile and administrative settings saved successfully!');
        setFormData(prev => ({ ...prev, admin_new_password: '', confirm_password: '' }));
      }
    } catch (err) {
      showToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Retrieving sanctuary profile & settings..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Shelter Profile & Administrative Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">Manage public shelter branding, contact details, and administrator credentials</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Shelter Identity */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-800 text-base border-b border-slate-100 pb-3">
            Shelter Identity & Public Branding
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Shelter / Organization Name *</label>
            <input
              type="text"
              required
              value={formData.shelter_name}
              onChange={e => setFormData({ ...formData, shelter_name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Official Phone *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Official Contact Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Sanctuary Physical Address *</label>
            <textarea
              rows={2}
              required
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Public Mission / About Information</label>
            <textarea
              rows={3}
              value={formData.website_info}
              onChange={e => setFormData({ ...formData, website_info: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
            ></textarea>
          </div>
        </div>

        {/* Administrator Credentials & Security (Admin Only) */}
        {isAdmin && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">Master Administrator Credentials</h3>
                <p className="text-xs text-slate-500">The primary root admin account cannot be deleted or disabled</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black">
                PROTECTED ROOT
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Admin Username</label>
                <input
                  type="text"
                  value={formData.admin_username}
                  onChange={e => setFormData({ ...formData, admin_username: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Password (Optional)</label>
                <input
                  type="password"
                  placeholder="Leave blank to keep"
                  value={formData.admin_new_password}
                  onChange={e => setFormData({ ...formData, admin_new_password: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Repeat new password"
                  value={formData.confirm_password}
                  onChange={e => setFormData({ ...formData, confirm_password: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-sm shadow-md transition-all disabled:opacity-50"
          >
            {saving ? 'Updating Settings...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
