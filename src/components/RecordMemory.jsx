import React, { useState, useEffect, useRef } from "react";
import { Mic, Shield, Hash, Zap, ArrowLeft, Play, Square, Brain, Target, CheckSquare, Calendar, Volume2, VolumeX, Settings, Waves, Activity, FileAudio, Upload, Download, Pause, Save, X, Video, Headphones, Blocks as Blockchain, Crown, AlertCircle, CheckCircle, Clock, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { processTranscriptWithAI } from "../utils/aiProcessor";
import { storeVerifiedMemory } from "../utils/blockchainVerification";
import {
  exportToGoogleCalendar,
  exportToTodoist,
  processAudioWithElevenLabs,
  generateVoiceWithElevenLabs,
  processVideoWithTavus,
  verifyContentWithAlgorand,
  getUserSubscriptionStatus,
} from "../utils/integrationManager";
import { useToast } from "../hooks/use-toast";
import { isAdmin, getAdminSubscriptionStatus } from "../utils/adminConfig";

const RecordMemory = ({ onBack, user }) => {
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
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [processingSteps, setProcessingSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [memoryTitle, setMemoryTitle] = useState("");

  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  const categories = [
    "general",
    "work",
    "personal",
    "meeting",
    "brainstorm",
    "interview",
    "learning",
    "shopping",
    "health",
  ];

  // Load subscription status
  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  // Timer for recording duration
  useEffect(() => {
    let interval;
    if (isListening && recordingStartTime) {
      interval = setInterval(() => {
        const currentTime = Date.now();
        const elapsed = Math.floor((currentTime - recordingStartTime) / 1000);
        setRecordingDuration(elapsed);
      }, 100); // Update every 100ms for smooth display
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
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [recognitionInstance]);

  const loadSubscriptionStatus = async () => {
    try {
      // Check if user is admin
      if (isAdmin(user?.email)) {
        setSubscriptionStatus(getAdminSubscriptionStatus());
        toast({
          title: "Admin Access Granted",
          description: "You have full access to all premium features",
          variant: "success"
        });
        return;
      }

      const status = await getUserSubscriptionStatus(user?.id);
      setSubscriptionStatus(status);
    } catch (error) {
      console.error("Error loading subscription status:", error);
      setSubscriptionStatus({ tier: "free", isActive: false });
    }
  };

  const checkPremiumFeature = (feature) => {
    // Admin always has access
    if (isAdmin(user?.email)) {
      return true;
    }

    if (!subscriptionStatus?.isActive || subscriptionStatus?.tier === "free") {
      toast({
        title: "Premium Feature",
        description: `${feature} requires a premium subscription`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const updateProcessingStep = (step, status = "processing") => {
    setProcessingSteps((prev) => {
      const newSteps = [...prev];
      const existingIndex = newSteps.findIndex((s) => s.name === step);
      
      if (existingIndex >= 0) {
        newSteps[existingIndex].status = status;
      } else {
        newSteps.push({ name: step, status });
      }
      
      return newSteps;
    });
  };

  const analyzeAudio = async (audioBlob) => {
    updateProcessingStep("ElevenLabs Audio Analysis", "processing");
    
    try {
      const analysis = await processAudioWithElevenLabs(audioBlob);
      if (analysis.success) {
        updateProcessingStep("ElevenLabs Audio Analysis", "completed");
        console.log("Voice Analysis Result:", analysis);
        toast({
          title: "Audio Analysis Complete",
          description: "Voice characteristics analyzed successfully",
        });
        return analysis;
      } else {
        updateProcessingStep("ElevenLabs Audio Analysis", "failed");
        throw new Error(analysis.error);
      }
    } catch (error) {
      updateProcessingStep("ElevenLabs Audio Analysis", "failed");
      toast({
        title: "Analysis Failed",
        description: "Voice analysis could not be completed",
        variant: "destructive",
      });
      return null;
    }
  };

  const synthesizeVoice = async (text) => {
    try {
      const result = await generateVoiceWithElevenLabs(
        text || "Your recording has been processed successfully!",
        "SAz9YHcvj6GTRTYXdXww"
      );
      if (result.success) {
        const audio = new Audio(result.audioUrl);
        audio.play();
        toast({
          title: "Voice Synthesis Complete",
          description: "Generated voice message is playing",
        });
      }
    } catch (error) {
      console.error("Voice synthesis error:", error);
    }
  };

  const verifyOnBlockchain = async (data) => {
    updateProcessingStep("Algorand Blockchain Verification", "processing");
    
    try {
      const result = await verifyContentWithAlgorand(data);
      if (result.success) {
        updateProcessingStep("Algorand Blockchain Verification", "completed");
        console.log("Blockchain Verification:", result);
        toast({
          title: "Blockchain Verification Complete",
          description: "Memory verified on Algorand blockchain",
        });
        return result;
      } else {
        updateProcessingStep("Algorand Blockchain Verification", "failed");
        throw new Error(result.error);
      }
    } catch (error) {
      updateProcessingStep("Algorand Blockchain Verification", "failed");
      toast({
        title: "Verification Failed",
        description: "Blockchain verification could not be completed",
        variant: "destructive",
      });
      return null;
    }
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

      streamRef.current = stream;

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
          "Your browser does not support speech recognition. Please use Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Setup audio visualization
      await setupAudioVisualization();

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        setRecordingStartTime(Date.now());
        toast({
          title: "Recording Started",
          description: "Speak clearly into your microphone",
        });
      };

      recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart;
          } else {
            interimTranscript += transcriptPart;
          }
        }

        setLiveTranscript(interimTranscript);
        if (finalTranscript) {
          setTranscript((prev) => prev + finalTranscript + " ");
          setConfidence(event.results[event.results.length - 1][0].confidence);
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        toast({
          title: "Recognition Error",
          description: "Speech recognition encountered an error",
          variant: "destructive",
        });
        stopListening();
      };

      recognition.onend = () => {
        if (isListening) {
          // Restart recognition if it stops unexpectedly
          recognition.start();
        }
      };

      recognition.start();
      setRecognitionInstance(recognition);
    } catch (error) {
      console.error("Error starting recognition:", error);
      toast({
        title: "Recording Error",
        description: "Could not start recording",
        variant: "destructive",
      });
    }
  };

  const stopListening = () => {
    if (recognitionInstance) {
      recognitionInstance.stop();
      setRecognitionInstance(null);
    }

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    setIsListening(false);
    setLiveTranscript("");
    setAudioLevel(0);

    toast({
      title: "Recording Stopped",
      description: `Recorded ${formatDuration(recordingDuration)}`,
    });
  };

  const processWithAI = async () => {
    if (!transcript.trim()) {
      toast({
        title: "No Content",
        description: "Please record some content first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingSteps([]);
    setCurrentStep(0);

    try {
      // Step 1: AI Processing
      updateProcessingStep("AI Analysis", "processing");
      const aiResults = await processTranscriptWithAI(transcript, context);
      updateProcessingStep("AI Analysis", "completed");

      // Step 2: Audio Analysis (Premium or Admin)
      if (audioBlob && (subscriptionStatus?.isActive || isAdmin(user?.email))) {
        await analyzeAudio(audioBlob);
      }

      // Step 3: Blockchain Verification
      const blockchainResult = await verifyOnBlockchain({
        type: "memory_verification",
        transcript,
        summary: aiResults.summary,
        title: memoryTitle || aiResults.title,
        user_id: user?.id,
      });

      setSummaryData({
        ...aiResults,
        title: memoryTitle || aiResults.title,
        blockchainHash: blockchainResult?.hash,
        verificationStatus: blockchainResult ? "verified" : "pending",
      });

      toast({
        title: "Processing Complete",
        description: "Your memory has been analyzed and verified",
      });
    } catch (error) {
      console.error("Processing error:", error);
      toast({
        title: "Processing Failed",
        description: "Could not process the recording",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const saveMemory = async () => {
    if (!summaryData) {
      toast({
        title: "Process First",
        description: "Please process the recording with AI first",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const memoryData = {
        user_id: user?.id,
        title: summaryData.title,
        transcript,
        summary: summaryData.summary,
        action_items: summaryData.actionItems,
        tags: summaryData.tags,
        priority: summaryData.priority,
        category: summaryData.category,
        sentiment: summaryData.sentiment,
        due_date: summaryData.dueDate,
        word_count: wordCount,
        confidence: summaryData.confidence,
        audio_duration: recordingDuration,
        recording_quality: recordingQuality,
        created_at: new Date().toISOString(),
      };

      const result = await storeVerifiedMemory(memoryData);

      if (result.memory) {
        toast({
          title: "Memory Saved Successfully",
          description: "Your memory has been saved with blockchain verification",
        });

        // Synthesize confirmation message for premium users or admin
        if (subscriptionStatus?.isActive || isAdmin(user?.email)) {
          await synthesizeVoice("Your memory has been saved successfully!");
        }

        // Reset form
        setTranscript("");
        setSummaryData(null);
        setRecordingDuration(0);
        setWordCount(0);
        setConfidence(0);
        setAudioBlob(null);
        setProcessingSteps([]);
        setMemoryTitle("");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Save Failed",
        description: "Could not save memory",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const exportActions = async (type) => {
    if (!summaryData?.actionItems?.length) {
      toast({
        title: "No Action Items",
        description: "Process the recording first to extract action items",
        variant: "destructive",
      });
      return;
    }

    try {
      let result;
      switch (type) {
        case "calendar":
          result = await exportToGoogleCalendar(
            summaryData.actionItems,
            summaryData.title
          );
          break;
        case "todoist":
          result = await exportToTodoist(
            summaryData.actionItems,
            summaryData.title,
            summaryData.priority
          );
          break;
      }

      if (result?.success) {
        toast({
          title: "Export Successful",
          description: `Action items exported to ${type}`,
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

  const ProcessingSteps = () => (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Activity className="h-5 w-5 text-blue-600" />
        Processing Steps
      </h3>
      <div className="space-y-3">
        {processingSteps.map((step, index) => (
          <div key={index} className="flex items-center gap-3">
            {step.status === "completed" && (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
            {step.status === "processing" && (
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            )}
            {step.status === "failed" && (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <span
              className={`text-sm ${
                step.status === "completed"
                  ? "text-green-700 dark:text-green-300"
                  : step.status === "failed"
                  ? "text-red-700 dark:text-red-300"
                  : "text-blue-700 dark:text-blue-300"
              }`}
            >
              {step.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack || (() => navigate("/"))}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Settings className="h-5 w-5" />
            </button>

            {isAdmin(user?.email) && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2 rounded-lg">
                <Crown className="h-4 w-4" />
                <span className="font-medium">Admin</span>
              </div>
            )}

            {!isAdmin(user?.email) && subscriptionStatus?.tier === "free" && (
              <button
                onClick={() => navigate("/premium")}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-200"
              >
                <Crown className="h-4 w-4" />
                Upgrade
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Smart Voice Recording
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            Record your thoughts and let AI transform them into actionable
            insights with blockchain verification
          </p>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recording Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Context
                </label>
                <select
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quality
                </label>
                <select
                  value={recordingQuality}
                  onChange={(e) => setRecordingQuality(e.target.value)}
                  className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="standard">Standard (16kHz)</option>
                  <option value="high">High (48kHz)</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={noiseReduction}
                    onChange={(e) => setNoiseReduction(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Noise Reduction
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={autoSave}
                    onChange={(e) => setAutoSave(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Auto Save
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recording Panel */}
          <div className="space-y-6">
            {/* Memory Title Input */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Memory Title
              </label>
              <input
                type="text"
                value={memoryTitle}
                onChange={(e) => setMemoryTitle(e.target.value)}
                placeholder="Enter a title for your memory..."
                className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Main Recording Control */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 dark:border-gray-700 text-center">
              <div className="space-y-6">
                {/* Audio Visualization */}
                <div className="relative">
                  <div
                    className={`w-32 h-32 mx-auto rounded-full border-4 transition-all duration-300 flex items-center justify-center ${
                      isListening
                        ? "border-red-500 bg-red-50 dark:bg-red-900/20 animate-pulse"
                        : "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                    }`}
                    style={{
                      transform: `scale(${1 + audioLevel * 0.3})`,
                    }}
                  >
                    <Mic
                      className={`h-12 w-12 ${
                        isListening
                          ? "text-red-600"
                          : "text-purple-600 dark:text-purple-400"
                      }`}
                    />
                  </div>

                  {/* Audio Level Indicator */}
                  {isListening && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-6 rounded-full transition-all duration-150 ${
                              audioLevel * 5 > i
                                ? "bg-red-500"
                                : "bg-gray-300 dark:bg-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Recording Button */}
                <button
                  onClick={isListening ? stopListening : startListening}
                  disabled={isProcessing || isSaving}
                  className={`w-full py-4 px-8 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                    isListening
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isListening ? (
                    <>
                      <Square className="h-5 w-5" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="h-5 w-5" />
                      Start Recording
                    </>
                  )}
                </button>

                {/* Recording Stats */}
                {(isListening || transcript) && (
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatDuration(recordingDuration)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Duration
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {wordCount}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Words
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {Math.round(confidence * 100)}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Confidence
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Live Transcript */}
            {(transcript || liveTranscript) && (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileAudio className="h-5 w-5 text-purple-600" />
                  Live Transcript
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg max-h-60 overflow-y-auto">
                  <p className="text-gray-900 dark:text-white leading-relaxed">
                    {transcript}
                    {liveTranscript && (
                      <span className="text-gray-500 dark:text-gray-400 italic">
                        {liveTranscript}
                      </span>
                    )}
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setTranscript("")}
                    disabled={isListening}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Analysis Panel */}
          <div className="space-y-6">
            {/* AI Processing */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                AI Analysis
              </h3>

              <button
                onClick={processWithAI}
                disabled={!transcript.trim() || isProcessing || isListening}
                className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    Process with AI
                  </>
                )}
              </button>

              {/* Premium Features */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-800 dark:text-blue-200">
                      Tavus Video Analysis
                    </span>
                  </div>
                  {subscriptionStatus?.isActive || isAdmin(user?.email) ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Crown className="h-4 w-4 text-amber-500" />
                  )}
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Headphones className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-800 dark:text-green-200">
                      ElevenLabs Voice AI
                    </span>
                  </div>
                  {subscriptionStatus?.isActive || isAdmin(user?.email) ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Crown className="h-4 w-4 text-amber-500" />
                  )}
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-purple-800 dark:text-purple-200">
                      Algorand Blockchain
                    </span>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </div>

            {/* Processing Steps */}
            {isProcessing && processingSteps.length > 0 && <ProcessingSteps />}

            {/* Summary Results */}
            {summaryData && (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  Analysis Results
                </h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      {summaryData.title}
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {summaryData.summary}
                    </p>
                  </div>

                  {summaryData.actionItems?.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Action Items ({summaryData.actionItems.length})
                      </h5>
                      <div className="space-y-2">
                        {summaryData.actionItems.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <CheckSquare className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {item}
                            </span>
                          </div>
                        ))}
                        {summaryData.actionItems.length > 3 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            +{summaryData.actionItems.length - 3} more items
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {summaryData.tags?.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                        Tags
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {summaryData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>Priority: {summaryData.priority}</span>
                      <span>Category: {summaryData.category}</span>
                      <span>Sentiment: {summaryData.sentiment}</span>
                    </div>
                    {summaryData.blockchainHash && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Shield className="h-4 w-4" />
                        <span className="text-xs">Verified</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Export Actions */}
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => exportActions("calendar")}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Calendar className="h-4 w-4" />
                    Calendar
                  </button>
                  <button
                    onClick={() => exportActions("todoist")}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <CheckSquare className="h-4 w-4" />
                    Todoist
                  </button>
                  <button
                    onClick={saveMemory}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 ml-auto"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Memory
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordMemory;