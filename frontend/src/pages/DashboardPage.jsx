import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function DashboardPage({ onNavigate }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [statsRes, chartsRes, actRes] = await Promise.all([
          api.getDashboardStats(),
          api.getDashboardCharts(),
          api.getRecentActivity()
        ]);

        if (statsRes.success) setStats(statsRes.data);
        if (chartsRes.success) setCharts(chartsRes.data);
        if (actRes.success) setRecentActivity(actRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) return <LoadingSpinner text="Compiling sanctuary intelligence & statistics..." />;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-teal-200 text-xs font-bold uppercase tracking-wider mb-2">
            Sanctuary Operational Control
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-teal-100 text-sm mt-1 max-w-xl">
            Here is the live status of all animals, medical rounds, adoption pipelines, and scheduled meet & greets for today.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => onNavigate('pets')}
            className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-all"
          >
            + Manage Pets
          </button>
          <button
            onClick={() => onNavigate('adoptions')}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all"
          >
            Adoptions ({stats?.pendingApplications || 0})
          </button>
        </div>
      </div>

      {/* 10 Required Stat Cards Grid */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Core Shelter Metrics</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Pets"
            value={stats?.totalPets || 0}
            color="teal"
            subtext="Shelter Census"
            onClick={() => onNavigate('pets')}
          />
          <StatCard
            title="Available"
            value={stats?.availablePets || 0}
            color="emerald"
            subtext="Ready to Adopt"
            onClick={() => onNavigate('pets')}
          />
          <StatCard
            title="Adopted"
            value={stats?.adoptedPets || 0}
            color="teal"
            subtext="Forever Homes"
            onClick={() => onNavigate('reports')}
          />
          <StatCard
            title="In Treatment"
            value={stats?.underTreatment || 0}
            color="rose"
            subtext="Clinical Care"
            onClick={() => onNavigate('medical')}
          />
          <StatCard
            title="In Foster"
            value={stats?.fosterPets || 0}
            color="purple"
            subtext="Caregiver Homes"
            onClick={() => onNavigate('foster')}
          />
          <StatCard
            title="Pending Apps"
            value={stats?.pendingApplications || 0}
            color="amber"
            subtext="Awaiting Review"
            onClick={() => onNavigate('adoptions')}
          />
          <StatCard
            title="Today's Visits"
            value={stats?.todayVisits || 0}
            color="blue"
            subtext="Meet & Greets"
            onClick={() => onNavigate('visits')}
          />
          <StatCard
            title="Vaccines Due"
            value={stats?.vaccinationsDue || 0}
            color="orange"
            subtext="Due in &le; 7 Days"
            onClick={() => onNavigate('vaccinations')}
          />
          <StatCard
            title="Overdue Vaccines"
            value={stats?.vaccinationsOverdue || 0}
            color="rose"
            subtext="Urgent Attention"
            onClick={() => onNavigate('vaccinations')}
          />
          <StatCard
            title="Monthly Due"
            value={stats?.monthlyReportsPending || 0}
            color="amber"
            subtext="Pending Reviews"
            onClick={() => onNavigate('monthly-reports')}
          />
        </div>
      </div>

      {/* Analytics & Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Pets by Category */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-slate-800 text-base">Shelter Population by Species</h4>
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg">Realtime</span>
          </div>
          <div className="space-y-3 pt-2">
            {charts?.petsByCategory && charts.petsByCategory.map(cat => {
              const total = stats?.totalPets || 10;
              const pct = Math.round((cat.count / total) * 100);
              return (
                <div key={cat.animal_type} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{cat.animal_type}s</span>
                    <span>{cat.count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Adoption Pipeline & Statuses */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-slate-800 text-base">Adoption Status Distribution</h4>
            <span className="text-xs font-semibold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-lg">Lifecycle</span>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            {charts?.adoptionStatusDistribution && charts.adoptionStatusDistribution.map(item => (
              <div key={item.adoption_status} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-xs font-medium text-slate-500 block">{item.adoption_status}</span>
                <span className="text-xl font-extrabold text-slate-900 mt-1 block">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 3: Monthly Adoption Trends */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-slate-800 text-base">Monthly Adoptions Trend (2026)</h4>
            <span className="text-xs text-slate-400 font-medium">Last 6 Months</span>
          </div>
          <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
            {charts?.monthlyAdoptionTrend && charts.monthlyAdoptionTrend.map(trend => {
              const maxVal = Math.max(...charts.monthlyAdoptionTrend.map(t => t.count), 10);
              const heightPct = Math.round((trend.count / maxVal) * 100);
              return (
                <div key={trend.month_label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-xs font-bold text-teal-800">{trend.count}</span>
                  <div
                    className="w-full bg-gradient-to-t from-teal-700 to-teal-500 rounded-t-xl transition-all duration-500 shadow-sm"
                    style={{ height: `${heightPct}%`, minHeight: '12px' }}
                  ></div>
                  <span className="text-[10px] font-bold text-slate-500 truncate">{trend.month_label.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 4: Health & Treatment Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-slate-800 text-base">Veterinary Health Breakdown</h4>
            <span className="text-xs text-slate-400 font-medium">Current Status</span>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            {charts?.healthStatusDistribution && charts.healthStatusDistribution.map(item => (
              <div key={item.health_status} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-xs font-semibold text-slate-500 block">{item.health_status}</span>
                <span className="text-xl font-extrabold text-teal-700 mt-1 block">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="font-extrabold text-slate-900 text-base">Recent Shelter Activity Stream</h4>
          <span className="text-xs font-bold text-slate-400">Live Audit</span>
        </div>

        <div className="divide-y divide-slate-100">
          {recentActivity.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No recent activity recorded.</p>
          ) : (
            recentActivity.slice(0, 7).map(act => (
              <div key={act.id} className="py-3 flex items-start justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800 block">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 mr-2 font-mono text-[10px]">
                      {act.action}
                    </span>
                    {act.details}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Executed by: <strong>{act.user_name}</strong> &bull; IP: {act.ip_address}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 whitespace-nowrap ml-4">
                  {new Date(act.created_at).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
