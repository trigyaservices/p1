import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

export default function MonthlyReportsPage({ onNavigate }) {
  const { hasPermission, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [reports, setReports] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPetId, setSelectedPetId] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    pet_id: '',
    report_month: new Date().toISOString().substring(0, 7), // 'YYYY-MM'
    weight: '',
    health_condition: '',
    behaviour: '',
    food: '',
    treatment: '',
    remarks: '',
    document_url: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [repRes, petsRes] = await Promise.all([
        api.getMonthlyReports({
          pet_id: selectedPetId !== 'All' ? selectedPetId : undefined,
          month: selectedMonth || undefined
        }),
        api.getPets({ limit: 100 })
      ]);

      if (repRes.success) setReports(repRes.data || []);
      if (petsRes.success) setPets(petsRes.data || []);
    } catch (err) {
      showToast(err.message || 'Failed to fetch monthly reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedPetId, selectedMonth]);

  const handleOpenCreate = () => {
    setFormData({
      pet_id: pets[0]?.id || '',
      report_month: new Date().toISOString().substring(0, 7),
      weight: pets[0]?.weight || '',
      health_condition: 'Active, healthy, normal appetite',
      behaviour: 'Social, gentle, comfortable with handlers',
      food: 'High-protein diet twice daily',
      treatment: 'Routine parasite check',
      remarks: 'Maintaining optimal fitness and ready for matching.',
      document_url: ''
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.createMonthlyReport(formData);
      if (res.success) {
        showToast('Monthly progress report logged successfully!');
        setModalOpen(false);
        fetchData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to file monthly report', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const canManage = isAdmin || hasPermission('MONTHLY_REPORTS');

  // Month names helper for timeline representation
  const formatMonthName = (yearMonth) => {
    if (!yearMonth) return '';
    const [y, m] = yearMonth.split('-');
    const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Monthly Pet Progress Reports</h1>
          <p className="text-xs text-slate-500 mt-0.5">Continuous evaluation tracking monthly weight, food, behaviour, and medical state</p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md transition-all flex items-center space-x-2"
          >
            <span>+ Create Monthly Report</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Filter by Pet</label>
          <select
            value={selectedPetId}
            onChange={e => setSelectedPetId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white font-medium"
          >
            <option value="All">All Shelter Animals</option>
            {pets.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.pet_code})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Filter by Month</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white"
          />
        </div>
      </div>

      {/* Timeline Progression Container */}
      <div className="space-y-6">
        {loading ? (
          <LoadingSpinner text="Retrieving monthly progress timeline..." />
        ) : reports.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <EmptyState
              title="No Monthly Reports Filed"
              description="Select a pet and file their progress report for the current month."
            />
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report, idx) => (
              <div
                key={report.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                {/* Left side: Pet & Month badge */}
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-teal-100/70 border border-teal-200 flex flex-col items-center justify-center text-teal-800 font-black text-xs shadow-sm flex-shrink-0">
                    <span className="text-[10px] uppercase font-bold text-teal-600">Month</span>
                    <span className="text-base">{report.report_month.split('-')[1]}</span>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-black text-slate-900">{report.pet_name}</h3>
                      <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                        {report.pet_code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">
                      📅 {formatMonthName(report.report_month)} &bull; Species: {report.animal_type}
                    </p>
                  </div>
                </div>

                {/* Middle details: Weight, health, food */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 flex-1 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block font-semibold">Weight Recorded</span>
                    <span className="text-sm font-extrabold text-slate-800">{report.weight} kg</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block font-semibold">Health Condition</span>
                    <span className="font-bold text-teal-800 truncate block">{report.health_condition}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block font-semibold">Food & Diet</span>
                    <span className="font-bold text-slate-700 truncate block">{report.food}</span>
                  </div>
                </div>

                {/* Right Action */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onNavigate('pet-detail', report.pet_id)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Pet Dossier &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Monthly Report Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="File Monthly Health & Progress Report"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Pet *</label>
              <select
                required
                value={formData.pet_id}
                onChange={e => setFormData({ ...formData, pet_id: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white font-medium"
              >
                <option value="">Select Pet</option>
                {pets.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.pet_code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Report Month (YYYY-MM) *</label>
              <input
                type="month"
                required
                value={formData.report_month}
                onChange={e => setFormData({ ...formData, report_month: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Current Weight (kg) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="e.g. 28.5"
                value={formData.weight}
                onChange={e => setFormData({ ...formData, weight: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Diet / Food Protocol *</label>
              <input
                type="text"
                required
                placeholder="e.g. Royal Canin 400g daily"
                value={formData.food}
                onChange={e => setFormData({ ...formData, food: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">General Health Condition *</label>
            <input
              type="text"
              required
              placeholder="e.g. Energetic pulse, clear coat, optimal vitals"
              value={formData.health_condition}
              onChange={e => setFormData({ ...formData, health_condition: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Behaviour & Socialization *</label>
            <input
              type="text"
              required
              placeholder="e.g. Eager to interact, responds to name, calm during grooming"
              value={formData.behaviour}
              onChange={e => setFormData({ ...formData, behaviour: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Treatment / Supplements Given</label>
            <input
              type="text"
              placeholder="e.g. Daily calcium tablet, multivitamin gel"
              value={formData.treatment}
              onChange={e => setFormData({ ...formData, treatment: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Remarks & Observations</label>
            <textarea
              rows={2}
              placeholder="General progress notes for the month..."
              value={formData.remarks}
              onChange={e => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
            ></textarea>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'File Monthly Report'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
