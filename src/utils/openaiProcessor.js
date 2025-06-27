/**
 * OpenAI-powered Processing Utility
 * Handles intelligent summarization, task extraction, and tagging
 */

import OpenAI from "openai";

// Initialize OpenAI client lazily
let openai = null;

const getOpenAIClient = () => {
  if (!openai && import.meta.env.VITE_OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true, // Note: In production, use server-side proxy
    });
  }
  return openai;
};

/**
 * Process transcript with OpenAI for actionable insights
 */
export const processTranscriptWithOpenAI = async (
  transcript,
  context = "general"
) => {
  try {
    const client = getOpenAIClient();

    if (!client) {
      console.warn(
        "OpenAI API key not configured, falling back to mock processor"
      );
      return await mockAIAnalysis(transcript, context);
    }

    const prompt = buildContextualPrompt(transcript, context);

    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an intelligent assistant that converts voice notes and text into actionable summaries, tasks, and insights. Focus on practical, useful outputs that help users stay organized and productive. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    const response = completion.choices[0].message.content;
    return parseOpenAIResponse(response, transcript, context);
  } catch (error) {
    console.error("OpenAI processing error:", error);
    // Fallback to mock analysis if OpenAI fails
    return await mockAIAnalysis(transcript, context);
  }
};

/**
 * Build contextual prompts based on note type
 */
const buildContextualPrompt = (transcript, context) => {
  const contextInstructions = {
    meeting:
      "Focus on action items, decisions made, and follow-up tasks. Identify participants and deadlines.",
    shopping:
      "Extract items to buy, quantities, stores, and urgency. Categorize by type (groceries, household, etc.).",
    health:
      "Identify appointments, medications, symptoms, and health goals. Note any urgent medical concerns.",
    learning:
      "Extract key concepts, study goals, and learning objectives. Identify areas for further research.",
    personal: "Focus on personal goals, reminders, and life management tasks.",
    work: "Identify work tasks, project updates, and professional goals.",
    brainstorm:
      "Capture creative ideas, potential solutions, and innovative concepts.",
    interview:
      "Extract key insights, candidate information, and evaluation criteria.",
  };

  const contextInstruction =
    contextInstructions[context] || "Extract general tasks and insights.";

  const basePrompt = `Analyze the following ${context} note and provide a structured response in JSON format:

Text: "${transcript}"

Context-specific instruction: ${contextInstruction}

Please provide a JSON response with these fields:
{
  "title": "A clear, descriptive title (max 60 characters)",
  "summary": "An actionable summary focusing on key points and outcomes",
  "actionItems": ["Array of specific, actionable tasks or next steps"],
  "tags": ["Array of relevant tags for organization (max 5)"],
  "priority": "Priority level (low, medium, high, urgent) based on content urgency",
  "category": "Main category (${context} or most appropriate)",
  "dueDate": "Suggested due date in ISO format if time-sensitive, otherwise null",
  "sentiment": "Overall sentiment (positive, neutral, negative)",
  "keyInsights": ["Array of important insights or decisions (max 3)"],
  "confidence": "Confidence score between 0 and 1 for the analysis quality"
}

Return only valid JSON without any additional text or formatting.`;

  return basePrompt;
};

/**
 * Parse OpenAI response into structured data
 */
const parseOpenAIResponse = (response, originalTranscript, context) => {
  try {
    // Clean the response to ensure it's valid JSON
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleanedResponse);

    return {
      title: parsed.title || generateFallbackTitle(originalTranscript),
      summary: parsed.summary || "AI-generated summary from voice note",
      actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      priority: ["low", "medium", "high", "urgent"].includes(parsed.priority)
        ? parsed.priority
        : "medium",
      category: parsed.category || context || "general",
      dueDate: parsed.dueDate || null,
      sentiment: ["positive", "neutral", "negative"].includes(parsed.sentiment)
        ? parsed.sentiment
        : "neutral",
      keyInsights: Array.isArray(parsed.keyInsights) ? parsed.keyInsights : [],
      confidence:
        typeof parsed.confidence === "number"
          ? Math.min(Math.max(parsed.confidence, 0), 1)
          : 0.8,
    };
  } catch (error) {
    console.error("Error parsing OpenAI response:", error);
    console.log("Raw response:", response);
    return generateFallbackResponse(originalTranscript, context);
  }
};

/**
 * Generate fallback response when OpenAI parsing fails
 */
const generateFallbackResponse = (transcript, context) => {
  return {
    title: generateFallbackTitle(transcript),
    summary: `${
      context.charAt(0).toUpperCase() + context.slice(1)
    } note: ${transcript.substring(0, 100)}${
      transcript.length > 100 ? "..." : ""
    }`,
    actionItems: extractBasicActionItems(transcript),
    tags: extractSimpleTags(transcript, context),
    priority: detectUrgency(transcript) ? "high" : "medium",
    category: context || "general",
    dueDate: null,
    sentiment: "neutral",
    keyInsights: [],
    confidence: 0.6,
  };
};

/**
 * Generate fallback title from transcript
 */
const generateFallbackTitle = (transcript) => {
  const words = transcript.trim().split(" ");
  if (words.length <= 8) {
    return transcript;
  }
  return words.slice(0, 8).join(" ") + "...";
};

/**
 * Extract basic action items from transcript
 */
const extractBasicActionItems = (transcript) => {
  const actionWords = [
    "buy",
    "call",
    "email",
    "meet",
    "schedule",
    "remind",
    "book",
    "order",
    "complete",
    "finish",
    "start",
  ];
  const sentences = transcript
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 0);

  const actionItems = [];
  sentences.forEach((sentence) => {
    const lowerSentence = sentence.toLowerCase();
    if (actionWords.some((word) => lowerSentence.includes(word))) {
      actionItems.push(sentence.trim());
    }
  });

  return actionItems.slice(0, 5); // Limit to 5 action items
};

/**
 * Extract simple tags from transcript
 */
const extractSimpleTags = (transcript, context) => {
  const contextTags = {
    meeting: ["meeting", "discussion", "team"],
    shopping: ["shopping", "groceries", "purchase"],
    health: ["health", "medical", "appointment"],
    learning: ["study", "learning", "education"],
    personal: ["personal", "life", "goals"],
    work: ["work", "project", "business"],
    brainstorm: ["ideas", "creative", "brainstorm"],
    interview: ["interview", "candidate", "hiring"],
  };

  const commonTags = {
    urgent: "urgent",
    important: "important",
    deadline: "deadline",
    "follow up": "follow-up",
    research: "research",
    planning: "planning",
  };

  const words = transcript.toLowerCase().split(" ");
  const tags = [...(contextTags[context] || [])];

  for (const [keyword, tag] of Object.entries(commonTags)) {
    if (words.some((word) => word.includes(keyword))) {
      tags.push(tag);
    }
  }

  return [...new Set(tags)].slice(0, 5);
};

/**
 * Detect urgency in transcript
 */
const detectUrgency = (transcript) => {
  const urgentWords = [
    "urgent",
    "asap",
    "immediately",
    "today",
    "now",
    "emergency",
    "critical",
  ];
  const words = transcript.toLowerCase().split(" ");
  return urgentWords.some((urgent) =>
    words.some((word) => word.includes(urgent))
  );
};

/**
 * Mock AI analysis for fallback
 */
const mockAIAnalysis = async (transcript, context = "general") => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const words = transcript.toLowerCase().split(" ");

  // Detect action words
  const actionWords = [
    "buy",
    "call",
    "email",
    "meet",
    "schedule",
    "remind",
    "book",
    "order",
  ];
  const hasAction = actionWords.some((action) =>
    words.some((word) => word.includes(action))
  );

  // Detect urgency
  const isUrgent = detectUrgency(transcript);

  return {
    title: generateFallbackTitle(transcript),
    summary: hasAction
      ? `Action required: ${transcript}`
      : `Note: ${transcript}`,
    actionItems: hasAction ? extractBasicActionItems(transcript) : [],
    tags: extractSimpleTags(transcript, context),
    priority: isUrgent ? "urgent" : "medium",
    category: context || detectCategory(transcript),
    dueDate: null,
    sentiment: detectSentiment(transcript),
    keyInsights: [],
    confidence: 0.7,
  };
};

/**
 * Detect category from transcript
 */
const detectCategory = (transcript) => {
  const categories = {
    work: [
      "meeting",
      "project",
      "deadline",
      "client",
      "office",
      "team",
      "presentation",
    ],
    shopping: ["buy", "purchase", "store", "grocery", "mall", "order"],
    health: [
      "doctor",
      "appointment",
      "medicine",
      "exercise",
      "hospital",
      "clinic",
    ],
    personal: ["family", "friend", "home", "personal", "birthday", "vacation"],
    learning: ["study", "learn", "course", "book", "research", "education"],
  };

  const words = transcript.toLowerCase().split(" ");

  for (const [category, keywords] of Object.entries(categories)) {
    if (
      keywords.some((keyword) => words.some((word) => word.includes(keyword)))
    ) {
      return category;
    }
  }

  return "general";
};

/**
 * Detect sentiment from transcript
 */
const detectSentiment = (transcript) => {
  const positiveWords = [
    "good",
    "great",
    "excellent",
    "happy",
    "excited",
    "love",
    "amazing",
    "wonderful",
  ];
  const negativeWords = [
    "bad",
    "terrible",
    "awful",
    "hate",
    "angry",
    "frustrated",
    "disappointed",
    "worried",
  ];

  const words = transcript.toLowerCase().split(" ");

  const positiveCount = positiveWords.filter((word) =>
    words.some((w) => w.includes(word))
  ).length;
  const negativeCount = negativeWords.filter((word) =>
    words.some((w) => w.includes(word))
  ).length;

  if (positiveCount > negativeCount) return "positive";
  if (negativeCount > positiveCount) return "negative";
  return "neutral";
};

/**
 * Enhanced search with semantic understanding
 */
export const searchMemoriesWithAI = async (query, memories) => {
  try {
    const client = getOpenAIClient();

    if (!client) {
      return basicSearch(query, memories);
    }

    // Use OpenAI for semantic search
    const searchPrompt = `Given this search query: "${query}"
    
    Find the most relevant memories from the following list based on semantic meaning, not just keyword matching.
    Consider the context, intent, and meaning behind the search query.
    
    Memories: ${JSON.stringify(
      memories.map((m) => ({
        id: m.id,
        title: m.title,
        summary: m.summary,
        tags: m.tags,
        category: m.category,
        actionItems: m.action_items,
      }))
    )}
    
    Return an array of memory IDs in order of relevance (most relevant first).
    Return only the JSON array, no additional text.`;

    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: searchPrompt }],
      temperature: 0.1,
      max_tokens: 300,
    });

    const relevantIds = JSON.parse(completion.choices[0].message.content);
    return memories.filter((m) => relevantIds.includes(m.id));
  } catch (error) {
    console.error("AI search error:", error);
    return basicSearch(query, memories);
  }
};

/**
 * Basic search fallback
 */
const basicSearch = (query, memories) => {
  const lowercaseQuery = query.toLowerCase();
  return memories.filter(
    (memory) =>
      memory.title?.toLowerCase().includes(lowercaseQuery) ||
      memory.summary?.toLowerCase().includes(lowercaseQuery) ||
      memory.transcript?.toLowerCase().includes(lowercaseQuery) ||
      memory.tags?.some((tag) => tag.toLowerCase().includes(lowercaseQuery)) ||
      memory.category?.toLowerCase().includes(lowercaseQuery) ||
      memory.action_items?.some((item) =>
        item.toLowerCase().includes(lowercaseQuery)
      )
  );
};
