import React, { useState, useEffect, useRef } from "react";
import { Mic, Square, ArrowLeft, Play, Pause, Volume2, VolumeX, Download, Save, X, Settings, Waves, Activity, FileAudio } from "lucide-react";

const VoiceRecorder = ({ onBack }) => {
  // ========================================
  // VOICE-TO-TEXT CONVERSION CORE SECTION
  // ========================================
  
  // State for voice recognition
  const [transcript, setTranscript] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState(null);
  const [confidence, setConfidence] = useState(0);
  
  // Recording state
  const [recordingStartTime, setRecordingStartTime] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  
  // Settings
  const [recordingQuality, setRecordingQuality] = useState("high");
  const [noiseReduction, setNoiseReduction] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  // Audio visualization
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);

  // Timer for recording duration
  useEffect(() => {
    let interval;
    if (isListening && recordingStartTime) {
      interval = setInterval(() => {
        const currentTime = Date.now();
        const elapsed = Math.floor((currentTime - recordingStartTime) / 1000);
        setRecordingDuration(elapsed);
      }, 100);
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

  // ========================================
  // VOICE-TO-TEXT SETUP FUNCTION
  // ========================================
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

      // Setup audio context for visualization
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
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

      // Audio level visualization
      const updateAudioLevel = () => {
        if (analyserRef.current && isListening) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);

          const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
          setAudioLevel(average / 255);

          animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };

      updateAudioLevel();
      return stream;
    } catch (error) {
      console.error("Audio setup error:", error);
      alert("Could not access microphone. Please check permissions.");
      return null;
    }
  };

  // ========================================
  // MAIN VOICE-TO-TEXT FUNCTION
  // ========================================
  const startListening = async () => {
    // Check browser support for Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Your browser does not support speech recognition. Please use Chrome or Edge.");
      return;
    }

    try {
      // Setup audio visualization
      await setupAudioVisualization();

      // Create and configure speech recognition
      const recognition = new SpeechRecognition();
      recognition.continuous = true;        // Keep listening
      recognition.interimResults = true;    // Show partial results
      recognition.lang = "en-US";          // Set language

      // ========================================
      // SPEECH RECOGNITION EVENT HANDLERS
      // ========================================
      
      recognition.onstart = () => {
        setIsListening(true);
        setRecordingStartTime(Date.now());
        console.log("Voice recognition started");
      };

      recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        // Process all results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            // Final result - add to main transcript
            finalTranscript += transcriptPart;
          } else {
            // Interim result - show as live preview
            interimTranscript += transcriptPart;
          }
        }

        // Update state with results
        setLiveTranscript(interimTranscript);
        if (finalTranscript) {
          setTranscript((prev) => prev + finalTranscript + " ");
          setConfidence(event.results[event.results.length - 1][0].confidence);
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        alert("Speech recognition error: " + event.error);
        stopListening();
      };

      recognition.onend = () => {
        // Restart recognition if it stops unexpectedly
        if (isListening) {
          recognition.start();
        }
      };

      // Start the recognition
      recognition.start();
      setRecognitionInstance(recognition);
      
    } catch (error) {
      console.error("Recognition start error:", error);
      alert("Could not start voice recognition");
    }
  };

  // ========================================
  // STOP VOICE-TO-TEXT FUNCTION
  // ========================================
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

    console.log(`Recording stopped. Duration: ${formatDuration(recordingDuration)}`);
  };

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================
  
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const downloadTranscript = () => {
    if (!transcript.trim()) {
      alert("No transcript to download");
      return;
    }

    const element = document.createElement("a");
    const file = new Blob([transcript], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `transcript-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadAudio = () => {
    if (!audioBlob) {
      alert("No audio to download");
      return;
    }

    const element = document.createElement("a");
    element.href = URL.createObjectURL(audioBlob);
    element.download = `recording-${new Date().toISOString().split('T')[0]}.wav`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const clearTranscript = () => {
    if (isListening) {
      alert("Stop recording first");
      return;
    }
    setTranscript("");
    setWordCount(0);
    setConfidence(0);
    setRecordingDuration(0);
    setAudioBlob(null);
  };

  // ========================================
  // RENDER COMPONENT
  // ========================================
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-purple-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-600 hover:text-purple-700 transition-colors rounded-lg hover:bg-gray-100"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Voice to Text Recorder
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            Record your voice and get real-time transcription with high accuracy
          </p>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recording Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Audio Quality
                </label>
                <select
                  value={recordingQuality}
                  onChange={(e) => setRecordingQuality(e.target.value)}
                  className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
                  <span className="text-sm text-gray-700">Noise Reduction</span>
                </label>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Recording Panel */}
          <div className="space-y-6">
            
            {/* Main Recording Control */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 shadow-lg text-center">
              <div className="space-y-6">
                
                {/* Audio Visualization */}
                <div className="relative">
                  <div
                    className={`w-32 h-32 mx-auto rounded-full border-4 transition-all duration-300 flex items-center justify-center ${
                      isListening
                        ? "border-red-500 bg-red-50 animate-pulse"
                        : "border-purple-500 bg-purple-50"
                    }`}
                    style={{
                      transform: `scale(${1 + audioLevel * 0.3})`,
                    }}
                  >
                    <Mic
                      className={`h-12 w-12 ${
                        isListening ? "text-red-600" : "text-purple-600"
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
                              audioLevel * 5 > i ? "bg-red-500" : "bg-gray-300"
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
                  className={`w-full py-4 px-8 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                    isListening
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                  }`}
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
                      <div className="text-2xl font-bold text-gray-900">
                        {formatDuration(recordingDuration)}
                      </div>
                      <div className="text-sm text-gray-600">Duration</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {wordCount}
                      </div>
                      <div className="text-sm text-gray-600">Words</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {Math.round(confidence * 100)}%
                      </div>
                      <div className="text-sm text-gray-600">Confidence</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Transcript Panel */}
          <div className="space-y-6">
            
            {/* Live Transcript Display */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileAudio className="h-5 w-5 text-purple-600" />
                Live Transcript
              </h3>
              
              <div className="bg-gray-50 p-4 rounded-lg max-h-80 overflow-y-auto min-h-[200px]">
                {transcript || liveTranscript ? (
                  <p className="text-gray-900 leading-relaxed">
                    {transcript}
                    {liveTranscript && (
                      <span className="text-gray-500 italic">{liveTranscript}</span>
                    )}
                  </p>
                ) : (
                  <p className="text-gray-500 italic text-center py-8">
                    Click "Start Recording" to begin voice-to-text conversion...
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={clearTranscript}
                  disabled={isListening}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  Clear
                </button>
                
                <button
                  onClick={downloadTranscript}
                  disabled={!transcript.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  Download Text
                </button>
                
                <button
                  onClick={downloadAudio}
                  disabled={!audioBlob}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  Download Audio
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3">How to Use:</h4>
              <ul className="text-blue-800 text-sm space-y-2">
                <li>• Click "Start Recording" to begin voice recognition</li>
                <li>• Speak clearly into your microphone</li>
                <li>• Watch real-time transcription appear</li>
                <li>• Click "Stop Recording" when finished</li>
                <li>• Download your transcript or audio file</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceRecorder;