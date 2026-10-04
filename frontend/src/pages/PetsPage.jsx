import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';
import PetFormModal from './PetFormModal';

export default function PetsPage({ onNavigate }) {
  const { hasPermission, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [petToDelete, setPetToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPets = async () => {
    setLoading(true);
    try {
      const res = await api.getPets({
        search,
        animal_type: selectedType,
        adoption_status: selectedStatus,
        page,
        limit: 10
      });
      if (res.success) {
        setPets(res.data || []);
        setPagination(res.pagination || { total: res.data.length, totalPages: 1 });
      }
    } catch (err) {
      showToast(err.message || 'Failed to load pets list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, [search, selectedType, selectedStatus, page]);

  const handleCreatePet = async (formData) => {
    try {
      const res = await api.createPet(formData);
      if (res.success) {
        showToast(res.message || 'Pet created successfully!');
        setFormModalOpen(false);
        fetchPets();
      }
    } catch (err) {
      showToast(err.message || 'Failed to create pet', 'error');
    }
  };

  const handleUpdatePet = async (formData) => {
    try {
      const res = await api.updatePet(editingPet.id, formData);
      if (res.success) {
        showToast('Pet profile updated successfully!');
        setFormModalOpen(false);
        setEditingPet(null);
        fetchPets();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update pet', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!petToDelete) return;
    setDeleting(true);
    try {
      const res = await api.deletePet(petToDelete.id);
      if (res.success) {
        showToast(res.message || 'Pet deleted successfully.');
        setDeleteDialogOpen(false);
        setPetToDelete(null);
        fetchPets();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete pet', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const canAdd = isAdmin || hasPermission('ADD_PET');
  const canEdit = isAdmin || hasPermission('EDIT_PET');
  const canDelete = isAdmin || hasPermission('DELETE_PET');

  const animalTypes = ['All', 'Dog', 'Cat', 'Bird', 'Rabbit', 'Hamster', 'Turtle', 'Other'];
  const statusFilters = ['All', 'Available', 'Application Pending', 'Visit Scheduled', 'Foster', 'Under Treatment', 'Adopted', 'Not Available'];

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Pet Registry & Inventory</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage pet profiles, demographics, photos, and live adoption states</p>
        </div>

        {canAdd && (
          <button
            onClick={() => { setEditingPet(null); setFormModalOpen(true); }}
            className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md transition-all flex items-center space-x-2"
          >
            <span>+ Add New Pet</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search by ID, name, breed, or location..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
          />

          <select
            value={selectedType}
            onChange={(e) => { setSelectedType(e.target.value); setPage(1); }}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white"
          >
            {animalTypes.map(t => (
              <option key={t} value={t}>{t === 'All' ? 'All Animal Types' : `${t}s`}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white font-medium"
          >
            {statusFilters.map(s => (
              <option key={s} value={s}>{s === 'All' ? 'All Adoption Statuses' : s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Retrieving pet records..." />
        ) : pets.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Pet Records Found"
              description="No pets matched your filter parameters. Try altering your search or create a new pet profile."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Pet Info</th>
                  <th scope="col" className="px-6 py-3.5">Species & Breed</th>
                  <th scope="col" className="px-6 py-3.5">Age / Gender</th>
                  <th scope="col" className="px-6 py-3.5">Health State</th>
                  <th scope="col" className="px-6 py-3.5">Current Location</th>
                  <th scope="col" className="px-6 py-3.5">Adoption Status</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {pets.map(pet => (
                  <tr key={pet.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Pet Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <img
                          src={pet.primary_photo_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80'}
                          alt={pet.name}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-sm"
                        />
                        <div>
                          <span className="font-extrabold text-sm text-slate-900 block">{pet.name}</span>
                          <span className="font-mono text-[11px] text-teal-700 font-bold">{pet.pet_code}</span>
                        </div>
                      </div>
                    </td>

                    {/* Species & Breed */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-slate-800 block">{pet.animal_type}</span>
                      <span className="text-slate-500 text-[11px]">{pet.breed}</span>
                    </td>

                    {/* Age / Gender */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-slate-700 block">{pet.age || 'Adult'}</span>
                      <span className="text-[11px] text-slate-400">{pet.gender} &bull; {pet.weight ? `${pet.weight}kg` : 'N/A'}</span>
                    </td>

                    {/* Health State */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                        pet.health_status === 'Healthy' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {pet.health_status}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                      📍 {pet.current_location}
                    </td>

                    {/* Adoption Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={pet.adoption_status} />
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={() => onNavigate('pet-detail', pet.id)}
                        className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 font-bold hover:bg-teal-100 transition-colors"
                        title="View Detailed Profile"
                      >
                        Profile &rarr;
                      </button>

                      {canEdit && (
                        <button
                          onClick={() => { setEditingPet(pet); setFormModalOpen(true); }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
                          title="Edit Pet"
                        >
                          Edit
                        </button>
                      )}

                      {canDelete && (
                        <button
                          onClick={() => { setPetToDelete(pet); setDeleteDialogOpen(true); }}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 font-bold hover:bg-rose-100 transition-colors"
                          title="Delete Pet"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalPages={pagination.totalPages}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </div>

      {/* Add / Edit Pet Modal */}
      <PetFormModal
        isOpen={formModalOpen}
        onClose={() => { setFormModalOpen(false); setEditingPet(null); }}
        onSubmit={editingPet ? handleUpdatePet : handleCreatePet}
        initialData={editingPet}
        isEditing={Boolean(editingPet)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setPetToDelete(null); }}
        onConfirm={confirmDelete}
        loading={deleting}
        title={`Delete Pet Record: ${petToDelete?.name}`}
        message={`Are you sure you want to permanently delete ${petToDelete?.name} (${petToDelete?.pet_code}) from the database? This action cannot be reversed.`}
        confirmText="Yes, Delete Pet"
        isDanger={true}
      />
    </div>
  );
}
