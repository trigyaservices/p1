import React from 'react';

export default function StatusBadge({ status, type = 'adoption' }) {
  if (!status) return null;

  const s = String(status).toUpperCase();

  // Adoption Statuses
  if (type === 'adoption') {
    switch (s) {
      case 'AVAILABLE':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Available</span>;
      case 'APPLICATION PENDING':
      case 'PENDING':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">Application Pending</span>;
      case 'VISIT SCHEDULED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">Visit Scheduled</span>;
      case 'VISIT COMPLETED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">Visit Completed</span>;
      case 'UNDER REVIEW':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-800 border border-cyan-200">Under Review</span>;
      case 'FOSTER':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">Foster Care</span>;
      case 'UNDER TREATMENT':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">Under Treatment</span>;
      case 'ADOPTED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">Adopted</span>;
      case 'APPROVED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Approved</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">Rejected</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">{status}</span>;
    }
  }

  // Vaccination Alerts
  if (type === 'vaccination') {
    switch (s) {
      case 'OVERDUE':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-300">Overdue (Action Required)</span>;
      case 'DUE_SOON':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-300">Due Soon (&le; 7 Days)</span>;
      case 'UPCOMING':
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-300">Upcoming (Current)</span>;
    }
  }

  // User Status
  if (type === 'user_status') {
    if (s === 'ACTIVE') {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Active</span>;
    }
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-300">Disabled</span>;
  }

  return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">{status}</span>;
}
