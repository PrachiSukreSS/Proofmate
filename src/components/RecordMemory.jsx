import React, { useState, useEffect } from "react";
import { Mic, Shield, Hash, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { processTranscriptWithAI } from "../utils/aiProcessor";
import { storeVerifiedMemory } from "../utils/blockchainVerification";
import { useToast } from "../hooks/use-toast";

const RecordMemory = () => {
  const [transcript, setTranscript] = useState("");
  const [summaryData, setSummaryData] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState(null);
  const [showRecording, setShowRecording] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Timer for recording duration
  useEffect(() => {
    let interval;
    if (isListening && recordingStartTime) {
      interval = setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - recordingStartTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isListening, recordingStartTime]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast({
        title: "Browser Not Supported",
        description: "Your browser does not support Speech Recognition",
        variant: "destructive",
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.start();

    setIsListening(true);
    setRecordingStartTime(Date.now());
    setRecognitionInstance(recognition);

    recognition.onresult = (event) => {
      let fullTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        fullTranscript += event.results[i][0].transcript + " ";
      }
      setTranscript((prev) => prev + fullTranscript.trim() + " ");
    };

    recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event);
      toast({
        title: "Recording Error",
        description: "There was an error with voice recognition",
        variant: "destructive",
      });
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const stopListening = () => {
    if (recognitionInstance) {
      recognitionInstance.stop();
      setIsListening(false);
    }
  };

  const handleStartRecording = () => {
    setShowRecording(true);
    setTranscript("");
    setSummaryData(null);
    setRecordingDuration(0);
    setVerificationStatus(null);
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
      const aiResults = await processTranscriptWithAI(transcript);
      setSummaryData(aiResults);
      
      toast({
        title: "Memory Processed",
        description: "Your memory has been analyzed successfully",
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
      // Get authenticated user
      const { data: userData, error: authError } = await supabase.auth.getUser();

      if (authError || !userData?.user?.id) {
        toast({
          title: "Authentication Error",
          description: "Please log in to save memories",
          variant: "destructive",
        });
        return;
      }

      const memoryData = {
        user_id: userData.user.id,
        transcript: transcript.trim(),
        title: summaryData.title,
        summary: summaryData.summary,
        emotion: summaryData.emotion,
        keywords: summaryData.keywords,
        poem: summaryData.poem,
        audio_duration: recordingDuration,
        created_at: new Date().toISOString()
      };

      // Store with blockchain verification
      const result = await storeVerifiedMemory(memoryData);
      
      setVerificationStatus({
        verified: result.verified,
        hash: result.hash,
        blockId: result.block.id
      });

      toast({
        title: "Memory Saved Successfully! 🎉",
        description: "Your memory has been saved and verified on the blockchain",
      });

      // Navigate to timeline after a short delay
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

  return (
    <div className="py-10 px-4 sm:px-8 max-w-6xl mx-auto">
      <div className="flex flex-col items-center gap-6 px-4">
        {!showRecording ? (
          <button
            onClick={handleStartRecording}
            className="group relative overflow-hidden rounded-full p-6 sm:p-8 shadow-2xl transition-all duration-300 transform hover:scale-110 hover:shadow-purple-500/25 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            style={{
              boxShadow:
                "0 25px 50px -12px rgba(147, 51, 234, 0.25), 0 0 30px rgba(147, 51, 234, 0.3)",
            }}
          >
            <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div
              className="absolute inset-0 rounded-full animate-pulse opacity-0 group-hover:opacity-30 transition-opacity duration-300"
              style={{
                background:
                  "radial-gradient(circle, rgba(147, 51, 234, 0.4) 0%, transparent 70%)",
              }}
            />
            <div className="relative flex items-center gap-2 sm:gap-3 text-white">
              <Mic className="h-6 w-6 sm:h-8 sm:w-8" />
              <span className="text-lg sm:text-xl font-semibold">
                🎙 Start Recording
              </span>
            </div>
          </button>
        ) : (
          <div className="w-full max-w-6xl space-y-6 sm:space-y-8">
            {/* Recording Controls */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border-2 border-purple-200">
              <div className="text-center space-y-6">
                {!isListening ? (
                  <button
                    onClick={startListening}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-6 sm:px-8 py-3 sm:py-4 text-white text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    🎤 Start Recording
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full"></div>
                    </div>
                    <div className="text-2xl font-mono text-red-600 font-bold">
                      {formatDuration(recordingDuration)}
                    </div>
                    <button
                      onClick={stopListening}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-6 sm:px-8 py-3 sm:py-4 text-white text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      ⏹️ Stop Recording
                    </button>
                    <p className="text-slate-600 text-sm sm:text-base">
                      Listening... Speak clearly into your microphone
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Transcript Display */}
            {transcript && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border-2 border-purple-200">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  📝 Your Voice Input
                </h3>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                  <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
                    {transcript}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-6">
                  <span>Duration: {formatDuration(recordingDuration)}</span>
                  <span>•</span>
                  <span>Words: {transcript.trim().split(' ').length}</span>
                </div>

                <div className="text-center">
                  <button
                    onClick={processMemory}
                    disabled={isProcessing}
                    className={`bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-6 sm:px-8 py-3 sm:py-4 text-white text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2 mx-auto ${
                      isProcessing ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing Memory...
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5" />
                        🧠 Process Memory
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Memory Analysis Display */}
            {summaryData && (
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 sm:p-8 shadow-lg border-2 border-purple-200">
                <h3 className="text-lg sm:text-xl font-semibold text-purple-800 mb-6 flex items-center gap-2">
                  ✨ Memory Analysis
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-slate-700 mb-2 text-sm sm:text-base">
                        Title
                      </h4>
                      <p className="text-slate-600 bg-white/50 p-3 rounded-lg text-sm sm:text-base">
                        {summaryData.title}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-700 mb-2 text-sm sm:text-base">
                        Emotion
                      </h4>
                      <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium capitalize">
                        {summaryData.emotion}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-700 mb-2 text-sm sm:text-base">
                        Keywords
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {summaryData.keywords.map((keyword, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs sm:text-sm rounded-full"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-slate-700 mb-2 text-sm sm:text-base">
                        Summary
                      </h4>
                      <p className="text-slate-600 bg-white/50 p-3 rounded-lg leading-relaxed text-sm sm:text-base">
                        {summaryData.summary}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-700 mb-2 text-sm sm:text-base">
                        Generated Poem
                      </h4>
                      <div className="bg-white/50 p-3 rounded-lg">
                        <p className="text-slate-600 italic leading-relaxed whitespace-pre-line text-sm sm:text-base">
                          {summaryData.poem}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center mt-6 sm:mt-8">
                  <button
                    onClick={saveToMemories}
                    disabled={isSaving}
                    className={`bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 px-6 sm:px-8 py-3 sm:py-4 text-white text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2 mx-auto ${
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
                        💾 Save to Memories
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
                    Blockchain Verification Complete
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
        )}
      </div>
    </div>
  );
};

export default RecordMemory;