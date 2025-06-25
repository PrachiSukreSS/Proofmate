/**
 * AI Processing Utility for Memory Analysis
 * Handles AI summarization, emotion detection, and content generation
 */

import { supabase } from './supabaseClient';

/**
 * Process transcript with AI to extract insights
 */
export const processTranscriptWithAI = async (transcript) => {
  try {
    // For now, we'll use a mock AI processor
    // In production, this would call OpenAI API through Supabase Edge Functions
    
    const mockAIResponse = await mockAIAnalysis(transcript);
    
    return {
      summary: mockAIResponse.summary,
      emotion: mockAIResponse.emotion,
      keywords: mockAIResponse.keywords,
      title: mockAIResponse.title,
      poem: mockAIResponse.poem,
      confidence: mockAIResponse.confidence
    };
  } catch (error) {
    console.error('Error processing transcript:', error);
    throw error;
  }
};

/**
 * Mock AI analysis (replace with real AI API calls)
 */
const mockAIAnalysis = async (transcript) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const words = transcript.toLowerCase().split(' ');
  const wordCount = words.length;
  
  // Simple emotion detection based on keywords
  const emotionKeywords = {
    happy: ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'love', 'fantastic'],
    sad: ['sad', 'depressed', 'down', 'upset', 'crying', 'tears', 'lonely', 'hurt'],
    anxious: ['worried', 'nervous', 'anxious', 'stress', 'panic', 'fear', 'scared'],
    calm: ['peaceful', 'calm', 'relaxed', 'serene', 'quiet', 'tranquil', 'meditation'],
    excited: ['excited', 'thrilled', 'pumped', 'energetic', 'enthusiastic'],
    thoughtful: ['thinking', 'pondering', 'reflecting', 'considering', 'wondering']
  };
  
  let detectedEmotion = 'neutral';
  let maxMatches = 0;
  
  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    const matches = keywords.filter(keyword => 
      words.some(word => word.includes(keyword))
    ).length;
    
    if (matches > maxMatches) {
      maxMatches = matches;
      detectedEmotion = emotion;
    }
  }
  
  // Extract keywords (simple approach - most frequent meaningful words)
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'was', 'are', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their'];
  
  const meaningfulWords = words
    .filter(word => word.length > 3 && !stopWords.includes(word))
    .reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});
  
  const keywords = Object.entries(meaningfulWords)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
  
  // Generate title
  const title = generateTitle(transcript, detectedEmotion);
  
  // Generate summary
  const summary = generateSummary(transcript, wordCount);
  
  // Generate poem
  const poem = generatePoem(transcript, detectedEmotion, keywords);
  
  return {
    summary,
    emotion: detectedEmotion,
    keywords,
    title,
    poem,
    confidence: Math.min(0.7 + (maxMatches * 0.1), 0.95)
  };
};

const generateTitle = (transcript, emotion) => {
  const titleTemplates = {
    happy: ['Joyful Moment', 'Happy Thoughts', 'Bright Memory', 'Cheerful Reflection'],
    sad: ['Melancholy Moment', 'Reflective Thoughts', 'Quiet Contemplation', 'Somber Memory'],
    anxious: ['Worried Thoughts', 'Anxious Moment', 'Restless Mind', 'Concerned Reflection'],
    calm: ['Peaceful Moment', 'Serene Thoughts', 'Tranquil Memory', 'Quiet Reflection'],
    excited: ['Thrilling Moment', 'Energetic Thoughts', 'Dynamic Memory', 'Vibrant Reflection'],
    thoughtful: ['Deep Thoughts', 'Contemplative Moment', 'Reflective Memory', 'Mindful Observation'],
    neutral: ['Personal Reflection', 'Memory Capture', 'Thought Recording', 'Voice Note']
  };
  
  const templates = titleTemplates[emotion] || titleTemplates.neutral;
  return templates[Math.floor(Math.random() * templates.length)];
};

const generateSummary = (transcript, wordCount) => {
  if (wordCount < 20) {
    return `A brief ${wordCount}-word reflection capturing a personal moment and thoughts.`;
  } else if (wordCount < 50) {
    return `A thoughtful ${wordCount}-word recording sharing personal insights and experiences.`;
  } else {
    return `A detailed ${wordCount}-word memory capturing important thoughts, feelings, and experiences worth remembering.`;
  }
};

const generatePoem = (transcript, emotion, keywords) => {
  const poemTemplates = {
    happy: [
      'Sunshine fills the air today,\nJoy dances in every way,\nMemories bright and spirits high,\nHappiness that will never die.',
      'Laughter echoes through the heart,\nJoyful moments, a perfect start,\nBrightness shines in every thought,\nHappiness that can\'t be bought.'
    ],
    sad: [
      'Gentle tears like morning dew,\nReflections deep and feelings true,\nIn quiet moments, hearts can mend,\nSorrow\'s journey finds its end.',
      'Melancholy whispers soft,\nMemories held up aloft,\nThrough the sadness, wisdom grows,\nPeace within the heart still flows.'
    ],
    calm: [
      'Stillness settles on the soul,\nPeaceful thoughts make spirits whole,\nQuiet moments, gentle breeze,\nTranquil heart finds perfect ease.',
      'Serenity flows like a stream,\nCalm reflections, peaceful dream,\nIn the silence, truth is found,\nPeace and quiet all around.'
    ],
    neutral: [
      'Thoughts and words flow like a stream,\nCapturing life\'s daily theme,\nMemories stored for days ahead,\nVoices heard and stories said.',
      'Simple moments, simply shared,\nDaily thoughts and feelings bared,\nIn these words, a life unfolds,\nStories that deserve be told.'
    ]
  };
  
  const templates = poemTemplates[emotion] || poemTemplates.neutral;
  return templates[Math.floor(Math.random() * templates.length)];
};

/**
 * Search memories using AI-enhanced search
 */
export const searchMemoriesWithAI = async (query, userId) => {
  try {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('user_id', userId)
      .or(`title.ilike.%${query}%,summary.ilike.%${query}%,transcript.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error searching memories:', error);
    throw error;
  }
};