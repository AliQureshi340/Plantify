import React, { useEffect, useState, useCallback } from 'react';
import { BarChart3, TreePine, Users, TrendingUp, Calendar, RefreshCw, AlertCircle, MapPin, ChevronRight } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

const AdminAnalytics = () => {
  const token = localStorage.getItem('token');
  const [analytics, setAnalytics] = useState(null);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [aRes, dRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/drives/analytics`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/admin/drives`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (aRes.ok) { const d = await aRes.json(); setAnalytics(d); }
      if (dRes.ok) { const d = await dRes.json(); setDrives(Array.isArray(d) ? d : []); }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const totalRaised = drives.reduce((s, d) => s + (d.raised || 0), 0);
  const totalTrees = drives.reduce((s, d) => s + (d.treesToPlant || 0), 0);
  const statusCounts = drives.reduce((acc, d) => {
    const s = d.status || 'upcoming';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const topDrives = [...drives]
    .sort((a, b) => (b.participants?.length || 0) - (a.participants?.length || 0))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-700 border-b border-green-600">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="text-white w-6 h-6" />
            <div>
              <h1 className="text-xl font-bold text-white">Analytics</h1>
              <p className="text-green-200 text-xs mt-0.5">Drive performance and statistics</p>
            </div>
          </div>
          <button onClick={fetchAnalytics} disabled={loading} className="p-2 rounded-lg bg-green-600/50 hover:bg-green-600 border border-green-500 text-white transition-all">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 flex gap-6">
        {/* Sidebar */}
        <aside className="w-52 shrink-0">
          <nav className="space-y-1 sticky top-6">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">Navigation</div>
            {[
              { label: 'Back to Drives', href: '/admin/drives' },
              { label: 'Verify Drives', href: '/admin/drives/verification' },
              
            ].map(({ label, href }) => (
              <button key={label} onClick={() => window.location.href = href}
                className="w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white text-sm font-medium transition-all">
                <ChevronRight size={14} className="rotate-180" />{label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {error && (
            <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium border bg-red-950 border-red-800 text-red-300">
              <AlertCircle size={16} />{error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-16 flex flex-col items-center gap-2 text-gray-500">
              <RefreshCw size={24} className="animate-spin text-green-500" />
              <span className="text-sm">Loading analytics...</span>
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'Total Drives', value: analytics?.totals?.totalDrives ?? drives.length, icon: TreePine, color: 'text-green-400' },
                  { label: 'Total Participants', value: analytics?.totals?.totalParticipants ?? drives.reduce((s, d) => s + (d.participants?.length || 0), 0), icon: Users, color: 'text-blue-400' },
                  { label: 'Avg Fill Rate', value: `${analytics?.totals?.averageFillPercent ?? 0}%`, icon: TrendingUp, color: 'text-amber-400' },
                  { label: 'Trees Planned', value: totalTrees.toLocaleString(), icon: TreePine, color: 'text-emerald-400' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500 font-medium">{label}</span>
                      <Icon size={15} className={color} />
                    </div>
                    <div className="text-2xl font-bold text-white">{value}</div>
                  </div>
                ))}
              </div>

              {/* Status Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wide text-gray-400">Status Breakdown</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'upcoming', label: 'Upcoming', color: 'bg-blue-500' },
                      { key: 'ongoing', label: 'Ongoing', color: 'bg-emerald-500' },
                      { key: 'completed', label: 'Completed', color: 'bg-gray-500' },
                      { key: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
                    ].map(({ key, label, color }) => {
                      const count = statusCounts[key] || 0;
                      const total = drives.length || 1;
                      const pct = Math.round((count / total) * 100);
                      return (
                        <div key={key}>
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>{label}</span>
                            <span className="text-white font-semibold">{count} ({pct}%)</span>
                          </div>
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Top Drives */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wide text-gray-400">Top Drives by Participants</h3>
                  {topDrives.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-6">No drives yet</p>
                  ) : (
                    <div className="space-y-2">
                      {topDrives.map((d, i) => (
                        <div key={d._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition-all">
                          <span className={`text-xs font-black w-5 ${i === 0 ? 'text-amber-400' : 'text-gray-600'}`}>#{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{d.title}</p>
                            <p className="text-gray-500 text-xs flex items-center gap-1"><MapPin size={10} />{d.location}</p>
                          </div>
                          <span className="text-emerald-400 font-bold text-sm shrink-0">{d.participants?.length || 0}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Upcoming vs Past */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wide text-gray-400">Upcoming vs Past</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Upcoming', value: analytics?.totals?.upcoming ?? 0, icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-900/20 border-blue-800/40' },
                    { label: 'Past', value: analytics?.totals?.past ?? 0, icon: BarChart3, color: 'text-gray-400', bg: 'bg-gray-800 border-gray-700' },
                  ].map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className={`rounded-xl p-5 border ${bg} flex items-center gap-4`}>
                      <Icon size={28} className={color} />
                      <div>
                        <div className="text-3xl font-black text-white">{value}</div>
                        <div className="text-xs text-gray-500 font-medium mt-0.5">{label} Drives</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;