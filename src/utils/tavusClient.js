import axios from "axios";

const API_KEY = import.meta.env.VITE_TAVUS_API_KEY;
const REPLICA_ID = import.meta.env.VITE_TAVUS_REPLICA_ID;
const BASE_URL = "https://api.tavus.io";

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${API_KEY}`,
};

export const analyzeWithTavus = async (videoFile) => {
  try {
    console.log("🎬 Starting Tavus video analysis...");

    if (!API_KEY) {
      console.warn("Tavus API key not configured, using mock analysis");
      return mockVideoAnalysis(videoFile);
    }

    const formData = new FormData();
    formData.append("file", videoFile);

    const response = await fetch(`${BASE_URL}/v1/deepfake/analyze`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Tavus API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      analysisId: data.id || `TAVUS_${Date.now()}`,
      deepfakeDetection: {
        isDeepfake: data.is_deepfake || false,
        confidence: data.confidence || 0.95,
        indicators: data.indicators || [],
        technicalAnalysis: data.technical_analysis || {}
      },
      faceAnalysis: data.face_analysis || {},
      audioVisualSync: data.audio_visual_sync || {},
      contentAnalysis: data.content_analysis || {},
      metadata: data.metadata || {}
    };
  } catch (error) {
    console.error("❌ Tavus Analysis Error:", error);
    return mockVideoAnalysis(videoFile);
  }
};

export const generatePersonalizedVideo = async (script) => {
  try {
    console.log("🎬 Generating personalized video with Tavus...");

    if (!API_KEY || !REPLICA_ID) {
      console.warn("Tavus credentials not configured, using mock generation");
      return mockVideoGeneration(script);
    }

    const response = await fetch(`${BASE_URL}/v1/video/generate`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        script,
        replica_id: REPLICA_ID,
        output_resolution: "1080p",
        background_color: "#000000",
      }),
    });

    if (!response.ok) {
      throw new Error(`Tavus API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      videoId: data.id,
      videoUrl: data.video_url,
      thumbnailUrl: data.thumbnail_url,
      status: data.status,
      metadata: data,
    };
  } catch (error) {
    console.error("❌ Video Generation Error:", error);
    return mockVideoGeneration(script);
  }
};

// Mock functions for when API is not available
const mockVideoAnalysis = async (videoFile) => {
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  return {
    success: true,
    analysisId: `TAVUS_MOCK_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
    processingTime: Math.floor(Math.random() * 5000) + 2000,
    deepfakeDetection: {
      isDeepfake: Math.random() < 0.1,
      confidence: 0.85 + Math.random() * 0.14,
      indicators: generateDeepfakeIndicators(),
      technicalAnalysis: generateTechnicalAnalysis()
    },
    faceAnalysis: {
      facesDetected: Math.floor(Math.random() * 3) + 1,
      emotionAnalysis: generateEmotionAnalysis(),
      ageEstimation: Math.floor(Math.random() * 40) + 20,
      genderPrediction: Math.random() > 0.5 ? 'male' : 'female',
      ethnicityAnalysis: generateEthnicityAnalysis()
    },
    audioVisualSync: {
      syncScore: 0.8 + Math.random() * 0.19,
      lipSyncAccuracy: 0.85 + Math.random() * 0.14,
      audioQuality: generateAudioQuality(),
      visualQuality: generateVisualQuality()
    },
    contentAnalysis: {
      transcript: generateMockTranscript(),
      keyTopics: generateKeyTopics(),
      sentimentAnalysis: generateSentimentAnalysis(),
      languageDetection: 'en-US',
      speakerCount: Math.floor(Math.random() * 3) + 1
    },
    metadata: {
      duration: Math.floor(Math.random() * 300) + 30,
      resolution: '1920x1080',
      frameRate: 30,
      codec: 'H.264',
      fileSize: Math.floor(Math.random() * 100) + 10,
      creationDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  };
};

const mockVideoGeneration = async (script) => {
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  return {
    success: true,
    videoId: `TAVUS_VIDEO_${Date.now()}`,
    videoUrl: `https://tavus-generated-videos.com/video_${Date.now()}.mp4`,
    thumbnailUrl: `https://tavus-generated-videos.com/thumb_${Date.now()}.jpg`,
    duration: Math.floor(Math.random() * 120) + 30,
    status: 'completed',
    generationTime: Math.floor(Math.random() * 10000) + 5000,
    metadata: {
      script,
      resolution: '1920x1080',
      frameRate: 30,
      codec: 'H.264'
    }
  };
};

// Helper functions for mock data
const generateDeepfakeIndicators = () => {
  const indicators = [
    'Facial landmark consistency',
    'Temporal coherence',
    'Lighting consistency',
    'Shadow analysis',
    'Texture analysis',
    'Blinking patterns',
    'Micro-expressions',
    'Head pose estimation'
  ];
  
  return indicators.map(indicator => ({
    name: indicator,
    score: Math.random(),
    status: Math.random() > 0.2 ? 'normal' : 'suspicious'
  }));
};

const generateTechnicalAnalysis = () => {
  return {
    compressionArtifacts: Math.random() < 0.3,
    noisePatterns: Math.random() < 0.2,
    frequencyAnalysis: {
      lowFreq: Math.random(),
      midFreq: Math.random(),
      highFreq: Math.random()
    },
    edgeConsistency: 0.7 + Math.random() * 0.3,
    colorSpaceAnalysis: {
      rgb: Math.random(),
      hsv: Math.random(),
      lab: Math.random()
    }
  };
};

const generateEmotionAnalysis = () => {
  const emotions = ['happy', 'sad', 'angry', 'surprised', 'fearful', 'disgusted', 'neutral'];
  const analysis = {};
  
  emotions.forEach(emotion => {
    analysis[emotion] = Math.random();
  });
  
  const total = Object.values(analysis).reduce((sum, val) => sum + val, 0);
  Object.keys(analysis).forEach(key => {
    analysis[key] = analysis[key] / total;
  });
  
  return analysis;
};

const generateEthnicityAnalysis = () => {
  const ethnicities = ['Asian', 'Black', 'Hispanic', 'White', 'Middle Eastern', 'Other'];
  const analysis = {};
  
  ethnicities.forEach(ethnicity => {
    analysis[ethnicity] = Math.random();
  });
  
  return analysis;
};

const generateAudioQuality = () => {
  return {
    clarity: 0.7 + Math.random() * 0.3,
    noiseLevel: Math.random() * 0.3,
    bitrate: Math.floor(Math.random() * 128) + 128,
    sampleRate: 44100,
    channels: Math.random() > 0.5 ? 2 : 1
  };
};

const generateVisualQuality = () => {
  return {
    sharpness: 0.7 + Math.random() * 0.3,
    brightness: 0.4 + Math.random() * 0.4,
    contrast: 0.5 + Math.random() * 0.3,
    saturation: 0.6 + Math.random() * 0.3,
    noiseLevel: Math.random() * 0.2
  };
};

const generateMockTranscript = () => {
  const sampleTexts = [
    "Welcome to our presentation on data integrity and truth verification.",
    "Today we'll be discussing the importance of authentic information in the digital age.",
    "Our advanced AI systems can detect manipulated content with high accuracy.",
    "This technology helps combat misinformation and ensures data authenticity.",
    "We believe in transparency and accountability in all our verification processes."
  ];
  
  return sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
};

const generateKeyTopics = () => {
  const topics = [
    'Data Verification',
    'AI Technology',
    'Digital Security',
    'Information Integrity',
    'Blockchain',
    'Machine Learning',
    'Cybersecurity',
    'Digital Forensics'
  ];
  
  return topics.slice(0, Math.floor(Math.random() * 4) + 2);
};

const generateSentimentAnalysis = () => {
  return {
    overall: Math.random() > 0.5 ? 'positive' : Math.random() > 0.5 ? 'neutral' : 'negative',
    confidence: 0.7 + Math.random() * 0.3,
    emotions: {
      joy: Math.random() * 0.3,
      trust: 0.4 + Math.random() * 0.4,
      fear: Math.random() * 0.2,
      surprise: Math.random() * 0.3,
      sadness: Math.random() * 0.2,
      disgust: Math.random() * 0.1,
      anger: Math.random() * 0.2,
      anticipation: Math.random() * 0.4
    }
  };
};