import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export default function PublicPetsPage({ onNavigate, initialCategory = 'All' }) {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState(initialCategory);
  const [selectedGender, setSelectedGender] = useState('All');

  useEffect(() => {
    async function fetchPets() {
      setLoading(true);
      try {
        const res = await api.getPublicCatalog({
          search,
          type: selectedType,
          gender: selectedGender
        });
        if (res.success) {
          setPets(res.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPets();
  }, [search, selectedType, selectedGender]);

  const categories = ['All', 'Dog', 'Cat', 'Bird', 'Rabbit', 'Hamster', 'Turtle', 'Other'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title & Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Meet Our Adoptable Animals</h1>
        <p className="text-slate-600 text-sm">
          Browse through pets currently staying at our sanctuary. All pets are microchipped and current on health vaccinations.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Keyword Search */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, breed, or ID..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>

          {/* Animal Type */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Animal Species' : `${cat}s`}
                </option>
              ))}
            </select>
          </div>

          {/* Gender */}
          <div>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white"
            >
              <option value="All">All Genders</option>
              <option value="Male">Male Only</option>
              <option value="Female">Female Only</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedType(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                selectedType === cat
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'All' ? 'All Pets' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Pets */}
      {loading ? (
        <LoadingSpinner text="Searching through adoptable companions..." />
      ) : pets.length === 0 ? (
        <EmptyState
          title="No Pets Found"
          description="There are currently no adoptable animals matching your selected filters. Try broadening your criteria."
          action={
            <button
              onClick={() => { setSearch(''); setSelectedType('All'); setSelectedGender('All'); }}
              className="px-4 py-2 bg-teal-700 text-white rounded-xl text-xs font-bold hover:bg-teal-800"
            >
              Reset Filters
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pets.map(pet => (
            <div
              key={pet.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              {/* Image Container */}
              <div className="relative h-60 overflow-hidden bg-slate-100">
                <img
                  src={pet.primary_photo_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80'}
                  alt={pet.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3">
                  <StatusBadge status={pet.adoption_status} />
                </div>
                <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-[11px] font-bold">
                  {pet.pet_code}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-slate-900">{pet.name}</h3>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {pet.gender}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-teal-700 mt-0.5">{pet.breed} &bull; {pet.animal_type}</p>
                  
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 font-medium">
                    <span>⏳ {pet.age || 'Adult'}</span>
                    <span>⚖️ {pet.weight ? `${pet.weight} kg` : 'N/A'}</span>
                    <span>❤️ {pet.health_status}</span>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                    {pet.description || 'Gentle companion pet ready for meeting.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 truncate max-w-[130px]">
                    📍 {pet.current_location}
                  </span>
                  <button
                    onClick={() => onNavigate('public-pet-detail', pet.id)}
                    className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    View & Adopt &rarr;
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
