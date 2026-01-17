import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Clock, TrendingUp, Award, Download, Calendar, Activity, Target } from 'lucide-react';

/**
 * AnalyticsDashboard - Comprehensive analytics and insights
 * Real-time metrics, charts, and session analytics
 */
function AnalyticsDashboard({ sessionId, onClose }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalytics();
    
    // Refresh analytics every 30 seconds for real-time data
    const interval = setInterval(loadAnalytics, 30000);
    return () => clearInterval(interval);
  }, [sessionId, dateRange]);

  const loadAnalytics = async () => {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.start,
        endDate: dateRange.end
      });
      
      const url = sessionId 
        ? `/api/analytics/session/${sessionId}?${params}`
        : `/api/analytics/overview?${params}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format = 'pdf') => {
    try {
      const response = await fetch(`/api/analytics/export/${sessionId}?format=${format}`);
      const blob = await response.blob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-report-${Date.now()}.${format}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Fehler beim Exportieren des Berichts');
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b', '#10b981', '#ef4444'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Activity size={48} className="mx-auto mb-4 opacity-50" />
        <p>Keine Analysedaten verfügbar</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
          <p className="text-gray-400">
            {dateRange.start} bis {dateRange.end}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-2">
            <Calendar size={18} className="text-gray-400" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="bg-transparent text-white text-sm focus:outline-none"
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="bg-transparent text-white text-sm focus:outline-none"
            />
          </div>

          {/* Export Buttons */}
          <button
            onClick={() => exportReport('pdf')}
            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all flex items-center gap-2"
          >
            <Download size={18} />
            PDF
          </button>
          <button
            onClick={() => exportReport('csv')}
            className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all flex items-center gap-2"
          >
            <Download size={18} />
            CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {['overview', 'sessions', 'quizzes', 'interactions'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium transition-all ${
              activeTab === tab
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <Users size={24} className="text-purple-400" />
                <span className="text-xs text-gray-400">Real-time</span>
              </div>
              <p className="text-3xl font-bold text-white">{analytics.activeParticipants || 0}</p>
              <p className="text-sm text-gray-400">Aktive Teilnehmer</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp size={24} className="text-green-400" />
                <span className="text-xs text-green-400">+{analytics.engagementChange || 0}%</span>
              </div>
              <p className="text-3xl font-bold text-white">{analytics.avgEngagement || 0}%</p>
              <p className="text-sm text-gray-400">Durchschn. Engagement</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock size={24} className="text-blue-400" />
              </div>
              <p className="text-3xl font-bold text-white">
                {formatDuration(analytics.avgTimeSpent || 0)}
              </p>
              <p className="text-sm text-gray-400">Durchschn. Zeit</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <Award size={24} className="text-yellow-400" />
              </div>
              <p className="text-3xl font-bold text-white">{analytics.avgQuizScore || 0}%</p>
              <p className="text-sm text-gray-400">Durchschn. Quiz-Score</p>
            </div>
          </div>

          {/* Time Spent Per Submodule Chart */}
          {analytics.timePerSubmodule && analytics.timePerSubmodule.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Zeit pro Submodul</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.timePerSubmodule}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                    labelStyle={{ color: '#f1f5f9' }}
                  />
                  <Legend />
                  <Bar dataKey="avgTime" fill="#8b5cf6" name="Durchschn. Zeit (s)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Drop-off Points */}
          {analytics.dropOffPoints && analytics.dropOffPoints.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target size={20} className="text-red-400" />
                Drop-off Punkte
              </h3>
              <div className="space-y-3">
                {analytics.dropOffPoints.map((point, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{point.name}</p>
                      <p className="text-sm text-gray-400">{point.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-400">{point.dropOffRate}%</p>
                      <p className="text-xs text-gray-400">Abbruchrate</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          {/* Session Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <p className="text-sm text-gray-400 mb-2">Gesamt-Sitzungen</p>
              <p className="text-3xl font-bold text-white">{analytics.totalSessions || 0}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <p className="text-sm text-gray-400 mb-2">Einzigartige Teilnehmer</p>
              <p className="text-3xl font-bold text-white">{analytics.uniqueParticipants || 0}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <p className="text-sm text-gray-400 mb-2">Durchschn. Dauer</p>
              <p className="text-3xl font-bold text-white">
                {formatDuration(analytics.avgSessionDuration || 0)}
              </p>
            </div>
          </div>

          {/* Session Timeline */}
          {analytics.sessionTimeline && analytics.sessionTimeline.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Sitzungsverlauf</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.sessionTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                    labelStyle={{ color: '#f1f5f9' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="participants" stroke="#8b5cf6" name="Teilnehmer" />
                  <Line type="monotone" dataKey="duration" stroke="#ec4899" name="Dauer (min)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Quizzes Tab */}
      {activeTab === 'quizzes' && (
        <div className="space-y-6">
          {/* Quiz Performance */}
          {analytics.quizPerformance && analytics.quizPerformance.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quiz-Leistung</h3>
              <div className="space-y-3">
                {analytics.quizPerformance.map((quiz, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-medium">{quiz.title}</p>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        quiz.successRate >= 80 ? 'bg-green-500/20 text-green-400' :
                        quiz.successRate >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {quiz.successRate}% Erfolgsrate
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Teilnahmen</p>
                        <p className="text-white font-semibold">{quiz.attempts}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Durchschn. Zeit</p>
                        <p className="text-white font-semibold">{formatDuration(quiz.avgTime)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Durchschn. Score</p>
                        <p className="text-white font-semibold">{quiz.avgScore}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Score Distribution */}
          {analytics.scoreDistribution && analytics.scoreDistribution.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Score-Verteilung</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.scoreDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.scoreDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Interactions Tab */}
      {activeTab === 'interactions' && (
        <div className="space-y-6">
          {/* Interaction Heatmap */}
          {analytics.interactionHeatmap && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Interaktions-Heatmap</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Emoji-Reaktionen</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {analytics.interactionHeatmap.emojis || 0}
                  </p>
                </div>
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Poll-Teilnahmen</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {analytics.interactionHeatmap.polls || 0}
                  </p>
                </div>
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Word Cloud Beiträge</p>
                  <p className="text-2xl font-bold text-green-400">
                    {analytics.interactionHeatmap.wordclouds || 0}
                  </p>
                </div>
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Q&A Aktivität</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {analytics.interactionHeatmap.qa || 0}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Participation Rates */}
          {analytics.participationRates && analytics.participationRates.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Teilnahmequoten</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.participationRates}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                    labelStyle={{ color: '#f1f5f9' }}
                  />
                  <Legend />
                  <Bar dataKey="rate" fill="#06b6d4" name="Teilnahmequote (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AnalyticsDashboard;
