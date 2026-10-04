import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

export default function VaccinationPage() {
  const { hasPermission, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [vaccinations, setVaccinations] = useState([]);
  const [alerts, setAlerts] = useState({ overdue: [], dueSoon: [], overdueCount: 0, dueSoonCount: 0 });
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVac, setEditingVac] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    pet_id: '',
    vaccine_name: '',
    record_type: 'Vaccination',
    vaccine_date: new Date().toISOString().split('T')[0],
    next_due_date: '',
    vet_name: 'Dr. Aakash Sharma',
    notes: '',
    certificate_url: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vacRes, alertRes, petsRes] = await Promise.all([
        api.getVaccinations({ status: selectedStatus, record_type: selectedType }),
        api.getVaccinationAlerts(),
        api.getPets({ limit: 100 })
      ]);

      if (vacRes.success) setVaccinations(vacRes.data || []);
      if (alertRes.success) setAlerts(alertRes.data);
      if (petsRes.success) setPets(petsRes.data || []);
    } catch (err) {
      showToast(err.message || 'Failed to load vaccination data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedStatus, selectedType]);

  const handleOpenCreate = () => {
    setEditingVac(null);
    const defaultNextDue = new Date();
    defaultNextDue.setFullYear(defaultNextDue.getFullYear() + 1);
    setFormData({
      pet_id: pets[0]?.id || '',
      vaccine_name: '',
      record_type: 'Vaccination',
      vaccine_date: new Date().toISOString().split('T')[0],
      next_due_date: defaultNextDue.toISOString().split('T')[0],
      vet_name: 'Dr. Aakash Sharma',
      notes: '',
      certificate_url: ''
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (v) => {
    setEditingVac(v);
    setFormData({
      pet_id: v.pet_id,
      vaccine_name: v.vaccine_name,
      record_type: v.record_type,
      vaccine_date: v.vaccine_date,
      next_due_date: v.next_due_date,
      vet_name: v.vet_name,
      notes: v.notes || '',
      certificate_url: v.certificate_url || ''
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingVac) {
        await api.updateVaccination(editingVac.id, formData);
        showToast('Vaccination schedule updated!');
      } else {
        await api.createVaccination(formData);
        showToast('Preventive immunization scheduled successfully!');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to save vaccination', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vaccination schedule entry?')) return;
    try {
      await api.deleteVaccination(id);
      showToast('Vaccination entry deleted.');
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to delete', 'error');
    }
  };

  const canManage = isAdmin || hasPermission('VACCINATION');
  const recordTypes = ['All', 'Vaccination', 'Deworming', 'Vet Check-up', 'Medicine Reminder', 'Other Health Reminder'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Vaccination & Preventative Health</h1>
          <p className="text-xs text-slate-500 mt-0.5">Automated deadline monitoring with green, orange, and red urgency alerts</p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md transition-all flex items-center space-x-2"
          >
            <span>+ Schedule Vaccine / Reminder</span>
          </button>
        )}
      </div>

      {/* Critical Alert Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Overdue (Red) Banner */}
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start space-x-3.5 shadow-sm">
          <div className="p-2 rounded-xl bg-rose-600 text-white text-lg font-bold flex-shrink-0">
            ⚠️
          </div>
          <div>
            <h4 className="font-extrabold text-rose-900 text-sm">
              Overdue Vaccinations ({alerts.overdueCount})
            </h4>
            <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
              Animals whose scheduled boosters are past due. Immediate veterinary recall recommended.
            </p>
          </div>
        </div>

        {/* Due Soon (Orange) Banner */}
        <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 flex items-start space-x-3.5 shadow-sm">
          <div className="p-2 rounded-xl bg-orange-500 text-white text-lg font-bold flex-shrink-0">
            ⏰
          </div>
          <div>
            <h4 className="font-extrabold text-orange-900 text-sm">
              Due Within 7 Days ({alerts.dueSoonCount})
            </h4>
            <p className="text-xs text-orange-700 mt-0.5 leading-relaxed">
              Health reminders and boosters scheduled within the coming week.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {['All', 'UPCOMING', 'DUE_SOON', 'OVERDUE'].map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedStatus === status
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status === 'All' ? 'All Schedules' : status.replace('_', ' ')}
            </button>
          ))}
        </div>

        <select
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
          className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white"
        >
          {recordTypes.map(t => (
            <option key={t} value={t}>{t === 'All' ? 'All Health Categories' : t}</option>
          ))}
        </select>
      </div>

      {/* Table of Vaccinations */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Analyzing immunization dates..." />
        ) : vaccinations.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Vaccinations Listed"
              description="No health reminders match the current filter selection."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Pet Details</th>
                  <th scope="col" className="px-6 py-3.5">Treatment / Vaccine</th>
                  <th scope="col" className="px-6 py-3.5">Last Given</th>
                  <th scope="col" className="px-6 py-3.5">Next Due Date</th>
                  <th scope="col" className="px-6 py-3.5">Calculated Urgency</th>
                  <th scope="col" className="px-6 py-3.5">Veterinarian</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {vaccinations.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-extrabold text-sm text-slate-900 block">{v.pet_name}</span>
                      <span className="font-mono text-[11px] text-teal-700">{v.pet_code}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 text-sm block">{v.vaccine_name}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded inline-block mt-0.5">
                        {v.record_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                      {v.vaccine_date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900">
                      {v.next_due_date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={v.computed_status} type="vaccination" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                      {v.vet_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      {canManage && (
                        <>
                          <button
                            onClick={() => handleOpenEdit(v)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => handleDelete(v.id)}
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

      {/* Add / Edit Vaccination Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingVac ? 'Update Immunization Record' : 'Schedule Vaccine or Health Reminder'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Pet *</label>
              <select
                required
                value={formData.pet_id}
                onChange={e => setFormData({ ...formData, pet_id: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white font-medium"
              >
                <option value="">Select a Pet</option>
                {pets.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.pet_code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reminder Category *</label>
              <select
                value={formData.record_type}
                onChange={e => setFormData({ ...formData, record_type: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white font-medium"
              >
                <option value="Vaccination">Vaccination</option>
                <option value="Deworming">Deworming</option>
                <option value="Vet Check-up">Vet Check-up</option>
                <option value="Medicine Reminder">Medicine Reminder</option>
                <option value="Other Health Reminder">Other Health Reminder</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Vaccine / Medication Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Anti-Rabies Booster, DHPPi 7-in-1"
              value={formData.vaccine_name}
              onChange={e => setFormData({ ...formData, vaccine_name: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date Administered *</label>
              <input
                type="date"
                required
                value={formData.vaccine_date}
                onChange={e => setFormData({ ...formData, vaccine_date: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Next Due Date (Booster) *</label>
              <input
                type="date"
                required
                value={formData.next_due_date}
                onChange={e => setFormData({ ...formData, next_due_date: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Veterinarian Name *</label>
              <input
                type="text"
                required
                value={formData.vet_name}
                onChange={e => setFormData({ ...formData, vet_name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Certificate Document URL</label>
              <input
                type="text"
                placeholder="Optional certificate link"
                value={formData.certificate_url}
                onChange={e => setFormData({ ...formData, certificate_url: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Pet tolerated injection well, no allergic reactions."
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
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
              {submitting ? 'Saving...' : 'Save Schedule'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
