import React, { useState, useEffect } from "react";
import {
  Calendar,
  Search,
  Shield,
  Hash,
  Clock,
  Filter,
  ArrowLeft,
  BarChart3,
  Target,
  Tag,
  TrendingUp,
  Brain,
  Download,
  Upload,
  RefreshCw,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Mic,
  Play,
  Pause,
  Eye,
  Edit3,
  Trash2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MemoryCard from "../components/MemoryCard";
import MemoryViewer from "../components/MemoryViewer";
import MemoryEditor from "../components/MemoryEditor";
import { supabase } from "../utils/supabaseClient";
import { verifyMemoryIntegrity } from "../utils/blockchainVerification";
import { searchMemoriesWithAI } from "../utils/openaiProcessor";
import { useToast } from "../hooks/use-toast";

const TimelinePage = ({ user }) => {
  const [memories, setMemories] = useState([]);
  const [filteredMemories, setFilteredMemories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [playingMemoryId, setPlayingMemoryId] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterSentiment, setFilterSentiment] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [editingMemory, setEditingMemory] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadMemories();
    } else {
      setIsLoading(false);
    }
  }, [user, sortBy, sortOrder]);

  useEffect(() => {
    applyFilters();
  }, [memories, filterCategory, filterPriority, filterSentiment, searchQuery]);

  const loadMemories = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      let query = supabase.from("memories").select("*").eq("user_id", user.id);

      // Apply sorting
      const sortField =
        sortBy === "newest" || sortBy === "oldest"
          ? "created_at"
          : sortBy === "priority"
          ? "priority"
          : sortBy === "category"
          ? "category"
          : sortBy === "rating"
          ? "rating"
          : "created_at";

      query = query.order(sortField, { ascending: sortOrder === "asc" });

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

  const applyFilters = () => {
    let filtered = [...memories];

    // Apply category filter
    if (filterCategory !== "all") {
      filtered = filtered.filter(
        (memory) => memory.category === filterCategory
      );
    }

    // Apply priority filter
    if (filterPriority !== "all") {
      filtered = filtered.filter(
        (memory) => memory.priority === filterPriority
      );
    }

    // Apply sentiment filter
    if (filterSentiment !== "all") {
      filtered = filtered.filter(
        (memory) => memory.sentiment === filterSentiment
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (memory) =>
          memory.title?.toLowerCase().includes(query) ||
          memory.summary?.toLowerCase().includes(query) ||
          memory.transcript?.toLowerCase().includes(query) ||
          memory.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    setFilteredMemories(filtered);
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim() || !user) {
      return;
    }

    try {
      const results = await searchMemoriesWithAI(query, memories);
      setFilteredMemories(results);
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
    try {
      if (memory.blockchain_hash) {
        const verification = await verifyMemoryIntegrity(
          memory.id,
          memory.blockchain_hash
        );

        if (verification.verified) {
          toast({
            title: "Memory Verified ✅",
            description: `Viewing: ${memory.title} - Integrity confirmed`,
            variant: "success"
          });
        } else {
          toast({
            title: "Verification Warning ⚠️",
            description: "Memory integrity could not be verified",
            variant: "destructive",
          });
        }
      }

      setSelectedMemory(memory);
    } catch (error) {
      console.error("Verification error:", error);
      setSelectedMemory(memory);
    }
  };

  const handleEditMemory = (memory) => {
    setEditingMemory(memory);
  };

  const handleDeleteMemory = async (memoryId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this memory? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("memories")
        .delete()
        .eq("id", memoryId)
        .eq("user_id", user.id);

      if (error) throw error;

      setMemories((prev) => prev.filter((memory) => memory.id !== memoryId));
      toast({
        title: "Memory Deleted",
        description: "The memory has been permanently deleted.",
        variant: "success"
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
        description: "Memory playback started.",
      });

      setTimeout(() => {
        setPlayingMemoryId(null);
      }, 5000);
    }
  };

  const handleRateMemory = async (memoryId, rating) => {
    try {
      const { error } = await supabase
        .from("memories")
        .update({ rating })
        .eq("id", memoryId)
        .eq("user_id", user.id);

      if (error) throw error;

      setMemories((prev) =>
        prev.map((memory) =>
          memory.id === memoryId ? { ...memory, rating } : memory
        )
      );
    } catch (error) {
      console.error("Rating error:", error);
      toast({
        title: "Rating Failed",
        description: "Could not save rating",
        variant: "destructive",
      });
    }
  };

  const handleMemorySaved = (updatedMemory) => {
    setMemories((prev) =>
      prev.map((memory) =>
        memory.id === updatedMemory.id ? updatedMemory : memory
      )
    );
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadMemories();
    setIsRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Timeline has been updated",
      variant: "success"
    });
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(memories, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `proofmate-memories-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Data Exported",
      description: "Your memories have been exported as JSON",
      variant: "success"
    });
  };

  const categories = [
    "all",
    "work",
    "personal",
    "shopping",
    "health",
    "learning",
    "meeting",
    "general",
  ];
  const priorities = ["all", "urgent", "high", "medium", "low"];
  const sentiments = ["all", "positive", "neutral", "negative"];

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div
      className={`grid gap-6 ${
        viewMode === "grid"
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1"
      }`}
    >
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-200 shadow-lg animate-pulse h-[420px]"
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
    <div className="text-center py-16 space-y-6">
      <div className="w-24 h-24 mx-auto bg-gradient-to-r from-purple-200 to-indigo-200 rounded-full flex items-center justify-center">
        <Mic className="h-12 w-12 text-purple-400" />
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-semibold text-slate-700">
          {searchQuery ? "No memories found" : "No memories yet"}
        </h3>
        <p className="text-slate-600 max-w-md mx-auto">
          {searchQuery
            ? "Try adjusting your search terms or filters"
            : "Start your first recording to see your timeline fill up with actionable insights and tasks"}
        </p>
        {!searchQuery && (
          <button
            onClick={() => navigate("/record")}
            className="mt-4 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 px-6 py-3 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            Create Your First Memory
          </button>
        )}
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-200 to-indigo-200 rounded-full flex items-center justify-center">
            <Shield className="h-10 w-10 text-purple-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-slate-700">
              Please Log In
            </h2>
            <p className="text-slate-600 max-w-md mx-auto">
              You need to be logged in to view your memories and access the
              timeline.
            </p>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 px-6 py-3 text-white font-semibold rounded-xl transition-all duration-300"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-purple-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 text-slate-600 hover:text-slate-800 transition-colors"
                title="Refresh"
              >
                <RefreshCw
                  className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </button>

              <button
                onClick={handleExportData}
                className="p-2 text-slate-600 hover:text-slate-800 transition-colors"
                title="Export Data"
              >
                <Download className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-1 bg-white/70 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "grid"
                      ? "bg-purple-500 text-white"
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                  title="Grid View"
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "list"
                      ? "bg-purple-500 text-white"
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                  title="List View"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              Smart Memory Timeline
            </h1>
            <p className="text-lg text-slate-700 max-w-2xl">
              Your AI-powered memory timeline with actionable insights, task
              extraction, and blockchain verification.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
              <input
                type="text"
                placeholder="Search memories with AI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 bg-white/70 border-2 border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all"
                      ? "All Categories"
                      : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 bg-white/70 border-2 border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority === "all"
                      ? "All Priorities"
                      : priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </option>
                ))}
              </select>

              <select
                value={filterSentiment}
                onChange={(e) => setFilterSentiment(e.target.value)}
                className="px-3 py-2 bg-white/70 border-2 border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {sentiments.map((sentiment) => (
                  <option key={sentiment} value={sentiment}>
                    {sentiment === "all"
                      ? "All Sentiments"
                      : sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 bg-white/70 border-2 border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="newest">Date</option>
                  <option value="priority">Priority</option>
                  <option value="category">Category</option>
                  <option value="rating">Rating</option>
                </select>

                <button
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="p-2 bg-white/70 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
                  title={`Sort ${
                    sortOrder === "asc" ? "Descending" : "Ascending"
                  }`}
                >
                  {sortOrder === "asc" ? (
                    <SortAsc className="h-4 w-4" />
                  ) : (
                    <SortDesc className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          {memories.length > 0 && (
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <div className="bg-white/70 backdrop-blur-sm px-4 py-2 rounded-lg border border-purple-200 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span className="text-purple-600 font-semibold">
                  {filteredMemories.length}
                </span>
                <span className="text-slate-600">
                  {filteredMemories.length === 1 ? "Memory" : "Memories"}
                </span>
              </div>

              <div className="bg-white/70 backdrop-blur-sm px-4 py-2 rounded-lg border border-green-200 flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-green-600 font-semibold">
                  {
                    memories.filter((m) => m.verification_status === "verified")
                      .length
                  }
                </span>
                <span className="text-slate-600">Verified</span>
              </div>

              <div className="bg-white/70 backdrop-blur-sm px-4 py-2 rounded-lg border border-blue-200 flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-blue-600 font-semibold">
                  {memories.reduce(
                    (sum, m) => sum + (m.action_items?.length || 0),
                    0
                  )}
                </span>
                <span className="text-slate-600">Action Items</span>
              </div>

              {searchQuery && (
                <div className="bg-white/70 backdrop-blur-sm px-4 py-2 rounded-lg border border-indigo-200 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-indigo-600" />
                  <span className="text-indigo-600 font-semibold">
                    AI Search
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
          <EmptyState />
        ) : (
          <div
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1"
            }`}
          >
            {filteredMemories.map((memory) => (
              <div key={memory.id} className="relative">
                <MemoryCard
                  memory={memory}
                  isPlaying={playingMemoryId === memory.id}
                  onView={handleViewMemory}
                  onEdit={handleEditMemory}
                  onDelete={handleDeleteMemory}
                  onPlay={handlePlayMemory}
                  onRate={handleRateMemory}
                />
                {/* Blockchain verification badge */}
                {memory.verification_status === "verified" && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full shadow-lg">
                    <Shield className="h-3 w-3" />
                  </div>
                )}
                {/* Priority indicator */}
                {memory.priority === "urgent" && (
                  <div className="absolute -top-2 -left-2 bg-red-500 text-white p-1 rounded-full shadow-lg">
                    <Clock className="h-3 w-3" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Memory Viewer Modal */}
        {selectedMemory && (
          <MemoryViewer
            memory={selectedMemory}
            onClose={() => setSelectedMemory(null)}
            onEdit={handleEditMemory}
            onRate={handleRateMemory}
          />
        )}

        {/* Memory Editor Modal */}
        {editingMemory && (
          <MemoryEditor
            memory={editingMemory}
            onClose={() => setEditingMemory(null)}
            onSave={handleMemorySaved}
          />
        )}
      </div>
    </div>
  );
};

export default TimelinePage;