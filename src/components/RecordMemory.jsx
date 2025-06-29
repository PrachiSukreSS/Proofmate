import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  Shield,
  Hash,
  Zap,
  ArrowLeft,
  Play,
  Square,
  Brain,
  Target,
  CheckSquare,
  Calendar,
  Volume2,
  VolumeX,
  Settings,
  Waves,
  Activity,
  FileAudio,
  Upload,
  Download,
  Pause,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { processTranscriptWithAI } from "../utils/aiProcessor";
import { storeVerifiedMemory } from "../utils/blockchainVerification";
import {
  exportToGoogleCalendar,
  exportToTodoist,
} from "../utils/integrationManager";
import { useToast } from "../hooks/use-toast";
// RevenueCat
import {
  getSubscriptionStatus,
  purchaseSubscription,
  restorePurchases,
} from "../utils/revenueCatClient";

// ElevenLabs
import {
  processWithElevenLabs,
  synthesizeVoice,
} from "../utils/elevenlabsClient";

// Algorand
import { verifyWithAlgorand } from "../utils/algorandClient";

// Tavus
import {
  analyzeWithTavus,
  generatePersonalizedVideo,
} from "../utils/tavusClient";


const RecordMemory = ({ onBack }) => {
  const [transcript, setTranscript] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [summaryData, setSummaryData] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState(null);
  const [recordingStartTime, setRecordingStartTime] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [context, setContext] = useState("general");
  const [audioLevel, setAudioLevel] = useState(0);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [recordingQuality, setRecordingQuality] = useState("high");
  const [noiseReduction, setNoiseReduction] = useState(true);
  const [autoSave, setAutoSave] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  // Timer for recording duration
  useEffect(() => {
    let interval;
    if (isListening && recordingStartTime) {
      interval = setInterval(() => {
        setRecordingDuration(
          Math.floor((Date.now() - recordingStartTime) / 1000)
        );
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isListening, recordingStartTime]);

  // Update word count
  useEffect(() => {
    const words = transcript
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    setWordCount(words.length);
  }, [transcript]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [recognitionInstance]);

  const checkUserAccess = async () => {
  const status = await getSubscriptionStatus();
  console.log("User Plan:", status.tier);
  return status;
};
const analyzeAudio = async (audioBlob) => {
  const analysis = await processWithElevenLabs(audioBlob);
  if (analysis.success) {
    console.log("Voice Analysis Result:", analysis);
  } else {
    alert("Voice analysis failed!");
  }
};
const synthesize = async () => {
  const result = await synthesizeVoice("Hello Prachi, you're doing amazing!", "SAz9YHcvj6GTRTYXdXww");
  if (result.success) {
    window.open(result.audioUrl, "_blank");
  }
};const analyzeVideo = async (videoFile) => {
  const result = await analyzeWithTavus(videoFile);
  if (result.success) {
    console.log("Video Deepfake Result:", result.deepfakeResult);
  } else {
    alert("Video analysis failed!");
  }
};
const generateVideo = async () => {
  const response = await generatePersonalizedVideo("Hi Prachi! You're glowing like the dawn 🌅");
  if (response.success) {
    window.open(response.videoUrl, "_blank");
  }
};
const verifyOnBlockchain = async (data) => {
  const result = await verifyWithAlgorand(data);
  if (result.success) {
    console.log("Blockchain Verification:", result);
  } else {
    alert("Verification on Algorand failed!");
  }
};
const handleSaveMemory = async (audioFile, videoFile, memoryData) => {
  const access = await checkUserAccess();
  if (!access.isActive) {
    alert("Your subscription is inactive. Please upgrade.");
    return;
  }

  await analyzeAudio(audioFile);
  await analyzeVideo(videoFile);
  await verifyOnBlockchain(memoryData);

  // Optional:
  // await synthesize();
  // await generateVideo();
};



  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const setupAudioVisualization = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: noiseReduction,
          sampleRate: recordingQuality === "high" ? 48000 : 16000,
        },
      });

      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);

      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // Setup MediaRecorder for audio capture
      mediaRecorderRef.current = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        setAudioBlob(audioBlob);
      };

      mediaRecorderRef.current.start();

      const updateAudioLevel = () => {
        if (analyserRef.current && isListening) {
          const dataArray = new Uint8Array(
            analyserRef.current.frequencyBinCount
          );
          analyserRef.current.getByteFrequencyData(dataArray);

          const average =
            dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
          setAudioLevel(average / 255);

          animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };

      updateAudioLevel();
      return stream;
    } catch (error) {
      console.error("Error setting up audio:", error);
      toast({
        title: "Audio Setup Error",
        description: "Could not access microphone for visualization",
        variant: "destructive",
      });
      return null;
    }
  };

  const startListening = async () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast({
        title: "Browser Not Supported",
        description:
          "Your browser does not support Speech Recognition. Please use Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;

    setIsListening(true);
    setRecordingStartTime(Date.now());
    setRecordingDuration(0);
    setTranscript("");
    setLiveTranscript("");
    setRecognitionInstance(recognition);

    // Setup audio visualization
    await setupAudioVisualization();

    recognition.start();

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";
      let totalConfidence = 0;
      let resultCount = 0;

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + " ";
          totalConfidence += result[0].confidence || 0.8;
          resultCount++;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      if (resultCount > 0) {
        setConfidence(totalConfidence / resultCount);
      }

      setTranscript((prev) => prev + finalTranscript);
      setLiveTranscript(interimTranscript);

      // Auto-save functionality
      if (autoSave && finalTranscript.trim()) {
        // Implement auto-save logic here
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      let errorMessage = "There was an error with voice recognition";

      switch (event.error) {
        case "no-speech":
          errorMessage = "No speech detected. Please try speaking louder.";
          break;
        case "audio-capture":
          errorMessage = "Microphone access denied or not available.";
          break;
        case "not-allowed":
          errorMessage =
            "Microphone permission denied. Please allow microphone access.";
          break;
        case "network":
          errorMessage = "Network error occurred during recognition.";
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }

      toast({
        title: "Recording Error",
        description: errorMessage,
        variant: "destructive",
      });
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.stop();
      }
      if (transcript.trim()) {
        toast({
          title: "Recording Complete",
          description: `Captured ${wordCount} words with ${Math.round(
            confidence * 100
          )}% confidence`,
        });
      }
    };
  };

  const stopListening = () => {
    if (recognitionInstance) {
      recognitionInstance.stop();
      setIsListening(false);
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const processMemory = async () => {
    if (!transcript.trim()) {
      toast({
        title: "No Content",
        description: "Please record some content before processing",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const aiResults = await processTranscriptWithAI(transcript, context);

      // Enhanced AI results with additional metadata
      const enhancedResults = {
        ...aiResults,
        word_count: wordCount,
        confidence: confidence,
        audio_duration: recordingDuration,
        recording_quality: recordingQuality,
        noise_reduction: noiseReduction,
        context: context,
      };

      setSummaryData(enhancedResults);

      toast({
        title: "Memory Processed Successfully! 🧠",
        description: `Analyzed ${wordCount} words and extracted ${
          aiResults.actionItems?.length || 0
        } action items`,
      });
    } catch (error) {
      console.error("Processing error:", error);
      toast({
        title: "Processing Error",
        description: "Failed to process your memory. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const saveToMemories = async () => {
    if (!summaryData || !transcript) {
      toast({
        title: "No Data",
        description: "No data to save. Please record and process first.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data: userData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !userData?.user?.id) {
        toast({
          title: "Authentication Error",
          description: "Please log in to save memories",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      const memoryData = {
        user_id: userData.user.id,
        transcript: transcript.trim(),
        title: summaryData.title,
        summary: summaryData.summary,
        action_items: summaryData.actionItems || [],
        tags: summaryData.tags || [],
        priority: summaryData.priority || "medium",
        category: summaryData.category || "general",
        sentiment: summaryData.sentiment || "neutral",
        due_date: summaryData.dueDate,
        audio_duration: recordingDuration,
        word_count: wordCount,
        confidence: confidence,
        recording_quality: recordingQuality,
        created_at: new Date().toISOString(),
      };

      const result = await storeVerifiedMemory(memoryData);

      setVerificationStatus({
        verified: result.verified,
        hash: result.hash,
        blockId: result.block.id,
      });

      toast({
        title: "Memory Saved Successfully! 🎉",
        description:
          "Your memory has been saved and verified on the blockchain",
      });

      setTimeout(() => {
        navigate("/timeline");
      }, 2000);
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Save Error",
        description: "Failed to save memory. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  

  const handleQuickExport = async (type) => {
    if (!summaryData?.actionItems?.length) {
      toast({
        title: "No Action Items",
        description: "Process your memory first to extract action items",
        variant: "destructive",
      });
      return;
    }

    try {
      if (type === "calendar") {
        await exportToGoogleCalendar(
          summaryData.actionItems,
          summaryData.title
        );
        toast({
          title: "Exported to Calendar",
          description: "Action items added to your calendar",
        });
      } else if (type === "todoist") {
        await exportToTodoist(
          summaryData.actionItems,
          summaryData.title,
          summaryData.priority
        );
        toast({
          title: "Exported to Todoist",
          description: "Tasks added to Todoist",
        });
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: `Could not export to ${type}`,
        variant: "destructive",
      });
    }
  };

  const downloadAudio = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `recording-${Date.now()}.wav`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const contextOptions = [
    { value: "general", label: "📝 General Note", icon: "📝" },
    { value: "meeting", label: "💼 Meeting/Work", icon: "💼" },
    { value: "personal", label: "👤 Personal Task", icon: "👤" },
    { value: "shopping", label: "🛒 Shopping List", icon: "🛒" },
    { value: "health", label: "🏥 Health/Medical", icon: "🏥" },
    { value: "learning", label: "📚 Learning/Study", icon: "📚" },
    { value: "brainstorm", label: "💡 Brainstorming", icon: "💡" },
    { value: "interview", label: "🎤 Interview", icon: "🎤" },
  ];

  return (
    <div className="py-6 px-4 max-w-5xl mx-auto">
      {onBack && (
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-purple-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>
      )}

      <div className="space-y-6">
        {/* Recording Settings */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-purple-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-600" />
            Recording Settings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Quality
              </label>
              <select
                value={recordingQuality}
                onChange={(e) => setRecordingQuality(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="high">High Quality (48kHz)</option>
                <option value="standard">Standard (16kHz)</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={noiseReduction}
                  onChange={(e) => setNoiseReduction(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Noise Reduction</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoSave}
                  onChange={(e) => setAutoSave(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Auto Save</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAudioMuted(!isAudioMuted)}
                className={`p-2 rounded-lg ${
                  isAudioMuted
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-600"
                }`}
              >
                {isAudioMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>
              <span className="text-sm text-slate-600">
                {isAudioMuted ? "Muted" : "Audio On"}
              </span>
            </div>
          </div>
        </div>

        {/* Context Selection */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-purple-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            What type of note are you recording?
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {contextOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setContext(option.value)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                  context === option.value
                    ? "border-purple-500 bg-purple-50 text-purple-700"
                    : "border-slate-200 hover:border-purple-300 text-slate-600"
                }`}
              >
                <div className="text-lg mb-1">{option.icon}</div>
                <div className="text-sm font-medium">
                  {option.label.split(" ").slice(1).join(" ")}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recording Controls */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-purple-200">
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              🎙️ Advanced Voice Recording
            </h2>

            {/* Audio Visualization */}
            {isListening && (
              <div className="mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Activity className="h-5 w-5 text-purple-600" />
                  <span className="text-sm text-slate-600">Audio Level</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-100"
                    style={{ width: `${audioLevel * 100}%` }}
                  />
                </div>
              </div>
            )}

            {!isListening ? (
              <div className="space-y-4">
                <button
                  onClick={startListening}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-8 py-4 text-white text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-3 mx-auto"
                >
                  <Play className="h-6 w-6" />
                  Start High-Quality Recording
                </button>
                <p className="text-slate-600 text-sm">
                  Advanced speech recognition with live captions and audio
                  visualization
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="text-3xl font-mono text-red-600 font-bold">
                    {formatDuration(recordingDuration)}
                  </div>
                  <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                </div>

                {/* Live Captions */}
                {liveTranscript && (
                  <div className="bg-slate-100 p-4 rounded-lg border-l-4 border-blue-500">
                    <p className="text-slate-700 italic">{liveTranscript}</p>
                  </div>
                )}

                <div className="flex justify-center gap-3">
                  <button
                    onClick={stopListening}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-8 py-4 text-white text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-3"
                  >
                    <Square className="h-6 w-6" />
                    Stop Recording
                  </button>

                  {audioBlob && (
                    <button
                      onClick={downloadAudio}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-6 py-4 text-white font-semibold rounded-xl transition-all duration-300 flex items-center gap-2"
                    >
                      <Download className="h-5 w-5" />
                      Download Audio
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-center gap-4 text-sm text-slate-600">
                  <span>Words: {wordCount}</span>
                  <span>•</span>
                  <span>Confidence: {Math.round(confidence * 100)}%</span>
                  <span>•</span>
                  <span>Quality: {recordingQuality}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Transcript Display */}
        {transcript && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-purple-200">
            <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <FileAudio className="h-5 w-5 text-purple-600" />
              Your Voice Input
            </h3>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 max-h-60 overflow-y-auto">
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {transcript}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-slate-600 mb-6">
              <div className="bg-purple-50 p-3 rounded-lg text-center">
                <div className="font-semibold text-purple-600">
                  {formatDuration(recordingDuration)}
                </div>
                <div>Duration</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="font-semibold text-blue-600">{wordCount}</div>
                <div>Words</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="font-semibold text-green-600">
                  {Math.round(confidence * 100)}%
                </div>
                <div>Confidence</div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg text-center">
                <div className="font-semibold text-orange-600 capitalize">
                  {context}
                </div>
                <div>Context</div>
              </div>
              <div className="bg-indigo-50 p-3 rounded-lg text-center">
                <div className="font-semibold text-indigo-600 capitalize">
                  {recordingQuality}
                </div>
                <div>Quality</div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={processMemory}
                disabled={isProcessing}
                className={`bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 px-8 py-4 text-white text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2 mx-auto ${
                  isProcessing ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing with Advanced AI...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    🧠 Extract Actionable Insights
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Enhanced AI Analysis Results */}
        {summaryData && (
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 shadow-lg border-2 border-purple-200">
            <h3 className="text-xl font-semibold text-purple-800 mb-6 flex items-center gap-2">
              ✨ Advanced AI Analysis Complete
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Title & Summary
                  </h4>
                  <div className="bg-white/50 p-4 rounded-lg space-y-2">
                    <p className="font-medium text-slate-800">
                      {summaryData.title}
                    </p>
                    <p className="text-slate-600 text-sm">
                      {summaryData.summary}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">
                    Analysis Metrics
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/50 p-3 rounded-lg text-center">
                      <div className="font-bold text-purple-600">
                        {Math.round(summaryData.confidence * 100)}%
                      </div>
                      <div className="text-xs text-slate-600">
                        AI Confidence
                      </div>
                    </div>
                    <div className="bg-white/50 p-3 rounded-lg text-center">
                      <div className="font-bold text-blue-600">
                        {summaryData.word_count}
                      </div>
                      <div className="text-xs text-slate-600">
                        Words Analyzed
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">
                    Classification
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        summaryData.priority === "urgent"
                          ? "bg-red-100 text-red-700"
                          : summaryData.priority === "high"
                          ? "bg-orange-100 text-orange-700"
                          : summaryData.priority === "medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {summaryData.priority} priority
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium capitalize">
                      {summaryData.category}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        summaryData.sentiment === "positive"
                          ? "bg-green-100 text-green-700"
                          : summaryData.sentiment === "negative"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {summaryData.sentiment}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    Action Items ({summaryData.actionItems?.length || 0})
                  </h4>
                  <div className="bg-white/50 p-3 rounded-lg space-y-2 max-h-40 overflow-y-auto">
                    {summaryData.actionItems &&
                    summaryData.actionItems.length > 0 ? (
                      summaryData.actionItems.map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-purple-600 font-bold mt-1">
                            •
                          </span>
                          <span className="text-slate-600 text-sm">{item}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 italic text-sm">
                        No specific action items identified
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">
                    Smart Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {summaryData.tags && summaryData.tags.length > 0 ? (
                      summaryData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full"
                        >
                          #{tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 italic text-sm">
                        No tags generated
                      </span>
                    )}
                  </div>
                </div>

                {summaryData.dueDate && (
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-2">
                      Suggested Due Date
                    </h4>
                    <div className="bg-white/50 p-3 rounded-lg">
                      <span className="text-slate-600 text-sm">
                        {new Date(summaryData.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Export Actions */}
            {summaryData.actionItems && summaryData.actionItems.length > 0 && (
              <div className="mt-6 p-4 bg-white/50 rounded-lg">
                <h4 className="font-semibold text-slate-700 mb-3">
                  Quick Export:
                </h4>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleQuickExport("calendar")}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Calendar className="h-4 w-4" />
                    Add to Calendar
                  </button>
                  <button
                    onClick={() => handleQuickExport("todoist")}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Target className="h-4 w-4" />
                    Send to Todoist
                  </button>
                </div>
              </div>
            )}

            <div className="text-center mt-8">
              <button
                onClick={saveToMemories}
                disabled={isSaving}
                className={`bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 px-8 py-4 text-white text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2 mx-auto ${
                  isSaving ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving & Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5" />
                    💾 Save to Timeline
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Blockchain Verification Status */}
        {verificationStatus && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 shadow-lg border-2 border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-semibold text-green-800">
                Blockchain Verification Complete ✅
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">
                  Hash: {verificationStatus.hash.substring(0, 16)}...
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">
                  Block ID: {verificationStatus.blockId}
                </span>
              </div>
              <p className="text-sm text-green-600 font-medium">
                ✅ Your memory has been cryptographically secured and verified
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordMemory;
