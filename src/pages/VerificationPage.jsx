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
  Download,
  Eye,
  AlertCircle,
  Info,
  Star,
  Hash,
  Loader
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
  const [processingStage, setProcessingStage] = useState('');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  
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
      'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.webm'],
      'audio/*': ['.mp3', '.wav', '.m4a', '.ogg', '.flac'],
      'text/*': ['.txt', '.pdf', '.doc', '.docx'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setUploadedFile(acceptedFiles[0]);
        toast({
          title: "File Uploaded Successfully",
          description: `${acceptedFiles[0].name} (${(acceptedFiles[0].size / 1024 / 1024).toFixed(2)} MB)`,
          variant: "success"
        });
      }
    },
    onDropRejected: (rejectedFiles) => {
      const rejection = rejectedFiles[0];
      let message = "Upload failed";
      
      if (rejection.errors.some(e => e.code === 'file-too-large')) {
        message = "File too large (max 100MB)";
      } else if (rejection.errors.some(e => e.code === 'file-invalid-type')) {
        message = "File type not supported";
      }
      
      toast({
        title: "Upload Error",
        description: message,
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
        setUploadedFile(new File([audioBlob], 'recording.wav', { type: 'audio/wav' }));
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
        description: "Could not access microphone. Please check permissions.",
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
        title: "Recording Completed",
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
    setAnalysisProgress(0);

    try {
      const fileType = uploadedFile.type || 'unknown';
      let analysisResults = {};

      // Stage 1: File Analysis
      setProcessingStage('Analyzing file structure...');
      setAnalysisProgress(20);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Stage 2: Content Processing
      setProcessingStage('Processing content with AI...');
      setAnalysisProgress(40);

      if (fileType.startsWith('video/')) {
        // Video analysis with Tavus
        analysisResults.video = await analyzeWithTavus(uploadedFile);
        analysisResults.ai = await processWithOpenAI(analysisResults.video.transcript || '', 'video_verification');
      } else if (fileType.startsWith('audio/')) {
        // Audio analysis with ElevenLabs
        analysisResults.audio = await processWithElevenLabs(uploadedFile);
        analysisResults.ai = await processWithOpenAI(analysisResults.audio.transcript || liveTranscript, 'audio_verification');
      } else if (fileType.startsWith('text/') || fileType.includes('pdf') || fileType.includes('document')) {
        // Text/document analysis
        const text = await extractTextFromFile(uploadedFile);
        analysisResults.ai = await processWithOpenAI(text, 'document_verification');
      } else {
        // General content analysis
        analysisResults.ai = await processWithOpenAI(`File: ${uploadedFile.name}`, 'general');
      }

      // Stage 3: Blockchain Verification
      setProcessingStage('Creating blockchain verification...');
      setAnalysisProgress(70);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      analysisResults.blockchain = await verifyWithAlgorand(analysisResults);

      // Stage 4: Generating Report
      setProcessingStage('Generating comprehensive report...');
      setAnalysisProgress(90);
      await new Promise(resolve => setTimeout(resolve, 800));

      // Store verification in database
      if (user) {
        const { data, error } = await supabase
          .from('verifications')
          .insert([{
            user_id: user.id,
            file_name: uploadedFile.name,
            file_type: fileType,
            file_size: uploadedFile.size,
            analysis_results: analysisResults,
            status: analysisResults.ai.confidence > 0.8 ? 'verified' : 'flagged',
            confidence_score: analysisResults.ai.confidence || 0.5,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) throw error;
      }

      setAnalysisProgress(100);
      setVerificationResult(analysisResults);

      toast({
        title: "Verification Complete",
        description: `Analysis completed with ${Math.round((analysisResults.ai.confidence || 0.5) * 100)}% confidence`,
        variant: "success"
      });

    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Failed",
        description: "An error occurred during analysis. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProcessingStage('');
      setAnalysisProgress(0);
    }
  };

  const extractTextFromFile = async (file) => {
    if (file.type === 'text/plain') {
      return await file.text();
    }
    // For other file types, return metadata
    return `File: ${file.name}, Size: ${file.size} bytes, Type: ${file.type}`;
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getVerificationStatus = () => {
    if (!verificationResult) return null;
    
    const confidence = verificationResult.ai?.confidence || 0;
    if (confidence > 0.9) return { 
      status: 'verified', 
      color: 'green', 
      icon: CheckCircle,
      label: 'Verified',
      description: 'High confidence in authenticity'
    };
    if (confidence > 0.7) return { 
      status: 'review', 
      color: 'yellow', 
      icon: Clock,
      label: 'Needs Review',
      description: 'Moderate confidence, manual review recommended'
    };
    return { 
      status: 'flagged', 
      color: 'red', 
      icon: AlertTriangle,
      label: 'Flagged',
      description: 'Low confidence, potential issues detected'
    };
  };

  const downloadReport = () => {
    if (!verificationResult) return;
    
    const report = {
      file: {
        name: uploadedFile.name,
        size: uploadedFile.size,
        type: uploadedFile.type
      },
      analysis: verificationResult,
      timestamp: new Date().toISOString(),
      user: user?.email || 'Anonymous'
    };
    
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `verification-report-${uploadedFile.name}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Report Downloaded",
      description: "Verification report has been saved",
      variant: "success"
    });
  };

  const tabs = [
    { id: 'upload', label: 'Upload File', icon: Upload, description: 'Upload any file for verification' },
    { id: 'record', label: 'Record Audio', icon: Mic, description: 'Record audio with live transcription' },
    { id: 'text', label: 'Text Analysis', icon: FileText, description: 'Analyze text content directly' }
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
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center gap-3 p-4 glassmorphic rounded-2xl"
        >
          <Shield className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Truth Verification
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Advanced AI-powered content analysis and verification
            </p>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'glassmorphic text-gray-700 dark:text-gray-300 hover:bg-white/20'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">{tab.label}</div>
                <div className="text-xs opacity-80">{tab.description}</div>
              </div>
            </motion.button>
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
              className="glassmorphic p-8 rounded-2xl"
            >
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {isDragActive ? 'Drop files here' : 'Upload files for verification'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Supports video, audio, text, and image files up to 100MB
                </p>
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  {['MP4', 'MP3', 'PDF', 'JPG', 'PNG', 'TXT'].map(format => (
                    <span key={format} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                      {format}
                    </span>
                  ))}
                </div>
                <button className="btn-primary">
                  Choose Files
                </button>
              </div>
              
              {uploadedFile && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-green-800 dark:text-green-200">
                        {uploadedFile.name}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-300">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • {uploadedFile.type}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Audio Recording */}
          {activeTab === 'record' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glassmorphic p-8 rounded-2xl"
            >
              <div className="text-center space-y-6">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  High-Quality Audio Recording
                </h3>
                
                {/* Audio Level Visualization */}
                {isRecording && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Audio Level:</span>
                      <div className="w-48 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-100"
                          style={{ width: `${audioLevel * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="text-3xl font-mono text-blue-600 dark:text-blue-400 font-bold">
                      {formatDuration(recordingDuration)}
                    </div>
                    
                    {liveTranscript && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 text-left"
                      >
                        <p className="text-sm text-blue-600 dark:text-blue-300 mb-2 font-semibold">Live Transcript:</p>
                        <p className="text-gray-900 dark:text-white">
                          {liveTranscript}
                        </p>
                      </motion.div>
                    )}
                  </div>
                )}
                
                <div className="flex justify-center">
                  {!isRecording ? (
                    <motion.button
                      onClick={startRecording}
                      className="w-24 h-24 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-lg hover:shadow-xl"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Mic className="h-10 w-10" />
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={stopRecording}
                      className="w-24 h-24 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-lg hover:shadow-xl"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Square className="h-10 w-10" />
                    </motion.button>
                  )}
                </div>
                
                <p className="text-gray-600 dark:text-gray-300">
                  {isRecording ? 'Recording with live transcription...' : 'Click to start high-quality recording'}
                </p>
              </div>
            </motion.div>
          )}

          {/* Text Analysis */}
          {activeTab === 'text' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glassmorphic p-8 rounded-2xl"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Direct Text Analysis
              </h3>
              <textarea
                placeholder="Paste your text content here for analysis..."
                className="w-full h-48 p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                onChange={(e) => {
                  const text = e.target.value;
                  if (text.trim()) {
                    const textBlob = new Blob([text], { type: 'text/plain' });
                    setUploadedFile(new File([textBlob], 'text-input.txt', { type: 'text/plain' }));
                  }
                }}
              />
            </motion.div>
          )}

          {/* Process Button */}
          <motion.button
            onClick={processVerification}
            disabled={!uploadedFile || isProcessing}
            className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            whileHover={{ scale: !uploadedFile || isProcessing ? 1 : 1.02 }}
            whileTap={{ scale: !uploadedFile || isProcessing ? 1 : 0.98 }}
          >
            {isProcessing ? (
              <>
                <Loader className="w-6 h-6 animate-spin" />
                <div className="text-left">
                  <div>Processing...</div>
                  <div className="text-sm opacity-80">{processingStage}</div>
                </div>
              </>
            ) : (
              <>
                <Zap className="h-6 w-6" />
                Start Advanced Verification
              </>
            )}
          </motion.button>

          {/* Progress Bar */}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glassmorphic p-4 rounded-xl"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Analysis Progress</span>
                <span className="text-sm text-gray-500">{analysisProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${analysisProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>
          )}
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
              <div className="glassmorphic p-6 rounded-2xl">
                {(() => {
                  const status = getVerificationStatus();
                  const StatusIcon = status?.icon;
                  return (
                    <div className="text-center space-y-4">
                      <div className={`w-20 h-20 bg-gradient-to-r from-${status?.color}-500 to-${status?.color}-600 rounded-full flex items-center justify-center mx-auto`}>
                        <StatusIcon className="h-10 w-10 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {status?.label}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                          {status?.description}
                        </p>
                        <div className="mt-3">
                          <div className="flex items-center justify-center gap-2">
                            <Star className="h-5 w-5 text-yellow-500" />
                            <span className="text-lg font-semibold">
                              {Math.round((verificationResult.ai?.confidence || 0) * 100)}% Confidence
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Analysis Results */}
              <div className="glassmorphic p-6 rounded-2xl">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Brain className="h-6 w-6 text-blue-500" />
                  Detailed Analysis
                </h4>
                <div className="space-y-6">
                  {verificationResult.ai?.summary && (
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Summary
                      </h5>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {verificationResult.ai.summary}
                      </p>
                    </div>
                  )}
                  
                  {verificationResult.ai?.flags && verificationResult.ai.flags.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        Flags & Concerns
                      </h5>
                      <div className="space-y-2">
                        {verificationResult.ai.flags.map((flag, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <span className="text-gray-700 dark:text-gray-300">{flag}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {verificationResult.blockchain && (
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Hash className="h-4 w-4 text-green-500" />
                        Blockchain Verification
                      </h5>
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-3 mb-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-800 dark:text-green-200">
                            Cryptographically Secured
                          </span>
                        </div>
                        <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                          <div>Hash: {verificationResult.blockchain.hash?.substring(0, 16)}...</div>
                          <div>Block: #{verificationResult.blockchain.blockNumber}</div>
                          <div>Network: {verificationResult.blockchain.network}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button 
                  onClick={downloadReport}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Download className="h-5 w-5" />
                  Download Report
                </button>
                <button className="btn-secondary flex items-center justify-center gap-2">
                  <Eye className="h-5 w-5" />
                  View Certificate
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="glassmorphic p-12 rounded-2xl text-center">
              <Brain className="h-20 w-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                Ready for Analysis
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Upload a file, record audio, or input text to begin comprehensive verification
              </p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Shield className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <div className="font-medium">AI Analysis</div>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Hash className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <div className="font-medium">Blockchain Proof</div>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Star className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                  <div className="font-medium">Confidence Score</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default VerificationPage;