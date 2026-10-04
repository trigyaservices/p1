import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = 'teal', subtext, onClick }) {
  const colorMap = {
    teal: 'bg-teal-50 text-teal-700 border-teal-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100'
  };

  const badgeClass = colorMap[color] || colorMap.teal;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-teal-400' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
          <h4 className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</h4>
          {subtext && <p className="text-xs font-medium text-slate-500 mt-1">{subtext}</p>}
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${badgeClass}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
}
