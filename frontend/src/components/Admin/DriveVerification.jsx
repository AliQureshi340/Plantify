import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Clock, MapPin, Users, Calendar, ChevronRight, RefreshCw, AlertCircle, TreePine } from 'lucide-react';

const DriveVerification = () => {
  const token = localStorage.getItem('token');
  const [pendingDrives, setPendingDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processing, setProcessing] = useState({});
  const [rejectModal, setRejectModal] = useState(null); // { id, reason }
  const apiBase = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

  const notify = (msg, type = 'success') => {
    if (type === 'error') setError(msg); else setSuccess(msg);
    setTimeout(() => { setError(''); setSuccess(''); }, 4000);
  };

  const fetchPending = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${apiBase}/api/admin/drives/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch pending drives');
      const data = await res.json();
      setPendingDrives(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [apiBase, token]);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  const handleApprove = async (id) => {
    setProcessing(p => ({ ...p, [id]: 'approving' }));
    try {
      const res = await fetch(`${apiBase}/api/admin/drives/${id}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to approve');
      setPendingDrives(prev => prev.filter(d => d._id !== id));
      notify('Drive approved and published.');
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      setProcessing(p => { const n = { ...p }; delete n[id]; return n; });
    }
  };

  const handleReject = async () => {
    if (!rejectModal?.reason?.trim()) { notify('Rejection reason is required.', 'error'); return; }
    const { id, reason } = rejectModal;
    setProcessing(p => ({ ...p, [id]: 'rejecting' }));
    setRejectModal(null);
    try {
      const res = await fetch(`${apiBase}/api/admin/drives/${id}/reject`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error('Failed to reject');
      setPendingDrives(prev => prev.filter(d => d._id !== id));
      notify('Drive rejected and user notified.');
    } catch (e) {
      notify(e.message, 'error');
    } finally {
      setProcessing(p => { const n = { ...p }; delete n[id]; return n; });
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-700 border-b border-green-600">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-white w-6 h-6" />
            <div>
              <h1 className="text-xl font-bold text-white">Drive Verification</h1>
              <p className="text-green-200 text-xs mt-0.5">Review and approve user-proposed drives</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {pendingDrives.length > 0 && (
              <span className="bg-amber-500 text-amber-950 text-xs font-black px-2.5 py-1 rounded-full">
                {pendingDrives.length} pending
              </span>
            )}
            <button onClick={fetchPending} disabled={loading} className="p-2 rounded-lg bg-green-600/50 hover:bg-green-600 border border-green-500 text-white transition-all">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
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
            <button className="w-full text-left flex items-center justify-between px-3 py-2.5 rounded-lg bg-green-900/40 text-green-300 border border-green-700/50 text-sm font-medium">
              <span className="flex items-center gap-2"><Clock size={15} />Pending</span>
              <span className="text-xs bg-amber-500 text-amber-950 px-1.5 py-0.5 rounded-full font-black">{pendingDrives.length}</span>
            </button>
            
          </nav>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {(error || success) && (
            <div className={`mb-4 flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium border ${
              error ? 'bg-red-950 border-red-800 text-red-300' : 'bg-emerald-950 border-emerald-800 text-emerald-300'
            }`}>
              <AlertCircle size={16} />{error || success}
            </div>
          )}

          {loading ? (
            <div className="text-center py-16 flex flex-col items-center gap-2 text-gray-500">
              <RefreshCw size={24} className="animate-spin text-green-500" />
              <span className="text-sm">Loading pending drives...</span>
            </div>
          ) : pendingDrives.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-emerald-900/40 border-2 border-emerald-700/50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-emerald-400" />
              </div>
              <h3 className="text-white font-bold text-lg">All Clear</h3>
              <p className="text-gray-500 text-sm mt-1">No drives pending review.</p>
            </div>
          ) : (
            <>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-white font-bold text-lg">
                  Pending Approvals <span className="text-amber-400">({pendingDrives.length})</span>
                </h2>
              </div>
              <div className="space-y-4">
                {pendingDrives.map(drive => {
                  const isProcessing = !!processing[drive._id];
                  return (
                    <div key={drive._id} className="bg-gray-900 border border-amber-800/40 rounded-xl p-5 hover:border-amber-700/60 transition-all">
                      <div className="flex gap-5">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-900/50 text-amber-300 border border-amber-700">PENDING REVIEW</span>
                          </div>
                          <h3 className="text-white font-bold text-lg mb-3">{drive.title}</h3>

                          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm mb-3">
                            <div className="flex items-center gap-2 text-gray-400">
                              <span className="text-gray-600 text-xs font-semibold uppercase">Proposed by</span>
                            </div>
                            <div className="text-gray-300">{drive.createdBy?.email || drive.createdBy?.name || 'User'}</div>

                            <div className="flex items-center gap-1.5 text-gray-500">
                              <Calendar size={13} />
                              <span className="text-xs font-semibold uppercase text-gray-600">Date</span>
                            </div>
                            <div className="text-gray-300 text-sm">{new Date(drive.date).toLocaleString()}</div>

                            <div className="flex items-center gap-1.5 text-gray-500">
                              <MapPin size={13} />
                              <span className="text-xs font-semibold uppercase text-gray-600">Location</span>
                            </div>
                            <div className="text-gray-300 text-sm">{drive.location || 'Not specified'}</div>

                            <div className="flex items-center gap-1.5 text-gray-500">
                              <Users size={13} />
                              <span className="text-xs font-semibold uppercase text-gray-600">Capacity</span>
                            </div>
                            <div className="text-gray-300 text-sm">{drive.capacity || '—'} participants</div>
                          </div>

                          {drive.description && (
                            <div className="bg-gray-800 rounded-lg p-3 text-sm text-gray-300 border border-gray-700">
                              <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Description</div>
                              {drive.description}
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col gap-2 shrink-0 pt-1">
                          <button
                            onClick={() => handleApprove(drive._id)}
                            disabled={isProcessing}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-sm border border-emerald-500 transition-all"
                          >
                            {processing[drive._id] === 'approving'
                              ? <RefreshCw size={15} className="animate-spin" />
                              : <CheckCircle size={15} />}
                            Approve
                          </button>
                          <button
                            onClick={() => setRejectModal({ id: drive._id, reason: '' })}
                            disabled={isProcessing}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-900/40 hover:bg-red-700 disabled:opacity-50 text-red-400 hover:text-white font-semibold text-sm border border-red-800 hover:border-red-600 transition-all"
                          >
                            {processing[drive._id] === 'rejecting'
                              ? <RefreshCw size={15} className="animate-spin" />
                              : <XCircle size={15} />}
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-white font-bold text-lg mb-1">Reject Drive</h3>
            <p className="text-gray-500 text-sm mb-4">The user will be notified with this reason.</p>
            <textarea
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg text-sm placeholder-gray-500 focus:border-red-500 focus:outline-none transition-all"
              placeholder="Enter rejection reason..."
              rows={3}
              value={rejectModal.reason}
              onChange={e => setRejectModal(m => ({ ...m, reason: e.target.value }))}
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleReject}
                disabled={!rejectModal.reason?.trim()}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white py-2.5 rounded-lg font-semibold text-sm transition-all"
              >
                <XCircle size={15} />Reject Drive
              </button>
              <button
                onClick={() => setRejectModal(null)}
                className="flex-1 bg-gray-800 border border-gray-700 text-gray-300 hover:text-white py-2.5 rounded-lg font-semibold text-sm transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriveVerification;