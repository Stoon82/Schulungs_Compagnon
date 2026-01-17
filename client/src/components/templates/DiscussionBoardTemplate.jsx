import { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, Pin, Trash2, Flag, Send, ChevronDown, ChevronRight, Save } from 'lucide-react';

/**
 * DiscussionBoardTemplate - Q&A and discussion board with threading
 * Features: Questions, threaded comments, upvoting, pinning, moderation
 */
function DiscussionBoardTemplate({ content = {}, onChange, onSave, isEditing = true }) {
  const [formData, setFormData] = useState({
    title: content?.title || 'Diskussionsforum',
    description: content?.description || '',
    allowAnonymous: content?.allowAnonymous || false,
    requireModeration: content?.requireModeration || false,
    allowUpvotes: content?.allowUpvotes !== false,
    questions: content?.questions || []
  });

  useEffect(() => {
    if (content && !isEditing) {
      setFormData({
        title: content?.title || 'Diskussionsforum',
        description: content?.description || '',
        allowAnonymous: content?.allowAnonymous || false,
        requireModeration: content?.requireModeration || false,
        allowUpvotes: content?.allowUpvotes !== false,
        questions: content?.questions || []
      });
    }
  }, [content, isEditing]);

  const handleChange = (updates) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    if (onChange) {
      onChange(newData);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
  };

  // Client mode - Interactive discussion board
  const [newQuestion, setNewQuestion] = useState('');
  const [newComment, setNewComment] = useState({});
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [upvotedQuestions, setUpvotedQuestions] = useState({});
  const [upvotedComments, setUpvotedComments] = useState({});

  const handleSubmitQuestion = () => {
    if (!newQuestion.trim()) return;

    const question = {
      id: Date.now(),
      text: newQuestion,
      author: 'Aktueller Benutzer',
      timestamp: new Date().toISOString(),
      upvotes: 0,
      isPinned: false,
      comments: []
    };

    handleChange({ questions: [...formData.questions, question] });
    setNewQuestion('');
    // TODO: Send to backend via socket/API
  };

  const handleSubmitComment = (questionId) => {
    const commentText = newComment[questionId];
    if (!commentText?.trim()) return;

    const updatedQuestions = formData.questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          comments: [
            ...q.comments,
            {
              id: Date.now(),
              text: commentText,
              author: 'Aktueller Benutzer',
              timestamp: new Date().toISOString(),
              upvotes: 0
            }
          ]
        };
      }
      return q;
    });

    handleChange({ questions: updatedQuestions });
    setNewComment({ ...newComment, [questionId]: '' });
    // TODO: Send to backend via socket/API
  };

  const handleUpvoteQuestion = (questionId) => {
    if (upvotedQuestions[questionId]) return;

    const updatedQuestions = formData.questions.map(q => {
      if (q.id === questionId) {
        return { ...q, upvotes: (q.upvotes || 0) + 1 };
      }
      return q;
    });

    handleChange({ questions: updatedQuestions });
    setUpvotedQuestions({ ...upvotedQuestions, [questionId]: true });
    // TODO: Send to backend via socket/API
  };

  const handleUpvoteComment = (questionId, commentId) => {
    const key = `${questionId}-${commentId}`;
    if (upvotedComments[key]) return;

    const updatedQuestions = formData.questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          comments: q.comments.map(c => {
            if (c.id === commentId) {
              return { ...c, upvotes: (c.upvotes || 0) + 1 };
            }
            return c;
          })
        };
      }
      return q;
    });

    handleChange({ questions: updatedQuestions });
    setUpvotedComments({ ...upvotedComments, [key]: true });
    // TODO: Send to backend via socket/API
  };

  const handlePinQuestion = (questionId) => {
    const updatedQuestions = formData.questions.map(q => {
      if (q.id === questionId) {
        return { ...q, isPinned: !q.isPinned };
      }
      return q;
    });

    handleChange({ questions: updatedQuestions });
    // TODO: Send to backend via socket/API
  };

  const handleDeleteQuestion = (questionId) => {
    if (!confirm('Frage wirklich löschen?')) return;
    
    const updatedQuestions = formData.questions.filter(q => q.id !== questionId);
    handleChange({ questions: updatedQuestions });
    // TODO: Send to backend via socket/API
  };

  const handleDeleteComment = (questionId, commentId) => {
    if (!confirm('Kommentar wirklich löschen?')) return;

    const updatedQuestions = formData.questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          comments: q.comments.filter(c => c.id !== commentId)
        };
      }
      return q;
    });

    handleChange({ questions: updatedQuestions });
    // TODO: Send to backend via socket/API
  };

  const toggleQuestion = (questionId) => {
    setExpandedQuestions({
      ...expandedQuestions,
      [questionId]: !expandedQuestions[questionId]
    });
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Gerade eben';
    if (minutes < 60) return `vor ${minutes} Min`;
    if (hours < 24) return `vor ${hours} Std`;
    return `vor ${days} Tag${days !== 1 ? 'en' : ''}`;
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Forum-Titel
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange({ title: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="z.B. Fragen & Antworten"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Beschreibung
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange({ description: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            rows="3"
            placeholder="Beschreiben Sie den Zweck dieses Forums..."
          />
        </div>

        {/* Settings */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-300">Einstellungen</h3>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.allowAnonymous}
              onChange={(e) => handleChange({ allowAnonymous: e.target.checked })}
              className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-300">Anonyme Beiträge erlauben</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.requireModeration}
              onChange={(e) => handleChange({ requireModeration: e.target.checked })}
              className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-300">Moderation erforderlich</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.allowUpvotes}
              onChange={(e) => handleChange({ allowUpvotes: e.target.checked })}
              className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-300">Upvotes aktivieren</span>
          </label>
        </div>

        {onSave && (
          <button
            onClick={handleSave}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2"
          >
            <Save size={20} />
            <span>Speichern</span>
          </button>
        )}
      </div>
    );
  }

  // Client/Preview mode - Interactive discussion board
  const sortedQuestions = [...formData.questions].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return (b.upvotes || 0) - (a.upvotes || 0);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-500/30">
        <div className="flex items-center gap-3 mb-3">
          <MessageSquare className="text-purple-400" size={24} />
          <h2 className="text-2xl font-bold text-white">{formData.title}</h2>
        </div>
        {formData.description && (
          <p className="text-gray-300">{formData.description}</p>
        )}
      </div>

      {/* New Question Form */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Neue Frage stellen</h3>
        <div className="flex gap-3">
          <textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Ihre Frage hier eingeben..."
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows="3"
          />
        </div>
        <button
          onClick={handleSubmitQuestion}
          disabled={!newQuestion.trim()}
          className="mt-3 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold text-white hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          <Send size={16} />
          Frage posten
        </button>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">
          Fragen ({formData.questions.length})
        </h3>

        {sortedQuestions.length === 0 ? (
          <div className="bg-white/5 rounded-xl p-12 border border-white/10 text-center">
            <MessageSquare size={48} className="mx-auto mb-4 text-gray-500" />
            <p className="text-gray-400">Noch keine Fragen gestellt</p>
          </div>
        ) : (
          sortedQuestions.map((question) => (
            <div
              key={question.id}
              className={`bg-white/5 rounded-xl border ${
                question.isPinned ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-white/10'
              } overflow-hidden`}
            >
              {/* Question Header */}
              <div className="p-4">
                <div className="flex items-start gap-4">
                  {/* Upvote Button */}
                  {formData.allowUpvotes && (
                    <button
                      onClick={() => handleUpvoteQuestion(question.id)}
                      disabled={upvotedQuestions[question.id]}
                      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                        upvotedQuestions[question.id]
                          ? 'bg-purple-500/30 text-purple-400'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      <ThumbsUp size={18} />
                      <span className="text-sm font-semibold">{question.upvotes || 0}</span>
                    </button>
                  )}

                  {/* Question Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {question.isPinned && (
                          <Pin size={16} className="text-yellow-400" />
                        )}
                        <p className="text-white font-medium">{question.text}</p>
                      </div>
                      
                      {/* Admin Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePinQuestion(question.id)}
                          className={`p-1 rounded transition-all ${
                            question.isPinned
                              ? 'text-yellow-400 hover:text-yellow-300'
                              : 'text-gray-400 hover:text-gray-300'
                          }`}
                          title={question.isPinned ? 'Lösen' : 'Anpinnen'}
                        >
                          <Pin size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="p-1 text-red-400 hover:text-red-300 transition-all"
                          title="Löschen"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <span>{question.author}</span>
                      <span>•</span>
                      <span>{formatTimestamp(question.timestamp)}</span>
                      <span>•</span>
                      <button
                        onClick={() => toggleQuestion(question.id)}
                        className="flex items-center gap-1 hover:text-gray-300"
                      >
                        {expandedQuestions[question.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        {question.comments?.length || 0} Antwort{question.comments?.length !== 1 ? 'en' : ''}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Comments Section */}
                {expandedQuestions[question.id] && (
                  <div className="mt-4 ml-16 space-y-3">
                    {/* Existing Comments */}
                    {question.comments?.map((comment) => (
                      <div key={comment.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex items-start gap-3">
                          {formData.allowUpvotes && (
                            <button
                              onClick={() => handleUpvoteComment(question.id, comment.id)}
                              disabled={upvotedComments[`${question.id}-${comment.id}`]}
                              className={`flex flex-col items-center gap-1 px-2 py-1 rounded transition-all text-xs ${
                                upvotedComments[`${question.id}-${comment.id}`]
                                  ? 'bg-purple-500/30 text-purple-400'
                                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
                              }`}
                            >
                              <ThumbsUp size={14} />
                              <span>{comment.upvotes || 0}</span>
                            </button>
                          )}
                          
                          <div className="flex-1">
                            <p className="text-gray-200 text-sm">{comment.text}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                              <span>{comment.author}</span>
                              <span>•</span>
                              <span>{formatTimestamp(comment.timestamp)}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteComment(question.id, comment.id)}
                            className="p-1 text-red-400 hover:text-red-300 transition-all"
                            title="Löschen"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* New Comment Form */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newComment[question.id] || ''}
                        onChange={(e) => setNewComment({ ...newComment, [question.id]: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment(question.id)}
                        placeholder="Antwort schreiben..."
                        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        onClick={() => handleSubmitComment(question.id)}
                        disabled={!newComment[question.id]?.trim()}
                        className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default DiscussionBoardTemplate;
