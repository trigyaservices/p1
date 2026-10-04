import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';

export default function PublicPetDetailPage({ petId, onNavigate }) {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [pet, setPet] = useState(null);
  const [activePhoto, setActivePhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Adoption Form State
  const [formData, setFormData] = useState({
    applicant_name: user?.name || '',
    mobile_number: user?.phone || '',
    email: user?.email || '',
    address: '',
    city: 'Pune',
    occupation: '',
    family_members: 3,
    home_type: 'Apartment',
    previous_pet_experience: '',
    reason_for_adoption: '',
    additional_information: ''
  });

  useEffect(() => {
    async function fetchPet() {
      setLoading(true);
      try {
        const res = await api.getPublicPet(petId);
        if (res.success && res.data) {
          setPet(res.data);
          setActivePhoto(res.data.primary_photo_url || res.data.photos?.[0]?.photo_url);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPet();
  }, [petId]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        pet_id: pet.id,
        preferred_pet: `${pet.name} (${pet.pet_code})`
      };
      const res = await api.applyForAdoption(payload);
      if (res.success) {
        showToast(`Application submitted! Reference code: ${res.data.application_code}`);
        setApplyModalOpen(false);
        // Refresh pet status
        setPet(prev => ({ ...prev, adoption_status: 'Application Pending' }));
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit application', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading pet profile..." />;
  if (!pet) return <div className="text-center py-16 text-slate-500">Pet record not found.</div>;

  const isAdoptable = ['Available', 'Application Pending'].includes(pet.adoption_status);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb / Back button */}
      <button
        onClick={() => onNavigate('public-pets')}
        className="text-sm font-semibold text-teal-700 hover:text-teal-900 flex items-center space-x-1"
      >
        <span>&larr;</span>
        <span>Back to Adoptable Pets</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Photo Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="h-96 rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-md">
            <img
              src={activePhoto || pet.primary_photo_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80'}
              alt={pet.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
          </div>

          {/* Thumbnails */}
          {pet.photos && pet.photos.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {pet.photos.map(p => (
                <button
                  key={p.id}
                  onClick={() => setActivePhoto(p.photo_url)}
                  className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                    activePhoto === p.photo_url ? 'border-teal-600 scale-95 shadow-md' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={p.photo_url} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Information & Adoption Callout (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="border-b border-slate-200 pb-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{pet.pet_code}</span>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">{pet.name}</h1>
              </div>
              <StatusBadge status={pet.adoption_status} />
            </div>
            <p className="text-base font-semibold text-teal-700 mt-1">{pet.breed} &bull; {pet.animal_type}</p>
          </div>

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400 block font-medium">Age</span>
              <span className="text-sm font-bold text-slate-800">{pet.age || 'Adult'}</span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400 block font-medium">Gender</span>
              <span className="text-sm font-bold text-slate-800">{pet.gender}</span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400 block font-medium">Weight</span>
              <span className="text-sm font-bold text-slate-800">{pet.weight ? `${pet.weight} kg` : 'N/A'}</span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-400 block font-medium">Color</span>
              <span className="text-sm font-bold text-slate-800">{pet.color}</span>
            </div>
          </div>

          {/* Location & Health */}
          <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200">
            <div className="flex items-center space-x-2 text-sm text-slate-700">
              <span className="font-bold text-slate-900">Current Location:</span>
              <span>📍 {pet.current_location}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-slate-700">
              <span className="font-bold text-slate-900">Health Evaluation:</span>
              <span className="text-teal-700 font-semibold">✓ {pet.health_status} &bull; Up-to-date Vaccines</span>
            </div>
            {pet.behaviour && (
              <div className="text-sm text-slate-700">
                <span className="font-bold text-slate-900 block mb-1">Temperament & Behaviour:</span>
                <p className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
                  {pet.behaviour}
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-base font-bold text-slate-900">About {pet.name}</h4>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {pet.description || 'This friendly shelter animal is currently staying in our sanctuary and is eager to find a forever home.'}
            </p>
          </div>

          {/* Adoption Call to Action Card */}
          <div className="bg-gradient-to-r from-teal-50 to-orange-50 border border-teal-200/80 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div>
              <h4 className="text-lg font-black text-slate-900">Interested in Adopting {pet.name}?</h4>
              <p className="text-xs text-slate-600 mt-1 max-w-md">
                Our adoption process includes reviewing your profile, a free shelter meet-and-greet, and veterinary health handover.
              </p>
            </div>

            {isAuthenticated ? (
              <button
                onClick={() => setApplyModalOpen(true)}
                disabled={!isAdoptable}
                className={`px-6 py-3.5 rounded-2xl font-black text-sm text-white shadow-lg transition-all flex-shrink-0 ${
                  isAdoptable
                    ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/25 hover:scale-105'
                    : 'bg-slate-400 cursor-not-allowed'
                }`}
              >
                {isAdoptable ? '🐾 Apply For Adoption' : 'Adoption Closed'}
              </button>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="px-6 py-3.5 rounded-2xl font-bold text-sm bg-teal-700 hover:bg-teal-800 text-white shadow-md transition-all flex-shrink-0"
              >
                Login to Apply for Adoption
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Adoption Application Modal */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title={`Adoption Application for ${pet.name} (${pet.pet_code})`}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleApplySubmit} className="space-y-5">
          <div className="bg-teal-50 p-3.5 rounded-xl border border-teal-100 text-xs text-teal-800">
            <strong>Adoption Screening:</strong> Please fill out this form accurately. Our shelter manager will review your submission and contact you to schedule an on-site visit.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Applicant Name *</label>
              <input
                type="text"
                required
                value={formData.applicant_name}
                onChange={e => setFormData({ ...formData, applicant_name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Contact *</label>
              <input
                type="text"
                required
                value={formData.mobile_number}
                onChange={e => setFormData({ ...formData, mobile_number: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Residential Address *</label>
            <input
              type="text"
              required
              placeholder="House/Flat number, building, street, area"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Occupation</label>
              <input
                type="text"
                placeholder="e.g. Software Engineer"
                value={formData.occupation}
                onChange={e => setFormData({ ...formData, occupation: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Family Members Count</label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.family_members}
                onChange={e => setFormData({ ...formData, family_members: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Housing Type</label>
              <select
                value={formData.home_type}
                onChange={e => setFormData({ ...formData, home_type: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white"
              >
                <option value="Apartment">Apartment</option>
                <option value="Independent House">Independent House</option>
                <option value="Row House">Row House</option>
                <option value="Villa / Bungalow">Villa / Bungalow</option>
                <option value="Farmhouse">Farmhouse</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Previous Pet Experience</label>
            <input
              type="text"
              placeholder="e.g. Owned dogs for 5 years, first-time pet parent, etc."
              value={formData.previous_pet_experience}
              onChange={e => setFormData({ ...formData, previous_pet_experience: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Adoption *</label>
            <textarea
              required
              rows={2}
              placeholder="Why would you like to adopt this pet? How will you accommodate their daily care?"
              value={formData.reason_for_adoption}
              onChange={e => setFormData({ ...formData, reason_for_adoption: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
            ></textarea>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setApplyModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
            >
              {submitting ? 'Submitting Application...' : 'Confirm & Submit Application'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
