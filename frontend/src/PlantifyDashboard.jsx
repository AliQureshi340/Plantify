  import React, { useState, useEffect, useCallback } from 'react';
import ForestRestoration from "./components/ForestRestoration";
import PlantShop from './components/PlantShop';
import UserDrives from './components/Admin/UserDrives';
import { useAuth } from './components/AuthSystem';
import GeoMappingPlantation from './GeoMappingPlantation';
import CorporateSponsorship from './components/CorporateSponsorship';
import Drives from './pages/Drives';
import CommunityEngagement from './components/CommunityEngagement'; 
import ProfilePage from './ProfilePage';
import PlantDatabase from './components/PlantDatabase';const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

const PlantifyDashboard = () => {
  const { user, logout, authFetch, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  // Community page state
  const [communityTab, setCommunityTab] = useState('feed'); // 'feed' | 'leaderboards' | 'achievements' | 'challenges'
  const [feedItems, setFeedItems] = useState([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [lbGlobal, setLbGlobal] = useState([]);
  const [lbWeekly, setLbWeekly] = useState([]);
  const [lbCity, setLbCity] = useState([]);
  const [lbCityName, setLbCityName] = useState('');
  // New story form state
  const [storyCaption, setStoryCaption] = useState('');
  const [storyFiles, setStoryFiles] = useState([]);
  const [storyBusy, setStoryBusy] = useState(false);
  const [storyError, setStoryError] = useState('');
  // Edit post state
  const [editPostId, setEditPostId] = useState(null);
  const [editCaption, setEditCaption] = useState('');
  const [editVisibility, setEditVisibility] = useState('public');
  const [editTags, setEditTags] = useState('');
  const [editBusy, setEditBusy] = useState(false);
  // Comments state
  const [openComments, setOpenComments] = useState({}); // postId -> bool
  const [commentsByPost, setCommentsByPost] = useState({}); // postId -> array
  const [commentsLoading, setCommentsLoading] = useState({}); // postId -> bool
  const [commentInputs, setCommentInputs] = useState({}); // postId -> text
  // Challenges state
  const [challengesActive, setChallengesActive] = useState([]);
  const [challengesScheduled, setChallengesScheduled] = useState([]);
  const [challengesPast, setChallengesPast] = useState([]);
  const [challengesLoading, setChallengesLoading] = useState(false);
  const [joining, setJoining] = useState({}); // challengeId -> bool
  const [myChallenges, setMyChallenges] = useState([]);
  const [chTab, setChTab] = useState('active'); // 'active' | 'scheduled' | 'past'
  // Proof-of-completion form (per challenge)
  const [proofNotes, setProofNotes] = useState({}); // id -> text
  const [proofFiles, setProofFiles] = useState({}); // id -> File[]
  const [proofModalId, setProofModalId] = useState(null); // challenge id for modal

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const toggleComments = async (postId) => {
    setOpenComments(prev => ({ ...prev, [postId]: !prev[postId] }));
    if (!openComments[postId]) {
      await loadComments(postId);
    }
  };

  const completeChallenge = async (id) => {
    try {
      setJoining(prev => ({ ...prev, [id]: true }));
      // Upload proof images if any
      let media = [];
      const files = proofFiles[id] || [];
      if (files.length > 0) {
        const fd = new FormData();
        files.slice(0,5).forEach(f => fd.append('images', f));
        const upRes = await fetch(`${API_BASE}/api/social/upload`, {
          method: 'POST',
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
          body: fd
        });
        const upData = await upRes.json();
        if (!upRes.ok) throw new Error(upData.error || 'Upload failed');
        media = upData.media || [];
      }
      const body = {
        proofNotes: (proofNotes[id] || '').trim(),
        proofMedia: media
      };
      const res = await authFetch(`/api/social/challenges/${id}/complete`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) {
        await Promise.all([loadChallengesActive(), loadMyParticipations()]);
        setProofNotes(prev => ({ ...prev, [id]: '' }));
        setProofFiles(prev => ({ ...prev, [id]: [] }));
        setProofModalId(null);
      } else {
        const jd = await res.json();
        alert(jd.error || 'Failed to complete');
      }
    } catch (e) {
      // no-op
    } finally {
      setJoining(prev => ({ ...prev, [id]: false }));
    }
  };

  const loadComments = async (postId) => {
    try {
      setCommentsLoading(prev => ({ ...prev, [postId]: true }));
      const res = await fetch(`${API_BASE}/api/social/posts/${postId}/comments`);
      const data = await res.json();
      if (res.ok) {
        setCommentsByPost(prev => ({ ...prev, [postId]: data }));
      } else {
        setCommentsByPost(prev => ({ ...prev, [postId]: [] }));
      }
    } catch (e) {
      setCommentsByPost(prev => ({ ...prev, [postId]: [] }));
    } finally {
      setCommentsLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const likePost = async (postId) => {
    try {
      const res = await authFetch(`/api/social/posts/${postId}/like`, { method: 'POST' });
      if (res.ok) {
        await loadFeed();
      }
    } catch (e) {
      // no-op
    }
  };

  const addComment = async (postId) => {
    const text = (commentInputs[postId] || '').trim();
    if (!text) return;
    try {
      const res = await authFetch(`/api/social/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (res.ok) {
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
        await Promise.all([loadComments(postId), loadFeed()]);
      } else {
        const jd = await res.json();
        alert(jd.error || 'Failed to comment');
      }
    } catch (e) {
      // no-op
    }
  };

  const handleStoryFiles = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    setStoryFiles(files);
  };

  const submitStory = async (e) => {
    e?.preventDefault();
    setStoryError('');
    if (!storyCaption && storyFiles.length === 0) {
      setStoryError('Add a caption or at least one image.');
      return;
    }
    try {
      setStoryBusy(true);
      let media = [];
      if (storyFiles.length > 0) {
        const fd = new FormData();
        storyFiles.forEach(f => fd.append('images', f));
        const upRes = await fetch(`${API_BASE}/api/social/upload`, {
          method: 'POST',
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined
          },
          body: fd
        });
        const upData = await upRes.json();
        if (!upRes.ok) throw new Error(upData.error || 'Upload failed');
        media = upData.media || [];
      }

      const createRes = await authFetch('/api/social/posts', {
        method: 'POST',
        body: JSON.stringify({ caption: storyCaption, media, tags: [], visibility: 'public' })
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error || 'Failed to post');

      // Reset form and reload feed
      setStoryCaption('');
      setStoryFiles([]);
      await loadFeed();
    } catch (err) {
      setStoryError(err.message || 'Failed to share story');
    } finally {
      setStoryBusy(false);
    }
  };

  const loadNotifications = useCallback(async () => {
    try {
      const res = await authFetch('/api/notifications');
      if (!res.ok) return;
      const data = await res.json();
      
      const prevUnreadIds = new Set(notifications.filter(n => !n.read).map(n => n._id));
      const newUnread = data.filter(n => !n.read && !prevUnreadIds.has(n._id));
      
      if (newUnread.length > 0) {
        setToast({ 
          title: newUnread[0].title, 
          message: newUnread[0].message, 
          link: newUnread[0].link 
        });
        setTimeout(() => setToast(null), 5000);
      }
      
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  }, [authFetch, notifications]);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Increased to 30s
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = async () => {
    try {
      const unread = notifications.filter(n => !n.read);
      await Promise.all(unread.map(n => 
        authFetch(`/api/notifications/${n._id}/read`, { method: 'PATCH' })
      ));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const navigateToPage = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  // --- Community Data Loaders ---
  const loadFeed = useCallback(async () => {
    try {
      setFeedLoading(true);
      const res = await authFetch('/api/social/feed');
      if (!res.ok) throw new Error('Feed failed');
      const data = await res.json();
      setFeedItems(data.items || []);
    } catch (e) {
      console.error('Feed load error:', e);
      setFeedItems([]);
    } finally {
      setFeedLoading(false);
    }
  }, [authFetch]);

  const loadLeaderboards = useCallback(async (city) => {
    try {
      const [g, w, c] = await Promise.all([
        fetch('/api/social/leaderboards/global'),
        fetch('/api/social/leaderboards/weekly'),
        city ? fetch(`/api/social/leaderboards/city/${encodeURIComponent(city)}`) : Promise.resolve({ ok: true, json: async () => [] })
      ]);
      setLbGlobal(g.ok ? await g.json() : []);
      setLbWeekly(w.ok ? await w.json() : []);
      setLbCity(c.ok ? await c.json() : []);
    } catch (e) {
      console.error('Leaderboards load error:', e);
      setLbGlobal([]); setLbWeekly([]); setLbCity([]);
    }
  }, []);

  useEffect(() => {
    if (currentPage === 'community') {
      if (communityTab === 'feed') loadFeed();
      if (communityTab === 'leaderboards') loadLeaderboards(lbCityName);
      if (communityTab === 'challenges') {
        loadChallengesActive();
        loadChallengesScheduled();
        loadChallengesPast();
        loadMyParticipations();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, communityTab]);

  const loadChallengesActive = async () => {
    try {
      setChallengesLoading(true);
      const res = await fetch(`${API_BASE}/api/social/challenges/active`);
      const data = await res.json();
      setChallengesActive(res.ok ? data : []);
    } catch (e) {
      setChallengesActive([]);
    } finally {
      setChallengesLoading(false);
    }
  };

  const loadChallengesScheduled = async () => {
    try {
      setChallengesLoading(true);
      const res = await fetch(`${API_BASE}/api/social/challenges/scheduled`);
      const data = await res.json();
      setChallengesScheduled(res.ok ? data : []);
    } catch (e) {
      setChallengesScheduled([]);
    } finally {
      setChallengesLoading(false);
    }
  };

  const loadChallengesPast = async () => {
    try {
      setChallengesLoading(true);
      const res = await fetch(`${API_BASE}/api/social/challenges/past`);
      const data = await res.json();
      setChallengesPast(res.ok ? data : []);
    } catch (e) {
      setChallengesPast([]);
    } finally {
      setChallengesLoading(false);
    }
  };

  const loadMyParticipations = async () => {
    try {
      const res = await authFetch('/api/social/me/challenges');
      const data = await res.json();
      if (res.ok) setMyChallenges(data);
    } catch (e) {
      setMyChallenges([]);
    }
  };

  const joinChallenge = async (id) => {
    try {
      setJoining(prev => ({ ...prev, [id]: true }));
      const res = await authFetch(`/api/social/challenges/${id}/join`, { method: 'POST' });
      if (res.ok) {
        await Promise.all([loadChallengesActive(), loadMyParticipations()]);
      } else {
        const jd = await res.json();
        alert(jd.error || 'Failed to join');
      }
    } catch (e) {
      // no-op
    } finally {
      setJoining(prev => ({ ...prev, [id]: false }));
    }
  };

  const IconComponent = ({ name, className = '' }) => {
    const icons = {
      'Home': <img src="/images/dashboard copy.png" alt="Dashboard" className={`w-20 h-19 ${className}`} />,
      'Cart': <img src="/images/cart.png" alt="Cart" className={`w-190 h-20 ${className}`} />,
      'Drive': <img src="/images/drive.png" alt="Drive" className={`w-20 h-12 ${className}`} />,
      'User': <img src="/images/profile.png" alt="Profile" className={`w-20 h-12 ${className}`} />,
      'Bell': '🔔',
      'Leaf': <img src="/images/plantify_logo_400x400.jpg" alt="Plantify" className={`w-80 h-10 ${className}`} />,
      'Camera': <img src="/images/4273907.png" alt="Camera" className={`w-13 h-13 ${className}`} />
    };
    return <span className={className}>{icons[name] || '•'}</span>;
  };

  const PageLoader = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-lime-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>
      <div className="relative z-10 text-center">
        <div className="mb-8">
         
         <div className="w-20 h-20 mx-auto flex items-center justify-center animate-pulse">
            <img src="https://img.icons8.com/?size=100&id=4Xem_S1LR0kT&format=png&color=40C057" width="80" height="80" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-8 animate-pulse">Loading...</h2>
        <div className="w-80 mx-auto">
          <div className="bg-gray-700 rounded-full h-2 mb-4 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full w-full"></div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );

  const renderDashboard = () => (
    <div className="page-content min-h-screen">
      <div className="animate-fade-in-up">
        <ForestRestoration />
      </div>

      
      <section className="py-16 bg-white rounded-xl mb-16 shadow-lg border border-gray-100">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">How Plantify Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Join our mission to make the world greener, one plant at a time</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8">
          <div className="text-center group">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
              <span className="text-green-600 text-2xl">📱</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Identify Plants</h3>
            <p className="text-gray-600">Use AI to identify plants instantly with your camera</p>
          </div>
          
          <div className="text-center group">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
              <span className="text-blue-600 text-2xl">🛒</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Shop Plants</h3>
            <p className="text-gray-600">Browse and purchase plants from our curated collection</p>
          </div>
          
          <div className="text-center group">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
              <span className="text-purple-600 text-2xl">🌳</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Join Drives</h3>
            <p className="text-gray-600">Participate in tree plantation drives in your area</p>
          </div>
        </div>
      </section>

      

      {/* Footer */}
      <footer className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-16 rounded-xl animate-fade-in-up shadow-2xl" style={{animationDelay: '800ms'}}>
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mr-4">
              <IconComponent name="Leaf" className="text-white text-xl" />
            </div>
            <h3 className="text-3xl font-bold">Plantify</h3>
          </div>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of plant enthusiasts in making the world a greener place. 
            Every plant identified, every tree planted makes a difference.
          </p>
          <div className="flex justify-center space-x-8 mb-8">
            <button className="text-gray-300 hover:text-white transition-colors duration-300 hover:scale-105 transform">
              About Us
            </button>
            <button className="text-gray-300 hover:text-white transition-colors duration-300 hover:scale-105 transform">
              Contact
            </button>
            <button className="text-gray-300 hover:text-white transition-colors duration-300 hover:scale-105 transform">
              Privacy
            </button>
            <button className="text-gray-300 hover:text-white transition-colors duration-300 hover:scale-105 transform">
              Terms
            </button>
          </div>
          <p className="text-gray-400 text-sm">
            © 2024 Plantify. All rights reserved. Made with 💚 for nature.
          </p>
        </div>
      </footer>
    </div>
  );

  
  const renderPageContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return renderDashboard();
      case 'shop':
        return <PlantShop />;
      case 'my-drives':
        return <UserDrives />;
        case 'CorporateSponsorship':
        return <CorporateSponsorship />;
        case 'plantdb':
  return <PlantDatabase />;
        case 'drives':  // ADD THIS
      return <Drives />;  // ADD THIS
        case 'map':
  return <GeoMappingPlantation />;
      case 'profile':
  return <ProfilePage onLogout={handleLogout} />;
      case 'community':
  return <CommunityEngagement authFetch={authFetch} API_BASE={API_BASE} token={token} user={user} />;
        return (
          <div className="page-content min-h-screen">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Community Engagement</h1>
              <p className="text-gray-600 mb-6">Share plantation stories, like and comment on posts, join challenges, and climb leaderboards.</p>
              <div className="flex flex-wrap gap-3 mb-6">
                <button onClick={() => setCommunityTab('feed')} className={`px-4 py-2 rounded-lg border ${communityTab === 'feed' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 hover:bg-green-50 border-gray-200'}`}>Feed</button>
                <button onClick={() => setCommunityTab('leaderboards')} className={`px-4 py-2 rounded-lg border ${communityTab === 'leaderboards' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 hover:bg-green-50 border-gray-200'}`}>Leaderboards</button>
                <button onClick={() => setCommunityTab('achievements')} className={`px-4 py-2 rounded-lg border ${communityTab === 'achievements' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 hover:bg-green-50 border-gray-200'}`}>Achievements</button>
                <button onClick={() => setCommunityTab('challenges')} className={`px-4 py-2 rounded-lg border ${communityTab === 'challenges' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 hover:bg-green-50 border-gray-200'}`}>Challenges</button>
              </div>

              {communityTab === 'feed' && (
                <div>
                  {/* Create Story */}
                  <form onSubmit={submitStory} className="mb-6 p-4 border rounded-lg">
                    <div className="mb-2 font-semibold text-gray-800">Share your plantation story</div>
                    <textarea value={storyCaption} onChange={(e) => setStoryCaption(e.target.value)} placeholder="Write a caption..." className="w-full border rounded p-2 mb-3" rows={3} />
                    <div className="flex items-center gap-3 mb-3">
                      <input type="file" multiple accept="image/*" onChange={handleStoryFiles} />
                      {storyFiles.length > 0 && (<span className="text-sm text-gray-600">{storyFiles.length} image(s) selected</span>)}
                    </div>
                    {storyError && <div className="text-sm text-red-600 mb-2">{storyError}</div>}
                    <button type="submit" disabled={storyBusy} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-60">{storyBusy ? 'Posting...' : 'Post'}</button>
                  </form>

                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-800">Your Feed</h3>
                    <button onClick={loadFeed} className="text-sm text-green-700 hover:underline">Refresh</button>
                  </div>
                  {feedLoading ? (
                    <div className="text-gray-500">Loading feed...</div>
                  ) : (
                    <div className="space-y-4">
                      {feedItems.length === 0 && <div className="text-gray-500">No posts yet. Follow people or create your first post!</div>}
                      {feedItems.map(p => {
                        const isOwner = user && p.userId && (p.userId === user.id || p.userId === user._id);
                        const isEditing = editPostId === p._id;
                        return (
                          <div key={p._id} className="p-4 border rounded-lg hover:shadow-sm transition">
                            <div className="flex items-center justify-between mb-1">
                              <div className="text-sm text-gray-500">{new Date(p.createdAt).toLocaleString()}</div>
                              {isOwner && !isEditing && (
                                <div className="flex gap-2">
                                  <button className="text-sm text-blue-600 hover:underline" onClick={() => { setEditPostId(p._id); setEditCaption(p.caption || ''); setEditVisibility(p.visibility || 'public'); setEditTags((p.tags || []).join(', ')); }}>Edit</button>
                                  <button className="text-sm text-red-600 hover:underline" onClick={async () => { if (!window.confirm('Delete this post?')) return; const delRes = await authFetch(`/api/social/posts/${p._id}`, { method: 'DELETE' }); if (delRes.ok) { await loadFeed(); } else { const d = await delRes.json(); alert(d.error || 'Failed to delete'); } }}>Delete</button>
                                </div>
                              )}
                            </div>

                            {!isEditing ? (
                              <>
                                <div className="text-gray-800 mb-2">{p.caption || '—'}</div>
                                {Array.isArray(p.media) && p.media[0]?.url && (<img src={p.media[0].url.startsWith('http') ? p.media[0].url : `${API_BASE}${p.media[0].url}`} alt="media" className="max-h-64 rounded" />)}
                                <div className="flex items-center gap-3 text-sm text-gray-600 mt-2">
                                  <span>❤️ {p.likeCount || 0}</span>
                                  <button className="text-green-700 hover:underline" onClick={() => likePost(p._id)}>Like</button>
                                  <span>· 💬 {p.commentCount || 0}</span>
                                  <button className="text-green-700 hover:underline" onClick={() => toggleComments(p._id)}>{openComments[p._id] ? 'Hide comments' : 'View comments'}</button>
                                  <span>· {p.visibility === 'followers' ? 'Followers' : 'Public'}</span>
                                </div>
                                {openComments[p._id] && (
                                  <div className="mt-3 border-t pt-3">
                                    <div className="flex gap-2 mb-3">
                                      <input className="flex-1 border rounded p-2 text-sm" placeholder="Write a comment..." value={commentInputs[p._id] || ''} onChange={e => setCommentInputs(prev => ({ ...prev, [p._id]: e.target.value }))} />
                                      <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={() => addComment(p._id)}>Comment</button>
                                    </div>
                                    {commentsLoading[p._id] ? (<div className="text-sm text-gray-500">Loading comments...</div>) : (
                                      <div className="space-y-2">
                                        {(commentsByPost[p._id] || []).map(c => (
                                          <div key={c._id} className="text-sm p-2 border rounded">
                                            <div className="text-gray-800">{c.text}</div>
                                            <div className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</div>
                                          </div>
                                        ))}
                                        {(commentsByPost[p._id] || []).length === 0 && (<div className="text-sm text-gray-500">No comments yet.</div>)}
                                      </div>
                                    )}
                                  </div>
                                )}
                                {p.tags?.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {p.tags.map((t, i) => (<span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-200">#{t}</span>))}
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="mt-2 p-3 border rounded">
                                <div className="mb-2">
                                  <label className="text-sm text-gray-600">Caption</label>
                                  <textarea value={editCaption} onChange={e => setEditCaption(e.target.value)} className="w-full border rounded p-2" rows={3} />
                                </div>
                                <div className="mb-2 flex gap-3 items-center">
                                  <label className="text-sm text-gray-600">Visibility</label>
                                  <select value={editVisibility} onChange={e => setEditVisibility(e.target.value)} className="border rounded p-1">
                                    <option value="public">Public</option>
                                    <option value="followers">Followers</option>
                                  </select>
                                </div>
                                <div className="mb-3">
                                  <label className="text-sm text-gray-600">Tags (comma separated)</label>
                                  <input value={editTags} onChange={e => setEditTags(e.target.value)} className="w-full border rounded p-2" />
                                </div>
                                <div className="flex gap-2">
                                  <button disabled={editBusy} className="bg-green-600 text-white px-3 py-1 rounded disabled:opacity-60" onClick={async () => {
                                    try { setEditBusy(true); const body = { caption: editCaption, visibility: editVisibility, tags: editTags.split(',').map(t => t.trim()).filter(Boolean) };
                                      const upRes = await authFetch(`/api/social/posts/${p._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
                                      const jd = await upRes.json(); if (!upRes.ok) throw new Error(jd.error || 'Update failed'); setEditPostId(null); await loadFeed();
                                    } catch (e) { alert(e.message || 'Failed to update'); } finally { setEditBusy(false); }
                                  }}>Save</button>
                                  <button className="px-3 py-1 rounded border" onClick={() => setEditPostId(null)}>Cancel</button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {communityTab === 'leaderboards' && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">Leaderboards</h3>
                    <input value={lbCityName} onChange={e => setLbCityName(e.target.value)} placeholder="City (optional)" className="border rounded px-2 py-1 text-sm" />
                    <button onClick={() => loadLeaderboards(lbCityName)} className="text-sm bg-green-600 text-white px-3 py-1 rounded">Load</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 rounded-lg border">
                      <div className="font-semibold mb-2">Global (Total Points)</div>
                      <ol className="list-decimal ml-4 space-y-1">
                        {lbGlobal.map((x, i) => (<li key={`${x.userId}-${i}`} className="text-sm text-gray-700">{x.userId} — {x.totalPoints} pts</li>))}
                        {lbGlobal.length === 0 && <div className="text-sm text-gray-500">No data</div>}
                      </ol>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <div className="font-semibold mb-2">Weekly</div>
                      <ol className="list-decimal ml-4 space-y-1">
                        {lbWeekly.map((x, i) => (<li key={`${x.userId}-${i}`} className="text-sm text-gray-700">{x.userId} — {x.weeklyPoints} pts</li>))}
                        {lbWeekly.length === 0 && <div className="text-sm text-gray-500">No data</div>}
                      </ol>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <div className="font-semibold mb-2">City {lbCityName ? `(${lbCityName})` : ''}</div>
                      <ol className="list-decimal ml-4 space-y-1">
                        {lbCity.map((x, i) => (<li key={`${x.userId}-${i}`} className="text-sm text-gray-700">{x.userId} — {x.weeklyPoints} pts</li>))}
                        {lbCity.length === 0 && <div className="text-sm text-gray-500">No data</div>}
                      </ol>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Challenges</h2>
              <p className="text-gray-600 mb-4">Join time-bound challenges to boost your impact and earn points.</p>
              <div className="flex gap-3 mb-4">
                <button onClick={() => setCommunityTab('challenges')} className={`px-4 py-2 rounded-lg ${communityTab==='challenges' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700'} hover:bg-green-700 hover:text-white transition`}>Explore Challenges</button>
              </div>
              {communityTab === 'challenges' && (
                <div>
                  <div className="mb-4 flex gap-2">
                    <button onClick={() => setChTab('active')} className={`px-3 py-1 rounded ${chTab==='active' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700'}`}>Active</button>
                    <button onClick={() => setChTab('scheduled')} className={`px-3 py-1 rounded ${chTab==='scheduled' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700'}`}>Scheduled</button>
                    <button onClick={() => setChTab('past')} className={`px-3 py-1 rounded ${chTab==='past' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700'}`}>Past</button>
                    <button onClick={() => { loadChallengesActive(); loadChallengesScheduled(); loadChallengesPast(); loadMyParticipations(); }} className="text-sm text-green-700 hover:underline">Refresh</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border rounded-lg">
                      <div className="font-semibold text-gray-800 mb-2">Active Challenges</div>
                      {challengesLoading ? (
                        <div className="text-sm text-gray-500">Loading...</div>
                      ) : (
                        <div className="space-y-3">
                          {(challengesActive || []).map(c => {
                            const now = new Date();
                            const active = now >= new Date(c.startAt) && now <= new Date(c.endAt);
                            const participation = myChallenges.find(mc => mc.challengeId === c._id);
                            const joined = !!participation;
                            const done = participation?.completed;
                            return (
                              <div key={c._id} className="p-3 border rounded">
                                <div className="flex items-center justify-between">
                                  <div className="font-medium text-gray-800">{c.title}</div>
                                  <span className={`text-xs px-2 py-0.5 rounded ${active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{active ? 'Active' : 'Scheduled'}</span>
                                </div>
                                <div className="text-sm text-gray-600 mb-1">{c.description}</div>
                                <div className="text-xs text-gray-500 mb-2">{new Date(c.startAt).toLocaleString()} → {new Date(c.endAt).toLocaleString()}</div>
                                <div className="flex gap-2 items-center">
                                  {!joined && (
                                    <button disabled={!active || joining[c._id]} onClick={() => joinChallenge(c._id)} className={`px-3 py-1 rounded ${!active ? 'bg-gray-200 text-gray-600' : 'bg-green-600 text-white hover:bg-green-700'} disabled:opacity-60`}>{joining[c._id] ? 'Joining...' : 'Join'}</button>
                                  )}
                                  {joined && !done && (
                                    <button disabled={!active || joining[c._id]} onClick={() => setProofModalId(c._id)} className={`px-3 py-1 rounded ${!active ? 'bg-gray-200 text-gray-600' : 'bg-emerald-600 text-white hover:bg-emerald-700'} disabled:opacity-60`}>Mark Complete</button>
                                  )}
                                  {joined && done && (<span className="text-sm text-green-700">✓ Completed</span>)}
                                </div>
                              </div>
                            );
                          })}
                          {(challengesActive || []).length === 0 && (<div className="text-sm text-gray-500">No active challenges.</div>)}
                        </div>
                      )}
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="font-semibold text-gray-800 mb-2">My Participations</div>
                      <div className="space-y-2">
                        {myChallenges.map(mc => (
                          <div key={mc._id} className="text-sm p-2 border rounded flex items-center justify-between">
                            <div>Joined on {new Date(mc.joinedAt).toLocaleString()}</div>
                            <div className="text-xs">{mc.completed ? (<span className="text-green-700">✓ Completed at {new Date(mc.completedAt).toLocaleString()}</span>) : (<span className="text-gray-600">In progress</span>)}</div>
                          </div>
                        ))}
                        {myChallenges.length === 0 && <div className="text-sm text-gray-500">You haven't joined any challenge yet.</div>}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="dashboard-container min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 w-full m-0 p-0">
     <header className="bg-[#f0faf4] border-b border-green-200 shadow-sm px-6 py-3 flex items-center justify-between sticky top-0 z-50">
  <div className="flex items-center">
    <div className="flex items-center group cursor-pointer">
<div className="mr-3 flex items-center justify-center">
<img src="https://img.icons8.com/?size=100&id=4Xem_S1LR0kT&format=png&color=40C057" width="42" height="42" />
      </div>
      <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
        Plantify
      </span>
    </div>
  </div>

  <nav className="flex items-center space-x-2">
    {[
      { label: 'Dashboard', page: 'dashboard' },
      { label: 'Plant Store', page: 'shop' },
      { label: 'Corporate', page: 'CorporateSponsorship' },
      { label: 'Plant DB', page: 'plantdb' },
      { label: 'Map', page: 'map' },
      { label: 'Drives', page: 'drives' },
    ].map(({ label, page }) => (
      <button
        key={page}
        onClick={() => navigateToPage(page)}
        className={`px-6 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${
          currentPage === page
            ? 'bg-green-600 text-white shadow-md scale-105'
            : 'text-green-900 hover:bg-green-100 hover:text-green-700 hover:scale-105'
        }`}
      >
        {label}
      </button>
    ))}

    <button
      onClick={() => { window.location.href = '/plant-detection'; }}
      className="px-6 py-3 rounded-xl text-base font-semibold text-green-900 hover:bg-green-100 hover:text-green-700 transition-all duration-200"
    >
      Plant Detection
    </button>

    <button
      onClick={() => { window.location.href = '/user/create-drive'; }}
      className="px-6 py-3 rounded-xl text-base font-semibold text-green-900 hover:bg-green-100 hover:text-green-700 transition-all duration-200"
    >
      Create Drive
    </button>
   {[
  { label: 'Profile', page: 'profile' },
  { label: 'Community', page: 'community' },
].map(({ label, page }) => (
  <button
    key={page}
    onClick={() => navigateToPage(page)}
    className={`px-6 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${
      currentPage === page
        ? 'bg-green-600 text-white shadow-md scale-105'
        : 'text-green-900 hover:bg-green-100 hover:text-green-700 hover:scale-105'
    }`}
  >
    {label}
  </button>
))}
  </nav>

  <div className="flex items-center space-x-2">
    
s
    <div className="relative">
      <button
        onClick={() => setShowNotifications(prev => !prev)}
        className="relative p-2 rounded-lg text-green-800 hover:bg-green-100 transition-all duration-200"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 min-w-[18px] h-[18px] flex items-center justify-center font-semibold shadow-md animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-green-100 z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b border-green-100">
            <div className="text-sm font-semibold text-gray-700">Notifications</div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-green-600 hover:text-green-800">Mark all read</button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">No notifications</div>
            ) : (
              notifications.map(n => (
                <button
                  key={n._id}
                  onClick={async () => {
                    if (!n.read) {
                      await authFetch(`/api/notifications/${n._id}/read`, { method: 'PATCH' });
                      setNotifications(prev => prev.map(x => x._id === n._id ? { ...x, read: true } : x));
                    }
                    if (n.link) window.location.href = n.link;
                  }}
                  className={`w-full text-left px-3 py-2 border-b last:border-0 hover:bg-green-50 ${n.read ? 'bg-white' : 'bg-green-50'}`}
                >
                  <div className="text-sm font-medium text-gray-800">{n.title}</div>
                  <div className="text-xs text-gray-600">{n.message}</div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>

    

    <button className="px-5 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105">
      Start Plant Journey
    </button>
  </div>
</header>

<main className="w-full m-0 p-0 bg-[#f0faf4]" style={{minHeight: '100vh', animation: 'fadeIn 0.2s ease'}}>
        {renderPageContent()}
      </main>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-white border border-green-200 shadow-xl rounded-lg p-4 z-50 min-w-[280px] animate-slide-up">
          <div className="font-semibold text-gray-800 mb-1">{toast.title}</div>
          <div className="text-sm text-gray-600 mb-3">{toast.message}</div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setToast(null)}
              className="px-3 py-1 rounded-md text-gray-600 hover:bg-gray-100"
            >
              Dismiss
            </button>
            {toast.link && (
              <button
                onClick={() => {
                  window.location.href = toast.link;
                  setToast(null);
                }}
                className="px-3 py-1 rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                View
              </button>
            )}
          </div>
        </div>
      )}

      {proofModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setProofModalId(null)} />
          <div className="relative bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-lg p-5">
            <div className="text-lg font-semibold text-gray-800 mb-2">Submit Proof</div>
            <div className="text-sm text-gray-600 mb-4">Add notes and at least one photo.</div>
            <div className="mb-3">
              <label className="text-sm text-gray-700">Notes</label>
              <textarea
                className="w-full border rounded p-2 text-sm mt-1"
                rows={3}
                value={proofNotes[proofModalId] || ''}
                onChange={e => setProofNotes(prev => ({ ...prev, [proofModalId]: e.target.value }))}
              />
            </div>
            <div className="mb-3">
              <label className="text-sm text-gray-700">Photos</label>
              <input
                type="file"
                accept="image/*"
                multiple
                className="mt-1"
                onChange={e => setProofFiles(prev => ({ ...prev, [proofModalId]: Array.from(e.target.files || []).slice(0,5) }))}
              />
              {(proofFiles[proofModalId]?.length || 0) > 0 && (
                <div className="text-xs text-gray-600 mt-1">{proofFiles[proofModalId].length} image(s) selected</div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 rounded border" onClick={() => setProofModalId(null)}>Cancel</button>
              <button
                className="px-4 py-2 rounded text-white bg-emerald-600 hover:bg-emerald-700"
                onClick={() => completeChallenge(proofModalId)}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out; }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </div>
    );
};

export default PlantifyDashboard;
