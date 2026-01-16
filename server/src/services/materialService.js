import db from './database.js';
import ollamaService from './ollamaService.js';

class MaterialService {
  constructor() {
    this.materials = [
      {
        id: 'intro_ki',
        title: 'Einführung in KI',
        type: 'pdf',
        description: 'Grundlagen der Künstlichen Intelligenz für Sozialarbeiter:innen',
        url: '/materials/intro_ki.pdf',
        category: 'basics',
        order: 1
      },
      {
        id: 'ollama_guide',
        title: 'Ollama Benutzerhandbuch',
        type: 'pdf',
        description: 'Wie man lokale KI-Modelle mit Ollama verwendet',
        url: '/materials/ollama_guide.pdf',
        category: 'technical',
        order: 2
      },
      {
        id: 'abw_use_cases',
        title: 'KI im ABW-Alltag',
        type: 'pdf',
        description: 'Praktische Anwendungsfälle von KI im Ambulant Betreuten Wohnen',
        url: '/materials/abw_use_cases.pdf',
        category: 'practical',
        order: 3
      },
      {
        id: 'datenschutz',
        title: 'Datenschutz und KI',
        type: 'pdf',
        description: 'GDPR-konforme Nutzung von KI-Tools',
        url: '/materials/datenschutz.pdf',
        category: 'legal',
        order: 4
      },
      {
        id: 'prompt_engineering',
        title: 'Prompt Engineering Basics',
        type: 'video',
        description: 'Video-Tutorial: Wie man effektive Prompts schreibt',
        url: 'https://www.youtube.com/watch?v=example',
        category: 'technical',
        order: 5
      },
      {
        id: 'ki_ethics',
        title: 'Ethik in der KI',
        type: 'link',
        description: 'Externe Ressource zu ethischen Aspekten der KI-Nutzung',
        url: 'https://example.com/ki-ethics',
        category: 'ethics',
        order: 6
      }
    ];
  }

  async getAllMaterials() {
    return this.materials.map(material => ({
      ...material,
      summary: null
    }));
  }

  async getMaterialById(materialId) {
    return this.materials.find(m => m.id === materialId) || null;
  }

  async getMaterialsByCategory(category) {
    return this.materials.filter(m => m.category === category);
  }

  async generateMaterialSummary(materialId) {
    const material = await this.getMaterialById(materialId);
    
    if (!material) {
      throw new Error('Material not found');
    }

    const summaryText = `${material.title}: ${material.description}`;
    
    try {
      const summary = await ollamaService.generateSummary(summaryText, 150);
      return summary;
    } catch (error) {
      console.error('Failed to generate summary:', error);
      return material.description;
    }
  }

  async trackMaterialAccess(participantId, materialId) {
    const sql = `
      INSERT INTO system_events (event_type, participant_id, data, timestamp)
      VALUES ('material_accessed', ?, ?, datetime('now'))
    `;
    
    await db.run(sql, [participantId, JSON.stringify({ materialId })]);
  }

  async getMaterialAccessStats() {
    const sql = `
      SELECT 
        json_extract(data, '$.materialId') as material_id,
        COUNT(*) as access_count,
        COUNT(DISTINCT participant_id) as unique_participants
      FROM system_events
      WHERE event_type = 'material_accessed'
      GROUP BY material_id
      ORDER BY access_count DESC
    `;

    return await db.all(sql);
  }

  getCategories() {
    const categories = [...new Set(this.materials.map(m => m.category))];
    return categories.map(cat => ({
      id: cat,
      name: this.getCategoryName(cat)
    }));
  }

  getCategoryName(category) {
    const names = {
      basics: 'Grundlagen',
      technical: 'Technisch',
      practical: 'Praxis',
      legal: 'Rechtliches',
      ethics: 'Ethik'
    };
    return names[category] || category;
  }
}

export default new MaterialService();
