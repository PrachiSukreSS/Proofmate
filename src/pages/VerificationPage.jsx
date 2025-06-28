import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { 
  Upload, 
  Mic, 
  FileText, 
  Shield, 
  Brain, 
  Zap,
  Square,
  CheckCircle,
  AlertTriangle,
  Download,
  Loader,
  Play,
  Pause
} from "lucide-react";
import { supabase } from "../utils/supabaseClient";
import { processWithOpenAI } from "../utils/openaiProcessor";
import { useToast } from "../hooks/use-toast";

const VerificationPage = ({ user }) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [processingStage, setProcessingStage] = useState('');
  
  const mediaRecorderRef = useRef(null);
  const intervalRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    };
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.webm'],
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
    onDropRejected: () => {
      toast({
        title: "Upload Failed",
        description: "File type not supported or file too large (max 100MB)",
        variant: "destructive"
      });
    }
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        setUploadedFile(new File([audioBlob], 'recording.wav', { type: 'audio/wav' }));
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingDuration(0);

      intervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      toast({
        title: "Recording Started",
        description: "Recording audio...",
        variant: "success"
      });

    } catch (error) {
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
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsRecording(false);
      
      toast({
        title: "Recording Stopped",
        description: `Recorded ${Math.floor(recordingDuration / 60)}:${(recordingDuration % 60).toString().padStart(2, '0')}`,
        variant: "success"
      });
    }
  };

  const processVerification = async () => {
    let contentToAnalyze = '';
    
    if (activeTab === 'text' && textInput.trim()) {
      contentToAnalyze = textInput;
    } else if (uploadedFile) {
      if (uploadedFile.type.startsWith('text/')) {
        contentToAnalyze = await uploadedFile.text();
      } else {
        contentToAnalyze = `File: ${uploadedFile.name}, Type: ${uploadedFile.type}, Size: ${uploadedFile.size} bytes`;
      }
    } else {
      toast({
        title: "No Content",
        description: "Please upload a file or enter text to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setVerificationResult(null);

    try {
      setProcessingStage('Analyzing content...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      setProcessingStage('Running AI verification...');
      const analysisResults = await processWithOpenAI(contentToAnalyze, 'general');

      setProcessingStage('Generating report...');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Store verification in database if user is logged in
      if (user) {
        const { error } = await supabase
          .from('verifications')
          .insert([{
            user_id: user.id,
            file_name: uploadedFile?.name || 'text-input',
            file_type: uploadedFile?.type || 'text/plain',
            file_size: uploadedFile?.size || contentToAnalyze.length,
            analysis_results: analysisResults,
            status: analysisResults.confidence > 0.8 ? 'verified' : 'flagged',
            confidence_score: analysisResults.confidence || 0.5,
            created_at: new Date().toISOString()
          }]);

        if (error) console.error('Database error:', error);
      }

      setVerificationResult(analysisResults);

      toast({
        title: "Verification Complete",
        description: `Analysis completed with ${Math.round((analysisResults.confidence || 0.5) * 100)}% confidence`,
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
      setProcessingStage('');
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getVerificationStatus = () => {
    if (!verificationResult) return null;
    
    const confidence = verificationResult.confidence || 0;
    if (confidence > 0.8) return { 
      status: 'verified', 
      color: 'green', 
      icon: CheckCircle,
      label: 'Verified',
      description: 'High confidence in authenticity'
    };
    if (confidence > 0.6) return { 
      status: 'review', 
      color: 'yellow', 
      icon: AlertTriangle,
      label: 'Needs Review',
      description: 'Moderate confidence'
    };
    return { 
      status: 'flagged', 
      color: 'red', 
      icon: AlertTriangle,
      label: 'Flagged',
      description: 'Low confidence, potential issues'
    };
  };

  const downloadReport = () => {
    if (!verificationResult) return;
    
    const report = {
      analysis: verificationResult,
      timestamp: new Date().toISOString(),
      user: user?.email || 'Anonymous'
    };
    
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `verification-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Report Downloaded",
      description: "Verification report saved",
      variant: "success"
    });
  };

  const tabs = [
    { id: 'upload', label: 'Upload File', icon: Upload },
    { id: 'record', label: 'Record Audio', icon: Mic },
    { id: 'text', label: 'Text Input', icon: FileText }
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
        <div className="inline-flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Content Verification
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              AI-powered truth verification and analysis
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="h-5 w-5" />
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
              className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg"
            >
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {isDragActive ? 'Drop files here' : 'Upload files for verification'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Supports video, audio, text, and image files up to 100MB
                </p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  Choose Files
                </button>
              </div>
              
              {uploadedFile && (
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-800 dark:text-green-200">
                        {uploadedFile.name}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-300">
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
              className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg"
            >
              <div className="text-center space-y-6">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Audio Recording
                </h3>
                
                {isRecording && (
                  <div className="text-3xl font-mono text-red-600 font-bold">
                    {formatDuration(recordingDuration)}
                  </div>
                )}
                
                <div className="flex justify-center">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="w-20 h-20 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-lg"
                    >
                      <Mic className="h-8 w-8" />
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="w-20 h-20 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-lg"
                    >
                      <Square className="h-8 w-8" />
                    </button>
                  )}
                </div>
                
                <p className="text-gray-600 dark:text-gray-300">
                  {isRecording ? 'Recording audio...' : 'Click to start recording'}
                </p>
              </div>
            </motion.div>
          )}

          {/* Text Input */}
          {activeTab === 'text' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Text Analysis
              </h3>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter text content for verification..."
                className="w-full h-48 p-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </motion.div>
          )}

          {/* Process Button */}
          <button
            onClick={processVerification}
            disabled={isProcessing || (!uploadedFile && !textInput.trim())}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 text-lg font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-3"
          >
            {isProcessing ? (
              <>
                <Loader className="w-6 h-6 animate-spin" />
                <div className="text-left">
                  <div>Processing...</div>
                  {processingStage && (
                    <div className="text-sm opacity-80">{processingStage}</div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Zap className="h-6 w-6" />
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
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                {(() => {
                  const status = getVerificationStatus();
                  const StatusIcon = status?.icon;
                  return (
                    <div className="text-center space-y-4">
                      <div className={`w-16 h-16 bg-${status?.color}-100 dark:bg-${status?.color}-900/20 rounded-full flex items-center justify-center mx-auto`}>
                        <StatusIcon className={`h-8 w-8 text-${status?.color}-600`} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {status?.label}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                          {status?.description}
                        </p>
                        <div className="mt-3">
                          <span className="text-lg font-semibold">
                            {Math.round((verificationResult.confidence || 0) * 100)}% Confidence
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Analysis Results */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Brain className="h-6 w-6 text-blue-600" />
                  Analysis Results
                </h4>
                <div className="space-y-4">
                  {verificationResult.summary && (
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Summary</h5>
                      <p className="text-gray-600 dark:text-gray-300">{verificationResult.summary}</p>
                    </div>
                  )}
                  
                  {verificationResult.flags && verificationResult.flags.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Flags</h5>
                      <div className="space-y-2">
                        {verificationResult.flags.map((flag, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            <span>{flag}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {verificationResult.recommendations && verificationResult.recommendations.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Recommendations</h5>
                      <ul className="space-y-1">
                        {verificationResult.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-gray-600 dark:text-gray-300">• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button 
                  onClick={downloadReport}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="h-5 w-5" />
                  Download Report
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl shadow-lg text-center">
              <Brain className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                Ready for Analysis
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Upload a file, record audio, or input text to begin verification
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default VerificationPage;