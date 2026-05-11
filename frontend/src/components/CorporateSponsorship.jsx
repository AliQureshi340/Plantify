import React, { useState } from 'react';
import { Plus, X, DollarSign, Users, Calendar, TrendingUp, AlertCircle, Building2 } from 'lucide-react';

const EMPTY_FORM = { title: '', goal: '', date: '', description: '' };

export default function CorporateSponsorshipModule() {
  const [drives, setDrives] = useState([
    {
      id: 1, title: 'Tree Plantation Drive 2024', goal: 50000, raised: 35000,
      participants: 120, date: '2024-11-15', status: 'active', approved: true,
      description: 'Plant 1000 trees in urban areas across the city parks.',
    },
  ]);
  const [userJoinedDrives, setUserJoinedDrives] = useState([]);
  const [showUserCreateForm, setShowUserCreateForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [notification, setNotification] = useState({ text: '', type: '' });
  const [sponsorModal, setSponsorModal] = useState(null);

  const notify = (text, type = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification({ text: '', type: '' }), 4000);
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Required';
    if (!formData.goal || Number(formData.goal) <= 0) errs.goal = 'Must be > 0';
    if (!formData.date) errs.date = 'Required';
    if (!formData.description.trim()) errs.description = 'Required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleUserCreateDrive = () => {
    if (!validateForm()) return;
    setFormData(EMPTY_FORM);
    setFormErrors({});
    setShowUserCreateForm(false);
    notify('Drive submitted for admin approval.');
  };

  const handleJoinDrive = (id) => {
    if (userJoinedDrives.includes(id)) return;
    setUserJoinedDrives(prev => [...prev, id]);
    setDrives(prev => prev.map(d => d.id === id ? { ...d, participants: d.participants + 1 } : d));
    notify('Successfully joined the drive!');
  };

  const handleSponsor = () => {
    const amt = Number(sponsorModal?.amount);
    if (!amt || amt <= 0) { notify('Enter a valid amount.', 'error'); return; }
    setDrives(prev => prev.map(d => d.id === sponsorModal.id ? { ...d, raised: d.raised + amt } : d));
    setSponsorModal(null);
    notify(`Sponsored $${amt.toLocaleString()} — thank you!`);
  };

  const inputCls = (name) =>
    `w-full px-4 py-2.5 bg-gray-800 border ${formErrors[name] ? 'border-red-600' : 'border-gray-700'} text-white rounded-xl text-sm focus:border-green-500 focus:outline-none transition-all placeholder-gray-500`;

  const DriveForm = ({ onSubmit, onCancel, submitLabel }) => (
    <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-5 mb-5 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wide">Title *</label>
          <input type="text" placeholder="Drive title" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} className={inputCls('title')} />
          {formErrors.title && <p className="text-red-400 text-xs mt-1">{formErrors.title}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wide">Funding Goal ($) *</label>
          <input type="number" placeholder="50000" value={formData.goal} onChange={e => setFormData(p => ({ ...p, goal: e.target.value }))} className={inputCls('goal')} />
          {formErrors.goal && <p className="text-red-400 text-xs mt-1">{formErrors.goal}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wide">Date *</label>
          <input type="date" value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} className={inputCls('date')} />
          {formErrors.date && <p className="text-red-400 text-xs mt-1">{formErrors.date}</p>}
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wide">Description *</label>
          <textarea placeholder="Goals and objectives..." value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} className={inputCls('description')} rows={2} />
          {formErrors.description && <p className="text-red-400 text-xs mt-1">{formErrors.description}</p>}
        </div>
      </div>
      <div className="flex gap-3 pt-1">
        <button onClick={onSubmit} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all border border-green-500">
          <Plus size={15} />{submitLabel}
        </button>
        <button onClick={() => { onCancel(); setFormData(EMPTY_FORM); setFormErrors({}); }} className="px-5 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 hover:text-white font-semibold text-sm transition-all">
          Cancel
        </button>
      </div>
    </div>
  );

  const FillBar = ({ raised, goal }) => {
    const pct = goal ? Math.min(Math.round((raised / goal) * 100), 100) : 0;
    return (
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>${raised.toLocaleString()} raised</span>
          <span>{pct}% of ${goal.toLocaleString()}</span>
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-amber-500' : 'bg-gradient-to-r from-green-600 to-emerald-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-700 border-b border-green-600">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center gap-3">
            <Building2 className="text-white w-6 h-6" />
            <div>
              <h1 className="text-xl font-bold text-white">Corporate Sponsorship</h1>
              <p className="text-green-200 text-xs mt-0.5">Browse, join and sponsor plantation drives</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Notification */}
        {notification.text && (
          <div className={`mb-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border ${
            notification.type === 'error' ? 'bg-red-950 border-red-800 text-red-300' : 'bg-emerald-950 border-emerald-800 text-emerald-300'
          }`}>
            <AlertCircle size={16} />{notification.text}
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold">Available Drives</h2>
          <button
            onClick={() => { setShowUserCreateForm(v => !v); setFormData(EMPTY_FORM); setFormErrors({}); }}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all border border-green-500"
          >
            {showUserCreateForm ? <X size={15} /> : <Plus size={15} />}
            {showUserCreateForm ? 'Cancel' : 'Propose Drive'}
          </button>
        </div>

        {showUserCreateForm && (
          <DriveForm
            onSubmit={handleUserCreateDrive}
            onCancel={() => setShowUserCreateForm(false)}
            submitLabel="Submit for Approval"
          />
        )}

        <div className="space-y-4">
          {drives.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-gray-900 border border-gray-800 rounded-xl">
              <TrendingUp size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No active drives available.</p>
            </div>
          ) : (
            drives.map(drive => {
              const joined = userJoinedDrives.includes(drive.id);
              return (
                <div key={drive.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <h4 className="text-white font-semibold">{drive.title}</h4>
                      <p className="text-gray-400 text-sm mt-0.5">{drive.description}</p>
                    </div>
                    {joined && (
                      <span className="text-xs font-bold bg-emerald-900/40 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-700 shrink-0">
                        Joined ✓
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1.5"><DollarSign size={12} className="text-amber-400" />${drive.raised.toLocaleString()} raised</div>
                    <div className="flex items-center gap-1.5"><Users size={12} className="text-blue-400" />{drive.participants} participants</div>
                    <div className="flex items-center gap-1.5"><Calendar size={12} className="text-purple-400" />{drive.date}</div>
                  </div>
                  <FillBar raised={drive.raised} goal={drive.goal} />
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleJoinDrive(drive.id)}
                      disabled={joined}
                      className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all border ${
                        joined ? 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500'
                      }`}
                    >
                      {joined ? 'Already Joined' : 'Join Drive'}
                    </button>
                    <button
                      onClick={() => setSponsorModal({ id: drive.id, amount: '' })}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-semibold text-sm border border-green-500 transition-all"
                    >
                      <DollarSign size={15} />Sponsor
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Sponsor Modal */}
      {sponsorModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-white font-bold text-lg mb-1">Sponsor This Drive</h3>
            <p className="text-gray-500 text-sm mb-4">Enter the amount you wish to contribute.</p>
            <div className="relative mb-4">
              <DollarSign size={15} className="absolute left-3.5 top-3 text-gray-500" />
              <input
                type="number"
                min="1"
                placeholder="Amount (USD)"
                value={sponsorModal.amount}
                onChange={e => setSponsorModal(m => ({ ...m, amount: e.target.value }))}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-800 border border-gray-700 text-white rounded-xl text-sm focus:border-green-500 focus:outline-none transition-all placeholder-gray-500"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSponsor}
                disabled={!sponsorModal.amount || Number(sponsorModal.amount) <= 0}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white py-2.5 rounded-lg font-semibold text-sm transition-all"
              >
                Confirm Sponsorship
              </button>
              <button
                onClick={() => setSponsorModal(null)}
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
}