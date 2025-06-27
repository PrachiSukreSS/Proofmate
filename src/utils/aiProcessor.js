/**
 * Enhanced AI Processing Utility
 * Integrates OpenAI for intelligent memory analysis
 */

import {
  processTranscriptWithOpenAI,
  searchMemoriesWithAI as openAISearchMemories,
} from "./openaiProcessor";
import { supabase } from "./supabaseClient";

/**
 * Main processing function - now uses OpenAI
 */
export const processTranscriptWithAI = async (
  transcript,
  context = "general"
) => {
  try {
    console.log(
      "Processing transcript with AI:",
      transcript.substring(0, 50) + "..."
    );

    // Use OpenAI for processing
    const aiResults = await processTranscriptWithOpenAI(transcript, context);

    console.log("AI processing complete:", aiResults);
    return aiResults;
  } catch (error) {
    console.error("Error in AI processing:", error);
    throw error;
  }
};

/**
 * Enhanced search with AI
 */
export const searchMemoriesWithAI = async (query, userId) => {
  try {
    // First get all user memories
    const { data: memories, error } = await supabase
      .from("memories")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Use AI for semantic search
    const results = await openAISearchMemories(query, memories || []);
    return results;
  } catch (error) {
    console.error("Error in AI search:", error);
    // Fallback to basic search
    const { data, error: searchError } = await supabase
      .from("memories")
      .select("*")
      .eq("user_id", userId)
      .or(
        `title.ilike.%${query}%,summary.ilike.%${query}%,transcript.ilike.%${query}%`
      )
      .order("created_at", { ascending: false });

    if (searchError) throw searchError;
    return data || [];
  }
};

/**
 * Analyze sentiment trends over time
 */
export const analyzeSentimentTrends = async (userId, timeframe = "30d") => {
  try {
    const { data: memories, error } = await supabase
      .from("memories")
      .select("sentiment, created_at")
      .eq("user_id", userId)
      .gte("created_at", getTimeframeDate(timeframe))
      .order("created_at", { ascending: true });

    if (error) throw error;

    // Group by date and calculate sentiment scores
    const trends = groupSentimentByDate(memories || []);
    return trends;
  } catch (error) {
    console.error("Error analyzing sentiment trends:", error);
    return [];
  }
};

/**
 * Get productivity insights
 */
export const getProductivityInsights = async (userId) => {
  try {
    const { data: memories, error } = await supabase
      .from("memories")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", getTimeframeDate("7d"));

    if (error) throw error;

    const insights = {
      totalMemories: memories.length,
      actionItems: memories.reduce(
        (sum, m) => sum + (m.action_items?.length || 0),
        0
      ),
      categories: getCategoryDistribution(memories),
      priorities: getPriorityDistribution(memories),
      completionRate: calculateCompletionRate(memories),
    };

    return insights;
  } catch (error) {
    console.error("Error getting productivity insights:", error);
    return null;
  }
};

/**
 * Utility functions
 */
const getTimeframeDate = (timeframe) => {
  const now = new Date();
  const days = parseInt(timeframe.replace("d", ""));
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
};

const groupSentimentByDate = (memories) => {
  const groups = {};

  memories.forEach((memory) => {
    const date = new Date(memory.created_at).toDateString();
    if (!groups[date]) {
      groups[date] = { positive: 0, neutral: 0, negative: 0, total: 0 };
    }

    groups[date][memory.sentiment || "neutral"]++;
    groups[date].total++;
  });

  return Object.entries(groups).map(([date, counts]) => ({
    date,
    ...counts,
    positiveRatio: counts.positive / counts.total,
    negativeRatio: counts.negative / counts.total,
  }));
};

const getCategoryDistribution = (memories) => {
  const distribution = {};
  memories.forEach((memory) => {
    const category = memory.category || "general";
    distribution[category] = (distribution[category] || 0) + 1;
  });
  return distribution;
};

const getPriorityDistribution = (memories) => {
  const distribution = {};
  memories.forEach((memory) => {
    const priority = memory.priority || "medium";
    distribution[priority] = (distribution[priority] || 0) + 1;
  });
  return distribution;
};

const calculateCompletionRate = (memories) => {
  const withActionItems = memories.filter((m) => m.action_items?.length > 0);
  const completed = withActionItems.filter(
    (m) => m.completion_status === "completed"
  );
  return withActionItems.length > 0
    ? completed.length / withActionItems.length
    : 0;
};
