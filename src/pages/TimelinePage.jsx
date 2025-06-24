import React, { useState, useEffect } from "react";
import { Calendar, Search, Clock } from "lucide-react";
import MemoryCard from "../components/MemoryCard";
import {
  getMemories,
  deleteMemory,
  searchMemories,
} from "../utils/memoryStorage";
import { useToast } from "../hooks/use-toast";

const Timeline = () => {
  const [memories, setMemories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [playingMemoryId, setPlayingMemoryId] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    loadMemories();
  }, []);

  const loadMemories = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const loadedMemories = getMemories();
      setMemories(loadedMemories);
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

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleViewMemory = (memory) => {
    console.log("Viewing memory:", memory);
    toast({
      title: "Memory Details",
      description: `Viewing: ${memory.title}`,
    });
  };

  const handleEditMemory = (memory) => {
    console.log("Editing memory:", memory);
    toast({
      title: "Edit Memory",
      description: `Edit functionality for: ${memory.title}`,
    });
  };

  const handleDeleteMemory = (memoryId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this memory? This action cannot be undone."
      )
    ) {
      try {
        deleteMemory(memoryId);
        setMemories((prev) => prev.filter((memory) => memory.id !== memoryId));
        toast({
          title: "Memory Deleted",
          description: "The memory has been permanently deleted.",
        });
      } catch (error) {
        console.error("Error deleting memory:", error);
        toast({
          title: "Delete Error",
          description: "Failed to delete the memory. Please try again.",
          variant: "destructive",
        });
      }
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

  const filteredMemories = searchQuery ? searchMemories(searchQuery) : memories;

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
          Start your first recording to see your timeline fill up with beautiful
          memories
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-4 sm:p-6">
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
              Browse through your recorded memories and important moments. Each
              memory is a treasure waiting to be rediscovered.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md mx-auto md:mx-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
            <input
              type="text"
              placeholder="Search your memories..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-3 bg-white/70 backdrop-blur-sm border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
            />
          </div>

          {/* Navigation Button */}
          <div className="text-center md:text-left">
            <button
              onClick={() => (window.location.href = "/")}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 px-4 sm:px-6 py-2 sm:py-3 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 mx-auto md:mx-0 text-sm sm:text-base"
            >
              ← Back to Home
            </button>
          </div>

          {/* Stats */}
          {memories.length > 0 && (
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <div className="bg-white/70 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg border border-purple-200">
                <span className="text-purple-600 font-semibold text-sm sm:text-base">
                  {memories.length}
                </span>
                <span className="text-slate-600 ml-1 text-sm sm:text-base">
                  Total Memories
                </span>
              </div>
              {searchQuery && (
                <div className="bg-white/70 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg border border-purple-200">
                  <span className="text-indigo-600 font-semibold text-sm sm:text-base">
                    {filteredMemories.length}
                  </span>
                  <span className="text-slate-600 ml-1 text-sm sm:text-base">
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
              <MemoryCard
                key={memory.id}
                memory={memory}
                isPlaying={playingMemoryId === memory.id}
                onView={handleViewMemory}
                onEdit={handleEditMemory}
                onDelete={handleDeleteMemory}
                onPlay={handlePlayMemory}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;
