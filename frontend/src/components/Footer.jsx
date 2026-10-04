import React from 'react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white font-black text-xl">
                🐾
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">Paws & Care Sanctuary</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Dedicated animal rescue, medical rehabilitation, and adoption network operating across Maharashtra.
              Committed to ethical no-kill sheltering, public education, and forever pet matching.
            </p>
            <p className="text-xs text-teal-400 font-semibold">
              BCA Final Year Project &bull; Real Full-Stack Web Application (Node.js + React + MySQL)
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Quick Navigation</h5>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => onNavigate && onNavigate('home')} className="hover:text-white transition-colors">
                  Home Page
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('public-pets')} className="hover:text-white transition-colors">
                  Available Pets
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('home', 'how-it-works')} className="hover:text-white transition-colors">
                  Adoption Process
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('login')} className="hover:text-white transition-colors">
                  Staff & Admin Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Shelter Info */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Contact & Hours</h5>
            <p className="text-sm text-slate-400">Plot 45, Green Valley Sanctuary Road, Near Pashan Lake, Pune, MH 411021</p>
            <p className="text-sm text-slate-300 font-medium">Emergency Rescue: +91 98765 43210</p>
            <p className="text-sm text-slate-400">Visiting Hours: 10:00 AM – 6:00 PM (Tue–Sun)</p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Pet Adoption and Management System. Designed for BCA Final Year Demonstration.</p>
        </div>
      </div>
    </footer>
  );
}
