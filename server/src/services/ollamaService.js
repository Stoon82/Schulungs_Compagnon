import axios from 'axios';

class OllamaService {
  constructor() {
    this.baseURL = process.env.OLLAMA_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'gemma2:2b';
    this.timeout = parseInt(process.env.OLLAMA_TIMEOUT || '30000');
    
    this.rateLimits = new Map();
    this.maxRequestsPerMinute = parseInt(process.env.OLLAMA_RATE_LIMIT || '5');
    
    this.systemPrompt = `Du bist ein freundlicher KI-Assistent für das Ambulant Betreute Wohnen (ABW).
Deine Aufgabe ist es, Sozialarbeiter:innen bei der Einführung in KI-Technologien zu unterstützen.
Sei geduldig, ermutigend und erkläre Konzepte auf einfache, verständliche Weise.
Verwende praktische Beispiele aus dem ABW-Kontext.
Antworte auf Deutsch und halte deine Antworten prägnant (max. 3-4 Sätze).`;
  }

  checkRateLimit(participantId) {
    const now = Date.now();
    const userRequests = this.rateLimits.get(participantId) || [];
    
    const recentRequests = userRequests.filter(timestamp => now - timestamp < 60000);
    
    if (recentRequests.length >= this.maxRequestsPerMinute) {
      const oldestRequest = Math.min(...recentRequests);
      const waitTime = Math.ceil((60000 - (now - oldestRequest)) / 1000);
      throw new Error(`Rate limit erreicht. Bitte warte ${waitTime} Sekunden.`);
    }
    
    recentRequests.push(now);
    this.rateLimits.set(participantId, recentRequests);
    
    return true;
  }

  async checkOllamaAvailability() {
    try {
      const response = await axios.get(`${this.baseURL}/api/tags`, {
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      console.error('Ollama not available:', error.message);
      return false;
    }
  }

  async chat(participantId, message, conversationHistory = []) {
    this.checkRateLimit(participantId);

    const isAvailable = await this.checkOllamaAvailability();
    
    if (!isAvailable) {
      return {
        response: 'Der KI-Assistent ist momentan nicht verfügbar. Bitte versuche es später erneut oder wende dich an den Trainer.',
        error: true,
        fallback: true
      };
    }

    const messages = [
      { role: 'system', content: this.systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    const startTime = Date.now();

    try {
      const response = await axios.post(
        `${this.baseURL}/api/chat`,
        {
          model: this.model,
          messages: messages,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            top_k: 40
          }
        },
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const responseTime = Date.now() - startTime;

      return {
        response: response.data.message.content,
        model: this.model,
        responseTime,
        error: false
      };

    } catch (error) {
      console.error('Ollama chat error:', error.message);

      const responseTime = Date.now() - startTime;

      if (error.code === 'ECONNREFUSED') {
        return {
          response: 'Der KI-Assistent ist nicht erreichbar. Stelle sicher, dass Ollama läuft.',
          error: true,
          responseTime,
          fallback: true
        };
      }

      if (error.code === 'ETIMEDOUT') {
        return {
          response: 'Die Anfrage hat zu lange gedauert. Bitte versuche es mit einer kürzeren Frage erneut.',
          error: true,
          responseTime,
          fallback: true
        };
      }

      return {
        response: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut oder kontaktiere den Trainer.',
        error: true,
        responseTime,
        fallback: true
      };
    }
  }

  async generateSummary(text, maxLength = 150) {
    const prompt = `Fasse folgenden Text in maximal ${maxLength} Zeichen zusammen:\n\n${text}`;

    try {
      const response = await axios.post(
        `${this.baseURL}/api/generate`,
        {
          model: this.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.3,
            max_tokens: 100
          }
        },
        {
          timeout: 15000
        }
      );

      return response.data.response.trim();
    } catch (error) {
      console.error('Summary generation error:', error.message);
      return text.substring(0, maxLength) + '...';
    }
  }

  clearRateLimitForParticipant(participantId) {
    this.rateLimits.delete(participantId);
  }
}

export default new OllamaService();
