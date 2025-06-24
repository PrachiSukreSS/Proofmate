import React, { useState } from 'react';
import { User, Mail, Calendar, Mic, Settings, Edit3, Save, X } from 'lucide-react';

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    username: 'John Doe',
    email: 'john.doe@example.com',
    joinDate: '2024-01-01',
    totalRecordings: 47,
    totalDuration: '5h 32m',
    bio: 'Professional podcaster and content creator passionate about storytelling.',
  });

  const [editedProfile, setEditedProfile] = useState(profile);

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const stats = [
    {
      icon: Mic,
      label: 'Total Recordings',
      value: profile.totalRecordings.toString(),
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      icon: Calendar,
      label: 'Total Duration',
      value: profile.totalDuration,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      icon: Calendar,
      label: 'Member Since',
      value: new Date(profile.joinDate).getFullYear().toString(),
      color: 'text-violet-600',
      bgColor: 'bg-violet-100',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4" style={{
          fontFamily: '"Nunito", "Inter", system-ui, sans-serif',
          fontWeight: '800',
          letterSpacing: '-0.02em'
        }}>
          Your Profile
        </h1>
        <p className="text-lg text-slate-700">
          Manage your account settings and view your recording statistics
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-purple-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 h-32 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
              <User className="h-12 w-12 text-slate-400" />
            </div>
          </div>
          <div className="absolute top-4 right-4">
            {isEditing ? (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 text-white"
                >
                  <Save className="h-5 w-5" />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 text-white"
              >
                <Edit3 className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        <div className="pt-16 pb-8 px-8 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={editedProfile.username}
                    onChange={(e) => setEditedProfile({ ...editedProfile, username: e.target.value })}
                    className="w-full px-4 py-2 bg-white/70 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                    className="w-full px-4 py-2 bg-white/70 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                  <textarea
                    value={editedProfile.bio}
                    onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-white/70 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-800" style={{
                  fontFamily: '"Nunito", "Inter", system-ui, sans-serif',
                  fontWeight: '800'
                }}>{profile.username}</h2>
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="h-4 w-4" />
                  {profile.email}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(profile.joinDate).toLocaleDateString()}
                </div>
                <p className="text-slate-600 mt-4">{profile.bio}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-purple-200"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Settings Section */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border-2 border-purple-200">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="h-6 w-6 text-slate-600" />
          <h3 className="text-xl font-semibold text-slate-800" style={{
            fontFamily: '"Nunito", "Inter", system-ui, sans-serif',
            fontWeight: '700'
          }}>Settings</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-slate-700">Recording Preferences</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" className="rounded border-slate-300" defaultChecked />
                <span className="text-sm text-slate-600">Auto-save recordings</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="rounded border-slate-300" defaultChecked />
                <span className="text-sm text-slate-600">High quality audio</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="rounded border-slate-300" />
                <span className="text-sm text-slate-600">Noise cancellation</span>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-slate-700">Notifications</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" className="rounded border-slate-300" defaultChecked />
                <span className="text-sm text-slate-600">Email notifications</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="rounded border-slate-300" />
                <span className="text-sm text-slate-600">Recording reminders</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="rounded border-slate-300" />
                <span className="text-sm text-slate-600">Weekly summaries</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;