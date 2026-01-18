const API_BASE_URL = '/api';

class ApiService {
  constructor() {
    this.sessionToken = localStorage.getItem('sessionToken');
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };

    // Always read from localStorage to get the latest token
    const token = localStorage.getItem('sessionToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
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

  async sendChatMessage(message, conversationHistory = []) {
    const response = await fetch(`${API_BASE_URL}/chat/message`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ message, conversationHistory })
    });

    return await response.json();
  }

  async getChatHistory(limit = 20) {
    const response = await fetch(`${API_BASE_URL}/chat/history?limit=${limit}`, {
      headers: this.getHeaders()
    });

    return await response.json();
  }

  async getChatStatus() {
    const response = await fetch(`${API_BASE_URL}/chat/status`);
    return await response.json();
  }

  async getMaterials() {
    const response = await fetch(`${API_BASE_URL}/materials`, {
      headers: this.getHeaders()
    });

    return await response.json();
  }

  async getMaterial(materialId) {
    const response = await fetch(`${API_BASE_URL}/materials/${materialId}`, {
      headers: this.getHeaders()
    });

    return await response.json();
  }

  async getMaterialSummary(materialId) {
    const response = await fetch(`${API_BASE_URL}/materials/${materialId}/summary`, {
      headers: this.getHeaders()
    });

    return await response.json();
  }

  // Admin API methods
  setAdminToken(token) {
    localStorage.setItem('admin_token', token);
  }

  getAdminToken() {
    return localStorage.getItem('admin_token');
  }

  clearAdminToken() {
    localStorage.removeItem('admin_token');
  }

  getAdminHeaders() {
    const token = this.getAdminToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async adminLogin(password) {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    const result = await response.json();
    if (result.success && result.data.token) {
      this.setAdminToken(result.data.token);
    }
    return result;
  }

  async adminLogout() {
    const response = await fetch(`${API_BASE_URL}/admin/logout`, {
      method: 'POST',
      headers: this.getAdminHeaders()
    });

    this.clearAdminToken();
    return await response.json();
  }

  async getAdminStats() {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: this.getAdminHeaders()
    });

    return await response.json();
  }

  async getAdminParticipants() {
    const response = await fetch(`${API_BASE_URL}/admin/participants`, {
      headers: this.getAdminHeaders()
    });

    return await response.json();
  }

  async getAdminParticipantDetails(participantId) {
    const response = await fetch(`${API_BASE_URL}/admin/participants/${participantId}`, {
      headers: this.getAdminHeaders()
    });

    return await response.json();
  }

  async getAdminMoodAnalytics(timeRange = '1 hour') {
    const response = await fetch(`${API_BASE_URL}/admin/analytics/moods?timeRange=${timeRange}`, {
      headers: this.getAdminHeaders()
    });

    return await response.json();
  }

  async getAdminEngagementData() {
    const response = await fetch(`${API_BASE_URL}/admin/analytics/engagement`, {
      headers: this.getAdminHeaders()
    });

    return await response.json();
  }

  async adminUnlockModule(moduleId, participantId = null, unlockForAll = false) {
    const response = await fetch(`${API_BASE_URL}/admin/modules/unlock`, {
      method: 'POST',
      headers: this.getAdminHeaders(),
      body: JSON.stringify({ moduleId, participantId, unlockForAll })
    });

    return await response.json();
  }

  async adminBroadcast(message, type = 'info') {
    const response = await fetch(`${API_BASE_URL}/admin/broadcast`, {
      method: 'POST',
      headers: this.getAdminHeaders(),
      body: JSON.stringify({ message, type })
    });

    return await response.json();
  }

  async adminKickParticipant(participantId) {
    const response = await fetch(`${API_BASE_URL}/admin/participants/${participantId}/kick`, {
      method: 'POST',
      headers: this.getAdminHeaders()
    });

    return await response.json();
  }

  async adminPauseSystem() {
    const response = await fetch(`${API_BASE_URL}/admin/system/pause`, {
      method: 'POST',
      headers: this.getAdminHeaders()
    });

    return await response.json();
  }

  async adminResumeSystem() {
    const response = await fetch(`${API_BASE_URL}/admin/system/resume`, {
      method: 'POST',
      headers: this.getAdminHeaders()
    });

    return await response.json();
  }

  async adminGenerateCode(moduleId, description) {
    const response = await fetch(`${API_BASE_URL}/admin/codes/generate`, {
      method: 'POST',
      headers: this.getAdminHeaders(),
      body: JSON.stringify({ moduleId, description })
    });

    return await response.json();
  }

  async adminGetCodes() {
    const response = await fetch(`${API_BASE_URL}/admin/codes`, {
      headers: this.getAdminHeaders()
    });

    return await response.json();
  }

  async adminDeactivateCode(code) {
    const response = await fetch(`${API_BASE_URL}/admin/codes/${code}/deactivate`, {
      method: 'POST',
      headers: this.getAdminHeaders()
    });

    return await response.json();
  }

  async adminToggleAppFeatured(appId, featured) {
    const response = await fetch(`${API_BASE_URL}/admin/apps/${appId}/feature`, {
      method: 'POST',
      headers: this.getAdminHeaders(),
      body: JSON.stringify({ featured })
    });

    return await response.json();
  }

  async adminDeactivateApp(appId) {
    const response = await fetch(`${API_BASE_URL}/admin/apps/${appId}/deactivate`, {
      method: 'POST',
      headers: this.getAdminHeaders()
    });

    return await response.json();
  }

  async adminGetLogs(limit = 50) {
    const response = await fetch(`${API_BASE_URL}/admin/logs?limit=${limit}`, {
      headers: this.getAdminHeaders()
    });

    return await response.json();
  }

  async adminExportData(type = 'all') {
    const response = await fetch(`${API_BASE_URL}/admin/export?type=${type}`, {
      headers: this.getAdminHeaders()
    });

    return await response.json();
  }

  // Module Creator API methods
  async getCreatorModules(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/module-creator/modules?${params}`, {
      headers: this.getAdminHeaders()
    });

    return await response.json();
  }

  async getCreatorModule(moduleId) {
    const response = await fetch(`${API_BASE_URL}/module-creator/modules/${moduleId}`, {
      headers: this.getAdminHeaders()
    });

    return await response.json();
  }

  // Public session methods (no authentication required, only session code)
  async getPublicModule(moduleId, sessionCode) {
    const response = await fetch(`${API_BASE_URL}/public-session/module/${moduleId}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-session-code': sessionCode
      }
    });
    return await response.json();
  }

  async getPublicSubmodules(moduleId, sessionCode) {
    const response = await fetch(`${API_BASE_URL}/public-session/module/${moduleId}/submodules`, {
      headers: {
        'Content-Type': 'application/json',
        'x-session-code': sessionCode
      }
    });
    return await response.json();
  }

  async createCreatorModule(moduleData) {
    const response = await fetch(`${API_BASE_URL}/module-creator/modules`, {
      method: 'POST',
      headers: this.getAdminHeaders(),
      body: JSON.stringify(moduleData)
    });

    return await response.json();
  }

  async updateCreatorModule(moduleId, moduleData) {
    const response = await fetch(`${API_BASE_URL}/module-creator/modules/${moduleId}`, {
      method: 'PUT',
      headers: this.getAdminHeaders(),
      body: JSON.stringify(moduleData)
    });

    return await response.json();
  }

  async deleteCreatorModule(moduleId) {
    const response = await fetch(`${API_BASE_URL}/module-creator/modules/${moduleId}`, {
      method: 'DELETE',
      headers: this.getAdminHeaders()
    });

    return await response.json();
  }

  async getModuleSubmodules(moduleId) {
    const response = await fetch(`${API_BASE_URL}/module-creator/modules/${moduleId}/submodules`, {
      headers: this.getAdminHeaders()
    });

    return await response.json();
  }

  async getSubmodule(submoduleId) {
    const response = await fetch(`${API_BASE_URL}/module-creator/submodules/${submoduleId}`, {
      headers: this.getAdminHeaders()
    });

    return await response.json();
  }

  async createSubmodule(moduleId, submoduleData) {
    const response = await fetch(`${API_BASE_URL}/module-creator/modules/${moduleId}/submodules`, {
      method: 'POST',
      headers: this.getAdminHeaders(),
      body: JSON.stringify(submoduleData)
    });

    return await response.json();
  }

  async updateSubmodule(submoduleId, submoduleData) {
    const response = await fetch(`${API_BASE_URL}/module-creator/submodules/${submoduleId}`, {
      method: 'PUT',
      headers: this.getAdminHeaders(),
      body: JSON.stringify(submoduleData)
    });

    return await response.json();
  }

  async deleteSubmodule(submoduleId) {
    const response = await fetch(`${API_BASE_URL}/module-creator/submodules/${submoduleId}`, {
      method: 'DELETE',
      headers: this.getAdminHeaders()
    });

    return await response.json();
  }

  async reorderSubmodules(submodules) {
    const response = await fetch(`${API_BASE_URL}/module-creator/submodules/reorder`, {
      method: 'PUT',
      headers: this.getAdminHeaders(),
      body: JSON.stringify({ submodules })
    });

    return await response.json();
  }

  async getMediaAssets(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/module-creator/media?${params}`, {
      headers: this.getAdminHeaders()
    });

    return await response.json();
  }

  async deleteMediaAsset(mediaId) {
    const response = await fetch(`${API_BASE_URL}/module-creator/media/${mediaId}`, {
      method: 'DELETE',
      headers: this.getAdminHeaders()
    });

    return await response.json();
  }
}

export default new ApiService();
