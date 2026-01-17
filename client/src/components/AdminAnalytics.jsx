import { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, Map, FileText, Trophy } from 'lucide-react';
import api from '../services/api';
import InteractionHeatmap from './InteractionHeatmap';
import PDFReportGenerator from './PDFReportGenerator';
import Leaderboard from './Leaderboard';

function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState('1 hour');
  const [moodData, setMoodData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      const result = await api.getAdminMoodAnalytics(timeRange);
      if (result.success) {
        setMoodData(result.data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const moodCounts = moodData.reduce((acc, item) => {
    acc[item.mood] = (acc[item.mood] || 0) + item.count;
    return acc;
  }, {});

  const totalMoods = Object.values(moodCounts).reduce((a, b) => a + b, 0);

  const moodColors = {
    confused: 'from-red-500 to-orange-500',
    thinking: 'from-yellow-500 to-orange-500',
    aha: 'from-blue-500 to-cyan-500',
    wow: 'from-purple-500 to-pink-500'
  };

  const moodLabels = {
    confused: 'Verwirrt 😕',
    thinking: 'Nachdenklich 🤔',
    aha: 'Aha! 💡',
    wow: 'Wow! 🤩'
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'heatmap', label: 'Interaction Heatmap', icon: Map },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'reports', label: 'Reports', icon: FileText }
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Icon size={18} />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Analytics</h2>
          <p className="text-gray-400">Mood tracking and engagement metrics</p>
        </div>

        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="1 hour">Last Hour</option>
          <option value="6 hours">Last 6 Hours</option>
          <option value="24 hours">Last 24 Hours</option>
          <option value="7 days">Last 7 Days</option>
        </select>
      </div>

      {loading ? (
        <div className="text-white text-center py-12">Loading analytics...</div>
      ) : (
        <>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 size={20} />
              Mood Distribution
            </h3>

            <div className="space-y-4">
              {Object.entries(moodCounts).map(([mood, count]) => {
                const percentage = totalMoods > 0 ? (count / totalMoods) * 100 : 0;
                
                return (
                  <div key={mood}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{moodLabels[mood]}</span>
                      <span className="text-gray-400 text-sm">
                        {count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${moodColors[mood]} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              {totalMoods === 0 && (
                <div className="text-center text-gray-400 py-8">
                  <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No mood data for this time range</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Total Moods</h3>
              <div className="text-4xl font-bold text-cyan-400">{totalMoods}</div>
              <p className="text-sm text-gray-400 mt-2">in {timeRange}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Most Common</h3>
              {totalMoods > 0 ? (
                <>
                  <div className="text-4xl font-bold text-purple-400">
                    {moodLabels[Object.keys(moodCounts).reduce((a, b) => 
                      moodCounts[a] > moodCounts[b] ? a : b
                    )]}
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    {Math.max(...Object.values(moodCounts))} occurrences
                  </p>
                </>
              ) : (
                <div className="text-gray-400">No data</div>
              )}
            </div>
          </div>
        </>
      )}
        </div>
      )}

      {activeTab === 'heatmap' && (
        <InteractionHeatmap />
      )}

      {activeTab === 'leaderboard' && (
        <Leaderboard />
      )}

      {activeTab === 'reports' && (
        <PDFReportGenerator />
      )}
    </div>
  );
}

export default AdminAnalytics;
