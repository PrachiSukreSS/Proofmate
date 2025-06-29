import axios from "axios";

const API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const BASE_URL = "https://api.elevenlabs.io/v1";

const headers = {
  "Content-Type": "application/json",
  "xi-api-key": API_KEY,
};

export const transcribeAndSpeak = async (audioFile, voiceId, settings = {}) => {
  try {
    console.log("🎧 Uploading audio to ElevenLabs for transcription...");

    // 1️⃣ Upload audio for transcription
    const formData = new FormData();
    formData.append("audio", audioFile);

    const transcriptResponse = await axios.post(
      `${BASE_URL}/audio/transcriptions`,
      formData,
      {
        headers: {
          "xi-api-key": API_KEY,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const text = transcriptResponse.data.text;
    console.log("📝 Transcription:", text);

    // 2️⃣ Now synthesize the same text back into audio
    const ttsResponse = await axios.post(
      `${BASE_URL}/text-to-speech/${voiceId}`,
      {
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: settings.stability || 0.75,
          similarity_boost: settings.similarity || 0.75,
        },
      },
      {
        headers: {
          "xi-api-key": API_KEY,
          "Content-Type": "application/json",
        },
        responseType: "blob",
      }
    );

    const audioURL = URL.createObjectURL(ttsResponse.data);
    const audio = new Audio(audioURL);
    audio.play(); // 🔊 Auto-play synthesized voice

    return {
      success: true,
      transcript: text,
      spokenAudio: audioURL,
    };

  } catch (error) {
    console.error("❌ Error in ElevenLabs combined function:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const processWithElevenLabs = async (audioFile) => {
  try {
    console.log("🎧 Processing audio with ElevenLabs...");

    const formData = new FormData();
    formData.append("audio", audioFile);

    // Simulate processing since ElevenLabs doesn't have a direct analysis endpoint
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock analysis results based on ElevenLabs capabilities
    const analysisResults = {
      voiceAuthentication: {
        isAuthentic: Math.random() > 0.15,
        confidence: 0.8 + Math.random() * 0.19,
        voiceprint: generateVoiceprint(),
        spoofingIndicators: generateSpoofingIndicators()
      },
      emotionDetection: {
        primaryEmotion: getPrimaryEmotion(),
        emotionScores: generateEmotionScores(),
        arousal: Math.random(),
        valence: Math.random() * 2 - 1,
        dominance: Math.random()
      },
      speechAnalysis: {
        transcript: "Sample transcript from audio analysis",
        confidence: 0.85 + Math.random() * 0.14,
        wordsPerMinute: Math.floor(Math.random() * 100) + 120,
        pauseAnalysis: generatePauseAnalysis(),
        stressPatterns: generateStressPatterns()
      },
      voiceCharacteristics: {
        gender: Math.random() > 0.5 ? 'male' : 'female',
        ageEstimate: Math.floor(Math.random() * 50) + 20,
        accent: detectAccent(),
        pitch: {
          fundamental: Math.floor(Math.random() * 200) + 100,
          range: Math.floor(Math.random() * 100) + 50,
          variation: Math.random()
        },
        timbre: generateTimbreAnalysis()
      },
      audioQuality: {
        signalToNoise: 20 + Math.random() * 20,
        clarity: 0.7 + Math.random() * 0.3,
        distortion: Math.random() * 0.1,
        backgroundNoise: Math.random() * 0.3,
        compression: detectCompression()
      },
      languageAnalysis: {
        primaryLanguage: 'en-US',
        confidence: 0.9 + Math.random() * 0.09,
        dialects: generateDialectAnalysis(),
        fluency: 0.8 + Math.random() * 0.19,
        pronunciation: generatePronunciationAnalysis()
      }
    };

    return {
      success: true,
      analysisId: `ELEVENLABS_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      processingTime: Math.floor(Math.random() * 3000) + 1500,
      ...analysisResults
    };

  } catch (error) {
    console.error("❌ Error processing audio with ElevenLabs:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const synthesizeVoice = async (text, voiceId, settings = {}) => {
  try {
    console.log("🗣️ Synthesizing voice with ElevenLabs...");

    const response = await axios.post(
      `${BASE_URL}/text-to-speech/${voiceId}`,
      {
        text,
        model_id: settings.model_id || "eleven_monolingual_v1",
        voice_settings: {
          stability: settings.stability || 0.75,
          similarity_boost: settings.similarity || 0.75,
          style: settings.style || 0.0,
          use_speaker_boost: settings.use_speaker_boost || true,
        },
      },
      {
        headers: {
          "xi-api-key": API_KEY,
          "Content-Type": "application/json",
        },
        responseType: "blob",
      }
    );

    const audioUrl = URL.createObjectURL(response.data);

    return {
      success: true,
      audioUrl: audioUrl,
      audioId: `audio_${Date.now()}`,
      duration: null,
      metadata: {
        voiceId,
        text,
        settings,
        generatedAt: new Date().toISOString(),
      },
    };

  } catch (error) {
    console.error("❌ Error synthesizing voice with ElevenLabs:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const cloneVoice = async (audioSamples, voiceName) => {
  try {
    console.log("🎭 Cloning voice with ElevenLabs...");

    const formData = new FormData();
    formData.append("name", voiceName);
    
    if (Array.isArray(audioSamples)) {
      audioSamples.forEach((sample, index) => {
        formData.append(`files`, sample, `sample_${index}.wav`);
      });
    } else {
      formData.append("files", audioSamples, "sample.wav");
    }

    const response = await axios.post(
      `${BASE_URL}/voices/add`,
      formData,
      {
        headers: {
          "xi-api-key": API_KEY,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return {
      success: true,
      voiceId: response.data.voice_id,
      voiceName: response.data.name,
      quality: response.data.quality || "unknown",
      metadata: {
        createdAt: new Date().toISOString(),
        samplesCount: Array.isArray(audioSamples) ? audioSamples.length : 1,
      },
    };

  } catch (error) {
    console.error("❌ Error cloning voice with ElevenLabs:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Helper functions for mock analysis
const generateVoiceprint = () => {
  const features = [];
  for (let i = 0; i < 128; i++) {
    features.push(Math.random() * 2 - 1);
  }
  return {
    features,
    hash: generateVoiceprintHash(features),
    similarity_threshold: 0.85
  };
};

const generateVoiceprintHash = (features) => {
  const sum = features.reduce((acc, val) => acc + val, 0);
  return Math.abs(Math.floor(sum * 1000000)).toString(16);
};

const generateSpoofingIndicators = () => {
  return {
    artificialMarkers: Math.random() < 0.1,
    compressionArtifacts: Math.random() < 0.2,
    frequencyAnomalies: Math.random() < 0.15,
    temporalInconsistencies: Math.random() < 0.1,
    spectralAnalysis: {
      naturalness: 0.8 + Math.random() * 0.19,
      harmonicStructure: 0.85 + Math.random() * 0.14,
      noiseFloor: Math.random() * 0.1
    }
  };
};

const getPrimaryEmotion = () => {
  const emotions = ['neutral', 'happy', 'sad', 'angry', 'fearful', 'surprised', 'disgusted'];
  return emotions[Math.floor(Math.random() * emotions.length)];
};

const generateEmotionScores = () => {
  return {
    happiness: Math.random(),
    sadness: Math.random(),
    anger: Math.random(),
    fear: Math.random(),
    surprise: Math.random(),
    disgust: Math.random(),
    neutral: Math.random(),
    excitement: Math.random(),
    calmness: Math.random()
  };
};

const generatePauseAnalysis = () => {
  return {
    totalPauses: Math.floor(Math.random() * 10) + 5,
    averagePauseLength: Math.random() * 2 + 0.5,
    pauseVariability: Math.random(),
    filledPauses: Math.floor(Math.random() * 5),
    silentPauses: Math.floor(Math.random() * 8) + 2
  };
};

const generateStressPatterns = () => {
  return {
    overallStress: Math.random(),
    stressVariability: Math.random(),
    stressedSyllables: Math.floor(Math.random() * 20) + 10,
    rhythmRegularity: 0.6 + Math.random() * 0.4,
    emphasisPatterns: generateEmphasisPatterns()
  };
};

const generateEmphasisPatterns = () => {
  const patterns = [];
  for (let i = 0; i < 5; i++) {
    patterns.push({
      position: Math.random(),
      intensity: Math.random(),
      type: Math.random() > 0.5 ? 'pitch' : 'volume'
    });
  }
  return patterns;
};

const detectAccent = () => {
  const accents = [
    'General American',
    'British RP',
    'Australian',
    'Canadian',
    'Southern American',
    'New York',
    'Boston',
    'Irish',
    'Scottish'
  ];
  return accents[Math.floor(Math.random() * accents.length)];
};

const generateTimbreAnalysis = () => {
  return {
    brightness: Math.random(),
    roughness: Math.random() * 0.3,
    warmth: Math.random(),
    richness: 0.5 + Math.random() * 0.5,
    nasality: Math.random() * 0.4,
    breathiness: Math.random() * 0.3
  };
};

const detectCompression = () => {
  const compressionTypes = ['None', 'MP3', 'AAC', 'OGG', 'FLAC'];
  return {
    type: compressionTypes[Math.floor(Math.random() * compressionTypes.length)],
    bitrate: Math.floor(Math.random() * 256) + 64,
    quality: 0.6 + Math.random() * 0.4
  };
};

const generateDialectAnalysis = () => {
  return {
    regionalVariations: Math.random(),
    socialVariations: Math.random(),
    formalityLevel: Math.random(),
    dialectConfidence: 0.7 + Math.random() * 0.3
  };
};

const generatePronunciationAnalysis = () => {
  return {
    accuracy: 0.8 + Math.random() * 0.19,
    clarity: 0.85 + Math.random() * 0.14,
    articulation: 0.75 + Math.random() * 0.24,
    phoneticVariations: Math.floor(Math.random() * 5),
    mispronunciations: Math.floor(Math.random() * 3)
  };
};