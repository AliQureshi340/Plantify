import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './components/AuthSystem';
import { User, Mail, MapPin, Calendar, TrendingUp, Star, Trophy, LogOut, Camera } from 'lucide-react';

const ProfilePage = ({ onLogout }) => {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const [avatar, setAvatar] = useState(null);
  const fileInputRef = useRef(null);
useEffect(() => {
  if (user?.profileImage) {
    setAvatar(`http://localhost:5000${user.profileImage}`);
  }
}, [user]);
  const initials = (name) => (name || 'U').charAt(0).toUpperCase();

const handleImageChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) return alert('Please select an image.');

  // Show preview immediately
  const reader = new FileReader();
  reader.onload = (ev) => setAvatar(ev.target.result);
  reader.readAsDataURL(file);

  // Upload to existing /api/auth/profile endpoint
  try {
    const fd = new FormData();
    fd.append('profileImage', file);
    const res = await fetch('http://localhost:5000/api/auth/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
  } catch (err) {
    alert('Failed to save: ' + err.message);
  }
};

  const stats = [
    { icon: '🌿', val: '42',    lbl: 'Plants Identified' },
    { icon: '🚗', val: '15',    lbl: 'Drives Joined' },
    { icon: '⭐', val: '1,000', lbl: 'Points Earned' },
    { icon: '🌳', val: '87',    lbl: 'Trees Planted' },
  ];

  const achievements = [
    { icon: '🌱', name: 'Plant Lover',      desc: 'Identified 10+ plants', color: '#10b981' },
    { icon: '📱', name: 'Tech Savvy',        desc: 'Used detection 5x',     color: '#3b82f6' },
    { icon: '🏆', name: 'Top Contributor',   desc: 'Top 10% this month',    color: '#8b5cf6' },
    { icon: '🔬', name: 'Expert Identifier', desc: '100% accuracy streak',  color: '#f59e0b' },
    { icon: '🚀', name: 'Drive Champion',    desc: 'Joined 10+ drives',     color: '#ef4444' },
    { icon: '🌍', name: 'Eco Warrior',       desc: 'Planted 50+ trees',     color: '#06b6d4' },
  ];

  const activity = [
    { icon: '🌿', text: 'Identified Monstera Deliciosa',      time: '2 hours ago' },
    { icon: '🚗', text: 'Joined "City Green Drive"',           time: 'Yesterday' },
    { icon: '⭐', text: 'Earned 50 points',                    time: '2 days ago' },
    { icon: '🌳', text: 'Planted 3 trees in Margalla Hills',   time: '1 week ago' },
    { icon: '🏆', text: 'Completed challenge: Urban Greening', time: '2 weeks ago' },
  ];

  const progress = [
    { lbl: 'Plants Identified',   val: 42, max: 100 },
    { lbl: 'Drives Joined',        val: 15, max: 50  },
    { lbl: 'Challenges Completed', val: 8,  max: 20  },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0a1410', color: '#e2f5ec', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>

        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #0d2818 0%, #0f3320 50%, #0a2010 100%)',
          border: '1px solid rgba(16,185,129,0.25)',
          borderRadius: 20, padding: '28px 32px', marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 8px 40px rgba(16,185,129,0.12)',
          flexWrap: 'wrap', gap: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 88, height: 88, borderRadius: '50%',
                border: '3px solid rgba(16,185,129,0.5)',
                overflow: 'hidden', background: 'rgba(16,185,129,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 24px rgba(16,185,129,0.2)',
              }}>
                {avatar
                  ? <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: 32, fontWeight: 800, color: '#10b981' }}>{initials(user?.name)}</span>
                }
              </div>
              <button
                onClick={() => fileInputRef.current.click()}
                style={{
                  position: 'absolute', bottom: 2, right: 2,
                  width: 28, height: 28, borderRadius: '50%',
                  background: '#10b981', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                  transition: 'transform 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.15)'}
                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Camera size={13} color="white" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#ecfdf5', marginBottom: 4 }}>
                {user?.name || 'Ali Qureshi'}
              </div>
              <div style={{ fontSize: 13, color: '#6ee7b7', marginBottom: 10 }}>
                🌿 Plant Enthusiast · Member since Jan 2024
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['Plant Expert', 'Verified'].map(b => (
                  <span key={b} style={{
                    background: 'rgba(16,185,129,0.12)', color: '#6ee7b7',
                    fontSize: 11, fontWeight: 600, padding: '3px 12px',
                    borderRadius: 20, border: '1px solid rgba(16,185,129,0.25)',
                  }}>{b}</span>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 12,
              background: 'rgba(255,255,255,0.05)', color: '#d1fae5',
              border: '1px solid rgba(255,255,255,0.1)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.3)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
          {stats.map(s => (
            <div key={s.lbl} style={{
              background: '#0d1f17', border: '1px solid rgba(16,185,129,0.15)',
              borderRadius: 16, padding: '20px 16px', textAlign: 'center',
              transition: 'all 0.25s', cursor: 'default',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}
              onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(16,185,129,0.4)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(16,185,129,0.15)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>{s.val}</div>
              <div style={{ fontSize: 11, color: '#4b7a63', marginTop: 4, fontWeight: 500 }}>{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          {['overview', 'achievements', 'activity'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '9px 24px', borderRadius: 30, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.25s', border: '1px solid transparent',
              background: tab === t ? '#10b981' : 'rgba(255,255,255,0.04)',
              color: tab === t ? 'white' : '#4b7a63',
              boxShadow: tab === t ? '0 4px 16px rgba(16,185,129,0.3)' : 'none',
            }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Account Info */}
            <div style={{
              background: '#0d1f17', border: '1px solid rgba(16,185,129,0.15)',
              borderRadius: 18, padding: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#6ee7b7', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={16} color="#10b981" /> Account Information
              </div>
              {[
                { icon: <User size={15} color="#10b981" />,      label: 'Full Name',    val: user?.name  || 'Ali Qureshi' },
                { icon: <Mail size={15} color="#3b82f6" />,      label: 'Email',        val: user?.email || 'ali@example.com' },
                { icon: <MapPin size={15} color="#ef4444" />,    label: 'Location',     val: 'Islamabad, Pakistan' },
                { icon: <Calendar size={15} color="#8b5cf6" />,  label: 'Member Since', val: 'January 2024' },
              ].map(r => (
                <div key={r.label} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: 'rgba(255,255,255,0.04)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{r.icon}</div>
                  <div>
                    <div style={{ fontSize: 10, color: '#4b7a63', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{r.label}</div>
                    <div style={{ fontSize: 13, color: '#d1fae5', marginTop: 2 }}>{r.val}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress */}
            <div style={{
              background: '#0d1f17', border: '1px solid rgba(16,185,129,0.15)',
              borderRadius: 18, padding: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#6ee7b7', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={16} color="#10b981" /> Your Progress
              </div>
              {progress.map(p => (
                <div key={p.lbl} style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: '#9ca3af' }}>{p.lbl}</span>
                    <span style={{ fontSize: 13, color: '#d1fae5', fontWeight: 700 }}>{p.val}/{p.max}</span>
                  </div>
                  <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 6,
                      background: 'linear-gradient(90deg, #059669, #10b981)',
                      width: `${(p.val / p.max) * 100}%`,
                      transition: 'width 0.8s ease',
                      boxShadow: '0 0 8px rgba(16,185,129,0.4)',
                    }} />
                  </div>
                </div>
              ))}
              <div style={{
                marginTop: 8, padding: '14px 16px',
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: 12,
              }}>
                <div style={{ color: '#10b981', fontWeight: 700, fontSize: 13 }}>🏆 Rank: Plant Expert</div>
                <div style={{ color: '#4b7a63', fontSize: 12, marginTop: 3 }}>Top 15% of all users</div>
              </div>
            </div>
          </div>
        )}

        {/* Achievements */}
        {tab === 'achievements' && (
          <div style={{
            background: '#0d1f17', border: '1px solid rgba(16,185,129,0.15)',
            borderRadius: 18, padding: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#6ee7b7', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Trophy size={16} color="#10b981" /> Achievements
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
              {achievements.map(a => (
                <div key={a.name} style={{
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 14, padding: 16, display: 'flex', alignItems: 'flex-start', gap: 12,
                  transition: 'all 0.2s', cursor: 'default',
                }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: `${a.color}18`,
                    border: `1px solid ${a.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                  }}>{a.icon}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#d1fae5' }}>{a.name}</div>
                    <div style={{ fontSize: 11, color: '#4b7a63', marginTop: 3 }}>{a.desc}</div>
                    <span style={{
                      display: 'inline-block', marginTop: 8,
                      fontSize: 11, fontWeight: 600, padding: '2px 10px',
                      borderRadius: 20, color: a.color,
                      background: `${a.color}18`, border: `1px solid ${a.color}30`,
                    }}>Unlocked</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity */}
        {tab === 'activity' && (
          <div style={{
            background: '#0d1f17', border: '1px solid rgba(16,185,129,0.15)',
            borderRadius: 18, padding: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#6ee7b7', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Star size={16} color="#10b981" /> Recent Activity
            </div>
            {activity.map((a, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 10px', borderRadius: 12,
                transition: 'background 0.2s', cursor: 'default',
                borderBottom: i < activity.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(16,185,129,0.06)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10, fontSize: 18,
                  background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>{a.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: '#d1fae5', fontWeight: 500 }}>{a.text}</div>
                  <div style={{ fontSize: 11, color: '#4b7a63', marginTop: 3 }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default ProfilePage;