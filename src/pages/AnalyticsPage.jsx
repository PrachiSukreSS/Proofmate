import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Users,
  Shield,
  Activity,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle,
  AlertTriangle,
  Clock,
  Target,
  Zap,
  FileText,
} from "lucide-react";
import { supabase } from "../utils/supabaseClient";
import { useToast } from "../hooks/use-toast";

const AnalyticsPage = ({ user }) => {
  const [analytics, setAnalytics] = useState({
    totalVerifications: 0,
    successfulVerifications: 0,
    flaggedContent: 0,
    averageConfidence: 0,
    monthlyGrowth: 0,
    topCategories: [],
    recentActivity: [],
    performanceMetrics: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, timeRange]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      // Load verification analytics
      const { data: verifications, error: verificationError } = await supabase
        .from("verifications")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", getTimeRangeDate(timeRange));

      if (verificationError) throw verificationError;

      // Load memories analytics
      const { data: memories, error: memoriesError } = await supabase
        .from("memories")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", getTimeRangeDate(timeRange));

      if (memoriesError) throw memoriesError;

      // Calculate analytics
      const totalVerifications = verifications?.length || 0;
      const successfulVerifications =
        verifications?.filter((v) => v.status === "verified").length || 0;
      const flaggedContent =
        verifications?.filter((v) => v.status === "flagged").length || 0;
      const averageConfidence =
        verifications?.reduce((sum, v) => sum + (v.confidence_score || 0), 0) /
          totalVerifications || 0;

      // Calculate category distribution
      const categoryCount = {};
      memories?.forEach((memory) => {
        const category = memory.category || "general";
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });

      const topCategories = Object.entries(categoryCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([category, count]) => ({ category, count }));

      // Recent activity
      const recentActivity = [
        ...(verifications?.slice(0, 5).map((v) => ({
          type: "verification",
          title: `Verified: ${v.file_name}`,
          timestamp: v.created_at,
          status: v.status,
        })) || []),
        ...(memories?.slice(0, 5).map((m) => ({
          type: "memory",
          title: m.title,
          timestamp: m.created_at,
          status: "completed",
        })) || []),
      ]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10);

      setAnalytics({
        totalVerifications,
        successfulVerifications,
        flaggedContent,
        averageConfidence,
        monthlyGrowth: calculateGrowth(verifications),
        topCategories,
        recentActivity,
        performanceMetrics: {
          totalMemories: memories?.length || 0,
          totalActionItems:
            memories?.reduce(
              (sum, m) => sum + (m.action_items?.length || 0),
              0
            ) || 0,
          averageWordsPerMemory:
            memories?.reduce((sum, m) => sum + (m.word_count || 0), 0) /
              (memories?.length || 1) || 0,
        },
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
      toast({
        title: "Analytics Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAnalytics();
    setIsRefreshing(false);
    toast({
      title: "Analytics Refreshed",
      description: "Data has been updated successfully",
    });
  };

  const exportAnalytics = () => {
    const exportData = {
      analytics,
      exportDate: new Date().toISOString(),
      timeRange,
      user: user.email,
    };

    // Create a formatted document instead of JSON
    const content = `
PROOFMATE ANALYTICS REPORT
Generated: ${new Date().toLocaleDateString()}
User: ${user.email}
Time Range: ${timeRange}

=== OVERVIEW ===
Total Verifications: ${analytics.totalVerifications}
Successful Verifications: ${analytics.successfulVerifications}
Flagged Content: ${analytics.flaggedContent}
Average Confidence: ${Math.round(analytics.averageConfidence * 100)}%
Monthly Growth: ${analytics.monthlyGrowth.toFixed(1)}%

=== PERFORMANCE METRICS ===
Total Memories: ${analytics.performanceMetrics.totalMemories}
Total Action Items: ${analytics.performanceMetrics.totalActionItems}
Average Words per Memory: ${Math.round(analytics.performanceMetrics.averageWordsPerMemory)}

=== TOP CATEGORIES ===
${analytics.topCategories.map((cat, i) => `${i + 1}. ${cat.category}: ${cat.count}`).join('\n')}

=== RECENT ACTIVITY ===
${analytics.recentActivity.map((activity, i) => 
  `${i + 1}. ${activity.title} (${new Date(activity.timestamp).toLocaleDateString()})`
).join('\n')}

Generated by ProofMate Analytics
    `;

    const dataBlob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `proofmate-analytics-${timeRange}-${
      new Date().toISOString().split("T")[0]
    }.txt`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Analytics Exported",
      description: "Analytics report has been downloaded as a document",
    });
  };

  const getTimeRangeDate = (range) => {
    const now = new Date();
    const days = parseInt(range.replace("d", ""));
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
  };

  const calculateGrowth = (data) => {
    if (!data || data.length === 0) return 0;
    const now = new Date();
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const thisMonth = data.filter(
      (item) => new Date(item.created_at) > lastMonth
    ).length;
    const previousMonth = data.filter(
      (item) =>
        new Date(item.created_at) <= lastMonth &&
        new Date(item.created_at) >
          new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
    ).length;
    return previousMonth > 0 ? ((thisMonth - previousMonth) / previousMonth) * 100 : 0;
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const StatCard = ({ icon: Icon, title, value, change, color = "blue" }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatNumber(value)}
          </p>
          {change !== undefined && (
            <p
              className={`text-sm ${
                change >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {change >= 0 ? "+" : ""}
              {change.toFixed(1)}% from last month
            </p>
          )}
        </div>
        <div
          className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/20`}
        >
          <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
      </div>
    </motion.div>
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please log in to view analytics
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Insights into your verification and memory data
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="365d">Last year</option>
            </select>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </button>
            <button
              onClick={exportAnalytics}
              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Shield}
            title="Total Verifications"
            value={analytics.totalVerifications}
            change={analytics.monthlyGrowth}
            color="blue"
          />
          <StatCard
            icon={CheckCircle}
            title="Successful Verifications"
            value={analytics.successfulVerifications}
            color="green"
          />
          <StatCard
            icon={AlertTriangle}
            title="Flagged Content"
            value={analytics.flaggedContent}
            color="red"
          />
          <StatCard
            icon={TrendingUp}
            title="Average Confidence"
            value={`${(analytics.averageConfidence * 100).toFixed(1)}%`}
            color="purple"
          />
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            icon={Target}
            title="Total Memories"
            value={analytics.performanceMetrics.totalMemories}
            color="indigo"
          />
          <StatCard
            icon={Zap}
            title="Action Items Created"
            value={analytics.performanceMetrics.totalActionItems}
            color="yellow"
          />
          <StatCard
            icon={BarChart3}
            title="Avg Words/Memory"
            value={Math.round(analytics.performanceMetrics.averageWordsPerMemory)}
            color="pink"
          />
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Categories */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Top Categories
            </h3>
            <div className="space-y-3">
              {analytics.topCategories.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {index + 1}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {category.category}
                    </span>
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">
                    {category.count}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {analytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className={`p-2 rounded-full ${
                    activity.type === "verification" 
                      ? "bg-blue-100 dark:bg-blue-900/20" 
                      : "bg-green-100 dark:bg-green-900/20"
                  }`}>
                    {activity.type === "verification" ? (
                      <Shield className={`h-4 w-4 ${
                        activity.type === "verification" 
                          ? "text-blue-600 dark:text-blue-400" 
                          : "text-green-600 dark:text-green-400"
                      }`} />
                    ) : (
                      <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activity.status === "verified" || activity.status === "completed"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                      : activity.status === "flagged"
                      ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                  }`}>
                    {activity.status}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;