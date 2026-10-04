import React from 'react';

export default function NotFoundPage({ onNavigate }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center text-3xl font-black shadow-sm">
        🐾
      </div>
      <h1 className="text-3xl font-black text-slate-900 tracking-tight">Page Not Found (404)</h1>
      <p className="text-sm text-slate-500 max-w-md leading-relaxed">
        The pet dossier or system section you are looking for does not exist or has been relocated.
      </p>
      <div className="pt-2">
        <button
          onClick={() => onNavigate('home')}
          className="px-6 py-2.5 rounded-xl bg-teal-700 text-white font-bold text-xs hover:bg-teal-800 shadow-sm"
        >
          Return to Sanctuary Home
        </button>
      </div>
    </div>
  );
}
