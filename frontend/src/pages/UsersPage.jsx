import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

export default function UsersPage() {
  const { user: currentUser, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // User Form Modal (Add / Edit)
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    email: '',
    phone: '',
    role: 'STAFF',
    permission_ids: []
  });

  // Reset Password Modal
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  // Delete Dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [uRes, pRes] = await Promise.all([
        api.getUsers(),
        api.getPermissionsList()
      ]);
      if (uRes.success) setUsers(uRes.data || []);
      if (pRes.success) setPermissions(pRes.data || []);
    } catch (err) {
      showToast(err.message || 'Failed to retrieve users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      username: '',
      password: '',
      email: '',
      phone: '',
      role: 'STAFF',
      // Default common staff permissions
      permission_ids: [1, 2, 5, 6, 7]
    });
    setUserModalOpen(true);
  };

  const handleOpenEdit = (u) => {
    setEditingUser(u);
    setFormData({
      name: u.name,
      username: u.username,
      password: '',
      email: u.email || '',
      phone: u.phone || '',
      role: u.role,
      permission_ids: u.permission_ids || []
    });
    setUserModalOpen(true);
  };

  const handleTogglePermission = (pId) => {
    setFormData(prev => {
      const current = prev.permission_ids || [];
      if (current.includes(pId)) {
        return { ...prev, permission_ids: current.filter(id => id !== pId) };
      } else {
        return { ...prev, permission_ids: [...current, pId] };
      }
    });
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingUser) {
        await api.updateUser(editingUser.id, formData);
        showToast('User profile and permissions updated.');
      } else {
        await api.createUser(formData);
        showToast(`User account '${formData.username}' created.`);
      }
      setUserModalOpen(false);
      fetchUsers();
    } catch (err) {
      showToast(err.message || 'Failed to save user', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (target) => {
    if (target.is_root) {
      showToast('Security Policy Violation: The primary Root Administrator cannot be disabled.', 'error');
      return;
    }
    const newStatus = target.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      const res = await api.toggleUserStatus(target.id, newStatus);
      if (res.success) {
        showToast(`User '${target.username}' marked as ${newStatus}.`);
        fetchUsers();
      }
    } catch (err) {
      showToast(err.message || 'Failed to toggle status', 'error');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.resetUserPassword(targetUser.id, newPassword);
      if (res.success) {
        showToast(`Password for ${targetUser.username} has been reset.`);
        setResetModalOpen(false);
        setNewPassword('');
      }
    } catch (err) {
      showToast(err.message || 'Failed to reset password', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    if (userToDelete.is_root) {
      showToast('Security Policy: The Root Administrator account can never be deleted.', 'error');
      setDeleteDialogOpen(false);
      return;
    }
    try {
      const res = await api.deleteUser(userToDelete.id);
      if (res.success) {
        showToast('User account deleted.');
        setDeleteDialogOpen(false);
        setUserToDelete(null);
        fetchUsers();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete user', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">User Accounts & Permissions</h1>
          <p className="text-xs text-slate-500 mt-0.5">Control staff access levels across all 13 shelter software modules</p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md transition-all flex items-center space-x-2"
          >
            <span>+ Add New User</span>
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading personnel directory..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3.5">User Profile</th>
                  <th scope="col" className="px-6 py-3.5">Role</th>
                  <th scope="col" className="px-6 py-3.5">Status</th>
                  <th scope="col" className="px-6 py-3.5">Assigned Permissions</th>
                  <th scope="col" className="px-6 py-3.5">Last Login</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* User Profile */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 font-black flex items-center justify-center text-sm shadow-sm">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-extrabold text-sm text-slate-900">{u.name}</span>
                            {u.is_root && (
                              <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded bg-amber-100 text-amber-800 border border-amber-200">
                                ROOT ADMIN
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-slate-500 text-[11px] block">{u.username} &bull; {u.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                        u.role === 'ADMIN' ? 'bg-amber-100 text-amber-800' :
                        u.role === 'STAFF' ? 'bg-teal-100 text-teal-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={u.status} type="user_status" />
                    </td>

                    {/* Permissions */}
                    <td className="px-6 py-4">
                      {u.role === 'ADMIN' ? (
                        <span className="inline-block px-2 py-0.5 rounded bg-teal-50 text-teal-800 text-[11px] font-bold border border-teal-200">
                          ALL PERMISSIONS (Root Bypass)
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {u.permissions?.map(code => (
                            <span key={code} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                              {code.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Last Login */}
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-[11px]">
                      {u.last_login_at ? new Date(u.last_login_at).toLocaleString() : 'Never logged in'}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-1.5">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                        title="Edit Details & Permissions"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => { setTargetUser(u); setNewPassword(''); setResetModalOpen(true); }}
                        className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 font-bold hover:bg-teal-100"
                        title="Reset Password"
                      >
                        Reset PW
                      </button>

                      {!u.is_root && (
                        <>
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`px-2.5 py-1 rounded-lg font-bold ${
                              u.status === 'ACTIVE'
                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {u.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                          </button>

                          <button
                            onClick={() => { setUserToDelete(u); setDeleteDialogOpen(true); }}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 font-bold hover:bg-rose-100"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit User Modal with 13 Permission Checkboxes */}
      <Modal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        title={editingUser ? `Edit Account & Permissions: ${editingUser.name}` : 'Create New Personnel Account'}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmitUser} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Sneha Kulkarni"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Username *</label>
              <input
                type="text"
                required
                disabled={Boolean(editingUser)}
                placeholder="e.g. sneha.vet"
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none disabled:bg-slate-100"
              />
            </div>
          </div>

          {!editingUser && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Initial Password *</label>
              <input
                type="password"
                required
                placeholder="Min 6 characters (e.g. Staff@123)"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Role *</label>
              <select
                value={formData.role}
                disabled={editingUser?.is_root}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white font-bold"
              >
                <option value="STAFF">STAFF</option>
                <option value="ADMIN">ADMIN</option>
                <option value="USER">USER / APPLICANT</option>
              </select>
            </div>
          </div>

          {/* Granular 13 Permissions Checkbox Matrix */}
          {formData.role !== 'ADMIN' && (
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <div>
                <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Module Permissions Checklist (13 Modules)
                </label>
                <p className="text-[11px] text-slate-500">
                  Select which modules this user account is authorized to view, modify, or execute.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 max-h-60 overflow-y-auto">
                {permissions.map(perm => {
                  const isChecked = formData.permission_ids?.includes(perm.id);
                  return (
                    <label
                      key={perm.id}
                      className={`flex items-start space-x-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-teal-50/80 border-teal-300 text-teal-950 font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleTogglePermission(perm.id)}
                        className="mt-0.5 rounded text-teal-700 focus:ring-teal-600"
                      />
                      <div className="text-xs">
                        <span className="block leading-tight">{perm.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">[{perm.code}]</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setUserModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save User Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title={`Reset Password for: ${targetUser?.username}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <p className="text-xs text-slate-600">
            Enter a new password for <strong>{targetUser?.name}</strong>. The user will be required to change it on their subsequent login.
          </p>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">New Temporary Password *</label>
            <input
              type="password"
              required
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setResetModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md disabled:opacity-50"
            >
              Confirm Password Reset
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete User Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title={`Delete User: ${userToDelete?.username}`}
        message={`Are you sure you want to permanently delete user account '${userToDelete?.name}'?`}
        confirmText="Yes, Delete User"
        isDanger={true}
      />
    </div>
  );
}
