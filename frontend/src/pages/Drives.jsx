import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthSystem';

export default function Drives() {
  const { authFetch, user } = useAuth();
  const [drives, setDrives] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => { fetchDrives(); }, []);

  const fetchDrives = async () => {
    try {
      const [dRes, sRes] = await Promise.all([
        authFetch('/api/drives'),
        authFetch('/api/drives/stats')
      ]);
      const dData = await dRes.json();
      const sData = await sRes.json();
      setDrives(dData.filter(d => d.status === 'approved'));
      setStats(sData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const joinDrive = async (id) => {
    const res = await authFetch(`/api/drives/${id}/join`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) return alert(data.error);
    fetchDrives();
  };

  const joinWaitlist = async (id) => {
    const res = await authFetch(`/api/drives/${id}/waitlist`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) return alert(data.error);
    alert('Added to waitlist!');
    fetchDrives();
  };

  const getCountdown = (date) => {
    const diff = new Date(date) - new Date();
    if (diff <= 0) return null;
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    return days > 0 ? `Starts in ${days}d ${hours}h` : `Starts in ${hours}h`;
  };

  const filtered = drives.filter(d => {
    const matchSearch =
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.location.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'All' ||
      d.status === filter.toLowerCase() ||
      d.location === filter;
    return matchSearch && matchFilter;
  });

  if (loading) return (
<div className="min-h-screen bg-[#0f172a]">
<div className="max-w-7xl mx-auto px-6 py-8"></div>
    <div className="text-green-400 text-lg font-medium">Loading drives...</div>
    </div>
  );

  return (
<div className="min-h-screen bg-[#0f172a]"><div className="max-w-7xl mx-auto px-6 py-8">

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">
          🌳
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Plantation Drives</h1>
          <p className="text-gray-400 text-sm mt-1">Discover and join tree plantation drives near you</p>
        </div>
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active Drives', value: stats.activeDrives, icon: '🌿' },
            { label: 'Trees Planted', value: stats.totalTrees, icon: '🌳' },
            { label: 'You Joined', value: stats.joinedByUser, icon: '✅' },
            { label: 'Total Participants', value: stats.totalParticipants, icon: '👥' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4 border border-gray-700 bg-[#1e293b] flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-gray-400">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search + Filters */}
      <div className="flex flex-wrap gap-3 mb-8 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search by title or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-600 rounded-xl text-sm focus:outline-none focus:border-green-500 bg-[#1e293b] text-white placeholder-gray-500"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {['All', 'Upcoming', 'Ongoing', 'Islamabad', 'Lahore', 'KPK'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                filter === f
                  ? 'bg-green-600 text-white border-green-600 shadow-sm'
                  : 'bg-[#1e293b] text-gray-300 border-gray-600 hover:border-green-500 hover:text-green-400'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <div className="text-5xl mb-3">🌱</div>
          <p className="text-lg font-medium text-gray-400">No drives found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(drive => {
            const joined = drive.participants?.includes(user?._id);
            const full = drive.participants?.length >= drive.capacity;
            const fillPct = Math.min((drive.participants?.length / drive.capacity) * 100, 100);
            const countdown = getCountdown(drive.date);

            return (
              <div key={drive._id} className="bg-[#1e293b] rounded-2xl border border-gray-700 hover:border-gray-500 transition-all duration-200 flex flex-col overflow-hidden">

                {/* Color top bar */}
                <div className={`h-1.5 w-full ${
                  drive.status === 'ongoing' ? 'bg-green-500' :
                  drive.status === 'upcoming' ? 'bg-blue-500' :
                  drive.status === 'completed' ? 'bg-gray-500' : 'bg-red-400'
                }`} />

                <div className="p-5 flex flex-col gap-3 flex-1">

                  {/* Title + Badge */}
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-lg font-bold text-white leading-tight">{drive.title}</h3>
                    <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-semibold ${
                      drive.status === 'ongoing' ? 'bg-green-900 text-green-400' :
                      drive.status === 'upcoming' ? 'bg-blue-900 text-blue-400' :
                      drive.status === 'completed' ? 'bg-gray-700 text-gray-400' :
                      'bg-red-900 text-red-400'
                    }`}>
                      {drive.status}
                    </span>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-col gap-1.5 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <span>📍</span>
                      <span className="font-medium text-gray-300">{drive.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span>{new Date(drive.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    {countdown && (
                      <div className="flex items-center gap-2 text-blue-400 font-medium">
                        <span>⏱</span>
                        <span>{countdown}</span>
                      </div>
                    )}
                  </div>

                  {/* Capacity Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                      <span>Spots filled</span>
                      <span className="font-semibold text-gray-300">{drive.participants?.length || 0} / {drive.capacity}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          full ? 'bg-red-500' : fillPct > 80 ? 'bg-yellow-400' : 'bg-green-500'
                        }`}
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  {drive.description && (
                    <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">{drive.description}</p>
                  )}

                  {/* Action */}
                  <div className="mt-auto pt-2">
                    {joined ? (
                      <div className="flex items-center gap-2 text-green-400 font-semibold text-sm py-2">
                        <span>✅</span> You joined this drive
                      </div>
                    ) : full ? (
                      <button
                        onClick={() => joinWaitlist(drive._id)}
                        className="w-full py-2.5 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-white text-sm font-semibold transition-all"
                      >
                        Join Waitlist
                      </button>
                    ) : (
                      <button
                        onClick={() => joinDrive(drive._id)}
                        className="w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition-all"
                      >
                        Join Drive
                      </button>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
   </div></div>
  );
}