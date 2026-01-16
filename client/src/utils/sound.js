// Sound effects utility for The Compagnon

class SoundManager {
  constructor() {
    this.enabled = localStorage.getItem('sound_enabled') !== 'false';
    this.volume = parseFloat(localStorage.getItem('sound_volume') || '0.5');
    this.sounds = {};
  }

  async loadSound(name, url) {
    try {
      const audio = new Audio(url);
      audio.volume = this.volume;
      this.sounds[name] = audio;
    } catch (error) {
      console.warn(`Failed to load sound: ${name}`, error);
    }
  }

  play(name) {
    if (!this.enabled) return;
    
    const sound = this.sounds[name];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(err => console.warn('Sound play failed:', err));
    }
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('sound_volume', this.volume.toString());
    
    Object.values(this.sounds).forEach(sound => {
      sound.volume = this.volume;
    });
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('sound_enabled', this.enabled.toString());
    return this.enabled;
  }

  // Predefined sounds using Web Audio API
  playSuccess() {
    if (!this.enabled) return;
    this.playTone(523.25, 0.1, 'sine'); // C5
    setTimeout(() => this.playTone(659.25, 0.1, 'sine'), 100); // E5
    setTimeout(() => this.playTone(783.99, 0.2, 'sine'), 200); // G5
  }

  playError() {
    if (!this.enabled) return;
    this.playTone(200, 0.3, 'sawtooth');
  }

  playClick() {
    if (!this.enabled) return;
    this.playTone(800, 0.05, 'sine');
  }

  playNotification() {
    if (!this.enabled) return;
    this.playTone(440, 0.1, 'sine'); // A4
    setTimeout(() => this.playTone(554.37, 0.15, 'sine'), 100); // C#5
  }

  playTone(frequency, duration, type = 'sine') {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(this.volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }
}

export const soundManager = new SoundManager();

// Vibration utility
export const vibrate = (pattern = 200) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

export const vibrateSuccess = () => vibrate([100, 50, 100]);
export const vibrateError = () => vibrate([200, 100, 200]);
export const vibrateClick = () => vibrate(50);
