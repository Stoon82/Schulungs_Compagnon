import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, AlertCircle, Loader } from 'lucide-react';
import api from '../services/api';

function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatStatus, setChatStatus] = useState({ available: false, model: '' });
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadChatStatus();
    loadChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatStatus = async () => {
    try {
      const result = await api.getChatStatus();
      if (result.success) {
        setChatStatus(result.data);
      }
    } catch (err) {
      console.error('Failed to load chat status:', err);
    }
  };

  const loadChatHistory = async () => {
    try {
      const result = await api.getChatHistory(10);
      if (result.success && result.data.length > 0) {
        const formattedHistory = result.data.flatMap(item => [
          { role: 'user', content: item.message },
          { role: 'assistant', content: item.response }
        ]);
        setMessages(formattedHistory);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);

    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const conversationHistory = messages.slice(-6);
      
      const result = await api.sendChatMessage(userMessage, conversationHistory);

      if (result.success) {
        setMessages([...newMessages, { 
          role: 'assistant', 
          content: result.data.response,
          responseTime: result.data.responseTime,
          error: result.data.error
        }]);
      } else {
        setError(result.error || 'Fehler beim Senden der Nachricht');
      }
    } catch (err) {
      console.error('Chat error:', err);
      setError('Verbindungsfehler. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
              <Bot size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">KI-Assistent</h3>
              <p className="text-xs text-gray-400">
                {chatStatus.available ? `Powered by ${chatStatus.model}` : 'Offline'}
              </p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs ${
            chatStatus.available 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-red-500/20 text-red-400'
          }`}>
            {chatStatus.available ? 'Online' : 'Offline'}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-8">
            <Bot size={48} className="mx-auto mb-4 opacity-50" />
            <p>Stelle mir eine Frage über KI im ABW-Kontext!</p>
            <p className="text-sm mt-2">Ich bin hier, um dir zu helfen.</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot size={18} className="text-white" />
              </div>
            )}
            
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              message.role === 'user'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                : message.error
                ? 'bg-red-500/20 border border-red-500/50 text-red-300'
                : 'bg-white/10 text-gray-200'
            }`}>
              <p className="whitespace-pre-wrap">{message.content}</p>
              {message.responseTime && (
                <p className="text-xs opacity-70 mt-2">
                  {(message.responseTime / 1000).toFixed(1)}s
                </p>
              )}
            </div>

            {message.role === 'user' && (
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                <User size={18} className="text-gray-400" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
              <Bot size={18} className="text-white" />
            </div>
            <div className="bg-white/10 rounded-2xl px-4 py-3">
              <Loader size={20} className="animate-spin text-cyan-400" />
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Stelle eine Frage..."
            disabled={loading || !chatStatus.available}
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            maxLength={500}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading || !chatStatus.available}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {input.length}/500 Zeichen • Max. {chatStatus.rateLimit || 5} Anfragen/Minute
        </p>
      </div>
    </div>
  );
}

export default ChatInterface;
