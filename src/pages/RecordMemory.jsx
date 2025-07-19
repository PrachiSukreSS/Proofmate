@@ .. @@
 import { supabase } from "../utils/supabaseClient";
 import { processTranscriptWithAI } from "../utils/aiProcessor";
-import { storeVerifiedMemory } from "../utils/blockchainVerification";
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
@@ .. @@
   const saveMemory = async () => {
     if (!summaryData) {
       toast({
         title: "Process First",
         description: "Please process the recording with AI first",
         variant: "destructive",
       });
       return;
     }
 
     if (!user) {
       toast({
         title: "Login Required",
         description: "Please log in to save memories",
         variant: "destructive",
       });
       return;
     }
 
     setIsSaving(true);
     try {
       const memoryData = {
         user_id: user.id,
         title: summaryData.title,
         transcript,
         summary: summaryData.summary,
         action_items: summaryData.actionItems || [],
         tags: summaryData.tags || [],
         priority: summaryData.priority || "medium",
         category: summaryData.category || context,
         sentiment: summaryData.sentiment || "neutral",
         due_date: summaryData.dueDate || null,
         word_count: wordCount,
         confidence: summaryData.confidence || confidence,
         audio_duration: recordingDuration,
         recording_quality: recordingQuality,
         created_at: new Date().toISOString(),
       };
 
       console.log("Saving memory data:", memoryData);
 
-      const result = await storeVerifiedMemory(memoryData);
+      const { data, error } = await supabase
+        .from("memories")
+        .insert([memoryData])
+        .select()
+        .single();
 
-      if (result && result.memory) {
+      if (error) throw error;
+
+      if (data) {
         toast({
           title: "Memory Saved Successfully",
-          description: "Your memory has been saved with blockchain verification",
+          description: "Your memory has been saved successfully",
           variant: "success"
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
 
         // Navigate to timeline after successful save
         setTimeout(() => {
           navigate("/timeline");
         }, 2000);
       } else {
         throw new Error("Failed to save memory - no result returned");
       }
     } catch (error) {
       console.error("Save error:", error);
       toast({
         title: "Save Failed",
         description: error.message || "Could not save memory. Please try again.",
         variant: "destructive",
       });
     } finally {
       setIsSaving(false);
     }
   };