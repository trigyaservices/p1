import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';

export default function PetFormModal({ isOpen, onClose, onSubmit, initialData = null, isEditing = false }) {
  const [formData, setFormData] = useState({
    name: '',
    animal_type: 'Dog',
    breed: '',
    dob: '',
    age: '',
    gender: 'Male',
    color: 'Standard',
    weight: '',
    identification_mark: '',
    microchip_number: '',
    rescue_date: '',
    rescue_location: '',
    current_location: 'Main Shelter',
    health_status: 'Healthy',
    behaviour: '',
    description: '',
    adoption_status: 'Available',
    primary_photo_url: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        animal_type: initialData.animal_type || 'Dog',
        breed: initialData.breed || '',
        dob: initialData.dob || '',
        age: initialData.age || '',
        gender: initialData.gender || 'Male',
        color: initialData.color || 'Standard',
        weight: initialData.weight || '',
        identification_mark: initialData.identification_mark || '',
        microchip_number: initialData.microchip_number || '',
        rescue_date: initialData.rescue_date || '',
        rescue_location: initialData.rescue_location || '',
        current_location: initialData.current_location || 'Main Shelter',
        health_status: initialData.health_status || 'Healthy',
        behaviour: initialData.behaviour || '',
        description: initialData.description || '',
        adoption_status: initialData.adoption_status || 'Available',
        primary_photo_url: initialData.primary_photo_url || ''
      });
    } else {
      setFormData({
        name: '',
        animal_type: 'Dog',
        breed: '',
        dob: '',
        age: '',
        gender: 'Male',
        color: 'Standard',
        weight: '',
        identification_mark: '',
        microchip_number: '',
        rescue_date: '',
        rescue_location: '',
        current_location: 'Main Shelter',
        health_status: 'Healthy',
        behaviour: '',
        description: '',
        adoption_status: 'Available',
        primary_photo_url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80'
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const animalTypes = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Hamster', 'Turtle', 'Fish', 'Other'];
  const adoptionStatuses = ['Available', 'Application Pending', 'Visit Scheduled', 'Foster', 'Under Treatment', 'Adopted', 'Not Available'];
  const healthStatuses = ['Healthy', 'Under Treatment', 'Critical', 'Recovering', 'Special Needs'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Pet Record: ${initialData?.name} (${initialData?.pet_code})` : 'Register New Shelter Pet'}
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Attributes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Pet Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Bruno"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Animal Type *</label>
            <select
              value={formData.animal_type}
              onChange={e => setFormData({ ...formData, animal_type: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white"
            >
              {animalTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Breed *</label>
            <input
              type="text"
              required
              placeholder="e.g. Golden Retriever"
              value={formData.breed}
              onChange={e => setFormData({ ...formData, breed: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Demographics & Physical */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
            <input
              type="date"
              value={formData.dob}
              onChange={e => setFormData({ ...formData, dob: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Age String</label>
            <input
              type="text"
              placeholder="e.g. 2 years 6 months"
              value={formData.age}
              onChange={e => setFormData({ ...formData, age: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Gender *</label>
            <select
              value={formData.gender}
              onChange={e => setFormData({ ...formData, gender: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Weight (kg)</label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 28.5"
              value={formData.weight}
              onChange={e => setFormData({ ...formData, weight: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Colors, Identifiers & Location */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Color *</label>
            <input
              type="text"
              required
              placeholder="e.g. Golden Cream"
              value={formData.color}
              onChange={e => setFormData({ ...formData, color: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Identification Mark</label>
            <input
              type="text"
              placeholder="e.g. White patch on chest"
              value={formData.identification_mark}
              onChange={e => setFormData({ ...formData, identification_mark: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Microchip Number</label>
            <input
              type="text"
              placeholder="15-digit RFID tag"
              value={formData.microchip_number}
              onChange={e => setFormData({ ...formData, microchip_number: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Statuses & Location */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Adoption Status *</label>
            <select
              value={formData.adoption_status}
              onChange={e => setFormData({ ...formData, adoption_status: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white font-semibold text-teal-800"
            >
              {adoptionStatuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Health Status *</label>
            <select
              value={formData.health_status}
              onChange={e => setFormData({ ...formData, health_status: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white"
            >
              {healthStatuses.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Current Location *</label>
            <input
              type="text"
              required
              placeholder="e.g. Enclosure A1, Cattery"
              value={formData.current_location}
              onChange={e => setFormData({ ...formData, current_location: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Rescue Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Rescue Date</label>
            <input
              type="date"
              value={formData.rescue_date}
              onChange={e => setFormData({ ...formData, rescue_date: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Rescue Location</label>
            <input
              type="text"
              placeholder="e.g. Baner Road, Pune"
              value={formData.rescue_location}
              onChange={e => setFormData({ ...formData, rescue_location: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Primary Photo URL */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Primary Photo Image URL</label>
          <input
            type="url"
            placeholder="https://..."
            value={formData.primary_photo_url}
            onChange={e => setFormData({ ...formData, primary_photo_url: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
          />
        </div>

        {/* Behaviour & Description */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Temperament & Behaviour</label>
            <input
              type="text"
              placeholder="e.g. Friendly, playful, great with kids"
              value={formData.behaviour}
              onChange={e => setFormData({ ...formData, behaviour: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Public & Shelter Description</label>
            <textarea
              rows={3}
              placeholder="Describe background, personality traits, and requirements..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
            ></textarea>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md transition-all"
          >
            {isEditing ? 'Save Changes' : 'Create Pet Profile'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
