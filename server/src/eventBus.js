import { EventEmitter } from 'events';

class SystemEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
    
    this.events = {
      MODULE_UNLOCKED: 'module:unlocked',
      PARTICIPANT_JOINED: 'participant:joined',
      PARTICIPANT_LEFT: 'participant:left',
      MOOD_UPDATED: 'mood:updated',
      APP_CREATED: 'app:created',
      APP_VOTED: 'app:voted',
      CODE_REDEEMED: 'code:redeemed',
      ADMIN_ACTION: 'admin:action',
      SYSTEM_EVENT: 'system:event'
    };
  }

  emitModuleUnlock(moduleId, data = {}) {
    this.emit(this.events.MODULE_UNLOCKED, { moduleId, ...data, timestamp: Date.now() });
  }

  emitParticipantJoined(participantId, data = {}) {
    this.emit(this.events.PARTICIPANT_JOINED, { participantId, ...data, timestamp: Date.now() });
  }

  emitParticipantLeft(participantId, data = {}) {
    this.emit(this.events.PARTICIPANT_LEFT, { participantId, ...data, timestamp: Date.now() });
  }

  emitMoodUpdate(participantId, mood, moduleId) {
    this.emit(this.events.MOOD_UPDATED, { participantId, mood, moduleId, timestamp: Date.now() });
  }

  emitAppCreated(appId, participantId, data = {}) {
    this.emit(this.events.APP_CREATED, { appId, participantId, ...data, timestamp: Date.now() });
  }

  emitAppVoted(appId, participantId, voteType) {
    this.emit(this.events.APP_VOTED, { appId, participantId, voteType, timestamp: Date.now() });
  }

  emitCodeRedeemed(code, participantId, featureId) {
    this.emit(this.events.CODE_REDEEMED, { code, participantId, featureId, timestamp: Date.now() });
  }

  emitAdminAction(action, data = {}) {
    this.emit(this.events.ADMIN_ACTION, { action, ...data, timestamp: Date.now() });
  }

  emitSystemEvent(eventType, data = {}) {
    this.emit(this.events.SYSTEM_EVENT, { eventType, ...data, timestamp: Date.now() });
  }

  onModuleUnlock(callback) {
    this.on(this.events.MODULE_UNLOCKED, callback);
  }

  onParticipantJoined(callback) {
    this.on(this.events.PARTICIPANT_JOINED, callback);
  }

  onParticipantLeft(callback) {
    this.on(this.events.PARTICIPANT_LEFT, callback);
  }

  onMoodUpdate(callback) {
    this.on(this.events.MOOD_UPDATED, callback);
  }

  onAppCreated(callback) {
    this.on(this.events.APP_CREATED, callback);
  }

  onAppVoted(callback) {
    this.on(this.events.APP_VOTED, callback);
  }

  onCodeRedeemed(callback) {
    this.on(this.events.CODE_REDEEMED, callback);
  }

  onAdminAction(callback) {
    this.on(this.events.ADMIN_ACTION, callback);
  }

  onSystemEvent(callback) {
    this.on(this.events.SYSTEM_EVENT, callback);
  }
}

const eventBus = new SystemEventBus();

eventBus.on('error', (error) => {
  console.error('EventBus Error:', error);
});

export default eventBus;
