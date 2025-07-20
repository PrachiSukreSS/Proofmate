import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Calendar,
  Mic,
  Settings,
  Edit3,
  Save,
  X,
  Shield,
  Brain,
  Target,
  Clock,
  BarChart3,
  TrendingUp,
  Award,
  Star,
  Download,
  Upload,
  RefreshCw,
  Bell,
  Volume2,
  Zap,
  Database,
} from "lucide-react";
import { supabase } from "../utils/supabaseClient";
import { useToast } from "../hooks/use-toast";

const ProfilePage = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    username: "",
    email: user?.email || "",
    bio: "",
    avatar_url: "",
    preferences: {
      notifications: true,
      autoSave: false,
      highQuality: true,
      noiseReduction: true,
      theme: "light",
    },
  });
  const [editedProfile, setEditedProfile] = useState(profile);
  const [stats, setStats] = useState({
    totalRecordings: 0,
    totalDuration: 0,
    totalWords: 0,
    averageConfidence: 0,
    actionItemsCreated: 0,
    memoriesThisWeek: 0,
    streakDays: 0,
    favoriteCategory: "general",
  });
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Use demo user if no user provided
    const currentUser = user || { id: 'demo-user', email: 'demo@proofmate.ai' };
    loadProfile();
    loadStats();
    loadAchievements();
  }, [user]);

  const loadProfile = async () => {
    try {
      const currentUser = user || { id: 'demo-user', email: 'demo@proofmate.ai' };
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*") 
        .eq("user_id", currentUser.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setProfile({
          username: data.username || "Demo User",
          email: currentUser.email,
          bio: data.bio || "",
          avatar_url: data.avatar_url || "",
          preferences: data.preferences || profile.preferences,
        });
        setEditedProfile({
          username: data.username || "",
          email: user.email,
          bio: data.bio || "",
          avatar_url: data.avatar_url || "",
          preferences: data.preferences || profile.preferences,
        });
      } else {
        // Create default profile
        const defaultProfile = {
          user_id: currentUser.id,
          username: currentUser.email.split("@")[0],
          bio: "",
          preferences: profile.preferences,
        };

        await supabase.from("user_profiles").insert([defaultProfile]);
        setProfile((prev) => ({ ...prev, username: defaultProfile.username }));
        setEditedProfile((prev) => ({
          ...prev,
          username: defaultProfile.username,
        }));
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const currentUser = user || { id: 'demo-user', email: 'demo@proofmate.ai' };
      const { data: memories, error } = await supabase
        .from("memories")
        .select("*")
        .eq("user_id", currentUser.id);

      if (error) throw error;

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const totalDuration = memories.reduce(
        (sum, m) => sum + (m.audio_duration || 0),
        0
      );
      const totalWords = memories.reduce(
        (sum, m) => sum + (m.word_count || 0),
        0
      );
      const totalConfidence = memories.reduce(
        (sum, m) => sum + (m.confidence || 0),
        0
      );
      const actionItems = memories.reduce(
        (sum, m) => sum + (m.action_items?.length || 0),
        0
      );
      const memoriesThisWeek = memories.filter(
        (m) => new Date(m.created_at) > weekAgo
      ).length;

      // Calculate category distribution
      const categoryCount = {};
      memories.forEach((m) => {
        const cat = m.category || "general";
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });
      const favoriteCategory = Object.keys(categoryCount).reduce(
        (a, b) => (categoryCount[a] > categoryCount[b] ? a : b),
        "general"
      );

      setStats({
        totalRecordings: memories.length,
        totalDuration,
        totalWords,
        averageConfidence:
          memories.length > 0 ? totalConfidence / memories.length : 0,
        actionItemsCreated: actionItems,
        memoriesThisWeek,
        streakDays: calculateStreak(memories),
        favoriteCategory,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const calculateStreak = (memories) => {
    if (memories.length === 0) return 0;

    const dates = memories
      .map((m) => new Date(m.created_at).toDateString())
      .sort();
    const uniqueDates = [...new Set(dates)].sort();

    let streak = 0;
    const today = new Date().toDateString();

    for (let i = uniqueDates.length - 1; i >= 0; i--) {
      const date = new Date(uniqueDates[i]);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - streak);

      if (date.toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const loadAchievements = async () => {
    // Mock achievements based on stats
    const mockAchievements = [
      {
        id: 1,
        title: "First Steps",
        description: "Created your first memory",
        icon: "🎯",
        unlocked: stats.totalRecordings > 0,
      },
      {
        id: 2,
        title: "Productive Week",
        description: "Created 5 memories in one week",
        icon: "📈",
        unlocked: stats.memoriesThisWeek >= 5,
      },
      {
        id: 3,
        title: "Action Hero",
        description: "Generated 50 action items",
        icon: "⚡",
        unlocked: stats.actionItemsCreated >= 50,
      },
      {
        id: 4,
        title: "Consistency King",
        description: "7-day recording streak",
        icon: "🔥",
        unlocked: stats.streakDays >= 7,
      },
      {
        id: 5,
        title: "Word Master",
        description: "Recorded 10,000 words",
        icon: "📝",
        unlocked: stats.totalWords >= 10000,
      },
    ];

    setAchievements(mockAchievements);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.from("user_profiles").upsert({
        user_id: user.id,
        username: editedProfile.username,
        bio: editedProfile.bio,
        avatar_url: editedProfile.avatar_url,
        preferences: editedProfile.preferences,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      setProfile(editedProfile);
      setIsEditing(false);

      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Save Failed",
        description: "Could not save profile changes",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const exportData = async () => {
    try {
      const { data: memories, error } = await supabase
        .from("memories")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      const exportData = {
        profile,
        stats,
        memories,
        exportDate: new Date().toISOString(),
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `proofmate-data-${
        new Date().toISOString().split("T")[0]
      }.json`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Data Exported",
        description: "Your complete data has been downloaded",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "Could not export data",
        variant: "destructive",
      });
    }
  };

  const statCards = [
    {
      icon: Mic,
      label: "Total Recordings",
      value: stats.totalRecordings.toString(),
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      icon: Clock,
      label: "Total Duration",
      value: formatDuration(stats.totalDuration),
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    {
      icon: Target,
      label: "Action Items",
      value: stats.actionItemsCreated.toString(),
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      icon: Brain,
      label: "Avg Confidence",
      value: `${Math.round(stats.averageConfidence * 100)}%`,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      icon: TrendingUp,
      label: "This Week",
      value: stats.memoriesThisWeek.toString(),
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      icon: Award,
      label: "Streak Days",
      value: stats.streakDays.toString(),
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-slate-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center md:text-left">
        <h1
          className="text-4xl md:text-5xl font-bold text-slate-800 mb-4"
          style={{
            fontFamily: '"Nunito", "Inter", system-ui, sans-serif',
            fontWeight: "800",
            letterSpacing: "-0.02em",
          }}
        >
          Your Profile
        </h1>
        <p className="text-lg text-slate-700">
          Manage your account settings and view your recording analytics
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-2">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-purple-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 h-32 relative">
              <div className="absolute -bottom-12 left-8">
                <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-slate-400" />
                  )}
                </div>
              </div>
              <div className="absolute top-4 right-4">
                {isEditing ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 text-white disabled:opacity-50"
                    >
                      {isSaving ? (
                        <RefreshCw className="h-5 w-5 animate-spin" />
                      ) : (
                        <Save className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 text-white"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 text-white"
                  >
                    <Edit3 className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            <div className="pt-16 pb-8 px-8 space-y-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={editedProfile.username}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          username: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-white/70 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      value={editedProfile.bio}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          bio: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-4 py-2 bg-white/70 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Avatar URL
                    </label>
                    <input
                      type="url"
                      value={editedProfile.avatar_url}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          avatar_url: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-white/70 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <h2
                    className="text-2xl font-bold text-slate-800"
                    style={{
                      fontFamily: '"Nunito", "Inter", system-ui, sans-serif',
                      fontWeight: "800",
                    }}
                  >
                    {profile.username || "Anonymous User"}
                  </h2>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="h-4 w-4" />
                    {profile.email}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="h-4 w-4" />
                    Member since{" "}
                    {new Date(
                      user?.created_at || Date.now()
                    ).toLocaleDateString()}
                  </div>
                  {profile.bio && (
                    <p className="text-slate-600 mt-4">{profile.bio}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border-2 border-purple-200 mt-6">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="h-6 w-6 text-slate-600" />
              <h3 className="text-xl font-semibold text-slate-800">
                Preferences
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-slate-700">
                  Recording Settings
                </h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={editedProfile.preferences.autoSave}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          preferences: {
                            ...editedProfile.preferences,
                            autoSave: e.target.checked,
                          },
                        })
                      }
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm text-slate-600">
                      Auto-save recordings
                    </span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={editedProfile.preferences.highQuality}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          preferences: {
                            ...editedProfile.preferences,
                            highQuality: e.target.checked,
                          },
                        })
                      }
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm text-slate-600">
                      High quality audio
                    </span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={editedProfile.preferences.noiseReduction}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          preferences: {
                            ...editedProfile.preferences,
                            noiseReduction: e.target.checked,
                          },
                        })
                      }
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm text-slate-600">
                      Noise cancellation
                    </span>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-slate-700">Notifications</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={editedProfile.preferences.notifications}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          preferences: {
                            ...editedProfile.preferences,
                            notifications: e.target.checked,
                          },
                        })
                      }
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm text-slate-600">
                      Email notifications
                    </span>
                  </label>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Theme
                    </label>
                    <select
                      value={editedProfile.preferences.theme}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          preferences: {
                            ...editedProfile.preferences,
                            theme: e.target.value,
                          },
                        })
                      }
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-purple-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={exportData}
                className="w-full flex items-center gap-2 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Download className="h-4 w-4" />
                Export Data
              </button>
              <button
                onClick={() => loadStats()}
                className="w-full flex items-center gap-2 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Stats
              </button>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-purple-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Achievements
            </h3>
            <div className="space-y-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-3 rounded-lg border-2 ${
                    achievement.unlocked
                      ? "border-yellow-200 bg-yellow-50"
                      : "border-slate-200 bg-slate-50 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div>
                      <h4 className="font-medium text-slate-800">
                        {achievement.title}
                      </h4>
                      <p className="text-xs text-slate-600">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-purple-200"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">
                    {stat.value}
                  </p>
                  <p className="text-sm text-slate-600">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Overview */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border-2 border-purple-200">
        <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-purple-600" />
          Analytics Overview
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-slate-700">Recording Patterns</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">
                  Favorite Category
                </span>
                <span className="font-medium text-slate-800 capitalize">
                  {stats.favoriteCategory}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">
                  Average Words per Memory
                </span>
                <span className="font-medium text-slate-800">
                  {stats.totalRecordings > 0
                    ? Math.round(stats.totalWords / stats.totalRecordings)
                    : 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Average Duration</span>
                <span className="font-medium text-slate-800">
                  {stats.totalRecordings > 0
                    ? formatDuration(
                        stats.totalDuration / stats.totalRecordings
                      )
                    : "0m"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-slate-700">Productivity Metrics</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">
                  Action Items per Memory
                </span>
                <span className="font-medium text-slate-800">
                  {stats.totalRecordings > 0
                    ? (
                        stats.actionItemsCreated / stats.totalRecordings
                      ).toFixed(1)
                    : 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Weekly Activity</span>
                <span className="font-medium text-slate-800">
                  {stats.memoriesThisWeek} memories
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Current Streak</span>
                <span className="font-medium text-slate-800">
                  {stats.streakDays} days
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
