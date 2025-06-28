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
  Download
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from "../utils/supabaseClient";
import { useToast } from "../hooks/use-toast";

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

  const statCards = [
    {
      title: "Total Verifications",
      value: stats.totalVerifications,
      icon: Shield,
      color: "from-primary-500 to-primary-600",
      bgColor: "bg-primary-50 dark:bg-primary-900/20"
    },
    {
      title: "Success Rate",
      value: `${stats.successRate}%`,
      icon: CheckCircle,
      color: "from-success-500 to-success-600",
      bgColor: "bg-success-50 dark:bg-success-900/20"
    },
    {
      title: "Pending Reviews",
      value: stats.pendingReviews,
      icon: Clock,
      color: "from-accent-500 to-accent-600",
      bgColor: "bg-accent-50 dark:bg-accent-900/20"
    },
    {
      title: "SDG Impact Score",
      value: stats.sdgImpact,
      icon: TrendingUp,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
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
      color: "from-success-500 to-success-600"
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
        <div className="text-center space-y-4">
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
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Welcome back, {user.email}
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <button className="btn-secondary flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
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
              className={`card p-6 ${stat.bgColor}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
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
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Verification Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={verificationTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="verifications" 
                stroke="#2563eb" 
                strokeWidth={2}
                dot={{ fill: '#2563eb' }}
              />
              <Line 
                type="monotone" 
                dataKey="successful" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.status === 'verified' ? 'bg-success-100 dark:bg-success-900/20' :
                    activity.status === 'pending' ? 'bg-accent-100 dark:bg-accent-900/20' :
                    'bg-error-100 dark:bg-error-900/20'
                  }`}>
                    {activity.type === 'video' ? <Video className="h-4 w-4" /> :
                     activity.type === 'audio' ? <Mic className="h-4 w-4" /> :
                     <FileText className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.title || `${activity.type} verification`}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    activity.status === 'verified' ? 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-200' :
                    activity.status === 'pending' ? 'bg-accent-100 text-accent-800 dark:bg-accent-900/20 dark:text-accent-200' :
                    'bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-200'
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
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.action}
                className="p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-all duration-200 text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
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
      </motion.div>
    </motion.div>
  );
};

export default DashboardPage;