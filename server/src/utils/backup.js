import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BackupManager {
  constructor() {
    this.backupDir = path.join(__dirname, '../../backups');
    this.dbPath = path.join(__dirname, '../../database/compagnon.db');
    
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async createBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(this.backupDir, `backup-${timestamp}.db`);
      
      if (fs.existsSync(this.dbPath)) {
        fs.copyFileSync(this.dbPath, backupPath);
        
        console.log(`✅ Backup created: ${backupPath}`);
        
        await this.cleanupOldBackups();
        
        return {
          success: true,
          path: backupPath,
          timestamp,
          size: fs.statSync(backupPath).size
        };
      } else {
        throw new Error('Database file not found');
      }
    } catch (error) {
      console.error('❌ Backup failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async restoreBackup(backupFileName) {
    try {
      const backupPath = path.join(this.backupDir, backupFileName);
      
      if (!fs.existsSync(backupPath)) {
        throw new Error('Backup file not found');
      }

      const tempBackup = `${this.dbPath}.temp`;
      if (fs.existsSync(this.dbPath)) {
        fs.copyFileSync(this.dbPath, tempBackup);
      }
      
      fs.copyFileSync(backupPath, this.dbPath);
      
      if (fs.existsSync(tempBackup)) {
        fs.unlinkSync(tempBackup);
      }
      
      console.log(`✅ Database restored from: ${backupPath}`);
      
      return {
        success: true,
        restoredFrom: backupFileName
      };
    } catch (error) {
      console.error('❌ Restore failed:', error);
      
      const tempBackup = `${this.dbPath}.temp`;
      if (fs.existsSync(tempBackup)) {
        fs.copyFileSync(tempBackup, this.dbPath);
        fs.unlinkSync(tempBackup);
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  async listBackups() {
    try {
      const files = fs.readdirSync(this.backupDir);
      const backups = files
        .filter(file => file.startsWith('backup-') && file.endsWith('.db'))
        .map(file => {
          const stats = fs.statSync(path.join(this.backupDir, file));
          return {
            filename: file,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
          };
        })
        .sort((a, b) => b.created - a.created);
      
      return backups;
    } catch (error) {
      console.error('❌ Failed to list backups:', error);
      return [];
    }
  }

  async cleanupOldBackups(keepCount = 10) {
    try {
      const backups = await this.listBackups();
      
      if (backups.length > keepCount) {
        const toDelete = backups.slice(keepCount);
        
        for (const backup of toDelete) {
          const backupPath = path.join(this.backupDir, backup.filename);
          fs.unlinkSync(backupPath);
          console.log(`🗑️  Deleted old backup: ${backup.filename}`);
        }
        
        return {
          success: true,
          deleted: toDelete.length
        };
      }
      
      return {
        success: true,
        deleted: 0
      };
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async exportData() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const exportPath = path.join(this.backupDir, `export-${timestamp}.json`);
      
      const db = await import('./database.js').then(m => m.default);
      
      const data = {
        exportDate: new Date().toISOString(),
        participants: await db.all('SELECT * FROM participants'),
        progress: await db.all('SELECT * FROM progress'),
        moods: await db.all('SELECT * FROM moods'),
        apps: await db.all('SELECT * FROM sandbox_apps'),
        votes: await db.all('SELECT * FROM votes'),
        secretCodes: await db.all('SELECT * FROM secret_codes'),
        codeRedemptions: await db.all('SELECT * FROM code_redemptions'),
        chatHistory: await db.all('SELECT * FROM chat_history')
      };
      
      fs.writeFileSync(exportPath, JSON.stringify(data, null, 2));
      
      console.log(`✅ Data exported: ${exportPath}`);
      
      return {
        success: true,
        path: exportPath,
        timestamp
      };
    } catch (error) {
      console.error('❌ Export failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  scheduleAutoBackup(intervalHours = 24) {
    const intervalMs = intervalHours * 60 * 60 * 1000;
    
    setInterval(async () => {
      console.log('🔄 Running scheduled backup...');
      await this.createBackup();
    }, intervalMs);
    
    console.log(`⏰ Auto-backup scheduled every ${intervalHours} hours`);
  }
}

export default new BackupManager();
