import React from 'react';

export default function Pagination({ currentPage = 1, totalPages = 1, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 sm:px-6 bg-white rounded-b-2xl">
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-600">
            Page <span className="font-semibold text-slate-900">{currentPage}</span> of{' '}
            <span className="font-semibold text-slate-900">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-xl shadow-sm" aria-label="Pagination">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-xl px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 focus:z-20 disabled:opacity-40 disabled:hover:bg-white border border-slate-300"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold border ${
                  currentPage === page
                    ? 'z-10 bg-teal-700 text-white border-teal-700'
                    : 'text-slate-700 hover:bg-slate-50 border-slate-300'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-xl px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 focus:z-20 disabled:opacity-40 disabled:hover:bg-white border border-slate-300"
            >
              Next
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
