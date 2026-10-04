import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

export default function VisitsPage() {
  const { hasPermission, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [visits, setVisits] = useState([]);
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Schedule Modal
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    application_id: '',
    pet_id: '',
    assigned_staff_id: '',
    visit_date: new Date().toISOString().split('T')[0],
    visit_time: '14:00',
    location: 'Main Shelter Meeting Courtyard',
    notes: ''
  });

  // Report Modal
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [activeVisit, setActiveVisit] = useState(null);
  const [reportData, setReportData] = useState({
    visit_result: 'Positive',
    recommendation: 'Highly recommended for adoption approval',
    report_notes: '',
    report_document_url: ''
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const [vRes, aRes, uRes] = await Promise.all([
        api.getVisits({ status: selectedStatus }),
        api.getAdoptionApplications({ limit: 100 }),
        api.getUsers({ limit: 50 })
      ]);

      if (vRes.success) setVisits(vRes.data || []);
      if (aRes.success) setApplications(aRes.data || []);
      if (uRes.success) setUsers(uRes.data || []);
    } catch (err) {
      showToast(err.message || 'Failed to load visits', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [selectedStatus]);

  const handleOpenSchedule = () => {
    const defaultApp = applications.find(a => ['PENDING', 'UNDER REVIEW', 'VISIT SCHEDULED'].includes(a.status)) || applications[0];
    setScheduleData({
      application_id: defaultApp?.id || '',
      pet_id: defaultApp?.pet_id || '',
      assigned_staff_id: users[0]?.id || '',
      visit_date: new Date().toISOString().split('T')[0],
      visit_time: '14:30',
      location: 'Main Shelter Meeting Courtyard',
      notes: ''
    });
    setScheduleModalOpen(true);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.scheduleVisit(scheduleData);
      if (res.success) {
        showToast('Visit successfully scheduled!');
        setScheduleModalOpen(false);
        fetchVisits();
      }
    } catch (err) {
      showToast(err.message || 'Failed to schedule visit', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenReport = (v) => {
    setActiveVisit(v);
    setReportData({
      visit_result: v.visit_result !== 'Pending' ? v.visit_result : 'Positive',
      recommendation: v.recommendation || 'The interaction went very well. Highly recommended.',
      report_notes: v.report_notes || '',
      report_document_url: v.report_document_url || ''
    });
    setReportModalOpen(true);
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.recordVisitReport(activeVisit.id, reportData);
      if (res.success) {
        showToast('Post-visit evaluation report filed successfully!');
        setReportModalOpen(false);
        fetchVisits();
      }
    } catch (err) {
      showToast(err.message || 'Failed to file report', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const canManage = isAdmin || hasPermission('VISITS');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Visit & Home Evaluation Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Schedule meet-and-greets, home checks, and record staff recommendations</p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenSchedule}
            className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md transition-all flex items-center space-x-2"
          >
            <span>+ Schedule New Visit</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {['All', 'SCHEDULED', 'COMPLETED', 'CANCELLED'].map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedStatus === st
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Visits Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Retrieving visit calendar..." />
        ) : visits.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Visits Found"
              description="No adoption meet-and-greet visits match this query."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Date & Time</th>
                  <th scope="col" className="px-6 py-3.5">Applicant</th>
                  <th scope="col" className="px-6 py-3.5">Pet</th>
                  <th scope="col" className="px-6 py-3.5">Location</th>
                  <th scope="col" className="px-6 py-3.5">Assigned Staff</th>
                  <th scope="col" className="px-6 py-3.5">Outcome</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {visits.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Date & Time */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-extrabold text-sm text-slate-900 block">{v.visit_date}</span>
                      <span className="text-teal-700 font-bold text-[11px]">⏰ {v.visit_time}</span>
                    </td>

                    {/* Applicant */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-slate-800 block text-sm">{v.applicant_name}</span>
                      <span className="text-slate-400 text-[11px]">{v.applicant_phone}</span>
                    </td>

                    {/* Pet */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-slate-800 block text-sm">{v.pet_name}</span>
                      <span className="text-teal-700 font-mono text-[11px]">{v.pet_code}</span>
                    </td>

                    {/* Location */}
                    <td className="px-6 py-4 text-slate-600">
                      📍 {v.location}
                    </td>

                    {/* Staff */}
                    <td className="px-6 py-4 whitespace-nowrap text-slate-700 font-medium">
                      👤 {v.staff_name || 'Unassigned'}
                    </td>

                    {/* Result */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        v.visit_result === 'Positive' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        v.visit_result === 'Negative' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                        'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {v.visit_result || 'Pending'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      {canManage && (
                        <button
                          onClick={() => handleOpenReport(v)}
                          className="px-3 py-1.5 rounded-xl bg-teal-50 text-teal-700 font-bold hover:bg-teal-100 transition-colors"
                        >
                          {v.status === 'COMPLETED' ? 'View/Edit Report' : 'File Report 📝'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schedule Visit Modal */}
      <Modal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        title="Schedule Adoption Visit"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Adoption Application *</label>
            <select
              required
              value={scheduleData.application_id}
              onChange={e => {
                const app = applications.find(a => String(a.id) === String(e.target.value));
                setScheduleData({
                  ...scheduleData,
                  application_id: e.target.value,
                  pet_id: app?.pet_id || ''
                });
              }}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white font-medium"
            >
              <option value="">Select Application</option>
              {applications.map(a => (
                <option key={a.id} value={a.id}>
                  {a.application_code} &bull; {a.applicant_name} (For: {a.pet_name})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Visit Date *</label>
              <input
                type="date"
                required
                value={scheduleData.visit_date}
                onChange={e => setScheduleData({ ...scheduleData, visit_date: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Visit Time *</label>
              <input
                type="time"
                required
                value={scheduleData.visit_time}
                onChange={e => setScheduleData({ ...scheduleData, visit_time: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Staff Member</label>
              <select
                value={scheduleData.assigned_staff_id}
                onChange={e => setScheduleData({ ...scheduleData, assigned_staff_id: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white font-medium"
              >
                <option value="">Select Staff</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Location *</label>
              <input
                type="text"
                required
                placeholder="e.g. Shelter Courtyard or Applicant Residence"
                value={scheduleData.location}
                onChange={e => setScheduleData({ ...scheduleData, location: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Instructions & Staff Notes</label>
            <textarea
              rows={2}
              placeholder="Provide briefing notes for the staff..."
              value={scheduleData.notes}
              onChange={e => setScheduleData({ ...scheduleData, notes: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
            ></textarea>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setScheduleModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md disabled:opacity-50"
            >
              {submitting ? 'Scheduling...' : 'Confirm Schedule'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Visit Report Modal */}
      <Modal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title={`Visit Report: ${activeVisit?.applicant_name} & ${activeVisit?.pet_name}`}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleReportSubmit} className="space-y-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <strong>Visit Evaluation:</strong> Record the bonding observed between the applicant and the pet, boundary safety, and staff recommendation.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Visit Result *</label>
              <select
                value={reportData.visit_result}
                onChange={e => setReportData({ ...reportData, visit_result: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white font-bold"
              >
                <option value="Positive">Positive (Bonding Confirmed)</option>
                <option value="Neutral">Neutral (Follow-up needed)</option>
                <option value="Negative">Negative (Not Recommended)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Staff Recommendation *</label>
              <input
                type="text"
                required
                placeholder="e.g. Approve for immediate adoption"
                value={reportData.recommendation}
                onChange={e => setReportData({ ...reportData, recommendation: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Observations & Notes</label>
            <textarea
              rows={3}
              placeholder="Detail family behavior, home fence height, interaction observations..."
              value={reportData.report_notes}
              onChange={e => setReportData({ ...reportData, report_notes: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Uploaded Document URL</label>
            <input
              type="text"
              placeholder="Optional photo or inspection report document link"
              value={reportData.report_document_url}
              onChange={e => setReportData({ ...reportData, report_document_url: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setReportModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Visit Report'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
