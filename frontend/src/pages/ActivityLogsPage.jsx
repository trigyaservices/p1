import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ActivityLogsPage() {
  const { showToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState('All');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getActivityLogs({
        action: selectedAction !== 'All' ? selectedAction : undefined,
        search
      });
      if (res.success) setLogs(res.data || []);
    } catch (err) {
      showToast(err.message || 'Failed to load audit logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search, selectedAction]);

  const actions = [
    'All', 'LOGIN', 'ADD_PET', 'EDIT_PET', 'DELETE_PET',
    'ADD_MEDICAL_RECORD', 'ADD_VACCINATION', 'APPROVE_ADOPTION',
    'REJECT_APPLICATION', 'SCHEDULE_VISIT', 'UPDATE_SETTINGS', 'CREATE_USER'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Audit Trail & Activity Logs</h1>
          <p className="text-xs text-slate-500 mt-0.5">Comprehensive chronological log of user logins, records created, and state updates</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Search by username, action, or details..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
        />

        <select
          value={selectedAction}
          onChange={e => setSelectedAction(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white font-medium"
        >
          {actions.map(act => (
            <option key={act} value={act}>{act === 'All' ? 'All System Operations' : act}</option>
          ))}
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Retrieving audit records..." />
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No activity recorded for this criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Timestamp</th>
                  <th scope="col" className="px-6 py-3.5">Operator</th>
                  <th scope="col" className="px-6 py-3.5">Action Code</th>
                  <th scope="col" className="px-6 py-3.5">Transaction Details</th>
                  <th scope="col" className="px-6 py-3.5">Network IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white font-medium">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 whitespace-nowrap text-slate-500">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap font-bold text-slate-900">
                      👤 {log.user_name}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 text-slate-800 border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-700">
                      {log.details}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap font-mono text-[11px] text-slate-400">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
