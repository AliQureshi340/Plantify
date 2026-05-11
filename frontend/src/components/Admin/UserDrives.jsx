import React, { useState } from 'react';
import { Plus, Check, X, DollarSign, Users, Calendar } from 'lucide-react';

export default function CorporateSponsorshipModule() {
  const [activeTab, setActiveTab] = useState('admin');
  const [drives, setDrives] = useState([
    {
      id: 1,
      title: 'Tree Plantation Drive 2024',
      goal: 50000,
      raised: 35000,
      participants: 120,
      date: '2024-11-15',
      status: 'active',
      approved: true,
      description: 'Plant 1000 trees in urban areas'
    }
  ]);
  const [pendingDrives, setPendingDrives] = useState([]);
  const [userJoinedDrives, setUserJoinedDrives] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUserCreateForm, setShowUserCreateForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', goal: '', date: '', description: '' });

  const handleCreateDrive = () => {
    if (!formData.title || !formData.goal || !formData.date || !formData.description) {
      alert('Please fill all fields');
      return;
    }
    const newDrive = {
      id: Date.now(),
      ...formData,
      goal: Number(formData.goal),
      raised: 0,
      participants: 0,
      status: 'active',
      approved: true
    };
    setDrives([...drives, newDrive]);
    setFormData({ title: '', goal: '', date: '', description: '' });
    setShowCreateForm(false);
  };

  const handleUserCreateDrive = () => {
    if (!formData.title || !formData.goal || !formData.date || !formData.description) {
      alert('Please fill all fields');
      return;
    }
    const newDrive = {
      id: Date.now(),
      ...formData,
      goal: Number(formData.goal),
      raised: 0,
      participants: 0,
      status: 'pending',
      approved: false
    };
    setPendingDrives([...pendingDrives, newDrive]);
    setFormData({ title: '', goal: '', date: '', description: '' });
    setShowUserCreateForm(false);
    alert('Drive submitted for approval!');
  };

  const handleApproveDrive = (id, approve) => {
    const drive = pendingDrives.find(d => d.id === id);
    if (approve) {
      setDrives([...drives, { ...drive, approved: true, status: 'active' }]);
    }
    setPendingDrives(pendingDrives.filter(d => d.id !== id));
  };

  const handleJoinDrive = (driveId) => {
    if (!userJoinedDrives.includes(driveId)) {
      setUserJoinedDrives([...userJoinedDrives, driveId]);
      setDrives(drives.map(d => d.id === driveId ? { ...d, participants: d.participants + 1 } : d));
      alert('Successfully joined the drive!');
    }
  };

  const handleSponsorDrive = (driveId) => {
    const sponsorAmount = Number(prompt('Enter sponsorship amount:'));
    if (sponsorAmount && sponsorAmount > 0) {
      setDrives(drives.map(d => d.id === driveId ? { ...d, raised: d.raised + sponsorAmount } : d));
      alert('Thank you for sponsoring!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Topbar */}
      <div className="w-full bg-gradient-to-r from-green-600 to-emerald-600 border-b-2 border-green-500 shadow-xl">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Corporate Sponsorship Module</h1>
          <p className="text-green-50 mt-1 text-sm font-medium">Manage drives, sponsorships and participants</p>
        </div>
      </div>

      {/* Layout with vertical sidebar */}
      <div className="p-6 flex gap-6">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl p-4 border-2 border-gray-700 shadow-2xl sticky top-6 h-fit">
          <div className="text-sm font-bold mb-4 text-green-400 tracking-wide">NAVIGATION</div>
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => setActiveTab('admin')}
              className={`text-left px-4 py-2.5 rounded-lg border-2 font-semibold text-sm tracking-wide transition-all duration-300 ${activeTab === 'admin' ? 'bg-green-600 border-green-500 text-white' : 'bg-gray-700 text-gray-100 border-gray-600 hover:bg-green-600 hover:border-green-500'}`}
            >
              Admin Panel
            </button>
            <button
              onClick={() => setActiveTab('user')}
              className={`text-left px-4 py-2.5 rounded-lg border-2 font-semibold text-sm tracking-wide transition-all duration-300 ${activeTab === 'user' ? 'bg-green-600 border-green-500 text-white' : 'bg-gray-700 text-gray-100 border-gray-600 hover:bg-green-600 hover:border-green-500'}`}
            >
              User Panel
            </button>
          </nav>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          {activeTab === 'admin' ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg border-2 border-green-500 font-semibold"
                >
                  <Plus size={20} /> Create Drive
                </button>
              </div>

              {showCreateForm && (
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 mb-8 border-2 border-gray-700 shadow-2xl">
                  <h3 className="text-xl font-bold text-white mb-4">Create New Drive</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Drive Title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg bg-gray-700 border-2 border-gray-600 text-white placeholder-gray-400 focus:border-green-500 focus:outline-none transition-all font-medium"
                    />
                    <input
                      type="number"
                      placeholder="Funding Goal"
                      value={formData.goal}
                      onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg bg-gray-700 border-2 border-gray-600 text-white placeholder-gray-400 focus:border-green-500 focus:outline-none transition-all font-medium"
                    />
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg bg-gray-700 border-2 border-gray-600 text-white focus:border-green-500 focus:outline-none transition-all font-medium"
                    />
                    <textarea
                      placeholder="Description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg bg-gray-700 border-2 border-gray-600 text-white placeholder-gray-400 focus:border-green-500 focus:outline-none transition-all font-medium"
                      rows="3"
                    />
                    <button
                      onClick={handleCreateDrive}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2.5 rounded-lg font-bold tracking-wide hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg border-2 border-green-500"
                    >
                      Create Drive
                    </button>
                  </div>
                </div>
              )}

              {pendingDrives.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-4">Pending Approval ({pendingDrives.length})</h3>
                  <div className="space-y-4">
                    {pendingDrives.map(drive => (
                      <div key={drive.id} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 border-2 border-yellow-600 shadow-2xl">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-white mb-2">{drive.title}</h4>
                            <p className="text-gray-300 text-sm mb-3">{drive.description}</p>
                            <div className="text-sm text-gray-400">Goal: ${drive.goal} | Date: {drive.date}</div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => handleApproveDrive(drive.id, true)}
                              className="bg-green-600 text-white p-2.5 rounded-lg hover:bg-green-700 transition-all border-2 border-green-500"
                            >
                              <Check size={20} />
                            </button>
                            <button
                              onClick={() => handleApproveDrive(drive.id, false)}
                              className="bg-red-600 text-white p-2.5 rounded-lg hover:bg-red-700 transition-all border-2 border-red-500"
                            >
                              <X size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-white mb-4">Active Drives ({drives.length})</h3>
                <div className="space-y-4">
                  {drives.map(drive => (
                    <div key={drive.id} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 border-2 border-gray-700 shadow-2xl hover:border-green-600 transition-all">
                      <h4 className="font-bold text-lg text-white mb-2">{drive.title}</h4>
                      <p className="text-gray-300 text-sm mb-3">{drive.description}</p>
                      <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                        <div className="flex items-center gap-2 text-gray-400">
                          <DollarSign size={16} className="text-green-400" />
                          <span>Raised: ${drive.raised} / ${drive.goal}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Users size={16} className="text-blue-400" />
                          <span>{drive.participants} Participants</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Calendar size={16} className="text-purple-400" />
                          <span>{drive.date}</span>
                        </div>
                      </div>
                      <div className="bg-gray-700 rounded-full h-2 border-2 border-gray-600">
                        <div
                          className="bg-gradient-to-r from-green-600 to-emerald-600 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min((drive.raised / drive.goal) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Available Drives</h2>
                <button
                  onClick={() => setShowUserCreateForm(!showUserCreateForm)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg border-2 border-green-500 font-semibold"
                >
                  <Plus size={20} /> Propose Drive
                </button>
              </div>

              {showUserCreateForm && (
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 mb-8 border-2 border-gray-700 shadow-2xl">
                  <h3 className="text-xl font-bold text-white mb-4">Propose New Drive</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Drive Title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg bg-gray-700 border-2 border-gray-600 text-white placeholder-gray-400 focus:border-green-500 focus:outline-none transition-all font-medium"
                    />
                    <input
                      type="number"
                      placeholder="Funding Goal"
                      value={formData.goal}
                      onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg bg-gray-700 border-2 border-gray-600 text-white placeholder-gray-400 focus:border-green-500 focus:outline-none transition-all font-medium"
                    />
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg bg-gray-700 border-2 border-gray-600 text-white focus:border-green-500 focus:outline-none transition-all font-medium"
                    />
                    <textarea
                      placeholder="Description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg bg-gray-700 border-2 border-gray-600 text-white placeholder-gray-400 focus:border-green-500 focus:outline-none transition-all font-medium"
                      rows="3"
                    />
                    <button
                      onClick={handleUserCreateDrive}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2.5 rounded-lg font-bold tracking-wide hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg border-2 border-green-500"
                    >
                      Submit for Approval
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {drives.map(drive => (
                  <div key={drive.id} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 border-2 border-gray-700 shadow-2xl hover:border-green-600 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-white">{drive.title}</h4>
                        <p className="text-gray-300 text-sm mt-1">{drive.description}</p>
                      </div>
                      {userJoinedDrives.includes(drive.id) && (
                        <span className="bg-green-900 text-green-300 px-3 py-1 rounded-full text-xs font-semibold border-2 border-green-600">
                          Joined ✓
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-sm mb-4">
                      <div className="flex items-center gap-2 text-gray-400">
                        <DollarSign size={16} className="text-green-400" />
                        <span>${drive.raised} / ${drive.goal}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Users size={16} className="text-blue-400" />
                        <span>{drive.participants} Participants</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar size={16} className="text-purple-400" />
                        <span>{drive.date}</span>
                      </div>
                    </div>

                    <div className="mb-4 bg-gray-700 rounded-full h-2 border-2 border-gray-600">
                      <div
                        className="bg-gradient-to-r from-green-600 to-emerald-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min((drive.raised / drive.goal) * 100, 100)}%` }}
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleJoinDrive(drive.id)}
                        disabled={userJoinedDrives.includes(drive.id)}
                        className={`flex-1 px-4 py-2.5 rounded-lg font-semibold border-2 transition-all ${
                          userJoinedDrives.includes(drive.id)
                            ? 'bg-gray-700 text-gray-400 border-gray-600 cursor-not-allowed'
                            : 'bg-blue-600 text-white border-blue-500 hover:bg-blue-700'
                        }`}
                      >
                        {userJoinedDrives.includes(drive.id) ? 'Already Joined' : 'Join Drive'}
                      </button>
                      <button
                        onClick={() => handleSponsorDrive(drive.id)}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2.5 rounded-lg font-semibold border-2 border-green-500 hover:from-green-700 hover:to-emerald-700 transition-all"
                      >
                        Sponsor Drive
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
