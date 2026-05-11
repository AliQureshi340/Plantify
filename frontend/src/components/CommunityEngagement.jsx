import React, { useState, useEffect, useCallback } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Search, Trophy, Flame, Globe, Star } from 'lucide-react';

/* ══════════════════════════════════════════
   DESIGN TOKENS  (mirrors ProfilePage exactly)
══════════════════════════════════════════ */
const T = {
  bg:        '#0a1410',
  surface:   '#0d1f17',
  card:      '#0d1f17',
  border:    'rgba(16,185,129,0.15)',
  borderHi:  'rgba(16,185,129,0.40)',
  green:     '#10b981',
  greenDim:  'rgba(16,185,129,0.08)',
  greenGlow: 'rgba(16,185,129,0.12)',
  textPri:   '#d1fae5',
  textSec:   '#4b7a63',
  textMid:   '#9ca3af',
  accent:    '#10b981',
  accentLt:  '#6ee7b7',
  danger:    '#ef4444',
  gold:      '#fbbf24',
  font:      'Inter, sans-serif',
};

const initials = (name) => (name || 'U').charAt(0).toUpperCase();

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
const CommunityEngagement = ({ authFetch, API_BASE, token, user }) => {
  const [tab, setTab] = useState('feed');
  const [feedItems, setFeedItems] = useState([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [caption, setCaption] = useState('');
  const [storyFiles, setStoryFiles] = useState([]);
  const [storyBusy, setStoryBusy] = useState(false);
  const [storyError, setStoryError] = useState('');
  const [openComments, setOpenComments] = useState({});
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentsLoading, setCommentsLoading] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [savedPosts, setSavedPosts] = useState(new Set());
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [selectedPost, setSelectedPost] = useState(null);
  const [lbGlobal, setLbGlobal] = useState([]);
  const [lbWeekly, setLbWeekly] = useState([]);
  const [lbCity, setLbCity] = useState([]);
  const [lbCityName, setLbCityName] = useState('');
  const [heartAnim, setHeartAnim] = useState({});

  const _fetch = authFetch || ((url, opts = {}) => fetch(`${API_BASE || 'http://localhost:5000'}${url}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(opts.headers || {}) }
  }));

  const loadFeed = useCallback(async () => {
    try { setFeedLoading(true); const r = await _fetch('/api/social/feed'); const d = await r.json(); setFeedItems(r.ok ? d.items || [] : []); }
    catch { setFeedItems([]); } finally { setFeedLoading(false); }
  }, []);

  const loadComments = async (postId) => {
    setCommentsLoading(p => ({ ...p, [postId]: true }));
    try { const r = await fetch(`${API_BASE || 'http://localhost:5000'}/api/social/posts/${postId}/comments`); const d = await r.json(); setCommentsByPost(p => ({ ...p, [postId]: r.ok ? d : [] })); }
    catch { setCommentsByPost(p => ({ ...p, [postId]: [] })); }
    finally { setCommentsLoading(p => ({ ...p, [postId]: false })); }
  };

  const toggleComments = async (postId) => {
    const nowOpen = !openComments[postId];
    setOpenComments(p => ({ ...p, [postId]: nowOpen }));
    if (nowOpen) await loadComments(postId);
  };

  const likePost = async (postId) => {
    setHeartAnim(p => ({ ...p, [postId]: true }));
    setTimeout(() => setHeartAnim(p => ({ ...p, [postId]: false })), 400);
    setLikedPosts(p => { const n = new Set(p); n.has(postId) ? n.delete(postId) : n.add(postId); return n; });
    try { await _fetch(`/api/social/posts/${postId}/like`, { method: 'POST' }); await loadFeed(); } catch {}
  };

  const addComment = async (postId) => {
    const text = (commentInputs[postId] || '').trim();
    if (!text) return;
    try {
      const r = await _fetch(`/api/social/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ text }) });
      if (r.ok) { setCommentInputs(p => ({ ...p, [postId]: '' })); await Promise.all([loadComments(postId), loadFeed()]); }
    } catch {}
  };

  const submitStory = async (e) => {
    e?.preventDefault(); setStoryError('');
    if (!caption && storyFiles.length === 0) { setStoryError('Add a caption or image.'); return; }
    setStoryBusy(true);
    try {
      let media = [];
      if (storyFiles.length > 0) {
        const fd = new FormData(); storyFiles.forEach(f => fd.append('images', f));
        const up = await fetch(`${API_BASE || 'http://localhost:5000'}/api/social/upload`, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {}, body: fd });
        const ud = await up.json(); if (!up.ok) throw new Error(ud.error || 'Upload failed'); media = ud.media || [];
      }
      const r = await _fetch('/api/social/posts', { method: 'POST', body: JSON.stringify({ caption, media, tags: [], visibility: 'public' }) });
      if (!r.ok) throw new Error(); setCaption(''); setStoryFiles([]); await loadFeed();
    } catch (err) { setStoryError(err.message || 'Failed to share'); }
    finally { setStoryBusy(false); }
  };

  const loadLeaderboards = useCallback(async (city) => {
    try {
      const base = API_BASE || 'http://localhost:5000';
      const [g, w, c] = await Promise.all([
        fetch(`${base}/api/social/leaderboards/global`), fetch(`${base}/api/social/leaderboards/weekly`),
        city ? fetch(`${base}/api/social/leaderboards/city/${encodeURIComponent(city)}`) : Promise.resolve({ ok: true, json: async () => [] })
      ]);
      setLbGlobal(g.ok ? await g.json() : []); setLbWeekly(w.ok ? await w.json() : []); setLbCity(c.ok ? await c.json() : []);
    } catch {}
  }, [API_BASE]);

  useEffect(() => {
    if (tab === 'feed') loadFeed();
    if (tab === 'leaderboards') loadLeaderboards(lbCityName);
  }, [tab]);

  const imgSrc = (url) => url?.startsWith('http') ? url : `${API_BASE || 'http://localhost:5000'}${url}`;
  const rankIcon = (i) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
  const rankColor = (i) => i === 0 ? '#fbbf24' : i === 1 ? '#d1d5db' : i === 2 ? '#cd7c2f' : T.textSec;
  const suggestions = ['alex_nature', 'green_warrior', 'eco_fighter'];

  /* ── shared card style ── */
  const cardStyle = {
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: 18,
    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
  };

  /* ── avatar ── */
  const Avatar = ({ name, size = 42, fontSize = 16 }) => (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, #059669, #047857)',
      border: `2px solid ${T.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize, color: 'white',
    }}>{initials(name)}</div>
  );

  /* ── action icon button ── */
  const ActionBtn = ({ onClick, active, activeColor, children }) => (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px',
      background: 'transparent', border: 'none', borderRadius: 10,
      color: active ? activeColor : T.textSec, cursor: 'pointer',
      fontFamily: T.font, fontSize: 13, transition: 'all 0.2s',
    }}
      onMouseOver={e => e.currentTarget.style.background = T.greenDim}
      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
    >{children}</button>
  );

  /* ── input ── */
  const Input = ({ style, ...props }) => (
    <input {...props} style={{
      background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(255,255,255,0.07)`,
      borderRadius: 12, padding: '10px 16px', color: T.textPri,
      fontFamily: T.font, fontSize: 13, outline: 'none', width: '100%',
      ...style,
    }}
      onFocus={e => e.target.style.borderColor = T.borderHi}
      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
    />
  );

  /* ── green btn ── */
  const GreenBtn = ({ disabled, onClick, children, style }) => (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '10px 28px', background: T.green, border: 'none',
      borderRadius: 12, color: 'white', fontFamily: T.font,
      fontSize: 13, fontWeight: 700, cursor: 'pointer',
      boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
      opacity: disabled ? 0.5 : 1, transition: 'all 0.2s',
      ...style,
    }}
      onMouseOver={e => { if (!disabled) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(16,185,129,0.4)'; } }}
      onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(16,185,129,0.3)'; }}
    >{children}</button>
  );

  /* ── tab btn ── */
  const TabBtn = ({ name }) => (
    <button onClick={() => setTab(name)} style={{
      padding: '9px 24px', borderRadius: 30, fontSize: 13, fontWeight: 600,
      cursor: 'pointer', border: '1px solid transparent', fontFamily: T.font,
      background: tab === name ? T.green : 'rgba(255,255,255,0.04)',
      color: tab === name ? 'white' : T.textSec,
      boxShadow: tab === name ? '0 4px 16px rgba(16,185,129,0.3)' : 'none',
      transition: 'all 0.25s',
    }}>{name.charAt(0).toUpperCase() + name.slice(1)}</button>
  );

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.textPri, fontFamily: T.font, overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(10,20,16,0.9)', backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${T.border}`,
        padding: '0 32px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
  <img src="https://img.icons8.com/?size=100&id=4Xem_S1LR0kT&format=png&color=40C057" width="32" height="32" />
  <span style={{ fontSize: 22, fontWeight: 800, color: T.green, letterSpacing: '-0.03em' }}>Plantify</span>
</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['feed', 'leaderboards', 'explore'].map(t => <TabBtn key={t} name={t} />)}
        </div>
        <div style={{
          width: 38, height: 38, borderRadius: '50%',
          background: 'linear-gradient(135deg, #059669, #047857)',
          border: `2px solid ${T.border}`, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 14, color: 'white', cursor: 'pointer',
        }}>{initials(user?.name)}</div>
      </nav>

      {/* ══ FEED ══ */}
      {tab === 'feed' && (
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '32px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>

            {/* Main column */}
            <div>
              {/* Creator */}
              <div style={{ ...cardStyle, padding: 24, marginBottom: 20, borderRadius: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <Avatar name={user?.name} size={36} fontSize={13} />
                  <span style={{ fontWeight: 700, fontSize: 15, color: T.accentLt }}>Share your plantation story</span>
                </div>
                <textarea
                  rows={3}
                  placeholder="What's growing in your world today? 🌿"
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12,
                    padding: '13px 16px', color: T.textPri,
                    fontFamily: T.font, fontSize: 14, resize: 'none', outline: 'none',
                    lineHeight: 1.6, boxSizing: 'border-box',
                  }}
                  onFocus={e => { e.target.style.borderColor = T.borderHi; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.07)'; }}
                />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 16px', background: T.greenDim,
                    border: `1px solid ${T.border}`, borderRadius: 10,
                    color: T.textSec, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
                  }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = T.borderHi; e.currentTarget.style.color = T.accent; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textSec; }}
                  >
                    <span>📷</span><span>Add photos</span>
                    <input type="file" multiple accept="image/*" onChange={e => setStoryFiles(Array.from(e.target.files || []).slice(0, 5))} style={{ display: 'none' }} />
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {storyFiles.length > 0 && <span style={{ fontSize: 12, color: T.accent }}>{storyFiles.length} selected</span>}
                    <GreenBtn onClick={submitStory} disabled={storyBusy}>🌱 {storyBusy ? 'Posting…' : 'Post'}</GreenBtn>
                  </div>
                </div>
                {storyError && <div style={{ color: T.danger, fontSize: 13, marginTop: 8 }}>{storyError}</div>}
              </div>

              {/* Feed items */}
              {feedLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid ${T.greenDim}`, borderTopColor: T.green, animation: 'spin 0.8s linear infinite' }} />
                </div>
              ) : feedItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: T.textSec }}>
                  <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>🌿</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: T.textPri, marginBottom: 8 }}>No posts yet</div>
                  <div style={{ fontSize: 14 }}>Follow people or share your first story above!</div>
                </div>
              ) : feedItems.map(p => {
                const isLiked = likedPosts.has(p._id);
                const isSaved = savedPosts.has(p._id);
                return (
                  <div key={p._id} style={{ ...cardStyle, borderRadius: 20, marginBottom: 18, overflow: 'hidden', transition: 'all 0.25s' }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = T.borderHi; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    {/* Post header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Avatar name={p.author?.name} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: T.textPri }}>{p.author?.name || 'User'}</div>
                          <div style={{ fontSize: 11, color: T.textSec, marginTop: 2 }}>{new Date(p.createdAt).toLocaleString()}</div>
                        </div>
                      </div>
                      <button style={{ background: 'transparent', border: 'none', color: T.textSec, cursor: 'pointer', padding: 6, borderRadius: 8 }}
                        onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = T.textPri; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.textSec; }}
                      ><MoreHorizontal size={18} /></button>
                    </div>

                    {/* Image */}
                    {Array.isArray(p.media) && p.media[0]?.url && (
                      <div onClick={() => setSelectedPost(p)} style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer', background: 'rgba(0,0,0,0.2)' }}>
                        <img src={imgSrc(p.media[0].url)} alt="post" style={{ width: '100%', height: 300, objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease' }}
                          onMouseOver={e => e.target.style.transform = 'scale(1.04)'}
                          onMouseOut={e => e.target.style.transform = 'scale(1)'}
                        />
                        {p.media.length > 1 && (
                          <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', color: 'white', fontSize: 11, padding: '4px 10px', borderRadius: 20 }}>
                            1 / {p.media.length}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Body */}
                    <div style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <ActionBtn onClick={() => likePost(p._id)} active={isLiked} activeColor={T.danger}>
                            <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} /><span>{p.likeCount || 0}</span>
                          </ActionBtn>
                          <ActionBtn onClick={() => toggleComments(p._id)}>
                            <MessageCircle size={20} /><span>{p.commentCount || 0}</span>
                          </ActionBtn>
                          <ActionBtn><Share2 size={20} /></ActionBtn>
                        </div>
                        <ActionBtn active={isSaved} activeColor={T.gold}
                          onClick={() => setSavedPosts(prev => { const n = new Set(prev); n.has(p._id) ? n.delete(p._id) : n.add(p._id); return n; })}
                        ><Bookmark size={20} fill={isSaved ? 'currentColor' : 'none'} /></ActionBtn>
                      </div>

                      <div style={{ fontSize: 14, color: T.textMid, lineHeight: 1.6, marginBottom: 6 }}>
                        <strong style={{ color: T.textPri, fontWeight: 600, marginRight: 4 }}>{p.author?.name || 'User'}</strong>{p.caption || ''}
                      </div>

                      {p.tags?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                          {p.tags.map((t, i) => <span key={i} style={{ fontSize: 12, color: T.accent, cursor: 'pointer' }}>#{t}</span>)}
                        </div>
                      )}

                      {!openComments[p._id] && (p.commentCount || 0) > 0 && (
                        <button onClick={() => toggleComments(p._id)} style={{ background: 'transparent', border: 'none', fontSize: 13, color: T.textSec, cursor: 'pointer', marginTop: 6, fontFamily: T.font, transition: 'color 0.2s' }}
                          onMouseOver={e => e.target.style.color = T.textPri}
                          onMouseOut={e => e.target.style.color = T.textSec}
                        >View all {p.commentCount} comments</button>
                      )}
                    </div>

                    {/* Comments */}
                    {openComments[p._id] && (
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.15)', padding: '14px 20px', maxHeight: 260, overflowY: 'auto' }}>
                        {commentsLoading[p._id] ? (
                          <div style={{ color: T.textSec, fontSize: 13 }}>Loading…</div>
                        ) : (commentsByPost[p._id] || []).length === 0 ? (
                          <div style={{ color: T.textSec, fontSize: 13 }}>No comments yet.</div>
                        ) : (commentsByPost[p._id] || []).map(c => (
                          <div key={c._id} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #047857, #065f46)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0 }}>{initials(c.userName)}</div>
                            <div>
                              <div style={{ fontSize: 13, color: T.textMid, lineHeight: 1.5 }}><strong style={{ color: T.textPri, fontWeight: 600, marginRight: 4 }}>{c.userName || 'User'}</strong>{c.text}</div>
                              <div style={{ fontSize: 11, color: T.textSec, marginTop: 3 }}>{new Date(c.createdAt).toLocaleString()}</div>
                            </div>
                          </div>
                        ))}
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.04)', marginTop: 8 }}>
                          <input
                            style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '8px 16px', color: T.textPri, fontFamily: T.font, fontSize: 13, outline: 'none' }}
                            placeholder="Add a comment…"
                            value={commentInputs[p._id] || ''}
                            onChange={e => setCommentInputs(prev => ({ ...prev, [p._id]: e.target.value }))}
                            onKeyPress={e => e.key === 'Enter' && addComment(p._id)}
                            onFocus={e => e.target.style.borderColor = T.borderHi}
                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
                          />
                          <button onClick={() => addComment(p._id)} style={{ background: 'transparent', border: 'none', color: T.accent, fontWeight: 700, fontFamily: T.font, fontSize: 13, cursor: 'pointer' }}>Post</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Sidebar */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 80 }}>

              {/* Profile mini */}
              <div style={{ ...cardStyle, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #047857)', border: `2px solid ${T.borderHi}`, boxShadow: '0 0 20px rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, color: 'white' }}>{initials(user?.name)}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: T.textPri }}>{user?.name || 'Plant Lover'}</div>
                    <div style={{ fontSize: 12, color: T.textSec }}>@{user?.handle || 'plantlover'}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 12, overflow: 'hidden' }}>
                  {[['42', 'Posts'], ['1.2K', 'Followers'], ['856', 'Following']].map(([n, l]) => (
                    <div key={l} style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 8px', textAlign: 'center', cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.background = T.greenDim}
                      onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    >
                      <div style={{ fontWeight: 800, fontSize: 16, color: T.accent }}>{n}</div>
                      <div style={{ fontSize: 11, color: T.textSec, marginTop: 2 }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nature banner */}
              <div style={{ borderRadius: 18, overflow: 'hidden', position: 'relative', background: 'linear-gradient(135deg, #064e3b, #065f46, #047857)', padding: '22px 18px', border: `1px solid rgba(16,185,129,0.25)` }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 20%, rgba(52,211,153,0.18), transparent 60%)', pointerEvents: 'none' }} />
                <div style={{ fontSize: 44, marginBottom: 8, position: 'relative', zIndex: 1 }}>🌳</div>
                <div style={{ fontWeight: 800, fontSize: 17, color: '#d1fae5', position: 'relative', zIndex: 1 }}>Green Planet</div>
                <div style={{ fontSize: 12, color: 'rgba(209,250,229,0.6)', marginTop: 4, lineHeight: 1.5, position: 'relative', zIndex: 1 }}>Every post plants a seed of change in someone's mind.</div>
              </div>

              {/* Suggestions */}
              <div style={{ ...cardStyle, padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.accentLt, marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  Suggested <span style={{ fontSize: 12, color: T.textSec, fontWeight: 400, cursor: 'pointer' }}>See all</span>
                </div>
                {suggestions.map((u, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #059669, #047857)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white' }}>{u.charAt(0).toUpperCase()}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: T.textPri }}>{u}</div>
                        <div style={{ fontSize: 11, color: T.textSec }}>Suggested for you</div>
                      </div>
                    </div>
                    <button style={{ background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 8, padding: '4px 14px', fontSize: 12, fontWeight: 600, color: T.accent, cursor: 'pointer', fontFamily: T.font, transition: 'all 0.2s' }}
                      onMouseOver={e => { e.currentTarget.style.background = T.greenDim; e.currentTarget.style.borderColor = T.borderHi; }}
                      onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = T.border; }}
                    >Follow</button>
                  </div>
                ))}
              </div>

              {/* Community stats */}
              <div style={{ ...cardStyle, padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.accentLt, marginBottom: 14 }}>🌿 Community Stats</div>
                {[['🌳', '12,400+', 'Trees planted'], ['👥', '840+', 'Active members'], ['🏆', '38', 'Drives this month']].map(([icon, val, lbl]) => (
                  <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ fontSize: 20 }}>{icon}</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 16, color: T.accent }}>{val}</div>
                      <div style={{ fontSize: 11, color: T.textSec }}>{lbl}</div>
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      )}

      {/* ══ LEADERBOARDS ══ */}
      {tab === 'leaderboards' && (
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '32px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
            <h2 style={{ fontWeight: 800, fontSize: 34, color: T.textPri }}>🏆 Leaderboards</h2>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.textSec }} />
                <input
                  style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '10px 16px 10px 38px', color: T.textPri, fontFamily: T.font, fontSize: 13, outline: 'none', width: 220 }}
                  placeholder="Search city…" value={lbCityName} onChange={e => setLbCityName(e.target.value)}
                  onFocus={e => e.target.style.borderColor = T.borderHi}
                  onBlur={e => e.target.style.borderColor = T.border}
                />
              </div>
              <GreenBtn onClick={() => loadLeaderboards(lbCityName)}>Search</GreenBtn>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
            {[
              { title: 'Global',  icon: <Globe size={17} />,  data: lbGlobal, key: 'totalPoints'  },
              { title: 'Weekly',  icon: <Flame size={17} />,  data: lbWeekly, key: 'weeklyPoints' },
              { title: lbCityName ? `📍 ${lbCityName}` : 'City', icon: <Star size={17} />, data: lbCity, key: 'weeklyPoints' },
            ].map(board => (
              <div key={board.title} style={{ ...cardStyle, borderRadius: 20, overflow: 'hidden', transition: 'all 0.25s' }}
                onMouseOver={e => { e.currentTarget.style.borderColor = T.borderHi; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {/* Card header */}
                <div style={{ padding: '15px 20px', background: T.greenDim, borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: T.accent }}>{board.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: 15, color: T.textPri }}>{board.title}</span>
                </div>
                {board.data.length === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', color: T.textSec, fontSize: 13 }}>No data yet</div>
                ) : board.data.map((x, i) => (
                  <div key={`${x.userId}-${i}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 20px', borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.background = T.greenDim}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontWeight: 800, fontSize: 15, width: 28, color: rankColor(i) }}>{rankIcon(i)}</span>
                    <div style={{ flex: 1, marginLeft: 10 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.textPri }}>{x.userId}</div>
                      <div style={{ fontSize: 11, color: T.textSec, marginTop: 2 }}>Level {x.level || 1}</div>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: 16, color: T.accent }}>{x[board.key] || 0}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ EXPLORE ══ */}
      {tab === 'explore' && (
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '32px 24px', textAlign: 'center', paddingTop: 80 }}>
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>🔍</div>
          <div style={{ fontWeight: 800, fontSize: 22, color: T.textPri, marginBottom: 8 }}>Explore</div>
          <div style={{ fontSize: 14, color: T.textSec }}>Coming soon — discover trending drives and plant stories.</div>
        </div>
      )}

      {/* ══ MODAL ══ */}
      {selectedPost && (
        <div onClick={() => setSelectedPost(null)} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, animation: 'fadeIn 0.2s ease' }}>
          <div onClick={e => e.stopPropagation()} style={{ ...cardStyle, borderRadius: 24, overflow: 'hidden', maxWidth: 620, width: '100%', position: 'relative', border: `1px solid ${T.borderHi}` }}>
            <button onClick={() => setSelectedPost(null)} style={{ position: 'absolute', top: 16, right: 16, width: 34, height: 34, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, zIndex: 1 }}>✕</button>
            {selectedPost.media?.[0]?.url && <img src={imgSrc(selectedPost.media[0].url)} alt="full" style={{ width: '100%', height: 340, objectFit: 'cover', display: 'block' }} />}
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <Avatar name={selectedPost.author?.name} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: T.textPri }}>{selectedPost.author?.name || 'User'}</div>
                  <div style={{ fontSize: 11, color: T.textSec }}>{new Date(selectedPost.createdAt).toLocaleString()}</div>
                </div>
              </div>
              <p style={{ color: T.textMid, fontSize: 14, lineHeight: 1.6 }}>{selectedPost.caption}</p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default CommunityEngagement;