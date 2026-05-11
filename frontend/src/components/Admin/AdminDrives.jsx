import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useAuth } from '../AuthSystem';
import {
  TreePine, BarChart3, Users, MapPin, Calendar, RefreshCw, Trash2, Edit3,
  Eye, EyeOff, Plus, X, ChevronRight, TrendingUp, CheckCircle, Clock, XCircle,
  AlertCircle, Map
} from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const ClickHandler = ({ onChange }) => {
  useMapEvents({ click: (e) => onChange({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
};

const MapPicker = ({ value, onChange }) => (
  <MapContainer center={[value.lat, value.lng]} zoom={12} style={{ height: '220px', width: '100%', borderRadius: '8px' }}>
    <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <ClickHandler onChange={onChange} />
    <Marker position={[value.lat, value.lng]} />
  </MapContainer>
);

const DEFAULT_FORM = {
  title: '', description: '', date: '', location: '', capacity: 100,
  isPublic: true, coordinates: { lat: 33.6844, lng: 73.0479 },
};

const STATUS_CONFIG = {
  upcoming:  { label: 'Upcoming',  color: 'text-blue-300',    bg: 'bg-blue-900/40',   border: 'border-blue-700', icon: Clock },
  ongoing:   { label: 'Ongoing',   color: 'text-emerald-300', bg: 'bg-emerald-900/40',border: 'border-emerald-700', icon: CheckCircle },
  completed: { label: 'Completed', color: 'text-gray-300',    bg: 'bg-gray-800',      border: 'border-gray-700', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-red-300',     bg: 'bg-red-900/30',    border: 'border-red-800', icon: XCircle },
};

const AdminDrives = () => {
  const { token, user } = useAuth();
  const [drives, setDrives] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState(DEFAULT_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const apiBase = process.env.REACT_APP_API_BASE || '';

  const notify = (msg, type = 'success') => {
    if (type === 'error') setError(msg); else setSuccess(msg);
    setTimeout(() => { setError(''); setSuccess(''); }, 4000);
  };

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/admin/drives`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setDrives(data);
      const a = await fetch(`${apiBase}/api/admin/drives/analytics`, { headers: { Authorization: `Bearer ${token}` } });
      const aData = await a.json();
      if (a.ok) setAnalytics(aData);
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [apiBase, token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => {
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const submit = async () => {
    if (!form.title || !form.location || !form.date) { notify('Title, location and date are required.', 'error'); return; }
    setSubmitting(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${apiBase}/api/admin/drives/${editingId}` : `${apiBase}/api/admin/drives`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      notify(editingId ? 'Drive updated.' : 'Drive created.');
      cancelEdit();
      fetchAll();
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const cancelEdit = () => {
    setForm(DEFAULT_FORM);
    setEditingId(null);
    setShowMap(false);
    setShowForm(false);
  };

  const startEdit = (d) => {
    setEditingId(d._id);
    setForm({
      title: d.title || '', description: d.description || '',
      date: d.date ? new Date(d.date).toISOString().slice(0, 16) : '',
      location: d.location || '', capacity: d.capacity || 100,
      isPublic: d.isPublic !== false,
      coordinates: d.coordinates || { lat: 33.6844, lng: 73.0479 },
    });
    setShowForm(true);
    setShowMap(!!d.coordinates);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id) => {
    try {
      const res = await fetch(`${apiBase}/api/admin/drives/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      notify('Drive deleted.');
      setDeleteConfirm(null);
      fetchAll();
    } catch (e) { notify(e.message, 'error'); }
  };

  const togglePublic = async (id) => {
    try {
      const res = await fetch(`${apiBase}/api/admin/drives/${id}/toggle-public`, {
        method: 'PATCH', headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      fetchAll();
    } catch (e) { notify(e.message, 'error'); }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${apiBase}/api/admin/drives/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      fetchAll();
    } catch (e) { notify(e.message, 'error'); }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <AlertCircle size={40} className="mx-auto mb-3 text-red-500" />
          <p className="text-lg font-semibold text-white">Admin Access Required</p>
        </div>
      </div>
    );
  }

  const totalParticipants = drives.reduce((s, d) => s + (d.participants?.length || 0), 0);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-700 border-b border-green-600">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TreePine className="text-white w-6 h-6" />
            <div>
              <h1 className="text-xl font-bold text-white">Plantation Drives</h1>
              <p className="text-green-200 text-xs mt-0.5">Create and manage community drives</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchAll} className="p-2 rounded-lg bg-green-600/50 hover:bg-green-600 border border-green-500 text-white transition-all">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => window.location.href = '/dashboard'} className="p-2 rounded-lg bg-green-600/50 hover:bg-green-600 border border-green-500 text-white transition-all">
  <ChevronRight size={16} className="rotate-180" />
</button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 flex gap-6">
        {/* Sidebar */}
        <aside className="w-52 shrink-0">
          <nav className="space-y-1 sticky top-6">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">Navigation</div>
            {[
              { label: 'Create Drive', href: '/admin/drives/create', icon: Plus },
              { label: 'Verify User Drives', href: '/admin/drives/verification', icon: CheckCircle },
              { label: 'Analytics', href: '/admin/drives/analytics', icon: BarChart3 },
            ].map(({ label, href, icon: Icon }) => (
              <button key={label} onClick={() => window.location.href = href}
                className="w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white text-sm font-medium transition-all">
                <Icon size={15} />{label}
              </button>
            ))}
            <div className="pt-3 mt-3 border-t border-gray-800">
              <button onClick={() => {
                const d = drives.find(d => d.participants?.length > 0) || drives[0];
                if (d) window.location.href = `/admin/drives/${d._id}/participants`;
                else notify('No drives available.', 'error');
              }} className="w-full text-left flex items-center justify-between px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white text-sm font-medium transition-all">
                <span className="flex items-center gap-2"><Users size={15} />Participants</span>
                <span className="text-xs bg-green-900 text-green-300 px-1.5 py-0.5 rounded-full font-bold">{totalParticipants}</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Notifications */}
          {(error || success) && (
            <div className={`mb-4 flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium border ${
              error ? 'bg-red-950 border-red-800 text-red-300' : 'bg-emerald-950 border-emerald-800 text-emerald-300'
            }`}>
              <AlertCircle size={16} />{error || success}
            </div>
          )}

          {/* Analytics */}
          {analytics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Total Drives', value: analytics.totals.totalDrives, icon: TreePine, color: 'text-green-400' },
                { label: 'Upcoming', value: analytics.totals.upcoming, icon: Clock, color: 'text-blue-400' },
                { label: 'Participants', value: analytics.totals.totalParticipants, icon: Users, color: 'text-purple-400' },
                { label: 'Avg. Fill', value: `${analytics.totals.averageFillPercent}%`, icon: TrendingUp, color: 'text-amber-400' },
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
          )}

          {/* Create/Edit Form */}
          {showForm && (
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-6">
              <h2 className="text-white font-bold text-lg mb-5">
                {editingId ? 'Edit Drive' : 'Create New Drive'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'title', label: 'Title *', placeholder: 'Drive title', type: 'text' },
                  { key: 'location', label: 'Location *', placeholder: 'Margalla Hills, Islamabad', type: 'text' },
                  { key: 'date', label: 'Date & Time *', type: 'datetime-local' },
                  { key: 'capacity', label: 'Capacity', placeholder: '100', type: 'number' },
                ].map(({ key, label, placeholder, type }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">{label}</label>
                    <input
                      type={type}
                      className="w-full rounded-lg px-4 py-2.5 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition-all text-sm"
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={e => setForm({ ...form, [key]: type === 'number' ? Number(e.target.value) : e.target.value })}
                    />
                  </div>
                ))}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Description</label>
                  <textarea
                    className="w-full rounded-lg px-4 py-2.5 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition-all text-sm"
                    placeholder="Describe this drive..."
                    rows={3}
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={form.isPublic}
                    onChange={e => setForm({ ...form, isPublic: e.target.checked })}
                    className="w-4 h-4 accent-green-500"
                  />
                  <label htmlFor="isPublic" className="text-gray-300 text-sm font-medium">Public Drive</label>
                </div>
              </div>

              {/* Map Toggle */}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setShowMap(v => !v)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 hover:border-blue-500 text-gray-300 hover:text-white text-sm font-medium transition-all"
                >
                  <Map size={15} />{showMap ? 'Hide Map' : 'Pick Location on Map'}
                </button>
                {showMap && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">
                      Click to set coordinates — <span className="text-green-400 font-mono">{form.coordinates.lat.toFixed(5)}, {form.coordinates.lng.toFixed(5)}</span>
                    </p>
                    <MapPicker value={form.coordinates} onChange={coords => setForm({ ...form, coordinates: coords })} />
                  </div>
                )}
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={submit}
                  disabled={submitting}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all border border-green-500"
                >
                  {submitting ? <RefreshCw size={15} className="animate-spin" /> : <Plus size={15} />}
                  {submitting ? 'Saving...' : editingId ? 'Update Drive' : 'Create Drive'}
                </button>
                <button onClick={cancelEdit} className="px-5 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:text-white font-semibold text-sm transition-all">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Drives Grid */}
          {loading ? (
            <div className="text-center py-16 flex flex-col items-center gap-2 text-gray-500">
              <RefreshCw size={24} className="animate-spin text-green-500" />
              <span className="text-sm">Loading drives...</span>
            </div>
          ) : drives.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <TreePine size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No drives yet. Create the first one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {drives.map(d => {
                const status = d.status || 'upcoming';
                const sc = STATUS_CONFIG[status] || STATUS_CONFIG.upcoming;
                const StatusIcon = sc.icon;
                const fillPct = d.capacity ? Math.round(((d.participants?.length || 0) / d.capacity) * 100) : 0;
                return (
                  <div key={d._id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all group">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border ${sc.bg} ${sc.color} ${sc.border}`}>
                            <StatusIcon size={10} />{sc.label}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${d.isPublic ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' : 'bg-gray-800 text-gray-500 border-gray-700'}`}>
                            {d.isPublic ? 'Public' : 'Private'}
                          </span>
                        </div>
                        <h3 className="text-white font-semibold truncate">{d.title}</h3>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-1.5"><Calendar size={11} />{new Date(d.date).toLocaleString()}</div>
                      <div className="flex items-center gap-1.5"><MapPin size={11} />{d.location}</div>
                      {d.coordinates && <div className="flex items-center gap-1.5 font-mono"><span>📍</span>{d.coordinates.lat.toFixed(4)}, {d.coordinates.lng.toFixed(4)}</div>}
                    </div>

                    {d.description && <p className="text-gray-400 text-sm mb-3 line-clamp-2">{d.description}</p>}

                    {/* Fill bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{d.participants?.length || 0} joined</span>
                        <span>{d.capacity} capacity ({fillPct}%)</span>
                      </div>
                      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-600 to-emerald-500 rounded-full transition-all"
                          style={{ width: `${Math.min(fillPct, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Status selector */}
                    <div className="mb-3">
                      <select
                        value={status}
                        onChange={e => updateStatus(d._id, e.target.value)}
                        className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg text-xs font-medium focus:border-green-500 focus:outline-none"
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-800">
                      <button onClick={() => window.location.href = `/admin/drives/${d._id}/participants`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 hover:border-green-600 text-gray-300 hover:text-white text-xs font-semibold transition-all">
                        <Users size={12} />Participants
                      </button>
                      <button onClick={() => startEdit(d)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 hover:border-blue-600 text-gray-300 hover:text-white text-xs font-semibold transition-all">
                        <Edit3 size={12} />Edit
                      </button>
                      <button onClick={() => togglePublic(d._id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 hover:border-purple-600 text-gray-300 hover:text-white text-xs font-semibold transition-all">
                        {d.isPublic ? <EyeOff size={12} /> : <Eye size={12} />}
                        {d.isPublic ? 'Make Private' : 'Make Public'}
                      </button>
                      <button onClick={() => setDeleteConfirm(d._id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-900/30 border border-red-800 hover:bg-red-800 text-red-400 hover:text-white text-xs font-semibold transition-all">
                        <Trash2 size={12} />Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-white font-bold text-lg mb-2">Delete Drive?</h3>
            <p className="text-gray-400 text-sm mb-6">This will permanently remove the drive and all participant data.</p>
            <div className="flex gap-3">
              <button onClick={() => remove(deleteConfirm)} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-semibold text-sm transition-all">Delete</button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-gray-800 border border-gray-700 text-gray-300 hover:text-white py-2.5 rounded-lg font-semibold text-sm transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDrives;