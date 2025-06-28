import OpenAI from "openai";

let openai = null;

const getOpenAIClient = () => {
  if (!openai && import.meta.env.VITE_OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    });
  }
  return openai;
};

export const processTranscriptWithOpenAI = async (transcript, context = 'general') => {
  try {
    const client = getOpenAIClient();
    
    if (!client) {
      console.warn('OpenAI API key not configured, using mock analysis');
      return mockAnalysis(transcript, context);
    }

    const prompt = buildPrompt(transcript, context);

    const completion = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an advanced AI assistant that analyzes voice recordings and extracts actionable insights. Provide structured analysis with titles, summaries, action items, tags, priorities, and sentiment analysis."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 1000,
    });

    const response = completion.choices[0].message.content;
    return parseAnalysisResponse(response, transcript);

  } catch (error) {
    console.error('OpenAI processing error:', error);
    return mockAnalysis(transcript, context);
  }
};

const buildPrompt = (transcript, context) => {
  const contextInstructions = {
    general: "Analyze this general voice recording for key insights and actionable items.",
    meeting: "Analyze this meeting recording for decisions, action items, and follow-ups.",
    personal: "Analyze this personal note for tasks, reminders, and important information.",
    shopping: "Analyze this shopping-related recording for items to buy and preferences.",
    health: "Analyze this health-related recording for symptoms, appointments, and care instructions.",
    learning: "Analyze this learning content for key concepts, study items, and knowledge points.",
    brainstorm: "Analyze this brainstorming session for ideas, concepts, and next steps.",
    interview: "Analyze this interview for key points, qualifications, and follow-up actions."
  };

  return `${contextInstructions[context] || contextInstructions.general}

Transcript: "${transcript}"

Provide analysis in JSON format:
{
  "title": "Descriptive title for this recording",
  "summary": "Brief summary of the main content",
  "actionItems": ["List of specific action items"],
  "tags": ["Relevant tags"],
  "priority": "urgent|high|medium|low",
  "category": "work|personal|shopping|health|learning|meeting|general",
  "sentiment": "positive|neutral|negative",
  "dueDate": "YYYY-MM-DD or null",
  "confidence": 0.85
}`;
};

const parseAnalysisResponse = (response, originalTranscript) => {
  try {
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleanedResponse);
    
    return {
      title: parsed.title || "Voice Recording",
      summary: parsed.summary || "Analysis completed",
      actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      priority: parsed.priority || "medium",
      category: parsed.category || "general",
      sentiment: parsed.sentiment || "neutral",
      dueDate: parsed.dueDate || null,
      confidence: Math.min(Math.max(parsed.confidence || 0.8, 0), 1)
    };
  } catch (error) {
    console.error('Error parsing OpenAI response:', error);
    return mockAnalysis(originalTranscript, 'general');
  }
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

export const searchMemoriesWithAI = async (query, memories) => {
  try {
    const client = getOpenAIClient();
    
    if (!client) {
      // Fallback to basic text search
      return memories.filter(memory => 
        memory.title?.toLowerCase().includes(query.toLowerCase()) ||
        memory.summary?.toLowerCase().includes(query.toLowerCase()) ||
        memory.transcript?.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Use AI for semantic search
    const searchPrompt = `
Given this search query: "${query}"

Find the most relevant memories from this list based on semantic similarity and context:

${memories.map((memory, index) => `
${index + 1}. Title: ${memory.title}
   Summary: ${memory.summary}
   Tags: ${memory.tags?.join(', ') || 'none'}
`).join('\n')}

Return only the numbers of the most relevant memories (up to 10), separated by commas.
If no memories are relevant, return "none".
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a semantic search assistant. Analyze the query and return the most relevant memory indices."
        },
        {
          role: "user",
          content: searchPrompt
        }
      ],
      temperature: 0.1,
      max_tokens: 100,
    });

    const response = completion.choices[0].message.content.trim();
    
    if (response.toLowerCase() === 'none') {
      return [];
    }

    const indices = response.split(',').map(num => parseInt(num.trim()) - 1).filter(index => !isNaN(index) && index >= 0 && index < memories.length);
    
    return indices.map(index => memories[index]);

  } catch (error) {
    console.error('AI search error:', error);
    // Fallback to basic search
    return memories.filter(memory => 
      memory.title?.toLowerCase().includes(query.toLowerCase()) ||
      memory.summary?.toLowerCase().includes(query.toLowerCase()) ||
      memory.transcript?.toLowerCase().includes(query.toLowerCase())
    );
  }
};

export const processWithOpenAI = async (content, type = 'general') => {
  try {
    const client = getOpenAIClient();
    
    if (!client) {
      console.warn('OpenAI API key not configured, using mock analysis');
      return mockAnalysis(content, type);
    }

    const prompt = buildPrompt(content, type);

    const completion = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an advanced truth verification AI that analyzes content for authenticity, bias, misinformation, and factual accuracy. Provide detailed analysis with confidence scores."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 1000,
    });

    const response = completion.choices[0].message.content;
    return parseAnalysisResponse(response, content);

  } catch (error) {
    console.error('OpenAI processing error:', error);
    return mockAnalysis(content, type);
  }
};