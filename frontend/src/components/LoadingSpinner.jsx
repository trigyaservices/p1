import React from 'react';

export default function LoadingSpinner({ text = 'Loading records...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-700 rounded-full animate-spin mb-4"></div>
      <p className="text-sm font-medium text-slate-500">{text}</p>
    </div>
  );
}
