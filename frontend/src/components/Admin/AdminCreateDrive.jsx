import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader, Calendar, Users, TreePine, Search, X, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
const ORGANIZER_TYPES = ['Government', 'NGO', 'Educational', 'Corporate', 'Community'];

const Field = ({ label, name, required, children, error: err }) => (
  <div>
    <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wide">
      {label}{required && <span className="text-red-400 ml-1">*</span>}
    </label>
    {children}
    {err && <p className="mt-1 text-xs text-red-400">{err}</p>}
  </div>
);

const CreateDrive = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const coordsRef = useRef({ lat: 33.6844, lng: 73.0479 });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [displayCoords, setDisplayCoords] = useState({ lat: 33.6844, lng: 73.0479 });

  const [formData, setFormData] = useState({
    title: '', description: '', location: '',
    date: '', time: '', maxParticipants: '', treesToPlant: '',
    requirements: '', contactInfo: '', organizer: '', organizerType: 'Government',
  });

  const isAdmin = userRole === 'admin';

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(userData.role);
    const timer = setTimeout(() => initMap(), 100);
    return () => clearTimeout(timer);
  }, []);

  const initMap = () => {
    if (!mapRef.current || mapRef.current._leaflet_id) return;
    const { lat, lng } = coordsRef.current;
    const mapInstance = L.map(mapRef.current).setView([lat, lng], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap', maxZoom: 19,
    }).addTo(mapInstance);

    const icon = L.divIcon({
      className: '',
      html: `<div style="width:24px;height:24px;border-radius:50%;background:#10b981;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>`,
      iconSize: [24, 24], iconAnchor: [12, 12],
    });

    const m = L.marker([lat, lng], { icon, draggable: true }).addTo(mapInstance);
    m.on('dragend', (e) => {
      const pos = e.target.getLatLng();
      updateCoords({ lat: pos.lat, lng: pos.lng });
    });
    mapInstance.on('click', (e) => {
      m.setLatLng(e.latlng);
      updateCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    mapInstanceRef.current = mapInstance;
    markerRef.current = m;
  };

  const updateCoords = (pos) => {
    coordsRef.current = pos;
    setDisplayCoords(pos);
    reverseGeocode(pos);
  };

  const reverseGeocode = async (coords) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json`);
      const data = await res.json();
      if (data.display_name) setFormData(prev => ({ ...prev, location: data.display_name }));
    } catch {}
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleLocationSearch = (e) => {
    const query = e.target.value;
    setFormData(prev => ({ ...prev, location: query }));
    if (fieldErrors.location) setFieldErrors(prev => ({ ...prev, location: '' }));
    clearTimeout(searchTimeoutRef.current);
    if (query.length < 2) { setSearchResults([]); setShowSearchResults(false); return; }
    setSearchLoading(true);
    setShowSearchResults(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=8`);
        const data = await res.json();
        setSearchResults(data);
      } catch { setSearchResults([]); }
      finally { setSearchLoading(false); }
    }, 500);
  };

  const selectResult = (result) => {
    const pos = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([pos.lat, pos.lng], 15);
      markerRef.current.setLatLng([pos.lat, pos.lng]);
    }
    coordsRef.current = pos;
    setDisplayCoords(pos);
    setFormData(prev => ({ ...prev, location: result.display_name }));
    setShowSearchResults(false);
    setSearchResults([]);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) { setError('Geolocation not supported.'); return; }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const pos = { lat: coords.latitude, lng: coords.longitude };
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([pos.lat, pos.lng], 15);
          markerRef.current.setLatLng([pos.lat, pos.lng]);
        }
        updateCoords(pos);
      },
      () => setError('Location access denied.')
    );
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Title is required';
    if (!formData.description.trim()) errs.description = 'Description is required';
    if (!formData.location.trim()) errs.location = 'Location is required';
    if (!formData.date) errs.date = 'Date is required';
    if (!formData.maxParticipants || Number(formData.maxParticipants) < 1) errs.maxParticipants = 'Min 1 participant';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please login to continue');
      const body = {
        title: formData.title, description: formData.description, location: formData.location,
        coordinates: coordsRef.current, date: formData.date, time: formData.time,
        capacity: parseInt(formData.maxParticipants) || 100,
        maxParticipants: parseInt(formData.maxParticipants) || 100,
        treesToPlant: parseInt(formData.treesToPlant) || 0,
        requirements: formData.requirements, contactInfo: formData.contactInfo,
        organizer: formData.organizer || (isAdmin ? 'Admin' : 'User'),
        organizerType: formData.organizerType,
      };
      const endpoint = isAdmin ? '/api/admin/drives' : '/api/drives';
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed'); }
      setSuccess(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSuccess(false);
    setFormData({
      title: '', description: '', location: '',
      date: '', time: '', maxParticipants: '', treesToPlant: '',
      requirements: '', contactInfo: '', organizer: '', organizerType: 'Government',
    });
    coordsRef.current = { lat: 33.6844, lng: 73.0479 };
    setDisplayCoords({ lat: 33.6844, lng: 73.0479 });
    if (markerRef.current) markerRef.current.setLatLng([33.6844, 73.0479]);
    if (mapInstanceRef.current) mapInstanceRef.current.setView([33.6844, 73.0479], 12);
    setFieldErrors({});
  };

  const inputCls = (name) =>
    `w-full px-4 py-2.5 bg-gray-800 border ${fieldErrors[name] ? 'border-red-600' : 'border-gray-700'} text-white rounded-xl focus:ring-0 focus:border-green-500 transition-all text-sm placeholder-gray-500`;

  if (success) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-900/50 border-2 border-emerald-600 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {isAdmin ? 'Drive Published!' : 'Drive Submitted!'}
          </h2>
          <p className="text-gray-400 mb-2">{formData.title}</p>
          <p className="text-gray-500 text-sm mb-8">
            {isAdmin ? 'Your drive is now live and visible to all users.' : 'Your drive has been submitted and is pending admin review.'}
          </p>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-left mb-6 space-y-2 text-sm">
            <div className="flex gap-2"><MapPin size={14} className="text-blue-400 mt-0.5 shrink-0" /><span className="text-gray-300">{formData.location}</span></div>
            <div className="flex gap-2"><Calendar size={14} className="text-orange-400 mt-0.5 shrink-0" /><span className="text-gray-300">{new Date(formData.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span></div>
            <div className="flex gap-2"><Users size={14} className="text-purple-400 mt-0.5 shrink-0" /><span className="text-gray-300">Capacity: {formData.maxParticipants}</span></div>
          </div>
          <div className="flex gap-3">
            <button onClick={reset} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold text-sm transition-all">Create Another</button>
            <button onClick={() => window.location.href = isAdmin ? '/admin/drives' : '/user/my-drives'} className="flex-1 bg-gray-800 border border-gray-700 text-gray-300 hover:text-white py-3 rounded-xl font-bold text-sm transition-all">
              {isAdmin ? 'View All Drives' : 'My Drives'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-gradient-to-r from-green-700 to-emerald-700 rounded-xl p-6 mb-6 flex items-center gap-4 border border-green-600">
          <div className="p-3 bg-green-600/50 rounded-xl border border-green-500">
            <TreePine className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Create Plantation Drive</h1>
            <p className="text-green-200 text-sm mt-0.5">
              {isAdmin ? 'Admin Mode — Drive publishes immediately' : 'Propose a drive for admin review'}
            </p>
          </div>
          <button onClick={() => window.location.href = '/admin/drives'} className="ml-auto flex items-center gap-1.5 text-green-200 hover:text-white text-sm font-medium transition-all">
            <ChevronRight size={14} className="rotate-180" />Back
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 px-4 py-3 rounded-xl bg-red-950 border border-red-800 text-red-300 text-sm">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />{error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left — Form */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
            <div className="border-b border-gray-800 pb-4">
              <h2 className="text-white font-bold text-base">Drive Information</h2>
            </div>

            <Field label="Title" name="title" required error={fieldErrors.title}>
              <input name="title" type="text" className={inputCls('title')} placeholder="Community Tree Planting Drive" value={formData.title} onChange={handleChange} />
            </Field>

            <Field label="Description" name="description" required error={fieldErrors.description}>
              <textarea name="description" rows={3} className={inputCls('description')} placeholder="Goals and purpose of this drive..." value={formData.description} onChange={handleChange} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Date" name="date" required error={fieldErrors.date}>
                <input name="date" type="date" min={new Date().toISOString().split('T')[0]} className={inputCls('date')} value={formData.date} onChange={handleChange} />
              </Field>
              <Field label="Time" name="time">
                <input name="time" type="time" className={inputCls('time')} value={formData.time} onChange={handleChange} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Max Participants" name="maxParticipants" required error={fieldErrors.maxParticipants}>
                <input name="maxParticipants" type="number" min="1" className={inputCls('maxParticipants')} placeholder="50" value={formData.maxParticipants} onChange={handleChange} />
              </Field>
              <Field label="Trees to Plant" name="treesToPlant">
                <input name="treesToPlant" type="number" min="0" className={inputCls('treesToPlant')} placeholder="100" value={formData.treesToPlant} onChange={handleChange} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Organizer Name" name="organizer">
                <input name="organizer" type="text" className={inputCls('organizer')} placeholder="Organization / person" value={formData.organizer} onChange={handleChange} />
              </Field>
              <Field label="Organizer Type" name="organizerType">
                <select name="organizerType" className={inputCls('organizerType')} value={formData.organizerType} onChange={handleChange}>
                  {ORGANIZER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Requirements" name="requirements">
              <textarea name="requirements" rows={2} className={inputCls('requirements')} placeholder="What should participants bring?" value={formData.requirements} onChange={handleChange} />
            </Field>

            <Field label="Contact Info" name="contactInfo">
              <input name="contactInfo" type="text" className={inputCls('contactInfo')} placeholder="Phone or email" value={formData.contactInfo} onChange={handleChange} />
            </Field>

            <div className={`rounded-xl p-3 border text-xs font-medium ${isAdmin ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300' : 'bg-amber-950/50 border-amber-800 text-amber-300'}`}>
              {isAdmin ? '🔒 Admin Mode: Published immediately, visible to all users.' : '⏳ User Mode: Submitted for admin review before going public.'}
            </div>

            <button onClick={handleSubmit} disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm transition-all border border-green-500 shadow-lg">
              {loading ? <Loader size={18} className="animate-spin" /> : <TreePine size={18} />}
              {loading ? 'Submitting...' : isAdmin ? 'Publish Drive' : 'Submit for Approval'}
            </button>
          </div>

          {/* Right — Map */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <div className="border-b border-gray-800 pb-4">
              <h2 className="text-white font-bold text-base">Select Location</h2>
            </div>

            <Field label="Search Location" name="location" required error={fieldErrors.location}>
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-3 text-gray-500" />
                <input
                  type="text"
                  name="location"
                  className={`w-full pl-10 pr-9 py-2.5 bg-gray-800 border ${fieldErrors.location ? 'border-red-600' : 'border-gray-700'} text-white rounded-xl focus:border-blue-500 transition-all text-sm placeholder-gray-500`}
                  placeholder="Search for a location..."
                  value={formData.location}
                  onChange={handleLocationSearch}
                />
                {showSearchResults && (
                  <button onClick={() => { setShowSearchResults(false); setSearchResults([]); }} className="absolute right-3 top-3 text-gray-500 hover:text-gray-300">
                    <X size={15} />
                  </button>
                )}
                {showSearchResults && (
                  <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                    {searchLoading ? (
                      <div className="p-4 text-center"><Loader size={18} className="animate-spin text-blue-400 mx-auto" /></div>
                    ) : searchResults.length > 0 ? (
                      <div className="p-1.5">
                        {searchResults.map((r, i) => (
                          <button key={i} onClick={() => selectResult(r)} className="w-full text-left p-2.5 hover:bg-gray-700 rounded-lg transition-all border-b border-gray-700/50 last:border-0">
                            <div className="flex items-start gap-2.5">
                              <MapPin size={14} className="text-blue-400 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-white text-sm font-medium">{r.display_name.split(',')[0]}</p>
                                <p className="text-gray-500 text-xs">{r.display_name}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-sm text-gray-500">No results found</div>
                    )}
                  </div>
                )}
              </div>
            </Field>

            <button onClick={useCurrentLocation} className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-medium transition-all">
              <MapPin size={14} />Use My Current Location
            </button>

            <div className="bg-gray-800 rounded-lg px-3 py-2 border border-gray-700">
              <span className="text-xs text-gray-500 font-mono">📍 {displayCoords.lat.toFixed(6)}, {displayCoords.lng.toFixed(6)}</span>
            </div>

            <div className="bg-blue-950/30 border border-blue-800/40 rounded-xl p-3 text-xs text-blue-300">
              Click the map or drag the marker to set the location. Use the search box for quick finding.
            </div>

            <div ref={mapRef} className="w-full h-80 rounded-xl border border-gray-700 overflow-hidden" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateDrive;