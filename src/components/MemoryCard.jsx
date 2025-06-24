import React from "react";
import { Calendar, Clock, Eye, Edit3, Trash2, Play, Pause } from "lucide-react";

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

  return (
    <div
      className={`group bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-purple-200 hover:border-purple-300 ${
        isPlaying ? "ring-2 ring-purple-400" : ""
      }`}
    >
      <div className="space-y-3 sm:space-y-4">
        {/* Header with emotion indicator */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3
              className="font-bold text-base sm:text-lg text-slate-800 group-hover:text-purple-600 transition-colors duration-200 mb-2"
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
                  memory.emotion
                )}`}
              ></div>
              <span className="text-xs sm:text-sm text-slate-600 capitalize">
                {memory.emotion || "neutral"}
              </span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-2">
          <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
            {truncateText(memory.summary)}
          </p>
        </div>

        {/* Keywords */}
        {memory.keywords && memory.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {memory.keywords.slice(0, 3).map((keyword, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
              >
                {keyword}
              </span>
            ))}
            {memory.keywords.length > 3 && (
              <span className="px-2 py-1 bg-indigo-100 text-indigo-600 text-xs rounded-full">
                +{memory.keywords.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Poem preview */}
        {memory.poem && (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-3 rounded-lg border border-purple-200">
            <p className="text-xs sm:text-sm text-purple-800 italic font-medium">
              {truncateText(memory.poem, 100)}
            </p>
          </div>
        )}

        {/* Timestamp */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400" />
          {formatDate(memory.timestamp)}
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center pt-3 sm:pt-4 border-t border-purple-200">
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
              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>

            <button
              onClick={() => onEdit && onEdit(memory)}
              className="p-1.5 sm:p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all duration-200"
              title="Edit memory"
            >
              <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>

            <button
              onClick={() => onDelete && onDelete(memory.id)}
              className="p-1.5 sm:p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-200"
              title="Delete memory"
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>

        {/* Progress bar when playing */}
        {isPlaying && (
          <div className="w-full bg-purple-200 rounded-full h-2 mt-3 sm:mt-4">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full w-1/3 animate-pulse"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryCard;
