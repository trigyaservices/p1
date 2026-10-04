import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';

export default function PetDetailPage({ petId, onNavigate }) {
  const { hasPermission, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Photo Upload Modal
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [isPrimaryCheck, setIsPrimaryCheck] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchPet = async () => {
    try {
      const res = await api.getPetById(petId);
      if (res.success) {
        setPet(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load pet profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPet();
  }, [petId]);

  const handleUploadPhoto = async (e) => {
    e.preventDefault();
    if (!newPhotoUrl) {
      showToast('Please specify a valid photo URL', 'error');
      return;
    }
    setUploading(true);
    try {
      const res = await api.uploadPetPhoto(pet.id, {
        photo_url: newPhotoUrl,
        caption: newPhotoCaption,
        is_primary: isPrimaryCheck
      });
      if (res.success) {
        showToast('Photo added to pet gallery!');
        setPhotoModalOpen(false);
        setNewPhotoUrl('');
        setNewPhotoCaption('');
        setIsPrimaryCheck(false);
        fetchPet();
      }
    } catch (err) {
      showToast(err.message || 'Failed to upload photo', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = async (photoId) => {
    try {
      const res = await api.setPrimaryPhoto(pet.id, photoId);
      if (res.success) {
        showToast('Primary photo updated successfully!');
        fetchPet();
      }
    } catch (err) {
      showToast(err.message || 'Failed to set primary photo', 'error');
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('Are you sure you want to remove this photo from the gallery?')) return;
    try {
      const res = await api.deletePetPhoto(pet.id, photoId);
      if (res.success) {
        showToast('Photo removed.');
        fetchPet();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete photo', 'error');
    }
  };

  if (loading) return <LoadingSpinner text="Loading detailed pet dossier..." />;
  if (!pet) return <div className="text-center py-16 text-slate-500">Pet record not found.</div>;

  const canUploadPhotos = isAdmin || hasPermission('UPLOAD_PHOTOS');

  const tabs = [
    { id: 'overview', label: 'Overview & Details', icon: '🐾' },
    { id: 'photos', label: `Photo Gallery (${pet.photos?.length || 0})`, icon: '🖼️' },
    { id: 'medical', label: `Medical History (${pet.medical_records?.length || 0})`, icon: '🩺' },
    { id: 'vaccinations', label: `Vaccinations (${pet.vaccinations?.length || 0})`, icon: '💉' },
    { id: 'reports', label: `Monthly Reports (${pet.monthly_reports?.length || 0})`, icon: '📋' },
    { id: 'adoptions', label: 'Adoption History', icon: '🏡' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('pets')}
          className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center space-x-1"
        >
          <span>&larr;</span>
          <span>Back to Pet Registry</span>
        </button>

        <span className="text-xs font-mono font-bold text-slate-400 bg-white px-3 py-1 rounded-xl border border-slate-200">
          Record ID: {pet.pet_code}
        </span>
      </div>

      {/* Main Profile Card Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 items-start">
        <div className="w-full md:w-56 h-56 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200 shadow-md">
          <img
            src={pet.primary_photo_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80'}
            alt={pet.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-black text-slate-900">{pet.name}</h1>
                <StatusBadge status={pet.adoption_status} />
              </div>
              <p className="text-sm font-semibold text-teal-700 mt-0.5">{pet.breed} &bull; {pet.animal_type}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onNavigate('public-pet-detail', pet.id)}
                className="px-3.5 py-1.5 text-xs font-bold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                View Public Page &rarr;
              </button>
            </div>
          </div>

          {/* Core Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 block">Age</span>
              <span className="text-xs font-bold text-slate-800">{pet.age || 'Adult'}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 block">Gender</span>
              <span className="text-xs font-bold text-slate-800">{pet.gender}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 block">Weight</span>
              <span className="text-xs font-bold text-slate-800">{pet.weight ? `${pet.weight} kg` : 'N/A'}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 block">Health State</span>
              <span className="text-xs font-bold text-teal-700">{pet.health_status}</span>
            </div>
          </div>

          <div className="text-xs text-slate-600 flex flex-wrap gap-4 pt-1">
            <span><strong>Location:</strong> 📍 {pet.current_location}</span>
            <span><strong>Color:</strong> {pet.color}</span>
            <span><strong>Microchip:</strong> {pet.microchip_number || 'Not Chipped'}</span>
            <span><strong>Intake Date:</strong> {pet.rescue_date || pet.created_at?.split(' ')[0]}</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-2 overflow-x-auto pb-1" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-3 px-4 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all ${
                activeTab === tab.id
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Description & Bio</h3>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {pet.description || 'No biography written yet.'}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Temperament & Behaviour</h3>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {pet.behaviour || 'Friendly and adaptable to shelter care.'}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Rescue Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <span className="text-slate-400 block">Rescue Location</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">{pet.rescue_location || 'Not Specified'}</span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <span className="text-slate-400 block">Special Identification Mark</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">{pet.identification_mark || 'None recorded'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Photo Gallery */}
      {activeTab === 'photos' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Photo Gallery</h3>
              <p className="text-xs text-slate-500">Manage multiple pet photos, assign primary photo, and preview</p>
            </div>
            {canUploadPhotos && (
              <button
                onClick={() => setPhotoModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-teal-700 text-white font-bold text-xs hover:bg-teal-800 transition-colors shadow-sm"
              >
                + Add Photo
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {pet.photos?.map(photo => (
              <div key={photo.id} className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-slate-50 flex flex-col group">
                <div className="relative h-48 overflow-hidden bg-slate-200">
                  <img src={photo.photo_url} alt="pet" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  {Boolean(photo.is_primary) && (
                    <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-md bg-teal-700 text-white text-[10px] font-extrabold shadow-sm">
                      PRIMARY PHOTO
                    </span>
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                  <p className="text-xs text-slate-600 truncate">{photo.caption || 'Photo asset'}</p>
                  {canUploadPhotos && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                      {!photo.is_primary ? (
                        <button
                          onClick={() => handleSetPrimary(photo.id)}
                          className="text-[11px] font-bold text-teal-700 hover:text-teal-900"
                        >
                          Make Primary
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-400">Current Primary</span>
                      )}
                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="text-[11px] font-bold text-rose-600 hover:text-rose-800"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Medical History */}
      {activeTab === 'medical' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Clinical Health & Treatment Log</h3>
              <p className="text-xs text-slate-500">Chronological veterinary records strictly preserved</p>
            </div>
            <button
              onClick={() => onNavigate('medical')}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100"
            >
              Open Medical Module &rarr;
            </button>
          </div>

          <div className="space-y-4">
            {pet.medical_records?.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No clinical history recorded.</p>
            ) : (
              pet.medical_records?.map(rec => (
                <div key={rec.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-900 text-sm">{rec.diagnosis}</span>
                    <span className="text-slate-500 font-bold">Date: {rec.record_date} &bull; Vet: {rec.vet_name}</span>
                  </div>
                  {rec.symptoms && (
                    <p className="text-xs text-slate-600"><strong>Symptoms:</strong> {rec.symptoms}</p>
                  )}
                  <p className="text-xs text-slate-700"><strong>Treatment Plan:</strong> {rec.treatment}</p>
                  {rec.medicine && (
                    <p className="text-xs text-teal-800 bg-teal-50 p-2 rounded-lg border border-teal-100">
                      <strong>Prescribed Medication:</strong> {rec.medicine}
                    </p>
                  )}
                  {rec.document_url && (
                    <div className="pt-1">
                      <a href={rec.document_url} target="_blank" rel="noreferrer" className="text-xs font-bold text-teal-700 hover:underline">
                        📎 View Attached Clinical Document
                      </a>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Vaccination */}
      {activeTab === 'vaccinations' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Vaccines & Preventive Reminders</h3>
              <p className="text-xs text-slate-500">Real-time status calculation (Green = Upcoming, Orange = Due Soon, Red = Overdue)</p>
            </div>
            <button
              onClick={() => onNavigate('vaccinations')}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100"
            >
              Open Vaccination Module &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {pet.vaccinations?.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No vaccination entries filed.</p>
            ) : (
              pet.vaccinations?.map(vac => (
                <div key={vac.id} className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-slate-900 text-sm">{vac.vaccine_name}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {vac.record_type}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 space-x-3">
                      <span>Given: {vac.vaccine_date}</span>
                      <span>&bull;</span>
                      <span>Next Due: <strong>{vac.next_due_date}</strong></span>
                      <span>&bull;</span>
                      <span>Vet: {vac.vet_name}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <StatusBadge status={vac.computed_status} type="vaccination" />
                    {vac.certificate_url && (
                      <a href={vac.certificate_url} target="_blank" rel="noreferrer" className="text-xs font-bold text-teal-700 hover:underline">
                        Certificate
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Monthly Reports */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Monthly Health Progress Timeline</h3>
              <p className="text-xs text-slate-500">Longitudinal evaluation tracking month over month</p>
            </div>
            <button
              onClick={() => onNavigate('monthly-reports')}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-teal-700 text-white hover:bg-teal-800"
            >
              + Create Report
            </button>
          </div>

          <div className="space-y-4">
            {pet.monthly_reports?.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No monthly progress evaluations found.</p>
            ) : (
              pet.monthly_reports?.map(report => (
                <div key={report.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-slate-900 text-sm">Month: {report.report_month}</span>
                    <span className="font-bold text-teal-700 bg-teal-100/60 px-2.5 py-1 rounded-lg">
                      Recorded Weight: {report.weight} kg
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <strong className="block text-slate-700 mb-1">Health Condition:</strong>
                      <p className="text-slate-600">{report.health_condition}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <strong className="block text-slate-700 mb-1">Diet & Food Intake:</strong>
                      <p className="text-slate-600">{report.food}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600"><strong>Behaviour:</strong> {report.behaviour}</p>
                  {report.remarks && <p className="text-xs text-slate-500"><strong>Remarks:</strong> {report.remarks}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 6: Adoption History */}
      {activeTab === 'adoptions' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base mb-1">Adoption & Guardianship Status</h3>
            <p className="text-xs text-slate-500 mb-4">Official application logs and final certificate</p>

            {pet.adoption_record ? (
              <div className="p-6 rounded-2xl bg-teal-50 border border-teal-200 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800">Formal Adoption Finalized</span>
                <h4 className="text-lg font-black text-teal-900">Certificate: {pet.adoption_record.certificate_code}</h4>
                <p className="text-xs text-teal-800">
                  Adopted by <strong>{pet.adoption_record.applicant_name}</strong> on {pet.adoption_record.adoption_date}.
                </p>
                <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-teal-100 italic">
                  "{pet.adoption_record.agreement_text}"
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100">
                This pet is currently <strong>{pet.adoption_status}</strong> and not finalized for legal guardianship yet.
              </p>
            )}
          </div>

          <div>
            <h4 className="font-bold text-slate-800 text-sm mb-3">Submitted Adoption Applications ({pet.adoption_applications?.length || 0})</h4>
            <div className="space-y-2">
              {pet.adoption_applications?.map(app => (
                <div key={app.id} className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{app.application_code} &bull; {app.applicant_name}</span>
                    <span className="text-slate-400 block">{app.city} &bull; {app.email}</span>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Photo Upload Modal */}
      <Modal
        isOpen={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        title="Add Photo to Pet Gallery"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleUploadPhoto} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Image URL *</label>
            <input
              type="url"
              required
              placeholder="https://images.unsplash.com/..."
              value={newPhotoUrl}
              onChange={e => setNewPhotoUrl(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Caption / Description</label>
            <input
              type="text"
              placeholder="e.g. Playing in the grass"
              value={newPhotoCaption}
              onChange={e => setNewPhotoCaption(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="isPrimary"
              checked={isPrimaryCheck}
              onChange={e => setIsPrimaryCheck(e.target.checked)}
              className="rounded text-teal-700 focus:ring-teal-600"
            />
            <label htmlFor="isPrimary" className="text-xs font-semibold text-slate-700">
              Set as pet's primary profile photo
            </label>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setPhotoModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              {uploading ? 'Adding...' : 'Add to Gallery'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
