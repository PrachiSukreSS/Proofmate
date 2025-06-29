import axios from "axios";

export const transcribeAndSpeak = async (audioFile, voiceId, settings = {}) => {
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;

  try {
    console.log("🎧 Uploading audio to ElevenLabs for transcription...");

    // 1️⃣ Upload audio for transcription
    const formData = new FormData();
    formData.append("audio", audioFile);

    const transcriptResponse = await axios.post(
      "https://api.elevenlabs.io/v1/audio/transcriptions",
      formData,
      {
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const text = transcriptResponse.data.text;
    console.log("📝 Transcription:", text);

    // 2️⃣ Now synthesize the same text back into audio
    const ttsResponse = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
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
          "xi-api-key": apiKey,
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
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;

  try {
    console.log("🎧 Processing audio with ElevenLabs...");

    const formData = new FormData();
    formData.append("audio", audioFile);

    const response = await axios.post(
      "https://api.elevenlabs.io/v1/audio/analysis",
      formData,
      {
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return {
      success: true,
      voiceAuthentication: response.data.voice_authentication || {},
      emotionDetection: response.data.emotion_detection || {},
      speechAnalysis: response.data.speech_analysis || {},
      voiceCharacteristics: response.data.voice_characteristics || {},
      audioQuality: response.data.audio_quality || {},
      languageAnalysis: response.data.language_analysis || {},
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
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;

  try {
    console.log("🗣️ Synthesizing voice with ElevenLabs...");

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
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
          "xi-api-key": apiKey,
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
      duration: null, // Would need additional API call to get duration
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
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;

  try {
    console.log("🎭 Cloning voice with ElevenLabs...");

    const formData = new FormData();
    formData.append("name", voiceName);
    
    // Add audio samples to form data
    if (Array.isArray(audioSamples)) {
      audioSamples.forEach((sample, index) => {
        formData.append(`files`, sample, `sample_${index}.wav`);
      });
    } else {
      formData.append("files", audioSamples, "sample.wav");
    }

    const response = await axios.post(
      "https://api.elevenlabs.io/v1/voices/add",
      formData,
      {
        headers: {
          "xi-api-key": apiKey,
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