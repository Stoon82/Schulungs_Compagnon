const API_BASE_URL = 'http://localhost:3000/api';

class ApiService {
  constructor() {
    this.sessionToken = localStorage.getItem('sessionToken');
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.sessionToken) {
      headers['Authorization'] = `Bearer ${this.sessionToken}`;
    }

    return headers;
  }

  setSessionToken(token) {
    this.sessionToken = token;
    localStorage.setItem('sessionToken', token);
  }

  clearSession() {
    this.sessionToken = null;
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('participantId');
    localStorage.removeItem('nickname');
  }

  async join(nickname = null) {
    const response = await fetch(`${API_BASE_URL}/auth/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname })
    });

    const data = await response.json();

    if (data.success) {
      this.setSessionToken(data.data.sessionToken);
      localStorage.setItem('participantId', data.data.participantId);
      localStorage.setItem('nickname', data.data.nickname || 'Anonymous');
      localStorage.setItem('avatarSeed', data.data.avatarSeed);
    }

    return data;
  }

  async getSession() {
    const response = await fetch(`${API_BASE_URL}/auth/session`, {
      headers: this.getHeaders()
    });

    const data = await response.json();

    if (!data.success && response.status === 401) {
      this.clearSession();
    }

    return data;
  }

  async getModules() {
    const response = await fetch(`${API_BASE_URL}/modules`, {
      headers: this.getHeaders()
    });

    return await response.json();
  }

  async completeModule(moduleId) {
    const response = await fetch(`${API_BASE_URL}/modules/${moduleId}/complete`, {
      method: 'POST',
      headers: this.getHeaders()
    });

    return await response.json();
  }

  async sendMood(mood, moduleId = null) {
    const response = await fetch(`${API_BASE_URL}/mood/update`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ mood, moduleId })
    });

    return await response.json();
  }

  async getMoodHistory(limit = 50) {
    const response = await fetch(`${API_BASE_URL}/mood/history?limit=${limit}`, {
      headers: this.getHeaders()
    });

    return await response.json();
  }
}

export default new ApiService();
