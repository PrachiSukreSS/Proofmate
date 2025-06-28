import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { 
  Upload, 
  Mic, 
  Video, 
  FileText, 
  Shield, 
  Brain, 
  Zap,
  Play,
  Pause,
  Square,
  CheckCircle,
  AlertTriangle,
  Clock,
  Download
} from "lucide-react";
import { supabase } from "../utils/supabaseClient";
import { processWithOpenAI } from "../utils/openaiProcessor";
import { verifyWithAlgorand } from "../utils/algorandClient";
import { analyzeWithTavus } from "../utils/tavusClient";
import { processWithElevenLabs } from "../utils/elevenLabsClient";
import { useToast } from "../hooks/use-toast";

const VerificationPage = ({ user }) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const recognitionRef = useRef(null);
  const intervalRef = useRef(null);
  
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
      if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    };
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.wmv'],
      'audio/*': ['.mp3', '.wav', '.m4a', '.ogg'],
      'text/*': ['.txt', '.pdf', '.doc', '.docx'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif']
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setUploadedFile(acceptedFiles[0]);
        toast({
          title: "File Uploaded",
          description: `${acceptedFiles[0].name} uploaded successfully`,
          variant: "success"
        });
      }
    },
    onDropRejected: (rejectedFiles) => {
      toast({
        title: "Upload Failed",
        description: "File type not supported or file too large",
        variant: "destructive"
      });
    }
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });

      // Setup audio visualization
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // Setup media recorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        setUploadedFile(audioBlob);
      };

      // Setup speech recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setLiveTranscript(transcript);
        };

        recognitionRef.current.start();
      }

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingDuration(0);

      // Start timer and audio level monitoring
      intervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
        
        // Update audio level
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
          setAudioLevel(average / 255);
        }
      }, 1000);

      toast({
        title: "Recording Started",
        description: "High-quality audio recording with live transcription",
        variant: "success"
      });

    } catch (error) {
      console.error('Recording error:', error);
      toast({
        title: "Recording Failed",
        description: "Could not access microphone",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (recognitionRef.current) recognitionRef.current.stop();
      if (intervalRef.current) clearInterval(intervalRef.current);
      
      setIsRecording(false);
      setAudioLevel(0);
      
      toast({
        title: "Recording Stopped",
        description: `Recorded ${Math.floor(recordingDuration / 60)}:${(recordingDuration % 60).toString().padStart(2, '0')}`,
        variant: "success"
      });
    }
  };

  const processVerification = async () => {
    if (!uploadedFile) {
      toast({
        title: "No File Selected",
        description: "Please upload a file or record audio first",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setVerificationResult(null);

    try {
      const fileType = uploadedFile.type || 'unknown';
      let analysisResults = {};

      // Process based on file type
      if (fileType.startsWith('video/')) {
        // Video analysis with Tavus
        analysisResults.video = await analyzeWithTavus(uploadedFile);
        analysisResults.ai = await processWithOpenAI(analysisResults.video.transcript || '', 'video_verification');
      } else if (fileType.startsWith('audio/')) {
        // Audio analysis with ElevenLabs
        analysisResults.audio = await processWithElevenLabs(uploadedFile);
        analysisResults.ai = await processWithOpenAI(analysisResults.audio.transcript || liveTranscript, 'audio_verification');
      } else {
        // Text/document analysis
        const text = await extractTextFromFile(uploadedFile);
        analysisResults.ai = await processWithOpenAI(text, 'document_verification');
      }

      // Blockchain verification
      analysisResults.blockchain = await verifyWithAlgorand(analysisResults);

      // Store verification in database
      if (user) {
        const { data, error } = await supabase
          .from('verifications')
          .insert([{
            user_id: user.id,
            file_name: uploadedFile.name || 'recorded_audio.wav',
            file_type: fileType,
            analysis_results: analysisResults,
            status: analysisResults.ai.confidence > 0.8 ? 'verified' : 'flagged',
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) throw error;
      }

      setVerificationResult(analysisResults);

      toast({
        title: "Verification Complete",
        description: "Analysis completed successfully",
        variant: "success"
      });

    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Failed",
        description: "An error occurred during analysis",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const extractTextFromFile = async (file) => {
    if (file.type === 'text/plain') {
      return await file.text();
    }
    // For other file types, return a placeholder
    return `Content from ${file.name}`;
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getVerificationStatus = () => {
    if (!verificationResult) return null;
    
    const confidence = verificationResult.ai?.confidence || 0;
    if (confidence > 0.9) return { status: 'verified', color: 'success', icon: CheckCircle };
    if (confidence > 0.7) return { status: 'review', color: 'accent', icon: Clock };
    return { status: 'flagged', color: 'error', icon: AlertTriangle };
  };

  const tabs = [
    { id: 'upload', label: 'Upload File', icon: Upload },
    { id: 'record', label: 'Record Audio', icon: Mic },
    { id: 'video', label: 'Video Analysis', icon: Video },
    { id: 'text', label: 'Text Analysis', icon: FileText }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Truth Verification
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Upload files, record audio, or analyze content using our advanced AI-powered verification system
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          {/* File Upload */}
          {activeTab === 'upload' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card p-8"
            >
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
                  isDragActive
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {isDragActive ? 'Drop files here' : 'Upload files for verification'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Supports video, audio, text, and image files up to 100MB
                </p>
                <button className="btn-primary">
                  Choose Files
                </button>
              </div>
              
              {uploadedFile && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary-600" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {uploadedFile.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Audio Recording */}
          {activeTab === 'record' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card p-8"
            >
              <div className="text-center space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  High-Quality Audio Recording
                </h3>
                
                {/* Audio Level Visualization */}
                {isRecording && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Audio Level:</span>
                      <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-success-400 to-primary-500 transition-all duration-100"
                          style={{ width: `${audioLevel * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="text-2xl font-mono text-primary-600 dark:text-primary-400">
                      {formatDuration(recordingDuration)}
                    </div>
                    
                    {liveTranscript && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-left">
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Live Transcript:</p>
                        <p className="text-gray-900 dark:text-white italic">
                          {liveTranscript}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex justify-center">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="w-20 h-20 bg-gradient-to-r from-primary-600 to-accent-500 hover:from-primary-700 hover:to-accent-600 rounded-full flex items-center justify-center text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      <Mic className="h-8 w-8" />
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="w-20 h-20 bg-gradient-to-r from-error-600 to-error-700 hover:from-error-700 hover:to-error-800 rounded-full flex items-center justify-center text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      <Square className="h-8 w-8" />
                    </button>
                  )}
                </div>
                
                <p className="text-gray-600 dark:text-gray-300">
                  {isRecording ? 'Recording with live transcription...' : 'Click to start recording'}
                </p>
              </div>
            </motion.div>
          )}

          {/* Process Button */}
          <button
            onClick={processVerification}
            disabled={!uploadedFile || isProcessing}
            className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="h-5 w-5" />
                Start Verification
              </>
            )}
          </button>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {verificationResult ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Status Card */}
              <div className="card p-6">
                {(() => {
                  const status = getVerificationStatus();
                  const StatusIcon = status?.icon;
                  return (
                    <div className="text-center space-y-4">
                      <div className={`w-16 h-16 bg-gradient-to-r from-${status?.color}-500 to-${status?.color}-600 rounded-full flex items-center justify-center mx-auto`}>
                        <StatusIcon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white capitalize">
                        {status?.status}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Confidence: {Math.round((verificationResult.ai?.confidence || 0) * 100)}%
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* Analysis Results */}
              <div className="card p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Analysis Results
                </h4>
                <div className="space-y-4">
                  {verificationResult.ai?.summary && (
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">Summary</h5>
                      <p className="text-gray-600 dark:text-gray-300">
                        {verificationResult.ai.summary}
                      </p>
                    </div>
                  )}
                  
                  {verificationResult.ai?.flags && verificationResult.ai.flags.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">Flags</h5>
                      <div className="space-y-2">
                        {verificationResult.ai.flags.map((flag, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <AlertTriangle className="h-4 w-4 text-accent-500" />
                            <span className="text-gray-600 dark:text-gray-300">{flag}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {verificationResult.blockchain && (
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">Blockchain Verification</h5>
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="h-4 w-4 text-success-500" />
                        <span className="text-gray-600 dark:text-gray-300">
                          Hash: {verificationResult.blockchain.hash?.substring(0, 16)}...
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Download className="h-4 w-4" />
                  Download Report
                </button>
                <button className="btn-secondary flex items-center justify-center gap-2">
                  <Shield className="h-4 w-4" />
                  View Certificate
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="card p-8 text-center">
              <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Ready for Analysis
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Upload a file or record audio to begin the verification process
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default VerificationPage;