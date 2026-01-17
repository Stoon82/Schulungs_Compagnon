import { useState, useEffect } from 'react';
import { MessageSquare, Plus, ThumbsUp, Reply, Pin, Trash2, Search } from 'lucide-react';
import axios from 'axios';

/**
 * DiscussionForum Component
 * Community discussion board for questions and collaboration
 */
function DiscussionForum({ moduleId, currentUser }) {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [newThread, setNewThread] = useState({
    title: '',
    content: '',
    category: 'question'
  });
  const [replyContent, setReplyContent] = useState('');

  const categories = [
    { id: 'all', label: 'Alle', icon: '📋' },
    { id: 'question', label: 'Fragen', icon: '❓' },
    { id: 'discussion', label: 'Diskussion', icon: '💬' },
    { id: 'announcement', label: 'Ankündigung', icon: '📢' }
  ];

  useEffect(() => {
    fetchThreads();
  }, [moduleId, filterCategory]);

  const fetchThreads = async () => {
    try {
      // Mock data - replace with actual API call
      const mockThreads = [
        {
          id: '1',
          title: 'Frage zur Medikamentengabe',
          content: 'Wie oft sollte man die Vitalzeichen nach der Medikamentengabe kontrollieren?',
          author: { id: '1', name: 'Anna Schmidt' },
          category: 'question',
          isPinned: true,
          likes: 12,
          replies: [
            {
              id: 'r1',
              content: 'In der Regel alle 15 Minuten in der ersten Stunde.',
              author: { id: '2', name: 'Dr. Müller' },
              likes: 8,
              createdAt: '2024-01-17T10:30:00'
            }
          ],
          createdAt: '2024-01-17T09:00:00'
        },
        {
          id: '2',
          title: 'Beste Praktiken für Hygiene',
          content: 'Welche Hygienemaßnahmen sind am wichtigsten bei der Patientenpflege?',
          author: { id: '3', name: 'Max Weber' },
          category: 'discussion',
          isPinned: false,
          likes: 5,
          replies: [],
          createdAt: '2024-01-17T11:00:00'
        }
      ];
      
      const filtered = filterCategory === 'all'
        ? mockThreads
        : mockThreads.filter(t => t.category === filterCategory);
      
      setThreads(filtered);
    } catch (error) {
      console.error('Error fetching threads:', error);
    }
  };

  const createThread = async () => {
    if (!newThread.title || !newThread.content) {
      alert('Bitte füllen Sie alle Felder aus');
      return;
    }

    try {
      const thread = {
        ...newThread,
        id: Date.now().toString(),
        author: currentUser,
        isPinned: false,
        likes: 0,
        replies: [],
        createdAt: new Date().toISOString()
      };

      setThreads([thread, ...threads]);
      setNewThread({ title: '', content: '', category: 'question' });
      setIsCreating(false);

      await axios.post('/api/forum/threads', { ...thread, moduleId });
    } catch (error) {
      console.error('Error creating thread:', error);
    }
  };

  const addReply = async (threadId) => {
    if (!replyContent.trim()) return;

    try {
      const reply = {
        id: Date.now().toString(),
        content: replyContent,
        author: currentUser,
        likes: 0,
        createdAt: new Date().toISOString()
      };

      const updatedThreads = threads.map(t =>
        t.id === threadId
          ? { ...t, replies: [...t.replies, reply] }
          : t
      );
      setThreads(updatedThreads);
      setReplyContent('');

      await axios.post(`/api/forum/threads/${threadId}/replies`, reply);
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const likeThread = async (threadId) => {
    const updatedThreads = threads.map(t =>
      t.id === threadId ? { ...t, likes: t.likes + 1 } : t
    );
    setThreads(updatedThreads);

    try {
      await axios.post(`/api/forum/threads/${threadId}/like`);
    } catch (error) {
      console.error('Error liking thread:', error);
    }
  };

  const filteredThreads = threads.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageSquare className="text-green-400" size={28} />
          <div>
            <h2 className="text-2xl font-bold text-white">Diskussionsforum</h2>
            <p className="text-sm text-gray-400">
              Stellen Sie Fragen und tauschen Sie sich aus
            </p>
          </div>
        </div>

        {!selectedThread && !isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-semibold text-white hover:from-green-600 hover:to-emerald-600 transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            Neuer Beitrag
          </button>
        )}
      </div>

      {/* Search and Filter */}
      {!selectedThread && !isCreating && (
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Beiträge durchsuchen..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500"
            />
          </div>

          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filterCategory === cat.id
                    ? 'bg-green-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Create Thread Form */}
      {isCreating && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Titel
            </label>
            <input
              type="text"
              value={newThread.title}
              onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
              placeholder="Kurze, beschreibende Überschrift"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Kategorie
            </label>
            <select
              value={newThread.category}
              onChange={(e) => setNewThread({ ...newThread, category: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500"
            >
              {categories.filter(c => c.id !== 'all').map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Inhalt
            </label>
            <textarea
              value={newThread.content}
              onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
              placeholder="Beschreiben Sie Ihre Frage oder Ihren Diskussionspunkt..."
              rows={6}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500 resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={createThread}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-semibold text-white hover:from-green-600 hover:to-emerald-600 transition-all"
            >
              Veröffentlichen
            </button>
            <button
              onClick={() => setIsCreating(false)}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold text-white transition-all"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {/* Thread Detail */}
      {selectedThread && (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedThread(null)}
            className="text-green-400 hover:text-green-300 text-sm mb-4"
          >
            ← Zurück zur Übersicht
          </button>

          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-2">{selectedThread.title}</h3>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <span>{selectedThread.author.name}</span>
                  <span>•</span>
                  <span>{new Date(selectedThread.createdAt).toLocaleDateString('de-DE')}</span>
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                    {categories.find(c => c.id === selectedThread.category)?.label}
                  </span>
                </div>
              </div>
              {selectedThread.isPinned && (
                <Pin className="text-yellow-400" size={20} />
              )}
            </div>

            <p className="text-gray-300 mb-4">{selectedThread.content}</p>

            <button
              onClick={() => likeThread(selectedThread.id)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
            >
              <ThumbsUp size={16} className="text-blue-400" />
              <span className="text-sm text-white">{selectedThread.likes}</span>
            </button>
          </div>

          {/* Replies */}
          <div className="space-y-3">
            <h4 className="text-lg font-bold text-white">{selectedThread.replies.length} Antworten</h4>
            
            {selectedThread.replies.map((reply) => (
              <div key={reply.id} className="bg-white/5 border border-white/10 rounded-lg p-4 ml-6">
                <div className="flex items-center gap-2 mb-2 text-sm text-gray-400">
                  <span className="font-semibold text-white">{reply.author.name}</span>
                  <span>•</span>
                  <span>{new Date(reply.createdAt).toLocaleString('de-DE')}</span>
                </div>
                <p className="text-gray-300 mb-3">{reply.content}</p>
                <button className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300">
                  <ThumbsUp size={14} />
                  {reply.likes}
                </button>
              </div>
            ))}

            {/* Reply Form */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Schreiben Sie eine Antwort..."
                rows={3}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500 resize-none mb-3"
              />
              <button
                onClick={() => addReply(selectedThread.id)}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-semibold text-white hover:from-green-600 hover:to-emerald-600 transition-all flex items-center gap-2"
              >
                <Reply size={18} />
                Antworten
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Threads List */}
      {!selectedThread && !isCreating && (
        <div className="space-y-3">
          {filteredThreads.length > 0 ? (
            filteredThreads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => setSelectedThread(thread)}
                className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-green-500/50 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {thread.isPinned && <Pin className="text-yellow-400" size={16} />}
                      <h3 className="text-white font-semibold">{thread.title}</h3>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-2">{thread.content}</p>
                  </div>
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs flex-shrink-0">
                    {categories.find(c => c.id === thread.category)?.icon}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>{thread.author.name}</span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp size={14} />
                    {thread.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare size={14} />
                    {thread.replies.length}
                  </span>
                  <span>{new Date(thread.createdAt).toLocaleDateString('de-DE')}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white/5 border border-white/10 rounded-lg">
              <MessageSquare className="mx-auto mb-4 text-gray-500" size={48} />
              <p className="text-gray-400">Keine Beiträge gefunden</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DiscussionForum;
