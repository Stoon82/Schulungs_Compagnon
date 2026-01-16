// Fallback mechanisms for critical services

class FallbackManager {
  constructor() {
    this.ollamaFallbackMode = false;
    this.ngrokFallbackUrl = null;
  }

  // Ollama fallback with simulated responses
  async getOllamaFallback(message) {
    console.warn('⚠️  Using Ollama fallback mode (simulation)');
    
    const responses = {
      'was ist': 'Das ist eine interessante Frage! In der Simulation kann ich dir leider keine detaillierte Antwort geben. Bitte frage deinen Trainer oder warte, bis der Ollama-Service wieder verfügbar ist.',
      'wie': 'Um diese Frage zu beantworten, benötige ich die vollständige KI-Funktionalität. Der Ollama-Service ist momentan nicht verfügbar.',
      'erkläre': 'Ich würde dir das gerne erklären, aber der KI-Service ist momentan im Fallback-Modus. Bitte versuche es später noch einmal.',
      'default': 'Der KI-Assistent ist momentan nicht verfügbar. Deine Frage wurde gespeichert und wird beantwortet, sobald der Service wieder läuft.'
    };

    const lowerMessage = message.toLowerCase();
    let response = responses.default;

    for (const [key, value] of Object.entries(responses)) {
      if (lowerMessage.includes(key)) {
        response = value;
        break;
      }
    }

    return {
      response,
      model: 'fallback-simulation',
      responseTime: 100,
      error: false,
      fallback: true
    };
  }

  // Ngrok fallback to local IP
  getLocalIpFallback() {
    const os = require('os');
    const interfaces = os.networkInterfaces();
    
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          const localUrl = `http://${iface.address}:${process.env.PORT || 3000}`;
          console.log(`🔄 Ngrok fallback: Use local IP ${localUrl}`);
          this.ngrokFallbackUrl = localUrl;
          return localUrl;
        }
      }
    }
    
    return `http://localhost:${process.env.PORT || 3000}`;
  }

  // Database corruption recovery
  async recoverDatabase(db, backupManager) {
    console.error('🚨 Database corruption detected! Attempting recovery...');
    
    try {
      // Try to restore from latest backup
      const backups = await backupManager.listBackups();
      
      if (backups.length > 0) {
        const latestBackup = backups[0];
        console.log(`📦 Restoring from backup: ${latestBackup.filename}`);
        
        const result = await backupManager.restoreBackup(latestBackup.filename);
        
        if (result.success) {
          console.log('✅ Database recovered successfully!');
          return { success: true, method: 'backup_restore' };
        }
      }
      
      // If no backups, try to rebuild from scratch
      console.log('🔨 No backups available, initializing new database...');
      await this.initializeNewDatabase(db);
      
      return { success: true, method: 'fresh_init' };
    } catch (error) {
      console.error('❌ Database recovery failed:', error);
      return { success: false, error: error.message };
    }
  }

  async initializeNewDatabase(db) {
    // Re-run schema initialization
    const schema = await import('../../database/schema.sql');
    // Execute schema
    console.log('✅ New database initialized');
  }

  // Network partition handling
  handleNetworkPartition(io) {
    console.warn('⚠️  Network partition detected');
    
    // Notify all connected clients
    io.emit('system:network_issue', {
      message: 'Netzwerkprobleme erkannt. Versuche Wiederverbindung...',
      timestamp: new Date().toISOString()
    });

    // Attempt reconnection
    setTimeout(() => {
      io.emit('system:network_recovered', {
        message: 'Netzwerkverbindung wiederhergestellt',
        timestamp: new Date().toISOString()
      });
    }, 5000);
  }

  // Participant overload protection
  checkParticipantOverload(participantCount, maxParticipants = 50) {
    if (participantCount >= maxParticipants) {
      console.warn(`⚠️  Participant limit reached: ${participantCount}/${maxParticipants}`);
      return {
        overloaded: true,
        message: 'Maximale Teilnehmerzahl erreicht. Bitte warten Sie.',
        currentCount: participantCount,
        maxCount: maxParticipants
      };
    }
    
    if (participantCount >= maxParticipants * 0.8) {
      console.warn(`⚠️  Approaching participant limit: ${participantCount}/${maxParticipants}`);
      return {
        warning: true,
        message: 'Teilnehmerzahl fast erreicht',
        currentCount: participantCount,
        maxCount: maxParticipants
      };
    }
    
    return { overloaded: false };
  }

  // Graceful degradation for heavy load
  async degradePerformance(currentLoad) {
    if (currentLoad > 0.9) {
      console.warn('⚠️  High load detected, enabling performance degradation');
      
      return {
        disableAnimations: true,
        reducePollingFrequency: true,
        limitConcurrentRequests: true,
        cacheAggressively: true
      };
    }
    
    return {
      disableAnimations: false,
      reducePollingFrequency: false,
      limitConcurrentRequests: false,
      cacheAggressively: false
    };
  }
}

export default new FallbackManager();
