import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Tag,
  Calendar,
  AlertCircle,
  Brain,
  CheckSquare,
  Plus,
  Trash2,
  Zap,
  Target,
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { supabase } from "../utils/supabaseClient";
import { processTranscriptWithAI } from "../utils/aiProcessor";

const MemoryEditor = ({ memory, onClose, onSave }) => {
  const [editedMemory, setEditedMemory] = useState({
    title: memory.title || "",
    summary: memory.summary || "",
    transcript: memory.transcript || "",
    action_items: memory.action_items || [],
    tags: memory.tags || [],
    priority: memory.priority || "medium",
    category: memory.category || "general",
    sentiment: memory.sentiment || "neutral",
    due_date: memory.due_date || "",
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newActionItem, setNewActionItem] = useState("");
  const [newTag, setNewTag] = useState("");
  const { toast } = useToast();

  const categories = [
    "general",
    "work",
    "personal",
    "shopping",
    "health",
    "learning",
    "meeting",
  ];
  const priorities = ["low", "medium", "high", "urgent"];
  const sentiments = ["positive", "neutral", "negative"];

  const handleInputChange = (field, value) => {
    setEditedMemory((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddActionItem = () => {
    if (newActionItem.trim()) {
      setEditedMemory((prev) => ({
        ...prev,
        action_items: [...prev.action_items, newActionItem.trim()],
      }));
      setNewActionItem("");
    }
  };

  const handleRemoveActionItem = (index) => {
    setEditedMemory((prev) => ({
      ...prev,
      action_items: prev.action_items.filter((_, i) => i !== index),
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !editedMemory.tags.includes(newTag.trim())) {
      setEditedMemory((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (index) => {
    setEditedMemory((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const handleReprocessWithAI = async () => {
    if (!editedMemory.transcript.trim()) {
      toast({
        title: "No Transcript",
        description: "Cannot reprocess without transcript content",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const aiResults = await processTranscriptWithAI(
        editedMemory.transcript,
        editedMemory.category
      );

      setEditedMemory((prev) => ({
        ...prev,
        title: aiResults.title || prev.title,
        summary: aiResults.summary || prev.summary,
        action_items: aiResults.actionItems || prev.action_items,
        tags: aiResults.tags || prev.tags,
        priority: aiResults.priority || prev.priority,
        sentiment: aiResults.sentiment || prev.sentiment,
      }));

      toast({
        title: "AI Reprocessing Complete",
        description: "Memory has been updated with new AI insights",
      });
    } catch (error) {
      console.error("Reprocessing error:", error);
      toast({
        title: "Reprocessing Failed",
        description: "Could not reprocess with AI",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!editedMemory.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please provide a title for the memory",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("memories")
        .update({
          title: editedMemory.title,
          summary: editedMemory.summary,
          transcript: editedMemory.transcript,
          action_items: editedMemory.action_items,
          tags: editedMemory.tags,
          priority: editedMemory.priority,
          category: editedMemory.category,
          sentiment: editedMemory.sentiment,
          due_date: editedMemory.due_date || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", memory.id);

      if (error) throw error;

      toast({
        title: "Memory Updated",
        description: "Your changes have been saved successfully",
      });

      if (onSave) {
        onSave({ ...memory, ...editedMemory });
      }
      onClose();
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Save Failed",
        description: "Could not save changes",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: "border-red-500 bg-red-50",
      high: "border-orange-500 bg-orange-50",
      medium: "border-yellow-500 bg-yellow-50",
      low: "border-green-500 bg-green-50",
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Edit Memory</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6">
            {/* Title and Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={editedMemory.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter memory title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={
                    editedMemory.due_date
                      ? editedMemory.due_date.split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    handleInputChange("due_date", e.target.value)
                  }
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category, Priority, Sentiment */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category
                </label>
                <select
                  value={editedMemory.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Priority
                </label>
                <select
                  value={editedMemory.priority}
                  onChange={(e) =>
                    handleInputChange("priority", e.target.value)
                  }
                  className={`w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 ${getPriorityColor(
                    editedMemory.priority
                  )}`}
                >
                  {priorities.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Sentiment
                </label>
                <select
                  value={editedMemory.sentiment}
                  onChange={(e) =>
                    handleInputChange("sentiment", e.target.value)
                  }
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sentiments.map((sentiment) => (
                    <option key={sentiment} value={sentiment}>
                      {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Summary */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Summary
              </label>
              <textarea
                value={editedMemory.summary}
                onChange={(e) => handleInputChange("summary", e.target.value)}
                rows={4}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Enter memory summary"
              />
            </div>

            {/* Transcript */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700">
                  Transcript
                </label>
                <button
                  onClick={handleReprocessWithAI}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-3 py-1 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Reprocess with AI
                    </>
                  )}
                </button>
              </div>
              <textarea
                value={editedMemory.transcript}
                onChange={(e) =>
                  handleInputChange("transcript", e.target.value)
                }
                rows={6}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Enter transcript content"
              />
            </div>

            {/* Action Items */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Action Items
              </label>
              <div className="space-y-2 mb-3">
                {editedMemory.action_items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg"
                  >
                    <CheckSquare className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span className="flex-1 text-slate-700">{item}</span>
                    <button
                      onClick={() => handleRemoveActionItem(index)}
                      className="p-1 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newActionItem}
                  onChange={(e) => setNewActionItem(e.target.value)}
                  placeholder="Add new action item"
                  className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === "Enter" && handleAddActionItem()}
                />
                <button
                  onClick={handleAddActionItem}
                  className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {editedMemory.tags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full"
                  >
                    <Tag className="h-3 w-3" />
                    <span className="text-sm">#{tag}</span>
                    <button
                      onClick={() => handleRemoveTag(index)}
                      className="ml-1 text-indigo-500 hover:text-indigo-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add new tag"
                  className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                />
                <button
                  onClick={handleAddTag}
                  className="px-4 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemoryEditor;
