import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  BarChart3,
  FileText,
  Video,
  Mic,
  Plus,
  Filter,
  Download,
  RefreshCw,
  Users,
  Activity
} from "lucide-react";
import { supabase } from "../utils/supabaseClient";
import { useToast } from "../hooks/use-toast";
import InteractiveCard3D from "../components/ui/InteractiveCard3D";

const DashboardPage = ({ user }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalVerifications: 0,
    successRate: 0,
    pendingReviews: 0,
    sdgImpact: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [verificationTrends, setVerificationTrends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadDashboardData();
  }, [user, navigate]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load user verifications
      const { data: verifications, error } = await supabase
        .from('verifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate stats
      const total = verifications?.length || 0;
      const successful = verifications?.filter(v => v.status === 'verified').length || 0;
      const pending = verifications?.filter(v => v.status === 'pending').length || 0;
      
      setStats({
        totalVerifications: total,
        successRate: total > 0 ? Math.round((successful / total) * 100) : 0,
        pendingReviews: pending,
        sdgImpact: Math.round(Math.random() * 10 * 10) / 10 // Mock SDG impact
      });

      // Set recent activity
      setRecentActivity(verifications?.slice(0, 5) || []);

      // Generate trend data
      const trendData = generateTrendData(verifications || []);
      setVerificationTrends(trendData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateTrendData = (verifications) => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayVerifications = verifications.filter(v => {
        const vDate = new Date(v.created_at);
        return vDate.toDateString() === date.toDateString();
      });
      
      last7Days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        verifications: dayVerifications.length,
        successful: dayVerifications.filter(v => v.status === 'verified').length
      });
    }
    return last7Days;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
    toast({
      title: "Dashboard Refreshed",
      description: "Data has been updated successfully",
      variant: "success"
    });
  };

  const statCards = [
    {
      title: "Total Verifications",
      value: stats.totalVerifications,
      icon: Shield,
      color: "from-primary-500 to-primary-600",
      bgColor: "bg-primary-50 dark:bg-primary-900/20",
      description: "Content items verified"
    },
    {
      title: "Success Rate",
      value: `${stats.successRate}%`,
      icon: CheckCircle,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      description: "Verification accuracy"
    },
    {
      title: "Pending Reviews",
      value: stats.pendingReviews,
      icon: Clock,
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      description: "Awaiting analysis"
    },
    {
      title: "SDG Impact Score",
      value: stats.sdgImpact,
      icon: TrendingUp,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      description: "Sustainability contribution"
    }
  ];

  const quickActions = [
    {
      title: "New Verification",
      description: "Start a new truth verification process",
      icon: Plus,
      action: () => navigate('/verify'),
      color: "from-primary-500 to-primary-600"
    },
    {
      title: "View Analytics",
      description: "Detailed analytics and insights",
      icon: BarChart3,
      action: () => navigate('/analytics'),
      color: "from-accent-500 to-accent-600"
    },
    {
      title: "Generate Report",
      description: "Create automated impact report",
      icon: FileText,
      action: () => generateReport(),
      color: "from-green-500 to-green-600"
    }
  ];

  const generateReport = async () => {
    toast({
      title: "Generating Report",
      description: "Your impact report is being generated...",
    });
    
    // Simulate report generation
    setTimeout(() => {
      toast({
        title: "Report Ready",
        description: "Your impact report has been generated successfully",
        variant: "success"
      });
    }, 2000);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6">
          <Shield className="h-16 w-16 text-primary-500 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Please log in to access your dashboard
          </p>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Welcome back, {user.email}
          </p>
        </div>
        <div className="flex gap-3 mt-6 md:mt-0">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            onClick={generateReport}
            className="btn-primary flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <InteractiveCard3D
                className="h-full"
                glowEffect={true}
                intensity={8}
              >
                <div className={`card p-6 h-full ${stat.bgColor}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {stat.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {stat.description}
                    </p>
                  </div>
                </div>
              </InteractiveCard3D>
            </motion.div>
          );
        })}
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Verification Trends */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <InteractiveCard3D glowEffect={true}>
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Verification Trends
              </h3>
              <div className="space-y-4">
                {verificationTrends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                      <span className="text-sm font-medium">{trend.date}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {trend.verifications} total
                      </span>
                      <span className="text-sm text-green-600">
                        {trend.successful} verified
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </InteractiveCard3D>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <InteractiveCard3D glowEffect={true}>
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Recent Activity
              </h3>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.status === 'verified' ? 'bg-green-100 dark:bg-green-900/20' :
                        activity.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                        'bg-red-100 dark:bg-red-900/20'
                      }`}>
                        {activity.file_type?.startsWith('video') ? <Video className="h-4 w-4" /> :
                         activity.file_type?.startsWith('audio') ? <Mic className="h-4 w-4" /> :
                         <FileText className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.file_name || `${activity.file_type} verification`}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        activity.status === 'verified' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200' :
                        activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                      }`}>
                        {activity.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No recent activity. Start your first verification!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </InteractiveCard3D>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <InteractiveCard3D glowEffect={true}>
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={action.action}
                    className="p-6 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {action.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </InteractiveCard3D>
      </motion.div>
    </div>
  );
};

export default DashboardPage;