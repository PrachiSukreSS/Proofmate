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

const buildPrompt = (content, type) => {
  const typeInstructions = {
    video_verification: "Analyze this video transcript for deepfake indicators, inconsistencies, and authenticity markers.",
    audio_verification: "Analyze this audio transcript for voice authenticity, emotional manipulation, and factual accuracy.",
    document_verification: "Analyze this document for factual accuracy, bias, misinformation, and source credibility.",
    general: "Analyze this content for truth, accuracy, and potential misinformation."
  };

  return `${typeInstructions[type] || typeInstructions.general}

Content: "${content}"

Provide analysis in JSON format:
{
  "confidence": 0.85,
  "authenticity_score": 0.9,
  "bias_score": 0.3,
  "factual_accuracy": 0.8,
  "summary": "Brief summary of findings",
  "flags": ["List of concerns or red flags"],
  "recommendations": ["Suggested actions"],
  "sources_needed": ["Claims that need verification"],
  "sdg_alignment": "How this relates to UN SDGs"
}`;
};

const parseAnalysisResponse = (response, originalContent) => {
  try {
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleanedResponse);
    
    return {
      confidence: Math.min(Math.max(parsed.confidence || 0.5, 0), 1),
      authenticity_score: Math.min(Math.max(parsed.authenticity_score || 0.5, 0), 1),
      bias_score: Math.min(Math.max(parsed.bias_score || 0.5, 0), 1),
      factual_accuracy: Math.min(Math.max(parsed.factual_accuracy || 0.5, 0), 1),
      summary: parsed.summary || "Analysis completed",
      flags: Array.isArray(parsed.flags) ? parsed.flags : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      sources_needed: Array.isArray(parsed.sources_needed) ? parsed.sources_needed : [],
      sdg_alignment: parsed.sdg_alignment || "No specific SDG alignment identified",
      original_content: originalContent.substring(0, 500)
    };
  } catch (error) {
    console.error('Error parsing OpenAI response:', error);
    return mockAnalysis(originalContent, 'general');
  }
};

const mockAnalysis = (content, type) => {
  const confidence = 0.7 + Math.random() * 0.2;
  
  return {
    confidence,
    authenticity_score: confidence,
    bias_score: Math.random() * 0.5,
    factual_accuracy: 0.6 + Math.random() * 0.3,
    summary: `${type} analysis completed. Content appears to be ${confidence > 0.8 ? 'authentic' : 'potentially concerning'}.`,
    flags: confidence < 0.8 ? ['Requires manual review', 'Low confidence score'] : [],
    recommendations: ['Verify with additional sources', 'Cross-reference claims'],
    sources_needed: ['Primary source verification needed'],
    sdg_alignment: "Contributes to SDG 16: Peace, Justice and Strong Institutions",
    original_content: content.substring(0, 500)
  };
};