import db from './database.js';
import eventBus from '../eventBus.js';

class ModuleService {
  constructor() {
    this.modules = {
      prolog: {
        id: 'prolog',
        title: 'Der Ruf',
        description: 'Was ist KI eigentlich?',
        order: 0,
        alwaysUnlocked: true
      },
      module_1: {
        id: 'module_1',
        title: 'Schwelle überschreiten',
        description: 'Local vs. Cloud AI',
        order: 1,
        alwaysUnlocked: true
      },
      module_2: {
        id: 'module_2',
        title: 'Verbündete finden',
        description: 'Erste Ollama-Interaktion',
        order: 2,
        alwaysUnlocked: false
      },
      module_3: {
        id: 'module_3',
        title: 'Die Prüfung',
        description: 'Code-Playground & App-Erstellung',
        order: 3,
        alwaysUnlocked: false
      },
      module_4: {
        id: 'module_4',
        title: 'Rückkehr mit dem Elixier',
        description: 'Integration in ABW-Alltag',
        order: 4,
        alwaysUnlocked: false
      },
      epilog: {
        id: 'epilog',
        title: 'Material-Hub & Community-Apps',
        description: 'Ressourcen und Community',
        order: 5,
        alwaysUnlocked: true
      }
    };
  }

  getAllModules() {
    return Object.values(this.modules).sort((a, b) => a.order - b.order);
  }

  getModuleById(moduleId) {
    return this.modules[moduleId] || null;
  }

  async getParticipantModules(participantId) {
    const sql = `
      SELECT module_id, unlocked_at, completed, completed_at
      FROM progress
      WHERE participant_id = ?
    `;
    const progress = await db.all(sql, [participantId]);
    
    const progressMap = {};
    progress.forEach(p => {
      progressMap[p.module_id] = {
        unlocked: true,
        unlockedAt: p.unlocked_at,
        completed: p.completed === 1,
        completedAt: p.completed_at
      };
    });

    return this.getAllModules().map(module => ({
      ...module,
      unlocked: module.alwaysUnlocked || progressMap[module.id]?.unlocked || false,
      unlockedAt: progressMap[module.id]?.unlockedAt || null,
      completed: progressMap[module.id]?.completed || false,
      completedAt: progressMap[module.id]?.completedAt || null
    }));
  }

  async unlockModule(participantId, moduleId) {
    const module = this.getModuleById(moduleId);
    
    if (!module) {
      throw new Error('Module not found');
    }

    const existing = await db.get(
      'SELECT * FROM progress WHERE participant_id = ? AND module_id = ?',
      [participantId, moduleId]
    );

    if (existing) {
      return { alreadyUnlocked: true };
    }

    await db.run(
      'INSERT INTO progress (participant_id, module_id, unlocked_at) VALUES (?, ?, datetime("now"))',
      [participantId, moduleId]
    );

    eventBus.emitModuleUnlock(moduleId, {
      participantId,
      title: module.title
    });

    return { unlocked: true, module };
  }

  async unlockModuleForAll(moduleId) {
    const module = this.getModuleById(moduleId);
    
    if (!module) {
      throw new Error('Module not found');
    }

    const participants = await db.all('SELECT id FROM participants');
    
    for (const participant of participants) {
      try {
        await this.unlockModule(participant.id, moduleId);
      } catch (error) {
        console.error(`Failed to unlock module for ${participant.id}:`, error);
      }
    }

    return { unlockedFor: participants.length, module };
  }

  async completeModule(participantId, moduleId) {
    const sql = `
      UPDATE progress
      SET completed = 1, completed_at = datetime('now')
      WHERE participant_id = ? AND module_id = ?
    `;
    
    const result = await db.run(sql, [participantId, moduleId]);
    
    if (result.changes === 0) {
      throw new Error('Module not found or not unlocked');
    }

    return { completed: true };
  }
}

export default new ModuleService();
