import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
  Share2,
  Edit3,
  Calendar,
  Clock,
  Tag,
  Brain,
  Shield,
  Hash,
  CheckSquare,
  Square,
  Star,
  MessageSquare,
  Copy,
  ExternalLink,
  FileText,
  Zap,
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import {
  exportToGoogleCalendar,
  exportToTodoist,
  exportAsPDF,
  copyToClipboard,
} from "../utils/integrationManager";

const MemoryViewer = ({ memory, onClose, onEdit, onRate }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(memory.audio_duration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [completedItems, setCompletedItems] = useState(new Set());
  const [rating, setRating] = useState(memory.rating || 0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(memory.comments || []);
  const audioRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate audio playback
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    toast({
      title: isPlaying ? "Paused" : "Playing",
      description: `Audio ${isPlaying ? "paused" : "started"}`,
    });
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      setVolume(0);
    } else {
      setVolume(1);
    }
  };

  const handleActionItemToggle = (index) => {
    const newCompleted = new Set(completedItems);
    if (newCompleted.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
    }
    setCompletedItems(newCompleted);
  };

  const handleRating = (newRating) => {
    setRating(newRating);
    if (onRate) {
      onRate(memory.id, newRating);
    }
    toast({
      title: "Rating Updated",
      description: `Rated ${newRating} stars`,
    });
  };

  const handleAddComment = () => {
    if (comment.trim()) {
      const newComment = {
        id: Date.now(),
        text: comment,
        timestamp: new Date().toISOString(),
        user: "You",
      };
      setComments([...comments, newComment]);
      setComment("");
      toast({
        title: "Comment Added",
        description: "Your comment has been saved",
      });
    }
  };

  const handleExport = async (type) => {
    try {
      let result;
      switch (type) {
        case "calendar":
          result = await exportToGoogleCalendar(
            memory.action_items || [],
            memory.title
          );
          break;
        case "todoist":
          result = await exportToTodoist(
            memory.action_items || [],
            memory.title,
            memory.priority
          );
          break;
        case "pdf":
          result = await exportAsPDF(memory);
          break;
        case "copy":
          const content = `${memory.title}\n\n${
            memory.summary
          }\n\nAction Items:\n${(memory.action_items || [])
            .map((item) => `• ${item}`)
            .join("\n")}`;
          result = await copyToClipboard(content);
          break;
      }

      if (result.success) {
        toast({
          title: "Export Successful",
          description: `Memory exported to ${type}`,
        });
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: `Could not export to ${type}`,
        variant: "destructive",
      });
    }
  };

  const getSentimentColor = (sentiment) => {
    const colors = {
      positive: "text-green-600 bg-green-100",
      negative: "text-red-600 bg-red-100",
      neutral: "text-blue-600 bg-blue-100",
    };
    return colors[sentiment] || colors.neutral;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: "from-red-400 to-red-500",
      high: "from-orange-400 to-orange-500",
      medium: "from-yellow-400 to-yellow-500",
      low: "from-green-400 to-green-500",
    };
    return colors[priority?.toLowerCase()] || colors.medium;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{memory.title}</h2>
              <div className="flex items-center gap-4 text-sm opacity-90">
                <span>{new Date(memory.created_at).toLocaleDateString()}</span>
                <span>•</span>
                <span className="capitalize">{memory.category}</span>
                <span>•</span>
                <div
                  className={`w-3 h-3 rounded-full bg-gradient-to-r ${getPriorityColor(
                    memory.priority
                  )}`}
                />
                <span className="capitalize">{memory.priority} Priority</span>
                {memory.verification_status === "verified" && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Shield className="h-4 w-4" />
                      <span>Verified</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mt-4">
            <span className="text-sm">Rate this memory:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRating(star)}
                className="text-yellow-300 hover:text-yellow-100 transition-colors"
              >
                <Star
                  className={`h-5 w-5 ${star <= rating ? "fill-current" : ""}`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Audio Player */}
              {memory.audio_duration && (
                <div className="bg-slate-50 rounded-2xl p-6">
                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Volume2 className="h-5 w-5" />
                    Audio Playback
                  </h3>

                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div
                      className="w-full bg-slate-200 rounded-full h-2 cursor-pointer"
                      onClick={handleSeek}
                    >
                      <div
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      />
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handlePlayPause}
                          className="p-3 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors"
                        >
                          {isPlaying ? (
                            <Pause className="h-5 w-5" />
                          ) : (
                            <Play className="h-5 w-5" />
                          )}
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={toggleMute}
                            className="text-slate-600 hover:text-slate-800"
                          >
                            {isMuted ? (
                              <VolumeX className="h-4 w-4" />
                            ) : (
                              <Volume2 className="h-4 w-4" />
                            )}
                          </button>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-20"
                          />
                        </div>
                      </div>

                      <div className="text-sm text-slate-600">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="bg-blue-50 rounded-2xl p-6">
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  AI Summary
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  {memory.summary}
                </p>

                {memory.sentiment && (
                  <div className="mt-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${getSentimentColor(
                        memory.sentiment
                      )}`}
                    >
                      Sentiment: {memory.sentiment}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Items */}
              {memory.action_items && memory.action_items.length > 0 && (
                <div className="bg-green-50 rounded-2xl p-6">
                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <CheckSquare className="h-5 w-5 text-green-600" />
                    Action Items ({memory.action_items.length})
                  </h3>
                  <div className="space-y-3">
                    {memory.action_items.map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <button
                          onClick={() => handleActionItemToggle(index)}
                          className="mt-1 text-green-600 hover:text-green-800"
                        >
                          {completedItems.has(index) ? (
                            <CheckSquare className="h-5 w-5" />
                          ) : (
                            <Square className="h-5 w-5" />
                          )}
                        </button>
                        <span
                          className={`text-slate-700 ${
                            completedItems.has(index)
                              ? "line-through opacity-60"
                              : ""
                          }`}
                        >
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Transcript */}
              <div className="bg-slate-50 rounded-2xl p-6">
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-slate-600" />
                  Full Transcript
                </h3>
                <div className="bg-white p-4 rounded-lg border max-h-60 overflow-y-auto">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {memory.transcript}
                  </p>
                </div>
              </div>

              {/* Comments */}
              <div className="bg-purple-50 rounded-2xl p-6">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                  Comments ({comments.length})
                </h3>

                <div className="space-y-3 mb-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-white p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-slate-800">
                          {comment.user}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(comment.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-700 text-sm">{comment.text}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
                  />
                  <button
                    onClick={handleAddComment}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Metadata */}
              <div className="bg-slate-50 rounded-2xl p-6">
                <h3 className="font-semibold text-slate-800 mb-4">
                  Memory Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span>{new Date(memory.created_at).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <span>{formatTime(memory.audio_duration || 0)}</span>
                  </div>
                  {memory.word_count && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-500" />
                      <span>{memory.word_count} words</span>
                    </div>
                  )}
                  {memory.confidence && (
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-slate-500" />
                      <span>
                        {Math.round(memory.confidence * 100)}% confidence
                      </span>
                    </div>
                  )}
                  {memory.blockchain_hash && (
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-slate-500" />
                      <span className="font-mono text-xs">
                        {memory.blockchain_hash.substring(0, 8)}...
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              {memory.tags && memory.tags.length > 0 && (
                <div className="bg-indigo-50 rounded-2xl p-6">
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Tag className="h-5 w-5 text-indigo-600" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {memory.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="bg-orange-50 rounded-2xl p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => onEdit && onEdit(memory)}
                    className="w-full flex items-center gap-2 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit Memory
                  </button>

                  <button
                    onClick={() => handleExport("calendar")}
                    className="w-full flex items-center gap-2 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Calendar className="h-4 w-4" />
                    Export to Calendar
                  </button>

                  <button
                    onClick={() => handleExport("todoist")}
                    className="w-full flex items-center gap-2 p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <CheckSquare className="h-4 w-4" />
                    Send to Todoist
                  </button>

                  <button
                    onClick={() => handleExport("pdf")}
                    className="w-full flex items-center gap-2 p-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </button>

                  <button
                    onClick={() => handleExport("copy")}
                    className="w-full flex items-center gap-2 p-3 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                    Copy to Clipboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryViewer;
