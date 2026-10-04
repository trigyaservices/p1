import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

export default function FosterPage({ onNavigate }) {
  const { hasPermission, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [fosters, setFosters] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    pet_id: '',
    foster_person: '',
    mobile: '',
    address: '',
    start_date: new Date().toISOString().split('T')[0],
    expected_end_date: '',
    pet_condition: 'Healthy, undergoing temporary socialization',
    notes: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fRes, pRes] = await Promise.all([
        api.getFosterRecords({ status: selectedStatus }),
        api.getPets({ limit: 100 })
      ]);

      if (fRes.success) setFosters(fRes.data || []);
      if (pRes.success) setPets(pRes.data || []);
    } catch (err) {
      showToast(err.message || 'Failed to load foster records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedStatus]);

  const handleOpenCreate = () => {
    const candidatePets = pets.filter(p => ['Available', 'Under Treatment'].includes(p.adoption_status));
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);

    setFormData({
      pet_id: candidatePets[0]?.id || pets[0]?.id || '',
      foster_person: '',
      mobile: '',
      address: '',
      start_date: new Date().toISOString().split('T')[0],
      expected_end_date: nextMonth.toISOString().split('T')[0],
      pet_condition: 'Healthy, needs calm environment and socialization',
      notes: ''
    });
    setModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.createFosterPlacement(formData);
      if (res.success) {
        showToast(res.message || 'Foster placement recorded!');
        setModalOpen(false);
        fetchData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to record foster care', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturnPet = async (fosterId, petName) => {
    const notes = window.prompt(`Confirm return of ${petName} back to shelter. Enter condition notes:`, 'Returned in excellent health');
    if (notes === null) return;

    try {
      const res = await api.returnFromFoster(fosterId, {
        return_status: 'RETURNED',
        return_notes: notes
      });
      if (res.success) {
        showToast(res.message || 'Pet returned to sanctuary!');
        fetchData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to process return', 'error');
    }
  };

  const canManage = isAdmin || hasPermission('EDIT_PET');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Foster Care Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track temporary home placements, socialization caregivers, and return schedules</p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md transition-all flex items-center space-x-2"
          >
            <span>+ Place Pet in Foster Care</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {['All', 'ACTIVE', 'RETURNED', 'ADOPTED_BY_FOSTER'].map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedStatus === st
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'All' ? 'All Placements' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Foster Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Retrieving foster placements..." />
        ) : fosters.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Foster Records"
              description="No active or past foster records found."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Foster Animal</th>
                  <th scope="col" className="px-6 py-3.5">Caregiver Person</th>
                  <th scope="col" className="px-6 py-3.5">Timeline Dates</th>
                  <th scope="col" className="px-6 py-3.5">Condition at Placement</th>
                  <th scope="col" className="px-6 py-3.5">Status</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {fosters.map(f => (
                  <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Animal */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-extrabold text-sm text-slate-900 block">{f.pet_name}</span>
                      <span className="font-mono text-[11px] text-teal-700">{f.pet_code} &bull; {f.breed}</span>
                    </td>

                    {/* Caregiver */}
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-800 block text-sm">{f.foster_person}</span>
                      <span className="text-slate-400 text-[11px]">{f.mobile}</span>
                      <span className="text-slate-500 text-[11px] block truncate max-w-xs">{f.address}</span>
                    </td>

                    {/* Timeline */}
                    <td className="px-6 py-4 whitespace-nowrap text-slate-700">
                      <span className="block font-medium">Start: {f.start_date}</span>
                      <span className="text-teal-700 font-bold text-[11px] block">Expected End: {f.expected_end_date}</span>
                      {f.actual_end_date && (
                        <span className="text-slate-400 text-[11px] block">Returned: {f.actual_end_date}</span>
                      )}
                    </td>

                    {/* Condition */}
                    <td className="px-6 py-4 text-slate-600">
                      <p className="truncate max-w-xs">{f.pet_condition}</p>
                      {f.notes && <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-xs">{f.notes}</p>}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        f.status === 'ACTIVE' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                        f.status === 'RETURNED' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                        'bg-teal-100 text-teal-800 border border-teal-200'
                      }`}>
                        {f.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      {f.status === 'ACTIVE' && canManage && (
                        <button
                          onClick={() => handleReturnPet(f.id, f.pet_name)}
                          className="px-3 py-1.5 rounded-xl bg-orange-50 text-orange-700 font-bold hover:bg-orange-100 transition-colors shadow-sm"
                        >
                          Conclude / Return Pet 🏡
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

      {/* Modal: New Foster Placement */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Place Animal in Foster Care"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Animal *</label>
              <select
                required
                value={formData.pet_id}
                onChange={e => setFormData({ ...formData, pet_id: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white font-medium"
              >
                <option value="">Select Pet</option>
                {pets.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.pet_code}) - {p.adoption_status}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Foster Caregiver Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Sneha Joshi"
                value={formData.foster_person}
                onChange={e => setFormData({ ...formData, foster_person: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Contact *</label>
              <input
                type="text"
                required
                placeholder="+91 9822334455"
                value={formData.mobile}
                onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Placement Address *</label>
              <input
                type="text"
                required
                placeholder="Residence area, building, street"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Expected End Date *</label>
              <input
                type="date"
                required
                value={formData.expected_end_date}
                onChange={e => setFormData({ ...formData, expected_end_date: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Pet Condition at Handover *</label>
            <input
              type="text"
              required
              placeholder="e.g. Healthy, timid, socialisation required"
              value={formData.pet_condition}
              onChange={e => setFormData({ ...formData, pet_condition: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Instructions</label>
            <textarea
              rows={2}
              placeholder="Care instructions, dietary preferences..."
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
            ></textarea>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md disabled:opacity-50"
            >
              {submitting ? 'Placing...' : 'Confirm Foster Placement'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
