import { useState } from 'react';
import { Unlock, Radio, Pause, Play, Key, Download, AlertTriangle } from 'lucide-react';
import api from '../services/api';

function AdminControls() {
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [moduleId, setModuleId] = useState('module_1');
  const [codeDescription, setCodeDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const showFeedback = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleBroadcast = async () => {
    if (!broadcastMessage.trim()) return;

    setLoading(true);
    try {
      const result = await api.adminBroadcast(broadcastMessage, 'info');
      if (result.success) {
        showFeedback('Message broadcasted successfully!');
        setBroadcastMessage('');
      }
    } catch (error) {
      showFeedback('Failed to broadcast message', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockModule = async (unlockForAll = false) => {
    setLoading(true);
    try {
      const result = await api.adminUnlockModule(moduleId, null, unlockForAll);
      if (result.success) {
        showFeedback(unlockForAll 
          ? `Module unlocked for ${result.data.unlocked} participants!`
          : 'Module unlocked successfully!'
        );
      }
    } catch (error) {
      showFeedback('Failed to unlock module', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCode = async () => {
    if (!codeDescription.trim()) return;

    setLoading(true);
    try {
      const result = await api.adminGenerateCode(moduleId, codeDescription);
      if (result.success) {
        showFeedback(`Secret code generated: ${result.data.code}`);
        setCodeDescription('');
      }
    } catch (error) {
      showFeedback('Failed to generate code', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePauseSystem = async () => {
    if (!confirm('Are you sure you want to pause the system?')) return;

    setLoading(true);
    try {
      await api.adminPauseSystem();
      showFeedback('System paused');
    } catch (error) {
      showFeedback('Failed to pause system', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeSystem = async () => {
    setLoading(true);
    try {
      await api.adminResumeSystem();
      showFeedback('System resumed');
    } catch (error) {
      showFeedback('Failed to resume system', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const result = await api.adminExportData('all');
      if (result.success) {
        const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `compagnon-export-${Date.now()}.json`;
        a.click();
        showFeedback('Data exported successfully!');
      }
    } catch (error) {
      showFeedback('Failed to export data', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Controls</h2>
        <p className="text-gray-400">System management and emergency controls</p>
      </div>

      {feedback && (
        <div className={`p-4 rounded-lg ${
          feedback.type === 'success' 
            ? 'bg-green-500/20 border border-green-500/50 text-green-300'
            : 'bg-red-500/20 border border-red-500/50 text-red-300'
        }`}>
          {feedback.message}
        </div>
      )}

      {/* Broadcast Message */}
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Radio size={20} />
          Broadcast Message
        </h3>
        <div className="space-y-4">
          <textarea
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
            placeholder="Enter message to broadcast to all participants..."
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
            rows={3}
          />
          <button
            onClick={handleBroadcast}
            disabled={loading || !broadcastMessage.trim()}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-semibold text-white hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send Broadcast
          </button>
        </div>
      </div>

      {/* Module Controls */}
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Unlock size={20} />
          Module Controls
        </h3>
        <div className="space-y-4">
          <select
            value={moduleId}
            onChange={(e) => setModuleId(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="prolog">Prolog: Der Ruf</option>
            <option value="module_1">Modul 1: Schwelle überschreiten</option>
            <option value="module_2">Modul 2: Verbündete finden</option>
            <option value="module_3">Modul 3: Die Prüfung</option>
            <option value="module_4">Modul 4: Rückkehr mit dem Elixier</option>
            <option value="epilog">Epilog: Material Hub</option>
          </select>
          <div className="flex gap-4">
            <button
              onClick={() => handleUnlockModule(true)}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
            >
              Unlock for All
            </button>
          </div>
        </div>
      </div>

      {/* Secret Code Generator */}
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Key size={20} />
          Secret Code Generator
        </h3>
        <div className="space-y-4">
          <input
            type="text"
            value={codeDescription}
            onChange={(e) => setCodeDescription(e.target.value)}
            placeholder="Code description (e.g., 'Easter egg for Module 2')"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <button
            onClick={handleGenerateCode}
            disabled={loading || !codeDescription.trim()}
            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg font-semibold text-white hover:from-yellow-600 hover:to-orange-600 transition-all disabled:opacity-50"
          >
            Generate Code
          </button>
        </div>
      </div>

      {/* Emergency Controls */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <AlertTriangle size={20} className="text-red-400" />
          Emergency Controls
        </h3>
        <div className="flex gap-4">
          <button
            onClick={handlePauseSystem}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all disabled:opacity-50"
          >
            <Pause size={18} />
            Pause System
          </button>
          <button
            onClick={handleResumeSystem}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all disabled:opacity-50"
          >
            <Play size={18} />
            Resume System
          </button>
          <button
            onClick={handleExport}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all disabled:opacity-50"
          >
            <Download size={18} />
            Export Data
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminControls;
