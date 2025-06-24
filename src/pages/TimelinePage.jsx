import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Play, Pause, MoreVertical, Search, Eye, Edit3, Trash2, Save, X } from 'lucide-react';

const TimelinePage = () => {
  const [recordings, setRecordings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    // Simulate loading recordings
    const loadRecordings = async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setRecordings([
        {
          id: '1',
          title: 'Team Meeting Notes',
          date: '2024-01-15',
          duration: '12:34',
          isPlaying: false,
        },
        {
          id: '2',
          title: 'Project Brainstorm',
          date: '2024-01-14',
          duration: '8:21',
          isPlaying: false,
        },
        {
          id: '3',
          title: 'Client Interview',
          date: '2024-01-13',
          duration: '25:47',
          isPlaying: false,
        },
        {
          id: '4',
          title: 'Daily Standup',
          date: '2024-01-12',
          duration: '5:12',
          isPlaying: false,
        },
      ]);
      setIsLoading(false);
    };

    loadRecordings();
  }, []);

  const togglePlayback = (id) => {
    setRecordings(prev => 
      prev.map(recording => ({
        ...recording,
        isPlaying: recording.id === id ? !recording.isPlaying : false,
      }))
    );
  };

  const handleViewMemory = (id) => {
    console.log('Viewing memory:', id);
  };

  const handleEdit = (id, title) => {
    setEditingId(id);
    setEditTitle(title);
  };

  const handleSaveEdit = (id) => {
    setRecordings(prev => 
      prev.map(recording => 
        recording.id === id 
          ? { ...recording, title: editTitle }
          : recording
      )
    );
    setEditingId(null);
    setEditTitle('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this recording?')) {
      setRecordings(prev => prev.filter(recording => recording.id !== id));
    }
  };

  const filteredRecordings = recordings.filter(recording =>
    recording.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-200 shadow-lg animate-pulse">
          <div className="space-y-4">
            <div className="h-4 bg-purple-200 rounded w-3/4"></div>
            <div className="h-3 bg-purple-200 rounded w-1/2"></div>
            <div className="h-3 bg-purple-200 rounded w-1/3"></div>
            <div className="flex justify-between items-center pt-4">
              <div className="h-8 w-8 bg-purple-200 rounded-full"></div>
              <div className="h-6 w-6 bg-purple-200 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-16 space-y-6">
      <div className="w-24 h-24 mx-auto bg-gradient-to-r from-purple-200 to-indigo-200 rounded-full flex items-center justify-center">
        <Calendar className="h-12 w-12 text-purple-400" />
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-semibold text-slate-700" style={{
          fontFamily: '"Nunito", "Inter", system-ui, sans-serif',
          fontWeight: '700'
        }}>No recordings yet</h3>
        <p className="text-slate-600 max-w-md mx-auto">
          Start your first recording from the home page to see your timeline fill up with memories
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-6">
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4" style={{
            fontFamily: '"Nunito", "Inter", system-ui, sans-serif',
            fontWeight: '800',
            letterSpacing: '-0.02em'
          }}>
            Your Timeline
          </h1>
          <p className="text-lg text-slate-700 max-w-2xl">
            Browse through your recorded memories and important moments
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto md:mx-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
          <input
            type="text"
            placeholder="Search your recordings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : filteredRecordings.length === 0 ? (
        searchQuery ? (
          <div className="text-center py-16 space-y-4">
            <Search className="h-16 w-16 mx-auto text-purple-300" />
            <h3 className="text-xl font-semibold text-slate-700" style={{
              fontFamily: '"Nunito", "Inter", system-ui, sans-serif',
              fontWeight: '700'
            }}>No recordings found</h3>
            <p className="text-slate-600">Try adjusting your search terms</p>
          </div>
        ) : (
          <EmptyState />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecordings.map((recording) => (
            <div
              key={recording.id}
              className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-purple-200 hover:border-purple-300"
              style={{
                boxShadow: '0 10px 25px -5px rgba(147, 51, 234, 0.1), 0 10px 10px -5px rgba(147, 51, 234, 0.04)'
              }}
            >
              <div className="space-y-4">
                {/* Recording Info */}
                <div className="space-y-2">
                  {editingId === recording.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-white/70 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg font-semibold"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(recording.id)}
                          className="p-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-200"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors duration-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <h3 className="font-semibold text-lg text-slate-800 group-hover:text-purple-600 transition-colors duration-200">
                      {recording.title}
                    </h3>
                  )}
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="h-4 w-4 text-purple-400" />
                    {new Date(recording.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="h-4 w-4 text-purple-400" />
                    {recording.duration}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex justify-between items-center pt-4 border-t border-purple-200">
                  <div className="flex gap-2">
                    <button
                      onClick={() => togglePlayback(recording.id)}
                      className={`p-2 rounded-full transition-all duration-200 ${
                        recording.isPlaying
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-purple-500 text-white hover:bg-purple-600'
                      }`}
                    >
                      {recording.isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleViewMemory(recording.id)}
                      className="p-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-all duration-200"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleEdit(recording.id, recording.title)}
                      className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all duration-200"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(recording.id)}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors duration-200">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>

                {/* Progress Bar (shown when playing) */}
                {recording.isPlaying && (
                  <div className="w-full bg-purple-200 rounded-full h-2 mt-4">
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full w-1/3 animate-pulse"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimelinePage;