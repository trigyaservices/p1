import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

export default function AdoptionsPage({ onNavigate }) {
  const { user, hasPermission, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [search, setSearch] = useState('');

  // Modals
  const [activeApp, setActiveApp] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('UNDER REVIEW');
  const [adminRemarks, setAdminRemarks] = useState('');

  // Approve Modal
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [agreementText, setAgreementText] = useState('');
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const [processing, setProcessing] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      let res;
      if (user?.role === 'USER') {
        res = await api.getMyApplications();
      } else {
        res = await api.getAdoptionApplications({ status: selectedStatus, search });
      }

      if (res.success) {
        setApplications(res.data || []);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load adoption applications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [selectedStatus, search, user]);

  const handleOpenStatusModal = (app) => {
    setActiveApp(app);
    setNewStatus(app.status);
    setAdminRemarks(app.admin_remarks || '');
    setStatusModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const res = await api.updateApplicationStatus(activeApp.id, {
        status: newStatus,
        admin_remarks: adminRemarks
      });
      if (res.success) {
        showToast(`Status updated to ${newStatus}`);
        setStatusModalOpen(false);
        fetchApplications();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleOpenApproveModal = (app) => {
    setActiveApp(app);
    setAgreementText(
      `I, ${app.applicant_name}, hereby accept full compassionate and legal guardianship of ${app.pet_name} (${app.pet_code}). I vow to provide high-quality nourishment, regular veterinary checkups, humane housing, and never to exploit or abandon this animal.`
    );
    setAdminRemarks('Application verified, home suitability confirmed, and adoption approved.');
    setApproveModalOpen(true);
  };

  const handleConfirmApproval = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const res = await api.approveAdoption(activeApp.id, {
        admin_remarks: adminRemarks,
        agreement_text: agreementText
      });
      if (res.success) {
        showToast(res.message || 'Adoption successfully approved!');
        setApproveModalOpen(false);
        // Load certificate
        loadCertificate(activeApp.id);
        fetchApplications();
      }
    } catch (err) {
      showToast(err.message || 'Approval failed', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (app) => {
    const reason = window.prompt(`Provide mandatory reason for rejecting ${app.application_code}:`);
    if (!reason) return;
    try {
      const res = await api.rejectAdoption(app.id, { admin_remarks: reason });
      if (res.success) {
        showToast('Application marked as REJECTED');
        fetchApplications();
      }
    } catch (err) {
      showToast(err.message || 'Failed to reject application', 'error');
    }
  };

  const loadCertificate = async (appId) => {
    try {
      const res = await api.getAdoptionCertificate(appId);
      if (res.success) {
        setCertificateData(res.data);
        setCertModalOpen(true);
      }
    } catch (err) {
      showToast('No adoption certificate available for this application yet.', 'info');
    }
  };

  const canManage = isAdmin || hasPermission('ADOPTION');
  const statuses = ['All', 'PENDING', 'UNDER REVIEW', 'VISIT SCHEDULED', 'VISIT COMPLETED', 'APPROVED', 'REJECTED', 'ADOPTED'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Adoption Application Pipeline</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {user?.role === 'USER'
              ? 'Track the live review status of your adoption applications'
              : 'Screen applicants, schedule visits, issue approvals, and generate certificates'}
          </p>
        </div>
      </div>

      {/* Filter Tabs (Staff / Admin view) */}
      {user?.role !== 'USER' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <input
              type="text"
              placeholder="Search by code, applicant name, city, or pet..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full sm:w-80 px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />

            <div className="flex flex-wrap gap-1.5 overflow-x-auto w-full sm:w-auto">
              {statuses.map(st => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    selectedStatus === st
                      ? 'bg-teal-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Applications Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Retrieving adoption applications..." />
        ) : applications.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Applications Found"
              description="No adoption applications exist matching the current filter state."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Application</th>
                  <th scope="col" className="px-6 py-3.5">Applicant Details</th>
                  <th scope="col" className="px-6 py-3.5">Target Pet</th>
                  <th scope="col" className="px-6 py-3.5">Living Situation</th>
                  <th scope="col" className="px-6 py-3.5">Pipeline Status</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {applications.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* App Code */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-xs font-bold text-teal-700 block">{app.application_code}</span>
                      <span className="text-[11px] text-slate-400">{app.created_at?.split(' ')[0]}</span>
                    </td>

                    {/* Applicant */}
                    <td className="px-6 py-4">
                      <span className="font-extrabold text-slate-900 block text-sm">{app.applicant_name}</span>
                      <span className="text-slate-500 text-[11px] block">{app.email} &bull; {app.mobile_number}</span>
                      <span className="text-slate-400 text-[11px]">📍 {app.city}</span>
                    </td>

                    {/* Target Pet */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-slate-800 block text-sm">{app.pet_name}</span>
                      <span className="text-teal-700 font-mono text-[11px]">{app.pet_code} &bull; {app.breed}</span>
                    </td>

                    {/* Situation */}
                    <td className="px-6 py-4 text-slate-600">
                      <span className="block font-medium">{app.home_type} ({app.family_members} members)</span>
                      <span className="text-[11px] text-slate-400 truncate max-w-[200px] block">
                        Reason: {app.reason_for_adoption}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={app.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-1.5">
                      <button
                        onClick={() => { setActiveApp(app); setDetailModalOpen(true); }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                        title="View Full Application Dossier"
                      >
                        Details
                      </button>

                      {app.status === 'ADOPTED' && (
                        <button
                          onClick={() => loadCertificate(app.id)}
                          className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 font-bold hover:bg-teal-100"
                          title="View Official Adoption Certificate"
                        >
                          Certificate 📜
                        </button>
                      )}

                      {canManage && app.status !== 'ADOPTED' && app.status !== 'REJECTED' && (
                        <>
                          <button
                            onClick={() => handleOpenStatusModal(app)}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold hover:bg-blue-100"
                          >
                            Status
                          </button>
                          <button
                            onClick={() => handleOpenApproveModal(app)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(app)}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 font-bold hover:bg-rose-100"
                          >
                            Reject
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

      {/* Application Detail Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={`Application Dossier: ${activeApp?.application_code}`}
        maxWidth="max-w-2xl"
      >
        {activeApp && (
          <div className="space-y-4 text-xs text-slate-700">
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-sm text-slate-900 block">{activeApp.applicant_name}</span>
                <span className="text-slate-500">{activeApp.email} &bull; {activeApp.mobile_number}</span>
              </div>
              <StatusBadge status={activeApp.status} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <strong className="block text-slate-400 mb-0.5">Requested Companion:</strong>
                <span className="font-bold text-slate-900 text-sm">{activeApp.pet_name} ({activeApp.pet_code})</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <strong className="block text-slate-400 mb-0.5">City & Housing:</strong>
                <span className="font-bold text-slate-900 text-sm">{activeApp.city} &bull; {activeApp.home_type}</span>
              </div>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
              <strong className="block text-slate-400">Physical Address:</strong>
              <p className="text-slate-800">{activeApp.address}</p>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
              <strong className="block text-slate-400">Prior Animal Guardianship:</strong>
              <p className="text-slate-800">{activeApp.previous_pet_experience || 'None noted'}</p>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
              <strong className="block text-slate-400">Reason for Adoption:</strong>
              <p className="text-slate-800 italic leading-relaxed">"{activeApp.reason_for_adoption}"</p>
            </div>

            {activeApp.admin_remarks && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                <strong className="block text-amber-800">Shelter Admin Remarks:</strong>
                <p className="text-amber-900">{activeApp.admin_remarks}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Change Status Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={`Update Pipeline Status: ${activeApp?.application_code}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Next Workflow Status</label>
            <select
              value={newStatus}
              onChange={e => setNewStatus(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white font-bold text-slate-800"
            >
              <option value="PENDING">PENDING</option>
              <option value="UNDER REVIEW">UNDER REVIEW</option>
              <option value="VISIT SCHEDULED">VISIT SCHEDULED</option>
              <option value="VISIT COMPLETED">VISIT COMPLETED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Administrative Notes / Feedback</label>
            <textarea
              rows={3}
              placeholder="e.g. Completed initial screening call. Applicant meets criteria."
              value={adminRemarks}
              onChange={e => setAdminRemarks(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
            ></textarea>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStatusModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md disabled:opacity-50"
            >
              {processing ? 'Saving...' : 'Update Status'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Approve Modal */}
      <Modal
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        title={`Finalize Legal Adoption: ${activeApp?.pet_name}`}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleConfirmApproval} className="space-y-4">
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
            <strong>Adoption Finalization Protocol:</strong> Approving this application will automatically update the pet's status to <strong>ADOPTED</strong>, register the legal guardianship record, and generate an official Adoption Certificate.
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Guardianship Agreement Terms</label>
            <textarea
              rows={4}
              required
              value={agreementText}
              onChange={e => setAgreementText(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Administrative Remarks</label>
            <input
              type="text"
              value={adminRemarks}
              onChange={e => setAdminRemarks(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setApproveModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
            >
              {processing ? 'Processing Adoption...' : 'Confirm & Finalize Adoption'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Official Adoption Certificate Modal */}
      <Modal
        isOpen={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        title="Official Pet Adoption Certificate"
        maxWidth="max-w-2xl"
      >
        {certificateData && (
          <div className="space-y-6">
            <div id="adoption-certificate" className="border-4 border-double border-teal-700 p-8 rounded-2xl bg-gradient-to-b from-white via-teal-50/20 to-white text-center space-y-6 shadow-sm">
              <div className="space-y-1">
                <span className="text-3xl">🐾</span>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Certificate of Adoption</h2>
                <p className="text-xs font-bold text-teal-800 uppercase tracking-widest">{certificateData.shelter_name}</p>
                <p className="font-mono text-xs font-bold text-slate-500">Ref: {certificateData.certificate_code}</p>
              </div>

              <div className="py-2 text-sm text-slate-700 leading-relaxed max-w-lg mx-auto">
                This is to officially certify that on <strong>{certificateData.adoption_date}</strong>,
                <br />
                <span className="text-lg font-black text-slate-900 block my-2">{certificateData.applicant_name}</span>
                has formally adopted and assumed lifelong compassionate guardianship of
                <br />
                <span className="text-xl font-black text-teal-800 block my-2">
                  {certificateData.pet_name} ({certificateData.pet_code})
                </span>
                <span className="text-xs text-slate-500 block">
                  {certificateData.breed} &bull; {certificateData.animal_type} &bull; {certificateData.color}
                </span>
              </div>

              <div className="text-[11px] text-slate-600 italic bg-white/80 p-3 rounded-xl border border-slate-200">
                "{certificateData.agreement_text}"
              </div>

              <div className="grid grid-cols-2 pt-6 border-t border-slate-300 text-xs">
                <div>
                  <p className="font-bold text-slate-800">Shelter Director Signature</p>
                  <p className="text-slate-400 mt-4 underline font-serif italic text-sm">Paws & Care Sanctuary</p>
                </div>
                <div>
                  <p className="font-bold text-slate-800">Adoptive Parent</p>
                  <p className="text-slate-400 mt-4 underline font-serif italic text-sm">{certificateData.applicant_name}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-teal-700 text-white font-bold text-xs hover:bg-teal-800 shadow-sm"
              >
                🖨️ Print / Save as PDF
              </button>
              <button
                type="button"
                onClick={() => setCertModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
