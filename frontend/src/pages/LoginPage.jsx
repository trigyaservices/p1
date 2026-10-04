import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage({ onNavigate }) {
  const { login } = useAuth();
  const { showToast } = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(username, password);
      showToast(`Welcome back, ${user.name}!`);
      onNavigate('dashboard');
    } catch (err) {
      setError(err.message || 'Invalid username or password.');
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (u, p) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-teal-700 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md">
            🐾
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Staff & User Portal</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Sign in with the credentials provided by your Administrator
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none transition-all"
            />
          </div>

          {/* Password with Show/Hide Toggle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none transition-all pr-16"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-teal-700 hover:text-teal-900 px-2 py-1 rounded"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

        {/* Demo Credentials Helper for BCA Examination */}
        <div className="pt-6 border-t border-slate-100 space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
            Demo Credentials (Click to Auto-fill)
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillCredentials('admin', 'Admin@123')}
              className="p-2 text-left bg-slate-50 hover:bg-teal-50 border border-slate-200 rounded-xl transition-colors"
            >
              <span className="font-bold text-slate-800 block">👑 Admin</span>
              <span className="text-[10px] text-slate-500 font-mono">admin / Admin@123</span>
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('dr.sharma', 'Staff@123')}
              className="p-2 text-left bg-slate-50 hover:bg-teal-50 border border-slate-200 rounded-xl transition-colors"
            >
              <span className="font-bold text-slate-800 block">🩺 Vet (Dr. Sharma)</span>
              <span className="text-[10px] text-slate-500 font-mono">dr.sharma / Staff@123</span>
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('priya.patel', 'Staff@123')}
              className="p-2 text-left bg-slate-50 hover:bg-teal-50 border border-slate-200 rounded-xl transition-colors"
            >
              <span className="font-bold text-slate-800 block">📋 Shelter Manager</span>
              <span className="text-[10px] text-slate-500 font-mono">priya.patel / Staff@123</span>
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('anita.adopter', 'User@123')}
              className="p-2 text-left bg-slate-50 hover:bg-teal-50 border border-slate-200 rounded-xl transition-colors"
            >
              <span className="font-bold text-slate-800 block">👤 Applicant (User)</span>
              <span className="text-[10px] text-slate-500 font-mono">anita.adopter / User@123</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
