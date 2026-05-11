import React, { useEffect, useState, useCallback } from 'react';
import { Users, RefreshCw, Download, Search, ChevronRight, AlertCircle, Mail, Phone, Calendar, Trophy } from 'lucide-react';

const AdminDriveParticipants = ({ driveId: propDriveId }) => {
  const token = localStorage.getItem('token');
  const [participants, setParticipants] = useState([]);
  const [drives, setDrives] = useState([]);
  const [selectedDriveId, setSelectedDriveId] = useState(propDriveId || '');
  const [currentDrive, setCurrentDrive] = useState(null);
  const [loading, setLoading] = useState(false);
  const [drivesLoading, setDrivesLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const apiBase = process.env.REACT_APP_API_BASE || '';

  const loadDrives = useCallback(async () => {
    try {
      setDrivesLoading(true);
      const res = await fetch(`${apiBase}/api/admin/drives`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) {
        setDrives(Array.isArray(data) ? data : []);
        if (!selectedDriveId && data.length > 0) {
          setSelectedDriveId(data[0]._id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDrivesLoading(false);
    }
  }, [apiBase, token, selectedDriveId]);

  const loadParticipants = useCallback(async () => {
    if (!selectedDriveId) { setParticipants([]); return; }
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${apiBase}/api/admin/drives/${selectedDriveId}/participants`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load participants');
      setParticipants(Array.isArray(data) ? data : []);
      setCurrentDrive(drives.find(d => d._id === selectedDriveId) || null);
    } catch (e) {
      setError(e.message);
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  }, [apiBase, token, selectedDriveId, drives]);

  useEffect(() => { loadDrives(); }, [loadDrives]);
  useEffect(() => { if (selectedDriveId) loadParticipants(); }, [selectedDriveId, loadParticipants]);

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => { if (selectedDriveId) loadParticipants(); }, 30000);
    return () => clearInterval(interval);
  }, [selectedDriveId, loadParticipants]);

  const handleDriveChange = (id) => {
    setSelectedDriveId(id);
    if (id) window.history.replaceState(null, '', `/admin/drives/${id}/participants`);
  };

  const exportCSV = () => {
    if (!participants.length) return;
    const header = 'Name,Email,Phone,Joined At';
    const rows = participants.map(p =>
      `"${(p.firstName || '') + ' ' + (p.lastName || '')}","${p.email || p.userId?.email || ''}","${p.phone || ''}","${new Date(p.createdAt).toLocaleString()}"`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `participants_${selectedDriveId}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = participants.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase();
    const email = (p.email || p.userId?.email || '').toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-700 border-b border-green-600">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="text-white w-6 h-6" />
            <div>
              <h1 className="text-xl font-bold text-white">Drive Participants</h1>
              <p className="text-green-200 text-xs mt-0.5">View and manage drive registrations</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => loadParticipants()}
              disabled={loading}
              className="p-2 rounded-lg bg-green-600/50 hover:bg-green-600 border border-green-500 text-white transition-all"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            {participants.length > 0 && (
              <button
                onClick={exportCSV}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-green-800 font-bold text-sm hover:bg-green-50 transition-all shadow"
              >
                <Download size={15} /> Export CSV
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 flex gap-6">
        {/* Sidebar */}
        <aside className="w-52 shrink-0">
          <nav className="space-y-1 sticky top-6">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">Navigation</div>
            <button onClick={() => window.location.href = '/admin/drives'} className="w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white text-sm font-medium transition-all">
              <ChevronRight size={14} className="rotate-180" />Back to Drives
            </button>
            <button onClick={() => window.location.href = '/admin/drives/verification'} className="w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white text-sm font-medium transition-all">
              Verify Drives
            </button>
            

            {/* Drive selector in sidebar */}
            {!drivesLoading && drives.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-800">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">Drives</div>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {drives.map(d => (
                    <button
                      key={d._id}
                      onClick={() => handleDriveChange(d._id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all truncate ${
                        selectedDriveId === d._id
                          ? 'bg-green-900/40 text-green-300 border border-green-700/50'
                          : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'
                      }`}
                    >
                      <div className="truncate">{d.title}</div>
                      <div className="text-gray-600 text-xs">{d.participants?.length || 0} joined</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </nav>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {error && (
            <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium border bg-red-950 border-red-800 text-red-300">
              <AlertCircle size={16} />{error}
            </div>
          )}

          {/* Drive selector & search */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="flex-1">
              <select
                value={selectedDriveId}
                onChange={e => handleDriveChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 text-white rounded-xl text-sm font-medium focus:border-green-500 focus:outline-none transition-all"
              >
                <option value="">-- Select a Drive --</option>
                {drives.map(d => (
                  <option key={d._id} value={d._id}>
                    {d.title} ({d.participants?.length || 0} joined)
                  </option>
                ))}
              </select>
            </div>
            {participants.length > 0 && (
              <div className="relative">
                <Search size={15} className="absolute left-3 top-3 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2.5 bg-gray-900 border border-gray-700 text-white rounded-xl text-sm focus:border-green-500 focus:outline-none transition-all w-64 placeholder-gray-500"
                />
              </div>
            )}
          </div>

          {/* Drive info */}
          {currentDrive && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-5 flex flex-wrap gap-4">
              <div>
                <div className="text-xs text-gray-500 font-medium">Drive</div>
                <div className="text-white font-semibold">{currentDrive.title}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">Date</div>
                <div className="text-white text-sm">{new Date(currentDrive.date).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">Capacity</div>
                <div className="text-white text-sm">{currentDrive.capacity}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">Fill Rate</div>
                <div className="text-emerald-400 font-bold text-sm">
                  {currentDrive.capacity ? Math.round((participants.length / currentDrive.capacity) * 100) : 0}%
                </div>
              </div>
            </div>
          )}

          {/* Table */}
          {!selectedDriveId ? (
            <div className="text-center py-16 text-gray-500">
              <Users size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a drive to view participants</p>
            </div>
          ) : loading ? (
            <div className="text-center py-16 flex flex-col items-center gap-2 text-gray-500">
              <RefreshCw size={24} className="animate-spin text-green-500" />
              <span className="text-sm">Loading participants...</span>
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
                <h2 className="text-white font-semibold">
                  {filtered.length} {search ? 'matching' : ''} participant{filtered.length !== 1 ? 's' : ''}
                  {search && <span className="text-gray-500 font-normal"> (of {participants.length} total)</span>}
                </h2>
              </div>
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">{search ? 'No participants match your search' : 'No participants yet'}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-800/60 border-b border-gray-700">
                        <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wide">#</th>
                        <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wide">Name</th>
                        <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wide">Email</th>
                        <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wide">Phone</th>
                        <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wide">Joined At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((p, i) => (
                        <tr key={p._id || i} className="border-t border-gray-800 hover:bg-gray-800/40 transition-colors">
                          <td className="px-5 py-3.5 text-gray-600 text-xs font-mono">{i + 1}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-green-900/50 border border-green-700/50 flex items-center justify-center text-xs font-bold text-green-400">
                                {(p.firstName?.[0] || '?').toUpperCase()}
                              </div>
                              <span className="text-white font-medium">{(p.firstName || '') + ' ' + (p.lastName || '')}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="flex items-center gap-1.5 text-gray-400">
                              <Mail size={12} className="shrink-0" />
                              {p.email || p.userId?.email || '—'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="flex items-center gap-1.5 text-gray-400">
                              <Phone size={12} className="shrink-0" />
                              {p.phone || '—'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="flex items-center gap-1.5 text-gray-500 text-xs">
                              <Calendar size={11} className="shrink-0" />
                              {new Date(p.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {/* Footer */}
              {participants.length > 0 && (
                <div className="px-5 py-3 bg-gray-800/40 border-t border-gray-800 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Total: <span className="text-white font-semibold">{participants.length}</span>
                  </span>
                  <span className="text-xs text-gray-600">Refreshes every 30s • Last: {new Date().toLocaleTimeString()}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDriveParticipants;