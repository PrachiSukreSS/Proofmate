import React, { useState, useEffect } from "react";
import { Calendar, Search, Shield, Hash, Clock, Filter } from "lucide-react";
import MemoryCard from "../components/MemoryCard";
import { supabase } from "../utils/supabaseClient";
import { verifyMemoryIntegrity } from "../utils/blockchainVerification";
import { searchMemoriesWithAI } from "../utils/aiProcessor";
import { useToast } from "../hooks/use-toast";

const TimelinePage = () => {
  const [memories, setMemories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [playingMemoryId, setPlayingMemoryId] = useState(null);
  const [filterEmotion, setFilterEmotion] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [user, setUser] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    initializeUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadMemories();
    }
  }, [user, sortBy]);

  const initializeUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadMemories = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      let query = supabase
        .from('memories')
        .select('*')
        .eq('user_id', user.id);

      // Apply sorting
      if (sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'oldest') {
        query = query.order('created_at', { ascending: true });
      } else if (sortBy === 'duration') {
        query = query.order('audio_duration', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      setMemories(data || []);
    } catch (error) {
      console.error("Error loading memories:", error);
      toast({
        title: "Loading Error",
        description: "Failed to load your memories. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim() || !user) {
      loadMemories();
      return;
    }

    try {
      const results = await searchMemoriesWithAI(query, user.id);
      setMemories(results);
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search Error",
        description: "Failed to search memories. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewMemory = async (memory) => {
    // Verify memory integrity
    try {
      const verification = await verifyMemoryIntegrity(memory.id, memory.blockchain_hash);
      
      if (verification.verified) {
        toast({
          title: "Memory Verified ✅",
          description: `Viewing: ${memory.title} - Integrity confirmed`,
        });
      } else {
        toast({
          title: "Verification Warning ⚠️",
          description: "Memory integrity could not be verified",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
    }
  };

  const handleEditMemory = (memory) => {
    toast({
      title: "Edit Memory",
      description: `Edit functionality for: ${memory.title}`,
    });
  };

  const handleDeleteMemory = async (memoryId) => {
    if (!window.confirm("Are you sure you want to delete this memory? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('memories')
        .delete()
        .eq('id', memoryId)
        .eq('user_id', user.id);

      if (error) throw error;

      setMemories(prev => prev.filter(memory => memory.id !== memoryId));
      toast({
        title: "Memory Deleted",
        description: "The memory has been permanently deleted.",
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Delete Error",
        description: "Failed to delete the memory. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePlayMemory = (memoryId) => {
    if (playingMemoryId === memoryId) {
      setPlayingMemoryId(null);
      toast({
        title: "Playback Stopped",
        description: "Memory playback has been stopped.",
      });
    } else {
      setPlayingMemoryId(memoryId);
      toast({
        title: "Playing Memory",
        description: "Memory playback started. (This is a simulation)",
      });

      setTimeout(() => {
        setPlayingMemoryId(null);
      }, 5000);
    }
  };

  const filteredMemories = memories.filter(memory => {
    if (filterEmotion === "all") return true;
    return memory.emotion === filterEmotion;
  });

  const emotions = ["all", "happy", "sad", "calm", "excited", "anxious", "thoughtful", "neutral"];

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border-2 border-purple-200 shadow-lg animate-pulse"
        >
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
    <div className="text-center py-12 sm:py-16 space-y-6 px-4">
      <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gradient-to-r from-purple-200 to-indigo-200 rounded-full flex items-center justify-center">
        <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-purple-400" />
      </div>
      <div className="space-y-2">
        <h3
          className="text-xl sm:text-2xl font-semibold text-slate-700"
          style={{
            fontFamily: '"Nunito", "Inter", system-ui, sans-serif',
            fontWeight: "700",
          }}
        >
          No memories yet
        </h3>
        <p className="text-slate-600 max-w-md mx-auto text-sm sm:text-base">
          Start your first recording to see your timeline fill up with beautiful memories
        </p>
        <button
          onClick={() => (window.location.href = "/")}
          className="mt-4 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 px-4 sm:px-6 py-2 sm:py-3 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
        >
          Create Your First Memory
        </button>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold text-slate-700 mb-4">Please Log In</h2>
        <p className="text-slate-600 mb-6">You need to be logged in to view your memories.</p>
        <button
          onClick={() => window.location.href = "/login"}
          className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 px-6 py-3 text-white font-semibold rounded-xl transition-all duration-300"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="space-y-4 sm:space-y-6">
          <div className="text-center md:text-left">
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 mb-4"
              style={{
                fontFamily: '"Nunito", "Inter", system-ui, sans-serif',
                fontWeight: "800",
                letterSpacing: "-0.02em",
              }}
            >
              Your Memory Timeline
            </h1>
            <p className="text-base sm:text-lg text-slate-700 max-w-2xl">
              Browse through your recorded memories with blockchain verification. Each memory is cryptographically secured.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
              <input
                type="text"
                placeholder="Search your memories..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-3 bg-white/70 backdrop-blur-sm border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              <select
                value={filterEmotion}
                onChange={(e) => setFilterEmotion(e.target.value)}
                className="px-3 py-2 bg-white/70 border-2 border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {emotions.map(emotion => (
                  <option key={emotion} value={emotion}>
                    {emotion === "all" ? "All Emotions" : emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-white/70 border-2 border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="duration">Longest First</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          {memories.length > 0 && (
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <div className="bg-white/70 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg border border-purple-200 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span className="text-purple-600 font-semibold text-sm sm:text-base">
                  {memories.length}
                </span>
                <span className="text-slate-600 text-sm sm:text-base">
                  Total Memories
                </span>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg border border-green-200 flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-green-600 font-semibold text-sm sm:text-base">
                  {memories.filter(m => m.verification_status === 'verified').length}
                </span>
                <span className="text-slate-600 text-sm sm:text-base">
                  Verified
                </span>
              </div>

              {searchQuery && (
                <div className="bg-white/70 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg border border-indigo-200 flex items-center gap-2">
                  <Search className="h-4 w-4 text-indigo-600" />
                  <span className="text-indigo-600 font-semibold text-sm sm:text-base">
                    {filteredMemories.length}
                  </span>
                  <span className="text-slate-600 text-sm sm:text-base">
                    Search Results
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : filteredMemories.length === 0 ? (
          searchQuery ? (
            <div className="text-center py-12 sm:py-16 space-y-4 px-4">
              <Search className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-purple-300" />
              <h3
                className="text-lg sm:text-xl font-semibold text-slate-700"
                style={{
                  fontFamily: '"Nunito", "Inter", system-ui, sans-serif',
                  fontWeight: "700",
                }}
              >
                No memories found
              </h3>
              <p className="text-slate-600 text-sm sm:text-base">
                Try adjusting your search terms or create new memories
              </p>
            </div>
          ) : (
            <EmptyState />
          )
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredMemories.map((memory) => (
              <div key={memory.id} className="relative">
                <MemoryCard
                  memory={memory}
                  isPlaying={playingMemoryId === memory.id}
                  onView={handleViewMemory}
                  onEdit={handleEditMemory}
                  onDelete={handleDeleteMemory}
                  onPlay={handlePlayMemory}
                />
                {/* Blockchain verification badge */}
                {memory.verification_status === 'verified' && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full shadow-lg">
                    <Shield className="h-3 w-3" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelinePage;