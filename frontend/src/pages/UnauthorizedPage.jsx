import React from 'react';

export default function UnauthorizedPage({ onNavigate }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-700 flex items-center justify-center text-3xl font-black shadow-sm">
        🔒
      </div>
      <h1 className="text-3xl font-black text-slate-900 tracking-tight">Access Restricted (403 Forbidden)</h1>
      <p className="text-sm text-slate-500 max-w-md leading-relaxed">
        Your user account does not have the necessary permission to access this module.
        Please contact your Shelter Administrator to update your role permissions.
      </p>
      <div className="pt-2">
        <button
          onClick={() => onNavigate('dashboard')}
          className="px-6 py-2.5 rounded-xl bg-teal-700 text-white font-bold text-xs hover:bg-teal-800 shadow-sm"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
