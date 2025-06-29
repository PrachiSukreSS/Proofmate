/**
 * Enhanced AI Processing Utility
 * Basic AI processing without OpenAI dependency
 */

import { supabase } from "./supabaseClient";

/**
 * Main processing function - basic analysis
 */
export const processTranscriptWithAI = async (
  transcript,
  context = "general"
) => {
  try {
    console.log(
      "Processing transcript with basic AI:",
      transcript.substring(0, 50) + "..."
    );

    // Use basic analysis instead of OpenAI
    const aiResults = mockAnalysis(transcript, context);

    console.log("AI processing complete:", aiResults);
    return aiResults;
  } catch (error) {
    console.error("Error in AI processing:", error);
    throw error;
  }
};

/**
 * Enhanced search with basic text matching
 */
export const searchMemoriesWithAI = async (query, memories) => {
  try {
    // Basic text search
    return memories.filter(memory => {
      const searchText = `${memory.title} ${memory.summary} ${memory.transcript} ${memory.tags?.join(' ')}`.toLowerCase();
      return searchText.includes(query.toLowerCase());
    });
  } catch (error) {
    console.error("Error in search:", error);
    return [];
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

const mockAnalysis = (transcript, context) => {
  const words = transcript.split(' ').filter(word => word.length > 0);
  const wordCount = words.length;
  
  // Generate mock action items based on transcript content
  const actionItems = [];
  if (transcript.toLowerCase().includes('call') || transcript.toLowerCase().includes('phone')) {
    actionItems.push('Make phone call');
  }
  if (transcript.toLowerCase().includes('email') || transcript.toLowerCase().includes('send')) {
    actionItems.push('Send email');
  }
  if (transcript.toLowerCase().includes('meeting') || transcript.toLowerCase().includes('schedule')) {
    actionItems.push('Schedule meeting');
  }
  if (transcript.toLowerCase().includes('buy') || transcript.toLowerCase().includes('purchase')) {
    actionItems.push('Make purchase');
  }
  
  // Generate tags based on content
  const tags = [];
  if (transcript.toLowerCase().includes('work') || transcript.toLowerCase().includes('office')) {
    tags.push('work');
  }
  if (transcript.toLowerCase().includes('home') || transcript.toLowerCase().includes('family')) {
    tags.push('personal');
  }
  if (transcript.toLowerCase().includes('urgent') || transcript.toLowerCase().includes('asap')) {
    tags.push('urgent');
  }
  
  // Determine priority based on keywords
  let priority = 'medium';
  if (transcript.toLowerCase().includes('urgent') || transcript.toLowerCase().includes('asap') || transcript.toLowerCase().includes('immediately')) {
    priority = 'urgent';
  } else if (transcript.toLowerCase().includes('important') || transcript.toLowerCase().includes('priority')) {
    priority = 'high';
  } else if (transcript.toLowerCase().includes('later') || transcript.toLowerCase().includes('sometime')) {
    priority = 'low';
  }
  
  // Determine sentiment
  let sentiment = 'neutral';
  const positiveWords = ['good', 'great', 'excellent', 'happy', 'excited', 'love', 'amazing'];
  const negativeWords = ['bad', 'terrible', 'awful', 'sad', 'angry', 'hate', 'frustrated'];
  
  const lowerTranscript = transcript.toLowerCase();
  const positiveCount = positiveWords.filter(word => lowerTranscript.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerTranscript.includes(word)).length;
  
  if (positiveCount > negativeCount) {
    sentiment = 'positive';
  } else if (negativeCount > positiveCount) {
    sentiment = 'negative';
  }
  
  return {
    title: `${context.charAt(0).toUpperCase() + context.slice(1)} Recording - ${new Date().toLocaleDateString()}`,
    summary: `Analyzed ${wordCount} words from ${context} recording. ${actionItems.length > 0 ? `Identified ${actionItems.length} action items.` : 'No specific action items identified.'}`,
    actionItems,
    tags: tags.length > 0 ? tags : [context],
    priority,
    category: context,
    sentiment,
    dueDate: null,
    confidence: 0.75 + Math.random() * 0.2 // 75-95% confidence
  };
};