import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

export default function RescuePage({ onNavigate }) {
  const { hasPermission, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [rescues, setRescues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Intake Modal State
  const [intakeModalOpen, setIntakeModalOpen] = useState(false);
  const [intakeData, setIntakeData] = useState({
    pet_type: 'Dog',
    rescue_date: new Date().toISOString().split('T')[0],
    rescue_location: '',
    rescued_by: '',
    initial_condition: '',
    emergency_treatment: '',
    current_location: 'Intake Clinic',
    notes: '',
    photo_url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80'
  });

  // Convert to Pet Modal State
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [activeRescue, setActiveRescue] = useState(null);
  const [convertData, setConvertData] = useState({
    name: '',
    breed: 'Mixed Breed',
    gender: 'Male',
    color: 'Standard',
    weight: '10',
    health_status: 'Under Treatment',
    behaviour: 'Recovering from trauma',
    description: ''
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchRescues = async () => {
    setLoading(true);
    try {
      const res = await api.getRescues({
        pet_type: selectedType,
        status: selectedStatus
      });
      if (res.success) setRescues(res.data || []);
    } catch (err) {
      showToast(err.message || 'Failed to load rescues', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRescues();
  }, [selectedType, selectedStatus]);

  const handleOpenIntake = () => {
    setIntakeData({
      pet_type: 'Dog',
      rescue_date: new Date().toISOString().split('T')[0],
      rescue_location: '',
      rescued_by: '',
      initial_condition: '',
      emergency_treatment: '',
      current_location: 'Intake Clinic Ward',
      notes: '',
      photo_url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80'
    });
    setIntakeModalOpen(true);
  };

  const handleIntakeSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.createRescue(intakeData);
      if (res.success) {
        showToast(res.message || 'Rescue intake filed successfully!');
        setIntakeModalOpen(false);
        fetchRescues();
      }
    } catch (err) {
      showToast(err.message || 'Failed to file rescue', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenConvert = (rescue) => {
    setActiveRescue(rescue);
    setConvertData({
      name: '',
      breed: 'Mixed Breed',
      gender: 'Male',
      color: 'Brown / Standard',
      weight: '12',
      health_status: 'Under Treatment',
      behaviour: 'Quiet, responding positively to handlers',
      description: `Rescued on ${rescue.rescue_date} at ${rescue.rescue_location}. Initial state: ${rescue.initial_condition}.`
    });
    setConvertModalOpen(true);
  };

  const handleConvertSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.convertToPet(activeRescue.id, convertData);
      if (res.success) {
        showToast(res.message || 'Rescue converted to official Pet Profile!');
        setConvertModalOpen(false);
        fetchRescues();
      }
    } catch (err) {
      showToast(err.message || 'Failed to convert to pet profile', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const canAdd = isAdmin || hasPermission('ADD_PET');
  const petTypes = ['All', 'Dog', 'Cat', 'Bird', 'Rabbit', 'Hamster', 'Turtle', 'Other'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Rescue & Emergency Response</h1>
          <p className="text-xs text-slate-500 mt-0.5">Emergency animal intake, initial stabilization, and conversion to permanent registry</p>
        </div>

        {canAdd && (
          <button
            onClick={handleOpenIntake}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md transition-all flex items-center space-x-2"
          >
            <span>🚨 New Emergency Rescue Intake</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {['All', 'RESCUED', 'CONVERTED_TO_PET', 'TRANSFERRED'].map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedStatus === st
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'All' ? 'All Incidents' : st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <select
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
          className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white"
        >
          {petTypes.map(t => (
            <option key={t} value={t}>{t === 'All' ? 'All Species' : `${t}s`}</option>
          ))}
        </select>
      </div>

      {/* Rescue Records Grid */}
      <div className="space-y-4">
        {loading ? (
          <LoadingSpinner text="Retrieving rescue mission logs..." />
        ) : rescues.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <EmptyState
              title="No Rescue Incidents"
              description="No rescue cases match the filter criteria."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rescues.map(rescue => (
              <div
                key={rescue.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-md">
                      {rescue.rescue_code}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      rescue.status === 'CONVERTED_TO_PET' ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {rescue.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex items-start space-x-4">
                    <img
                      src={rescue.photo_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80'}
                      alt="rescue"
                      className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-sm flex-shrink-0"
                    />
                    <div>
                      <h3 className="font-black text-slate-900 text-base">{rescue.pet_type} at {rescue.rescue_location}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        📅 Rescue Date: <strong>{rescue.rescue_date}</strong> &bull; Rescuer: <strong>{rescue.rescued_by}</strong>
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">Current Location: 📍 {rescue.current_location}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                    <strong className="text-slate-700 block">Initial Physical Condition:</strong>
                    <p className="text-slate-600">{rescue.initial_condition}</p>
                  </div>

                  {rescue.emergency_treatment && (
                    <div className="bg-teal-50/50 p-3 rounded-xl border border-teal-100 text-xs space-y-1">
                      <strong className="text-teal-800 block">Emergency Treatment Applied:</strong>
                      <p className="text-teal-900">{rescue.emergency_treatment}</p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  {rescue.status === 'CONVERTED_TO_PET' ? (
                    <span className="text-xs font-bold text-teal-700">
                      ✓ Enrolled as Pet #{rescue.converted_pet_id}
                    </span>
                  ) : canAdd ? (
                    <button
                      onClick={() => handleOpenConvert(rescue)}
                      className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-sm transition-all"
                    >
                      🐾 Create Official Pet Profile from Rescue &rarr;
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">Intake pending clinical clearance</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: New Rescue Intake */}
      <Modal
        isOpen={intakeModalOpen}
        onClose={() => setIntakeModalOpen(false)}
        title="Emergency Animal Rescue Intake"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleIntakeSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Rescued Animal Species *</label>
              <select
                value={intakeData.pet_type}
                onChange={e => setIntakeData({ ...intakeData, pet_type: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white font-medium"
              >
                {['Dog', 'Cat', 'Bird', 'Rabbit', 'Hamster', 'Turtle', 'Other'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Rescue Date *</label>
              <input
                type="date"
                required
                value={intakeData.rescue_date}
                onChange={e => setIntakeData({ ...intakeData, rescue_date: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Rescue Location / Landmark *</label>
              <input
                type="text"
                required
                placeholder="e.g. Highway 48 Toll Plaza"
                value={intakeData.rescue_location}
                onChange={e => setIntakeData({ ...intakeData, rescue_location: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Rescuer / Ambulance Officer *</label>
              <input
                type="text"
                required
                placeholder="e.g. Vikram Singh"
                value={intakeData.rescued_by}
                onChange={e => setIntakeData({ ...intakeData, rescued_by: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Initial Physical & Health Condition *</label>
            <input
              type="text"
              required
              placeholder="e.g. Dehydrated, fracture on left hind leg, malnourished"
              value={intakeData.initial_condition}
              onChange={e => setIntakeData({ ...intakeData, initial_condition: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Treatment Administered</label>
            <textarea
              rows={2}
              placeholder="e.g. Saline drip, wound flush with betadine, painkiller injection"
              value={intakeData.emergency_treatment}
              onChange={e => setIntakeData({ ...intakeData, emergency_treatment: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Current Quarantine Ward</label>
              <input
                type="text"
                value={intakeData.current_location}
                onChange={e => setIntakeData({ ...intakeData, current_location: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Rescue Photo URL</label>
              <input
                type="url"
                value={intakeData.photo_url}
                onChange={e => setIntakeData({ ...intakeData, photo_url: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIntakeModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md disabled:opacity-50"
            >
              {submitting ? 'Filing...' : 'Register Rescue Case'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Convert Rescue to Pet */}
      <Modal
        isOpen={convertModalOpen}
        onClose={() => setConvertModalOpen(false)}
        title={`Enroll Rescue #${activeRescue?.rescue_code} into Official Pet Directory`}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleConvertSubmit} className="space-y-4">
          <div className="bg-teal-50 p-3 rounded-xl border border-teal-200 text-xs text-teal-900 leading-relaxed">
            Converting this rescue incident will automatically allocate a unique <strong>PET-YYYY-XXXXX</strong> code, register full profile fields, and transition the animal into adoptable census tracking.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Pet Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Rocky"
                value={convertData.name}
                onChange={e => setConvertData({ ...convertData, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Breed Description *</label>
              <input
                type="text"
                required
                placeholder="e.g. German Shepherd Mix"
                value={convertData.breed}
                onChange={e => setConvertData({ ...convertData, breed: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Gender *</label>
              <select
                value={convertData.gender}
                onChange={e => setConvertData({ ...convertData, gender: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white font-medium"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Coat Color</label>
              <input
                type="text"
                value={convertData.color}
                onChange={e => setConvertData({ ...convertData, color: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={convertData.weight}
                onChange={e => setConvertData({ ...convertData, weight: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setConvertModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md disabled:opacity-50"
            >
              {submitting ? 'Creating Profile...' : 'Confirm Pet Registration'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
