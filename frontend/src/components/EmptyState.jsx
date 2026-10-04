import React from 'react';

export default function EmptyState({ icon: Icon, title = 'No Records Found', description = 'There are no items matching the selected criteria.', action }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 mb-4 shadow-sm">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <h3 className="text-base font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      {action}
    </div>
  );
}
