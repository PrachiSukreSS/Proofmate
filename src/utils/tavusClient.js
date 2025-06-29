const API_KEY = import.meta.env.VITE_TAVUS_API_KEY;
const REPLICA_ID = import.meta.env.VITE_TAVUS_REPLICA_ID;
const BASE_URL = "https://api.tavus.io";

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${API_KEY}`,
};

export const analyzeWithTavus = async (videoFile) => {
  try {
    const formData = new FormData();
    formData.append("file", videoFile);

    const response = await fetch(`${BASE_URL}/v1/deepfake/analyze`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
      body: formData,
    });

    const data = await response.json();

    return {
      success: true,
      analysisId: data.id,
      deepfakeResult: data.result,
    };
  } catch (error) {
    console.error("Tavus Analysis Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const generatePersonalizedVideo = async (script) => {
  try {
    const response = await fetch(`${BASE_URL}/v1/video/generate`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        script,
        replicaId: REPLICA_ID,
        voiceId: "elevenlabs", // Optional: pass your ElevenLabs ID if supported
        outputResolution: "1080p",
      }),
    });

    const data = await response.json();

    return {
      success: true,
      videoId: data.id,
      videoUrl: data.video_url,
      thumbnail: data.thumbnail_url,
      status: data.status,
      metadata: data,
    };
  } catch (error) {
    console.error("Video Generation Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
