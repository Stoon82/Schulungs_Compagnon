import { useState } from 'react';
import api from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

function JoinScreen({ onJoin }) {
  const { t } = useLanguage();
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleJoin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await api.join(nickname || null);
      
      if (result.success) {
        onJoin(result.data);
      } else {
        setError(result.error || 'Failed to join');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      console.error('Join error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            {t('joinScreen.title')}
          </h1>
          <p className="text-xl text-gray-300">
            {t('joinScreen.greeting')}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          <div className="mb-6">
            <p className="text-gray-300 mb-4">
              {t('joinScreen.intro1')}
            </p>
            <p className="text-cyan-400 font-semibold">
              {t('joinScreen.intro2')}
            </p>
          </div>

          <form onSubmit={handleJoin}>
            <div className="mb-6">
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-300 mb-2">
                {t('joinScreen.nickname')}
              </label>
              <input
                type="text"
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder={t('joinScreen.nicknamePlaceholder')}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white"
            >
              {loading ? t('joinScreen.joining') : t('joinScreen.join')}
            </button>
          </form>

          <p className="mt-4 text-xs text-gray-400 text-center">
            {t('joinScreen.privacy')}
          </p>
        </div>
      </div>
    </div>
  );
}

export default JoinScreen;
