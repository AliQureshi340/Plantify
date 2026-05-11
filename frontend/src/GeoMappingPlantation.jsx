import React, { useState, useEffect, useRef } from 'react';
import './components/GeoMappingPlantation.css';
import {
  MapPin, Calendar, Users, TreePine, Search, Filter,
  Navigation, X, ChevronDown, Loader, AlertCircle,
  Compass, Layers, SlidersHorizontal, ArrowRight,
  CheckCircle2, Clock, Leaf, Wind
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

const globalCSS = `
  :root {
    --bg:       #ffffff;
    --bg2:      #f8faf8;
    --bg3:      #f0f5f0;
    --border:   #e2e8e2;
    --border2:  #c8d8c8;
    --text:     #1a2e1a;
    --text2:    #4a6b4a;
    --text3:    #7a9b7a;
    --green:    #16a34a;
    --green2:   #22c55e;
    --green3:   #dcfce7;
    --green4:   #bbf7d0;
    --red:      #ef4444;
    --blue:     #2563eb;
    --blue2:    #eff6ff;
    --card:     #ffffff;
  }
  * { box-sizing: border-box; }
  body { margin: 0; }
  .geo-root { font-family: 'DM Sans', 'Inter', sans-serif; background: var(--bg2); color: var(--text); }
  .sidebar::-webkit-scrollbar { width: 4px; }
  .sidebar::-webkit-scrollbar-track { background: var(--bg2); }
  .sidebar::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }

  .drive-card {
    transition: transform 0.18s cubic-bezier(.4,0,.2,1), box-shadow 0.18s cubic-bezier(.4,0,.2,1), border-color 0.18s ease;
    cursor: pointer;
  }
  .drive-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 28px rgba(22,163,74,0.13), 0 2px 8px rgba(0,0,0,0.06);
    border-color: var(--green) !important;
  }

  .btn-join {
    flex: 1;
    padding: 9px 0;
    background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
    border: none;
    border-radius: 10px;
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
    letter-spacing: 0.02em;
    box-shadow: 0 2px 10px rgba(22,163,74,0.35), inset 0 1px 0 rgba(255,255,255,0.15);
    transition: all 0.18s cubic-bezier(.4,0,.2,1);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
  }
  .btn-join:hover {
    background: linear-gradient(135deg, #15803d 0%, #166534 100%);
    box-shadow: 0 4px 18px rgba(22,163,74,0.45), inset 0 1px 0 rgba(255,255,255,0.15);
    transform: translateY(-1px);
  }
  .btn-join:active { transform: translateY(0); box-shadow: 0 1px 6px rgba(22,163,74,0.3); }
  .btn-join:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

  .btn-directions {
    flex: 1;
    padding: 9px 0;
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    border: 1.5px solid #93c5fd;
    border-radius: 10px;
    color: #1d4ed8;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
    letter-spacing: 0.02em;
    box-shadow: 0 2px 8px rgba(37,99,235,0.1);
    transition: all 0.18s cubic-bezier(.4,0,.2,1);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
  }
  .btn-directions:hover {
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    border-color: #60a5fa;
    box-shadow: 0 4px 16px rgba(37,99,235,0.18);
    transform: translateY(-1px);
  }
  .btn-directions:active { transform: translateY(0); }

  .btn-filter {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 9px 14px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.18s cubic-bezier(.4,0,.2,1);
    letter-spacing: 0.02em;
  }
  .btn-filter-main {
    background: var(--bg2);
    border: 1.5px solid var(--border);
    color: var(--text2);
  }
  .btn-filter-main.active {
    background: linear-gradient(135deg, #dcfce7, #bbf7d0);
    border-color: var(--green);
    color: var(--green);
    box-shadow: 0 2px 10px rgba(22,163,74,0.15);
  }
  .btn-filter-main:hover { border-color: var(--green); color: var(--green); }

  .btn-location {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 9px 14px;
    background: linear-gradient(135deg, #fff5f5, #fee2e2);
    border: 1.5px solid #fca5a5;
    border-radius: 10px;
    color: #dc2626;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.18s cubic-bezier(.4,0,.2,1);
    letter-spacing: 0.02em;
  }
  .btn-location:hover {
    background: linear-gradient(135deg, #fee2e2, #fecaca);
    border-color: #f87171;
    box-shadow: 0 3px 12px rgba(220,38,38,0.15);
    transform: translateY(-1px);
  }

  .filter-btn {
    padding: 5px 13px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    border: 1.5px solid var(--border);
    background: var(--bg);
    color: var(--text2);
    transition: all 0.15s cubic-bezier(.4,0,.2,1);
    letter-spacing: 0.02em;
  }
  .filter-btn:hover { border-color: var(--green); color: var(--green); background: var(--green3); }
  .filter-btn.active {
    background: linear-gradient(135deg, #dcfce7, #bbf7d0);
    border-color: var(--green);
    color: var(--green);
    box-shadow: 0 2px 8px rgba(22,163,74,0.18);
  }

  .btn-modal-join {
    width: 100%;
    padding: 13px;
    border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
    letter-spacing: 0.02em;
    box-shadow: 0 4px 18px rgba(22,163,74,0.38), inset 0 1px 0 rgba(255,255,255,0.15);
    transition: all 0.18s cubic-bezier(.4,0,.2,1);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .btn-modal-join:hover {
    background: linear-gradient(135deg, #15803d 0%, #166534 100%);
    box-shadow: 0 6px 24px rgba(22,163,74,0.48);
    transform: translateY(-1px);
  }
  .btn-modal-join:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

  .btn-modal-directions {
    width: 100%;
    padding: 13px;
    border-radius: 12px;
    background: linear-gradient(135deg, #eff6ff, #dbeafe);
    border: 1.5px solid #93c5fd;
    color: #1d4ed8;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
    letter-spacing: 0.02em;
    box-shadow: 0 2px 10px rgba(37,99,235,0.12);
    transition: all 0.18s cubic-bezier(.4,0,.2,1);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .btn-modal-directions:hover {
    background: linear-gradient(135deg, #dbeafe, #bfdbfe);
    border-color: #60a5fa;
    box-shadow: 0 4px 18px rgba(37,99,235,0.2);
    transform: translateY(-1px);
  }

  .stat-chip {
    background: #fff;
    border: 1.5px solid var(--border);
    border-radius: 12px;
    padding: 10px 12px;
    display: flex;
    align-items: center;
    gap: 9px;
    transition: box-shadow 0.15s ease, border-color 0.15s ease;
  }
  .stat-chip:hover { border-color: var(--green); box-shadow: 0 2px 10px rgba(22,163,74,0.1); }

  @keyframes pulse-ring {
    0%   { transform: scale(1);   opacity: 1; }
    100% { transform: scale(2.5); opacity: 0; }
  }

  .dark-popup .leaflet-popup-content-wrapper {
    background: #ffffff;
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text);
    box-shadow: 0 4px 24px rgba(0,0,0,0.12);
  }
  .dark-popup .leaflet-popup-tip { background: #ffffff; }
  .dark-popup .leaflet-popup-close-button { color: var(--text3) !important; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fade-up { animation: fadeUp 0.28s cubic-bezier(.4,0,.2,1) both; }

  @keyframes badgePulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(22,163,74,0.3); }
    50%       { box-shadow: 0 0 0 5px rgba(22,163,74,0); }
  }
  .badge-upcoming { animation: badgePulse 2.4s ease infinite; }

  input::placeholder { color: var(--text3); }
  input:focus { outline: none; border-color: var(--green) !important; box-shadow: 0 0 0 3px rgba(22,163,74,0.12); }

  .drive-card-btn-row { display: flex; gap: 8px; margin-top: 11px; }
`;

const StyleTag = () => <style>{globalCSS}</style>;

const StatChip = ({ icon: Icon, label, value, color }) => (
  <div style={{
    background: '#fff',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: '10px 12px',
    display: 'flex', alignItems: 'center', gap: 9
  }}>
    <div style={{
      background: color === 'green' ? 'var(--green3)' : color === 'blue' ? 'var(--blue2)' : '#fff7ed',
      borderRadius: 8, padding: 7, display: 'flex'
    }}>
      <Icon size={14} color={color === 'green' ? 'var(--green)' : color === 'blue' ? 'var(--blue)' : '#ea580c'} />
    </div>
    <div>
      <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{label}</div>
    </div>
  </div>
);

const GeoMappingPlantation = () => {
  const userMarkerRef = useRef(null);
  const mapRef        = useRef(null);

  const [map,              setMap]             = useState(null);
  const [userLocation,     setUserLocation]    = useState(null);
  const [selectedZone,     setSelectedZone]    = useState(null);
  const [searchQuery,      setSearchQuery]     = useState('');
  const [filterType,       setFilterType]      = useState('all');
  const [filterOrganizer,  setFilterOrganizer] = useState('all');
  const [filterDate,       setFilterDate]      = useState('all');
  const [showFilters,      setShowFilters]     = useState(false);
  const [markers,          setMarkers]         = useState([]);
  const [plantationDrives, setPlantationDrives]= useState([]);
  const [loading,          setLoading]         = useState(true);
  const [error,            setError]           = useState(null);
  const [registering,      setRegistering]     = useState(false);
  const [mapStyle,         setMapStyle]        = useState('default');
  const [tileLayer,        setTileLayer]       = useState(null);

  const fetchDrives = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/drives');
      if (!response.ok) throw new Error('Failed to fetch drives');
      const data = await response.json();
      const transformed = data.map(drive => ({
        _id:           drive._id,
        name:          drive.title,
        location:      (drive.coordinates?.lat && drive.coordinates?.lng) ? drive.coordinates : null,
        address:       drive.location,
        date:          drive.date,
        participants:  drive.registeredUsers?.length || 0,
        treesPlanted:  drive.treesToPlant || 0,
        type:          new Date(drive.date) > new Date() ? 'upcoming' : 'completed',
        organizer:     drive.organizer || 'Admin',
        organizerType: drive.organizerType || 'Government',
        description:   drive.description,
        plantSpecies:  drive.plantSpecies || [],
        status:        drive.status || 'active',
      }));
      setPlantationDrives(transformed);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDrives(); }, []);

useEffect(() => {
  const timer = setTimeout(() => {
    if (mapRef.current && !map && !mapRef.current._leaflet_id) initMap();
  }, 100);
  return () => clearTimeout(timer);
}, []);

useEffect(() => {
  getUserLocation();
}, []);

useEffect(() => {
  if (map && userLocation) updateMarkers();
}, [userLocation, map]);

  useEffect(() => {
    if (map) updateMarkers();
  }, [map, filterType, filterOrganizer, filterDate, searchQuery, plantationDrives]);

  const tileSources = {
    default:   'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    topo:      'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
  };

  const initMap = () => {
    if (!mapRef.current || mapRef.current._leaflet_id) return;
    const mapInstance = L.map(mapRef.current, { zoomControl: false }).setView([33.6844, 73.0479], 11);
    L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);
    const layer = L.tileLayer(tileSources.default, { attribution: '© OpenStreetMap' }).addTo(mapInstance);
    setTileLayer(layer);
    setMap(mapInstance);
  };

  const switchMapStyle = (style) => {
    if (!map || !tileLayer) return;
    map.removeLayer(tileLayer);
    const newLayer = L.tileLayer(tileSources[style], { attribution: '© OpenStreetMap' }).addTo(map);
    setTileLayer(newLayer);
    setMapStyle(style);
  };

  const getUserLocation = () => {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      const loc = { lat: coords.latitude, lng: coords.longitude };
      setUserLocation(loc);
    },
    () => console.log('Location denied'),
    { enableHighAccuracy: true, timeout: 10000 }
  );
};

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  const updateMarkers = () => {
    if (!map) return;
    markers.forEach(m => map.removeLayer(m));
    const newMarkers = [];

    getFilteredDrives().forEach(drive => {
      if (!drive.location?.lat || !drive.location?.lng) return;
      const isUpcoming = drive.type === 'upcoming';
      const color = isUpcoming ? '#16a34a' : '#6b7280';

      const icon = L.divIcon({
        className: '',
        html: `<div style="
          background:${color};width:20px;height:20px;border-radius:50%;
          border:3px solid #ffffff;
          box-shadow:0 2px 8px rgba(0,0,0,0.2);
          cursor:pointer;
        "></div>`,
        iconSize: [20, 20], iconAnchor: [10, 10],
      });

      const marker = L.marker([drive.location.lat, drive.location.lng], { icon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family:'DM Sans',sans-serif;padding:4px;min-width:190px;">
          <div style="font-weight:700;font-size:14px;color:#1a2e1a;margin-bottom:5px;">${drive.name}</div>
          <div style="font-size:12px;color:#4a6b4a;margin-bottom:3px;">📍 ${drive.address}</div>
          <div style="font-size:12px;color:#6b7280;">📅 ${new Date(drive.date).toLocaleDateString()}</div>
          <div style="font-size:12px;color:#6b7280;margin-top:2px;">👥 ${drive.participants} participants</div>
          <div style="margin-top:8px;">
            <span style="background:${isUpcoming?'#dcfce7':'#f3f4f6'};color:${isUpcoming?'#16a34a':'#4b5563'};padding:2px 10px;border-radius:20px;font-size:11px;font-weight:600;">${drive.type}</span>
          </div>
        </div>
      `, { className: 'dark-popup' });

      marker.on('click', () => setSelectedZone(drive));
      newMarkers.push(marker);
    });

    setMarkers(newMarkers);

    if (userLocation) {
      if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);
      const userIcon = L.divIcon({
        className: '',
        html: `<div style="position:relative;width:16px;height:16px;">
          <div style="background:#ef4444;width:16px;height:16px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 3px rgba(239,68,68,0.25);position:relative;z-index:2;"></div>
        </div>`,
        iconSize: [16, 16], iconAnchor: [8, 8],
      });
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
.addTo(map).bindPopup('<div style="font-family:\'DM Sans\',sans-serif;font-weight:700;color:#16a34a;font-size:13px;letter-spacing:0.01em;">📍 You are here</div>', { className: 'dark-popup' });
    }
  };

  const getFilteredDrives = () => plantationDrives.filter(drive => {
    if (!drive.location) return false;
    const q = searchQuery.toLowerCase();
    const matchSearch = drive.name.toLowerCase().includes(q) ||
      drive.address?.toLowerCase().includes(q) ||
      drive.organizer?.toLowerCase().includes(q) ||
      drive.plantSpecies?.some(s => s.toLowerCase().includes(q));
    const matchType = filterType === 'all' || drive.type === filterType;
    const matchOrg  = filterOrganizer === 'all' || drive.organizerType?.toLowerCase() === filterOrganizer.toLowerCase();
    let matchDate   = true;
    if (filterDate !== 'all') {
      const d = new Date(drive.date), now = new Date();
      if (filterDate === 'thisWeek')  matchDate = d >= now && d <= new Date(now.getTime() + 7*86400000);
      if (filterDate === 'thisMonth') matchDate = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    return matchSearch && matchType && matchOrg && matchDate;
  });

  const centerMapOnUser = () => {
    if (!userLocation || !map) return;
    map.setView([userLocation.lat, userLocation.lng], 16);
    userMarkerRef.current?.openPopup();
  };
  const centerMapOnZone = (loc) => map?.setView([loc.lat, loc.lng], 15);

  const getDirections = (drive) => {
    if (!userLocation) { alert('Enable location access first'); return; }
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${drive.location.lat},${drive.location.lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const handleRegisterForDrive = (driveId) => {
    setRegistering(true);
    setTimeout(() => {
      alert('Successfully registered for the drive! 🌱');
      setRegistering(false);
      setSelectedZone(null);
    }, 600);
  };

  const filteredDrives    = getFilteredDrives();
  const organizerTypes    = [...new Set(plantationDrives.map(d => d.organizerType).filter(Boolean))];
  const upcomingCount     = plantationDrives.filter(d => d.type === 'upcoming').length;
  const totalParticipants = plantationDrives.reduce((s, d) => s + d.participants, 0);
  const totalTrees        = plantationDrives.reduce((s, d) => s + d.treesPlanted, 0);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#f8faf8', flexDirection:'column', gap:16 }} className="geo-root">
      <StyleTag />
      <div style={{ display:'flex', gap:6 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width:8, height:8, borderRadius:'50%', background:'var(--green)',
            animation:`fadeUp 0.6s ease ${i*0.15}s infinite alternate`
          }} />
        ))}
      </div>
      <p style={{ color:'var(--text3)', fontSize:14, margin:0 }}>Loading plantation drives…</p>
    </div>
  );

  return (
    <div className="geo-root" style={{ display:'flex', height:'100vh', overflow:'hidden' }}>
      <StyleTag />

      {/* ── SIDEBAR ── */}
      <aside className="sidebar" style={{
        width: 370, minWidth: 370,
        background: '#fff',
        borderRight: '1px solid var(--border)',
        overflowY: 'auto', display:'flex', flexDirection:'column',
        zIndex: 10,
        boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
      }}>

        {/* Header */}
        <div style={{
          background: '#fff',
          padding: '20px 18px 16px',
          borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 0, zIndex: 20,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:3 }}>
            <div style={{ background:'var(--green3)', borderRadius:8, padding:6, display:'flex' }}>
              <Leaf size={18} color="var(--green)" />
            </div>
            <h1 style={{ margin:0, fontSize:18, fontWeight:700, color:'var(--text)', letterSpacing:'-0.3px' }}>
              Plantation Zones
            </h1>
          </div>
          <p style={{ margin:'0 0 14px 0', fontSize:12, color:'var(--text3)' }}>
            Discover &amp; join green drives near you
          </p>

          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
            <StatChip icon={Clock}    label="Upcoming"     value={upcomingCount}           color="green" />
            <StatChip icon={Users}    label="Participants" value={totalParticipants}        color="blue"  />
            <StatChip icon={TreePine} label="Trees"        value={totalTrees || '—'}       color="orange"/>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ margin:'12px 16px 0', padding:'10px 12px', background:'#fffbeb', border:'1px solid #fcd34d', borderRadius:8, display:'flex', gap:8, alignItems:'center' }}>
            <AlertCircle size={15} color="#d97706" />
            <span style={{ fontSize:12, color:'#92400e' }}>Running in offline mode</span>
          </div>
        )}

        {/* Search + Filters */}
        <div style={{ padding:'14px 16px 0' }}>
          <div style={{ position:'relative', marginBottom:10 }}>
            <Search size={14} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'var(--text3)' }} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search drives, locations, species…"
              style={{
                width:'100%', padding:'9px 12px 9px 34px',
                background:'var(--bg2)', border:'1px solid var(--border)',
                borderRadius:8, color:'var(--text)', fontSize:13,
fontFamily:'DM Sans, sans-serif',
              }}
            />
          </div>

          <div style={{ display:'flex', gap:8, marginBottom:10 }}>
  <button
    onClick={() => setShowFilters(v => !v)}
    className={`btn-filter btn-filter-main${showFilters ? ' active' : ''}`}
  >
    <SlidersHorizontal size={13} />
    Filters
    <ChevronDown size={12} style={{ transform: showFilters ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
  </button>
  {userLocation && (
    <button onClick={centerMapOnUser} className="btn-location">
      <Compass size={13} /> My Location
    </button>
  )}
</div>

          {showFilters && (
            <div className="fade-up" style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:10, padding:12, marginBottom:10 }}>
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:11, color:'var(--text3)', fontWeight:600, marginBottom:7, letterSpacing:'0.06em', textTransform:'uppercase' }}>Status</div>
                <div style={{ display:'flex', gap:6 }}>
                  {['all','upcoming','completed'].map(t => (
                    <button key={t} onClick={() => setFilterType(t)}
                      className={`filter-btn${filterType===t?' active':''}`}>
                      {t.charAt(0).toUpperCase()+t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: organizerTypes.length ? 12 : 0 }}>
                <div style={{ fontSize:11, color:'var(--text3)', fontWeight:600, marginBottom:7, letterSpacing:'0.06em', textTransform:'uppercase' }}>Date Range</div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {[{k:'all',l:'All'},{k:'thisWeek',l:'This Week'},{k:'thisMonth',l:'This Month'}].map(({k,l}) => (
                    <button key={k} onClick={() => setFilterDate(k)}
                      className={`filter-btn${filterDate===k?' active':''}`}>{l}</button>
                  ))}
                </div>
              </div>

              {organizerTypes.length > 0 && (
                <div>
                  <div style={{ fontSize:11, color:'var(--text3)', fontWeight:600, marginBottom:7, letterSpacing:'0.06em', textTransform:'uppercase' }}>Organizer</div>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {['all', ...organizerTypes].map(t => (
                      <button key={t} onClick={() => setFilterOrganizer(t)}
                        className={`filter-btn${filterOrganizer===t?' active':''}`}>
                        {t === 'all' ? 'All' : t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ fontSize:12, color:'var(--text3)', marginBottom:12, paddingBottom:12, borderBottom:'1px solid var(--border)' }}>
            <span style={{ color:'var(--green)', fontWeight:700 }}>{filteredDrives.length}</span> drive{filteredDrives.length!==1?'s':''} found
          </div>
        </div>

        {/* Drive list */}
        <div style={{ padding:'0 16px 24px', display:'flex', flexDirection:'column', gap:10 }}>
          {filteredDrives.map((drive, idx) => {
            const dist = userLocation && drive.location
              ? calculateDistance(userLocation.lat, userLocation.lng, drive.location.lat, drive.location.lng)
              : null;
            const isSelected = selectedZone?._id === drive._id;
            const isUpcoming = drive.type === 'upcoming';

            return (
              <div
                key={drive._id}
                className="drive-card fade-up"
                style={{
                  animationDelay: `${idx * 0.05}s`,
                  background: isSelected ? 'var(--green3)' : '#fff',
                  border: isSelected ? '1.5px solid var(--green)' : '1px solid var(--border)',
                  borderRadius: 12, padding:'14px',
                }}
                onClick={() => { setSelectedZone(drive); centerMapOnZone(drive.location); }}
              >
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:8 }}>
                  <h3 style={{ margin:0, fontSize:14, fontWeight:600, color:'var(--text)', flex:1, paddingRight:8, lineHeight:1.35 }}>
                    {drive.name}
                  </h3>
                  <span className={isUpcoming ? 'badge-upcoming' : ''}
                    style={{
                      padding:'2px 9px', borderRadius:20, fontSize:11, fontWeight:600, whiteSpace:'nowrap',
                      background: isUpcoming ? 'var(--green3)' : '#f3f4f6',
                      border: `1px solid ${isUpcoming ? '#86efac' : '#e5e7eb'}`,
                      color: isUpcoming ? 'var(--green)' : '#6b7280',
                    }}>
                    {drive.type}
                  </span>
                </div>

                <div style={{ display:'flex', gap:7, alignItems:'flex-start', marginBottom:6 }}>
                  <MapPin size={12} color="var(--text3)" style={{ marginTop:2, flexShrink:0 }} />
                  <span style={{ fontSize:12, color:'var(--text3)', lineHeight:1.4 }}>{drive.address}</span>
                </div>

                <div style={{ display:'flex', gap:7, alignItems:'center', marginBottom:6 }}>
                  <Calendar size={12} color="var(--text3)" />
                  <span style={{ fontSize:12, color:'var(--text3)' }}>
                    {new Date(drive.date).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}
                  </span>
                </div>

                {dist !== null && (
                  <div style={{ display:'flex', gap:7, alignItems:'center', marginBottom:6 }}>
                    <Navigation size={12} color="#ef4444" />
                    <span style={{ fontSize:12, color:'#ef4444', fontWeight:600 }}>{dist.toFixed(1)} km away</span>
                  </div>
                )}

                <div style={{ display:'flex', gap:7, marginTop:8 }}>
                  <div style={{ flex:1, background:'var(--bg2)', borderRadius:7, padding:'5px 9px', display:'flex', alignItems:'center', gap:5 }}>
                    <Users size={11} color="var(--text3)" />
                    <span style={{ fontSize:12, color:'var(--text)', fontWeight:600 }}>{drive.participants}</span>
                    <span style={{ fontSize:11, color:'var(--text3)' }}>joined</span>
                  </div>
                  <div style={{ flex:1, background:'var(--bg2)', borderRadius:7, padding:'5px 9px', display:'flex', alignItems:'center', gap:5 }}>
                    <TreePine size={11} color="var(--green)" />
                    <span style={{ fontSize:12, color:'var(--green)', fontWeight:600 }}>{drive.treesPlanted > 0 ? drive.treesPlanted : 'TBD'}</span>
                    <span style={{ fontSize:11, color:'var(--text3)' }}>trees</span>
                  </div>
                </div>

                {drive.plantSpecies?.length > 0 && (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginTop:9 }}>
                    {drive.plantSpecies.map((s, i) => (
                      <span key={i} style={{
                        padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:600,
                        background:'var(--green3)', border:'1px solid #86efac', color:'var(--green)',
                      }}>{s}</span>
                    ))}
                  </div>
                )}

               <div className="drive-card-btn-row">
  {isUpcoming && (
    <button
      className="btn-join"
      onClick={e => { e.stopPropagation(); handleRegisterForDrive(drive._id); }}
      disabled={registering}
    >
      🌱 {registering ? 'Joining…' : 'Join Drive'}
    </button>
  )}
  {drive.location && (
    <button
      className="btn-directions"
      onClick={e => { e.stopPropagation(); getDirections(drive); }}
    >
      <Navigation size={11} /> Directions
    </button>
  )}
</div>
              </div>
            );
          })}

          {filteredDrives.length === 0 && (
            <div style={{ textAlign:'center', padding:'40px 20px', color:'var(--text3)' }}>
              <Wind size={32} style={{ opacity:0.3, marginBottom:10 }} />
              <p style={{ margin:0, fontSize:14, color:'var(--text2)' }}>No drives match your filters</p>
              <p style={{ margin:'5px 0 0', fontSize:12 }}>Try adjusting or clearing filters</p>
            </div>
          )}
        </div>
      </aside>

      {/* ── MAP AREA ── */}
      <div style={{ flex:1, position:'relative' }}>
        <div ref={mapRef} style={{ width:'100%', height:'100%' }} />

        {/* Map style switcher */}
        <div style={{
          position:'absolute', top:12, left:12, zIndex:500,
          background:'#fff', border:'1px solid var(--border)',
          borderRadius:10, padding:5, display:'flex', gap:3,
          boxShadow:'0 2px 8px rgba(0,0,0,0.1)',
        }}>
          {[
            { k:'default',   l:'Street'    },
            { k:'satellite', l:'Satellite' },
            { k:'topo',      l:'Terrain'   },
          ].map(({k,l}) => (
            <button key={k} onClick={() => switchMapStyle(k)} style={{
              padding:'5px 11px', borderRadius:7, fontSize:11, fontWeight:600,
              cursor:'pointer', fontFamily:'DM Sans, sans-serif', border:'none',
              background: mapStyle===k ? 'var(--green3)' : 'transparent',
              color: mapStyle===k ? 'var(--green)' : 'var(--text3)',
              transition:'all 0.2s',
            }}>{l}</button>
          ))}
        </div>

        {/* Legend */}
        <div style={{
          position:'absolute', top:12, right:12, zIndex:500,
          background:'#fff', border:'1px solid var(--border)',
          borderRadius:10, padding:'10px 13px',
          boxShadow:'0 2px 8px rgba(0,0,0,0.08)',
          minWidth:130,
        }}>
          <div style={{ fontSize:10, fontWeight:700, color:'var(--text3)', marginBottom:7, letterSpacing:'0.06em', textTransform:'uppercase' }}>Legend</div>
          {[
            { color:'#16a34a', label:'Upcoming' },
            { color:'#6b7280', label:'Completed' },
            { color:'#ef4444', label:'You' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display:'flex', alignItems:'center', gap:7, marginBottom:5 }}>
              <div style={{ width:9, height:9, borderRadius:'50%', background:color }} />
              <span style={{ fontSize:12, color:'var(--text2)' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Bottom stats bar */}
        <div style={{
          position:'absolute', bottom:14, left:'50%', transform:'translateX(-50%)', zIndex:500,
          background:'#fff', border:'1px solid var(--border)',
          borderRadius:12, padding:'9px 20px',
          display:'flex', gap:22, alignItems:'center',
          boxShadow:'0 4px 16px rgba(0,0,0,0.1)',
        }}>
          {[
            { label:'Drives',       value: plantationDrives.length,  color:'var(--text)'  },
            { label:'Upcoming',     value: upcomingCount,             color:'var(--green)' },
            { label:'Participants', value: totalParticipants,         color:'var(--blue)'  },
            { label:'Trees',        value: totalTrees || '—',         color:'var(--green)' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ textAlign:'center' }}>
              <div style={{ fontSize:18, fontWeight:700, color, lineHeight:1 }}>{value}</div>
              <div style={{ fontSize:10, color:'var(--text3)', marginTop:2, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── DETAIL MODAL ── */}
      {selectedZone && (
        <div
          style={{
            position:'fixed', inset:0, background:'rgba(0,0,0,0.35)',
            display:'flex', alignItems:'center', justifyContent:'center',
            zIndex:9999, padding:20,
          }}
          onClick={() => setSelectedZone(null)}
        >
          <div
            className="fade-up"
            style={{
              background:'#fff',
              border:'1px solid var(--border)',
              borderRadius:16, maxWidth:500, width:'100%',
              maxHeight:'88vh', overflowY:'auto',
              boxShadow:'0 20px 60px rgba(0,0,0,0.15)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div style={{
              position:'sticky', top:0, zIndex:10,
              background:'#fff',
              borderBottom:'1px solid var(--border)',
              padding:'14px 18px',
              display:'flex', alignItems:'center', justifyContent:'space-between',
              borderRadius:'16px 16px 0 0',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ background:'var(--green3)', borderRadius:7, padding:5, display:'flex' }}>
                  <Leaf size={15} color="var(--green)" />
                </div>
                <span style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>Drive Details</span>
              </div>
              <button
                onClick={() => setSelectedZone(null)}
                style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:7, padding:'5px 7px', cursor:'pointer', color:'var(--text2)', display:'flex' }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding:20 }}>
              <div style={{ marginBottom:16 }}>
                <h2 style={{ margin:'0 0 5px', fontSize:20, fontWeight:700, color:'var(--text)', lineHeight:1.2 }}>
                  {selectedZone.name}
                </h2>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:12, color:'var(--text3)' }}>{selectedZone.organizer}</span>
                  {selectedZone.organizerType && (
                    <span style={{
                      padding:'2px 9px', borderRadius:20, fontSize:11, fontWeight:600,
                      background:'#fff7ed', border:'1px solid #fed7aa', color:'#ea580c',
                    }}>{selectedZone.organizerType}</span>
                  )}
                  <span className={selectedZone.type==='upcoming'?'badge-upcoming':''} style={{
                    marginLeft:'auto', padding:'2px 11px', borderRadius:20, fontSize:11, fontWeight:600,
                    background: selectedZone.type==='upcoming' ? 'var(--green3)' : '#f3f4f6',
                    border: `1px solid ${selectedZone.type==='upcoming' ? '#86efac' : '#e5e7eb'}`,
                    color: selectedZone.type==='upcoming' ? 'var(--green)' : '#6b7280',
                  }}>{selectedZone.type}</span>
                </div>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
                <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:10, padding:'11px 13px', display:'flex', gap:11, alignItems:'flex-start' }}>
                  <div style={{ background:'var(--green3)', borderRadius:7, padding:7, display:'flex', flexShrink:0 }}>
                    <MapPin size={13} color="var(--green)" />
                  </div>
                  <div>
                    <div style={{ fontSize:10, color:'var(--text3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:2 }}>Location</div>
                    <div style={{ fontSize:13, color:'var(--text)', lineHeight:1.4 }}>{selectedZone.address}</div>
                    {selectedZone.location && (
                      <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>
                        {selectedZone.location.lat.toFixed(4)}, {selectedZone.location.lng.toFixed(4)}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:10, padding:'11px 13px', display:'flex', gap:11, alignItems:'center' }}>
                  <div style={{ background:'var(--blue2)', borderRadius:7, padding:7, display:'flex', flexShrink:0 }}>
                    <Calendar size={13} color="var(--blue)" />
                  </div>
                  <div>
                    <div style={{ fontSize:10, color:'var(--text3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:2 }}>Date</div>
                    <div style={{ fontSize:13, color:'var(--text)' }}>
                      {new Date(selectedZone.date).toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
                    </div>
                  </div>
                </div>

                {userLocation && selectedZone.location && (
                  <div style={{ background:'#fff5f5', border:'1px solid #fecaca', borderRadius:10, padding:'11px 13px', display:'flex', gap:11, alignItems:'center' }}>
                    <div style={{ background:'#fee2e2', borderRadius:7, padding:7, display:'flex', flexShrink:0 }}>
                      <Navigation size={13} color="#ef4444" />
                    </div>
                    <div>
                      <div style={{ fontSize:10, color:'#f87171', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:2 }}>Distance from You</div>
                      <div style={{ fontSize:15, fontWeight:700, color:'#ef4444' }}>
                        {calculateDistance(userLocation.lat, userLocation.lng, selectedZone.location.lat, selectedZone.location.lng).toFixed(1)} km
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
                <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:10, padding:'12px', textAlign:'center' }}>
                  <div style={{ fontSize:24, fontWeight:700, color:'var(--text)' }}>{selectedZone.participants}</div>
                  <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>Participants</div>
                </div>
                <div style={{ background:'var(--green3)', border:'1px solid #86efac', borderRadius:10, padding:'12px', textAlign:'center' }}>
                  <div style={{ fontSize:24, fontWeight:700, color:'var(--green)' }}>{selectedZone.treesPlanted || 'TBD'}</div>
                  <div style={{ fontSize:11, color:'var(--text2)', marginTop:2 }}>Trees Planted</div>
                </div>
              </div>

              {selectedZone.description && (
                <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:10, padding:'12px', marginBottom:14 }}>
                  <div style={{ fontSize:10, color:'var(--text3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>About this Drive</div>
                  <p style={{ margin:0, fontSize:13, color:'var(--text2)', lineHeight:1.6 }}>{selectedZone.description}</p>
                </div>
              )}

              {selectedZone.plantSpecies?.length > 0 && (
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:10, color:'var(--text3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:7 }}>Plant Species</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                    {selectedZone.plantSpecies.map((s, i) => (
                      <span key={i} style={{
                        padding:'3px 11px', borderRadius:20, fontSize:12, fontWeight:600,
                        background:'var(--green3)', border:'1px solid #86efac', color:'var(--green)',
                      }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

             <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {selectedZone.type === 'upcoming' && (
                  <button
                    className="btn-modal-join"
                    onClick={() => handleRegisterForDrive(selectedZone._id)}
                    disabled={registering}
                  >
                    <CheckCircle2 size={15} />
                    {registering ? 'Joining…' : 'Join This Drive'}
                  </button>
                )}
                {selectedZone.location && (
                  <button
                    className="btn-modal-directions"
                    onClick={() => getDirections(selectedZone)}
                  >
                    <Navigation size={15} />
                    Get Directions in Google Maps
                    <ArrowRight size={13} />
                  </button>
                )}
                {selectedZone.type === 'completed' && (
                  <div style={{ padding:'11px', background:'var(--green3)', border:'1px solid #86efac', borderRadius:10, textAlign:'center' }}>
                    <p style={{ margin:0, fontSize:13, color:'var(--text2)' }}>✓ This drive has been completed</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeoMappingPlantation;