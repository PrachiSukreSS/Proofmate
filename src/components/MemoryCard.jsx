import React from "react";
import { Calendar, Clock, Play, Pause, Target, CheckSquare, Hash } from "lucide-react";

const MemoryCard = ({
  memory,
  onView,
  onEdit,
  onDelete,
  onPlay,
  isPlaying = false,
}) => {
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      happy: "from-yellow-400 to-orange-400",
      sad: "from-blue-400 to-indigo-400",
      excited: "from-pink-400 to-red-400",
      calm: "from-green-400 to-teal-400",
      anxious: "from-purple-400 to-violet-400",
      thoughtful: "from-purple-400 to-indigo-400",
      nostalgic: "from-indigo-400 to-purple-400",
      default: "from-purple-400 to-indigo-400",
    };
    return colors[emotion?.toLowerCase()] || colors.default;
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: "border-red-500 bg-red-50 dark:bg-red-900/20",
      high: "border-orange-500 bg-orange-50 dark:bg-orange-900/20",
      medium: "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20",
      low: "border-green-500 bg-green-50 dark:bg-green-900/20",
    };
    return colors[priority?.toLowerCase()] || colors.medium;
  };

  return (
    <div
      className={`group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-purple-200 dark:border-purple-700/50 transition-all duration-300 ${
        isPlaying ? "ring-2 ring-purple-400" : ""
      }`}
    >
      <div className="space-y-3 sm:space-y-4">
        {/* Header with priority indicator */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                  memory.priority
                )}`}
              >
                {memory.priority || "medium"}
              </div>
              {memory.verification_status === "verified" && (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <Hash className="h-3 w-3" />
                  <span className="text-xs">Verified</span>
                </div>
              )}
            </div>
            <h3
              className="font-bold text-base sm:text-lg text-slate-800 dark:text-slate-100 mb-2"
              style={{
                fontFamily: '"Nunito", "Inter", system-ui, sans-serif',
                fontWeight: "700",
              }}
            >
              {memory.title || "Untitled Memory"}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-3 h-3 rounded-full bg-gradient-to-r ${getEmotionColor(
                  memory.sentiment
                )}`}
              ></div>
              <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 capitalize">
                {memory.sentiment || "neutral"}
              </span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-2">
          <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
            {truncateText(memory.summary)}
          </p>
        </div>

        {/* Action Items */}
        {memory.action_items && memory.action_items.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Action Items ({memory.action_items.length})
              </span>
            </div>
            <div className="space-y-1">
              {memory.action_items.slice(0, 2).map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckSquare className="h-3 w-3 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-blue-700 dark:text-blue-300">
                    {item.length > 50 ? item.substring(0, 50) + "..." : item}
                  </span>
                </div>
              ))}
              {memory.action_items.length > 2 && (
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  +{memory.action_items.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {memory.tags && memory.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {memory.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
            {memory.tags.length > 3 && (
              <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-xs rounded-full">
                +{memory.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Timestamp and Stats */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400" />
            {formatDate(memory.created_at)}
          </div>
          {memory.word_count && (
            <div className="flex items-center gap-1">
              <span>{memory.word_count} words</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center pt-3 sm:pt-4 border-t border-purple-200 dark:border-purple-700">
          <div className="flex gap-1 sm:gap-2">
            <button
              onClick={() => onPlay && onPlay(memory.id)}
              className={`p-1.5 sm:p-2 rounded-full transition-all duration-200 ${
                isPlaying
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-purple-500 text-white hover:bg-purple-600"
              }`}
              title={isPlaying ? "Stop playback" : "Play memory"}
            >
              {isPlaying ? (
                <Pause className="h-3 w-3 sm:h-4 sm:w-4" />
              ) : (
                <Play className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
            </button>

            <button
              onClick={() => onView && onView(memory)}
              className="p-1.5 sm:p-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-all duration-200"
              title="View full memory"
            >
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>

          {memory.confidence && (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {Math.round(memory.confidence * 100)}% confidence
            </div>
          )}
        </div>

        {/* Progress bar when playing */}
        {isPlaying && (
          <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2 mt-3 sm:mt-4">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full w-1/3 animate-pulse"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryCard;