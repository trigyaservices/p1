import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

export default function MedicalPage() {
  const { hasPermission, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [records, setRecords] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPet, setSelectedPet] = useState('All');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    pet_id: '',
    record_date: new Date().toISOString().split('T')[0],
    vet_name: 'Dr. Aakash Sharma',
    diagnosis: '',
    symptoms: '',
    treatment: '',
    medicine: '',
    notes: '',
    document_url: ''
  });

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await api.getMedicalRecords({
        pet_id: selectedPet !== 'All' ? selectedPet : undefined,
        search
      });
      if (res.success) setRecords(res.data || []);

      const petsRes = await api.getPets({ limit: 100 });
      if (petsRes.success) setPets(petsRes.data || []);
    } catch (err) {
      showToast(err.message || 'Failed to load medical records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [search, selectedPet]);

  const handleOpenCreate = () => {
    setEditingRecord(null);
    setFormData({
      pet_id: pets[0]?.id || '',
      record_date: new Date().toISOString().split('T')[0],
      vet_name: 'Dr. Aakash Sharma',
      diagnosis: '',
      symptoms: '',
      treatment: '',
      medicine: '',
      notes: '',
      document_url: ''
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (rec) => {
    setEditingRecord(rec);
    setFormData({
      pet_id: rec.pet_id,
      record_date: rec.record_date,
      vet_name: rec.vet_name,
      diagnosis: rec.diagnosis,
      symptoms: rec.symptoms || '',
      treatment: rec.treatment,
      medicine: rec.medicine || '',
      notes: rec.notes || '',
      document_url: rec.document_url || ''
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingRecord) {
        await api.updateMedicalRecord(editingRecord.id, formData);
        showToast('Medical record updated successfully!');
      } else {
        await api.createMedicalRecord(formData);
        showToast('Clinical medical record filed successfully!');
      }
      setModalOpen(false);
      fetchRecords();
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!recordToDelete) return;
    try {
      await api.deleteMedicalRecord(recordToDelete.id);
      showToast('Medical record deleted.');
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
      fetchRecords();
    } catch (err) {
      showToast(err.message || 'Failed to delete record', 'error');
    }
  };

  const canManage = isAdmin || hasPermission('MEDICAL');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Clinical Health & Medical Records</h1>
          <p className="text-xs text-slate-500 mt-0.5">Chronological veterinary evaluations, diagnoses, and treatments</p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md transition-all flex items-center space-x-2"
          >
            <span>+ Log Medical Record</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Search by diagnosis, pet name, vet, or medicine..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
        />

        <select
          value={selectedPet}
          onChange={e => setSelectedPet(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white font-medium"
        >
          <option value="All">All Shelter Pets</option>
          {pets.map(p => (
            <option key={p.id} value={p.id}>{p.name} ({p.pet_code}) - {p.breed}</option>
          ))}
        </select>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Retrieving medical logs..." />
        ) : records.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Medical Records"
              description="No medical records match your criteria. You can log new clinical evaluations using the button above."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Pet</th>
                  <th scope="col" className="px-6 py-3.5">Record Date</th>
                  <th scope="col" className="px-6 py-3.5">Diagnosis</th>
                  <th scope="col" className="px-6 py-3.5">Treatment & Medicine</th>
                  <th scope="col" className="px-6 py-3.5">Attending Vet</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {records.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-extrabold text-sm text-slate-900 block">{rec.pet_name}</span>
                      <span className="font-mono text-[11px] text-teal-700">{rec.pet_code} &bull; {rec.animal_type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-700">
                      {rec.record_date}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 block text-sm">{rec.diagnosis}</span>
                      {rec.symptoms && (
                        <span className="text-[11px] text-slate-500 block mt-0.5">Symptoms: {rec.symptoms}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-800 block font-medium">{rec.treatment}</span>
                      {rec.medicine && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-100 rounded text-[11px] font-semibold">
                          Rx: {rec.medicine}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                      👨‍⚕️ {rec.vet_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      {canManage && (
                        <>
                          <button
                            onClick={() => handleOpenEdit(rec)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => { setRecordToDelete(rec); setDeleteDialogOpen(true); }}
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

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingRecord ? 'Edit Clinical Health Record' : 'Log New Medical Record'}
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Examination Date *</label>
              <input
                type="date"
                required
                value={formData.record_date}
                onChange={e => setFormData({ ...formData, record_date: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Attending Veterinarian *</label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Aakash Sharma"
                value={formData.vet_name}
                onChange={e => setFormData({ ...formData, vet_name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Diagnosis *</label>
              <input
                type="text"
                required
                placeholder="e.g. Paw wound infection, Ear mites"
                value={formData.diagnosis}
                onChange={e => setFormData({ ...formData, diagnosis: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Symptoms Observed</label>
            <input
              type="text"
              placeholder="e.g. Limping, scratch marks, decreased appetite"
              value={formData.symptoms}
              onChange={e => setFormData({ ...formData, symptoms: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Treatment Plan *</label>
            <textarea
              required
              rows={2}
              placeholder="Describe procedure, cleaning, dressing, physical therapy..."
              value={formData.treatment}
              onChange={e => setFormData({ ...formData, treatment: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Prescribed Medicines</label>
              <input
                type="text"
                placeholder="e.g. Amoxicillin 250mg, Meloxicam"
                value={formData.medicine}
                onChange={e => setFormData({ ...formData, medicine: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Document / PDF URL</label>
              <input
                type="text"
                placeholder="Optional report file URL"
                value={formData.document_url}
                onChange={e => setFormData({ ...formData, document_url: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>
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
              {submitting ? 'Saving...' : 'Save Medical Entry'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Medical Record"
        message="Are you sure you want to remove this medical history record? Clinical records should generally be preserved."
        confirmText="Delete Record"
        isDanger={true}
      />
    </div>
  );
}
