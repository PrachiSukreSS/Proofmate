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
