import React, { useState, useRef, useEffect } from "react";
import {
  Mic,
  Square,
  Loader,
  MessageSquare,
  Brain,
  AlertCircle,
} from "lucide-react";
import axios from "axios";

const RecordMemory = () => {
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Your browser does not support Speech Recognition. Please use Chrome, Edge, or Safari."
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognitionRef.current = recognition;
    setIsListening(true);
    setTranscript("");
    setSummary("");
    setError("");
    finalTranscriptRef.current = "";

    recognition.onstart = () => {
      console.log("Speech recognition started");
      setError("");
    };

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptText = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptText + " ";
        } else {
          interimTranscript += transcriptText;
        }
      }

      // Add final transcript to our running total
      if (finalTranscript) {
        finalTranscriptRef.current += finalTranscript;
      }

      // Update display with both final and interim results
      const fullTranscript = finalTranscriptRef.current + interimTranscript;
      setTranscript(fullTranscript);
    };

    recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      let errorMessage = "Voice input error occurred.";

      switch (event.error) {
        case "no-speech":
          errorMessage = "No speech detected. Please try speaking again.";
          break;
        case "audio-capture":
          errorMessage = "Microphone access denied or not available.";
          break;
        case "not-allowed":
          errorMessage =
            "Microphone permission denied. Please allow microphone access and refresh the page.";
          break;
        case "network":
          errorMessage = "Network error occurred during speech recognition.";
          break;
        case "aborted":
          // Don't show error for manual stops
          return;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }

      setError(errorMessage);
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");
      if (isListening) {
        // If we're still supposed to be listening, restart recognition
        // This handles cases where recognition stops unexpectedly
        setTimeout(() => {
          if (isListening && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.log("Recognition restart failed:", e);
              setIsListening(false);
            }
          }
        }, 100);
      }
    };

    try {
      recognition.start();
    } catch (error) {
      console.error("Failed to start recognition:", error);
      setError("Failed to start voice recognition. Please try again.");
      setIsListening(false);
    }
  };

  const stopListening = () => {
    setIsListening(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    // Ensure we keep the final transcript
    setTranscript(finalTranscriptRef.current.trim());
  };

  const summarizeText = async () => {
    const textToSummarize = transcript.trim();

    if (!textToSummarize) {
      setError("No text to summarize. Please record something first.");
      return;
    }

    if (!apiKey) {
      setError(
        "OpenAI API key not found. Please add VITE_OPENAI_API_KEY to your environment variables."
      );
      return;
    }

    setIsProcessing(true);
    setSummary("");
    setError("");

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that creates concise, well-structured summaries of voice recordings. Focus on key points, action items, and important details. Keep the summary clear and organized with bullet points when appropriate.",
            },
            {
              role: "user",
              content: `Please summarize the following voice recording transcript:\n\n${textToSummarize}`,
            },
          ],
          max_tokens: 500,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const aiSummary = response.data.choices[0].message.content;
      setSummary(aiSummary);
    } catch (error) {
      console.error("OpenAI API error:", error);
      let errorMessage = "Failed to generate summary.";

      if (error.response?.status === 401) {
        errorMessage = "Invalid API key. Please check your OpenAI API key.";
      } else if (error.response?.status === 429) {
        errorMessage = "API rate limit exceeded. Please try again later.";
      } else if (error.response?.data?.error?.message) {
        errorMessage = `API Error: ${error.response.data.error.message}`;
      } else if (error.code === "NETWORK_ERROR") {
        errorMessage = "Network error. Please check your internet connection.";
      }

      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearAll = () => {
    setTranscript("");
    setSummary("");
    setError("");
    finalTranscriptRef.current = "";
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Recording Controls */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2 border-purple-200">
        <div className="flex flex-col items-center space-y-4">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Mic className="h-6 w-6 text-purple-600" />
            Voice Recording
          </h2>

          <div className="flex gap-4 flex-wrap justify-center">
            {!isListening ? (
              <button
                onClick={startListening}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Mic className="h-5 w-5" />
                Start Recording
              </button>
            ) : (
              <button
                onClick={stopListening}
                className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Square className="h-5 w-5" />
                Stop Recording
              </button>
            )}

            {(transcript || summary) && (
              <button
                onClick={clearAll}
                className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-full font-medium transition-all duration-300"
              >
                Clear All
              </button>
            )}
          </div>

          {isListening && (
            <div className="flex items-center gap-2 text-red-600 animate-pulse">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
              <span className="text-sm font-medium">
                🎙️ Recording... Speak continuously
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Error:</span>
          </div>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      )}

      {/* Transcript Display */}
      {transcript && (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2 border-purple-200">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-slate-800">
                  Your Voice Input
                </h3>
              </div>
              <span className="text-sm text-slate-500">
                {transcript.split(" ").filter((word) => word.length > 0).length}{" "}
                words
              </span>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border-2 border-slate-200 min-h-[120px] max-h-[300px] overflow-y-auto">
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {transcript}
              </p>
            </div>

            <div className="flex justify-center">
              <button
                onClick={summarizeText}
                disabled={isProcessing || !transcript.trim()}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                {isProcessing ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Generating Summary...
                  </>
                ) : (
                  <>
                    <Brain className="h-5 w-5" />
                    Generate AI Summary
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Display */}
      {summary && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-xl border-2 border-blue-200">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-slate-800">
                🧠 AI Summary
              </h3>
            </div>

            <div className="bg-white/80 rounded-lg p-4 border border-blue-200">
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {summary}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-amber-50 rounded-2xl p-4 border-2 border-amber-200">
        <div className="text-center space-y-2">
          <p className="text-sm text-amber-800 font-medium">
            💡 Tips for better recording:
          </p>
          <p className="text-xs text-amber-700">
            Speak clearly • Allow microphone access • Use Chrome/Edge for best
            results • Keep background noise minimal • Recording continues until
            you stop it
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecordMemory;
