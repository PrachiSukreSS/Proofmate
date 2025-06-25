import React, { useState, useEffect } from "react";
import { Mic, Shield, Hash, Zap, ArrowLeft, Play, Square } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { processTranscriptWithAI } from "../utils/aiProcessor";
import { storeVerifiedMemory } from "../utils/blockchainVerification";
import { useToast } from "../hooks/use-toast";

const RecordMemory = ({ onBack }) => {
  const [transcript, setTranscript] = useState("");
  const [summaryData, setSummaryData] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState(null);
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
    };
  }, [recognitionInstance]);

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
        description: "Your browser does not support Speech Recognition. Please use Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    setRecordingStartTime(Date.now());
    setRecordingDuration(0);
    setTranscript("");
    setRecognitionInstance(recognition);

    recognition.start();

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      setTranscript(prev => {
        const newTranscript = prev + finalTranscript;
        return newTranscript;
      });
    };

    recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      let errorMessage = "There was an error with voice recognition";
      
      switch(event.error) {
        case 'no-speech':
          errorMessage = "No speech detected. Please try speaking louder.";
          break;
        case 'audio-capture':
          errorMessage = "Microphone access denied or not available.";
          break;
        case 'not-allowed':
          errorMessage = "Microphone permission denied. Please allow microphone access.";
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
      if (transcript.trim()) {
        toast({
          title: "Recording Complete",
          description: "Your voice has been captured successfully!",
        });
      }
    };
  };

  const stopListening = () => {
    if (recognitionInstance) {
      recognitionInstance.stop();
      setIsListening(false);
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
      const aiResults = await processTranscriptWithAI(transcript);
      setSummaryData(aiResults);
      
      toast({
        title: "Memory Processed Successfully! 🧠",
        description: "Your memory has been analyzed and is ready to save",
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
        navigate("/login");
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
    <div className="py-6 px-4 max-w-4xl mx-auto">
      {/* Back Button */}
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
        {/* Recording Controls */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-purple-200">
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              🎙️ Voice Recording Studio
            </h2>
            
            {!isListening ? (
              <div className="space-y-4">
                <button
                  onClick={startListening}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-8 py-4 text-white text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-3 mx-auto"
                >
                  <Play className="h-6 w-6" />
                  Start Recording
                </button>
                <p className="text-slate-600 text-sm">
                  Click to start recording your voice. Make sure your microphone is enabled.
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
                
                <div className="flex justify-center">
                  <button
                    onClick={stopListening}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-8 py-4 text-white text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-3"
                  >
                    <Square className="h-6 w-6" />
                    Stop Recording
                  </button>
                </div>
                
                <p className="text-slate-600 text-sm">
                  🎤 Listening... Speak clearly into your microphone
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Transcript Display */}
        {transcript && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-purple-200">
            <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
              📝 Your Voice Input
            </h3>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
              <p className="text-slate-700 leading-relaxed">
                {transcript}
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-600 mb-6">
              <span>Duration: {formatDuration(recordingDuration)}</span>
              <span>•</span>
              <span>Words: {transcript.trim().split(' ').filter(word => word.length > 0).length}</span>
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
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 shadow-lg border-2 border-purple-200">
            <h3 className="text-xl font-semibold text-purple-800 mb-6 flex items-center gap-2">
              ✨ Memory Analysis Complete
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Title</h4>
                  <p className="text-slate-600 bg-white/50 p-3 rounded-lg">
                    {summaryData.title}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Emotion</h4>
                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium capitalize">
                    {summaryData.emotion}
                  </span>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {summaryData.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Summary</h4>
                  <p className="text-slate-600 bg-white/50 p-3 rounded-lg leading-relaxed">
                    {summaryData.summary}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Generated Poem</h4>
                  <div className="bg-white/50 p-3 rounded-lg">
                    <p className="text-slate-600 italic leading-relaxed whitespace-pre-line">
                      {summaryData.poem}
                    </p>
                  </div>
                </div>
              </div>
            </div>

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