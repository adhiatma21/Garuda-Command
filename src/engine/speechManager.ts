// Tactical Aviation Radio Speech Queue Manager
// Ensures radio communications are spoken completely from start to finish
// without cutting off mid-sentence or repeating uncontrollably.

export interface SpeechQueueItem {
  id: string;
  text: string;
  isATC?: boolean;
  language?: 'id' | 'en';
  priority?: 'normal' | 'urgent';
  onStart?: () => void;
  onEnd?: () => void;
}

class RadioSpeechManager {
  private queue: SpeechQueueItem[] = [];
  private isProcessing = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private keepAliveInterval: any = null;
  private voices: SpeechSynthesisVoice[] = [];
  private currentLanguage: 'id' | 'en' = 'id';
  private radioGapTimeout: any = null;
  private currentSafetyTimer: any = null;
  private sessionToken = 0;
  private lastSpokenText = '';
  private lastSpokenTime = 0;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices() || [];
    }
  }

  public setLanguage(lang: 'id' | 'en') {
    this.currentLanguage = lang;
  }

  public speak(text: string, isATC = false, language?: 'id' | 'en', priority: 'normal' | 'urgent' = 'normal') {
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    const cleanText = text.trim();
    if (!cleanText) return;

    // Prevent immediate identical phrase spam within 4 seconds
    const now = Date.now();
    if (cleanText === this.lastSpokenText && now - this.lastSpokenTime < 4000) {
      return;
    }

    const item: SpeechQueueItem = {
      id: 'speech-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      text: cleanText,
      isATC,
      language: language || this.currentLanguage,
      priority
    };

    if (priority === 'urgent') {
      // Put right after the currently speaking item
      if (this.queue.length > 0) {
        this.queue.splice(1, 0, item);
      } else {
        this.queue.push(item);
      }
    } else {
      // Prevent duplicate queue buildup (max 6 pending items)
      const isDuplicateInQueue = this.queue.some(q => q.text === cleanText);
      if (!isDuplicateInQueue) {
        if (this.queue.length > 6) {
          // Drop oldest non-urgent item to prevent lag
          this.queue.splice(1, 1);
        }
        this.queue.push(item);
      }
    }

    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  private getVoice(lang: string, isATC: boolean): SpeechSynthesisVoice | null {
    if (this.voices.length === 0) {
      this.loadVoices();
    }

    const isId = lang.startsWith('id');
    const matchingLangVoices = this.voices.filter(v => 
      isId ? v.lang.toLowerCase().includes('id') : (v.lang.toLowerCase().includes('en') || v.lang.toLowerCase().includes('us'))
    );

    if (matchingLangVoices.length > 0) {
      if (isATC) {
        // Prefer female / high clarity for Tower/ATC/Radar
        const female = matchingLangVoices.find(v => 
          v.name.toLowerCase().includes('female') || 
          v.name.toLowerCase().includes('samantha') || 
          v.name.toLowerCase().includes('zira') ||
          v.name.toLowerCase().includes('gadis') ||
          v.name.toLowerCase().includes('siti')
        );
        if (female) return female;
      } else {
        // Prefer male / commanding tactical voice for Pilot
        const male = matchingLangVoices.find(v => 
          v.name.toLowerCase().includes('male') || 
          v.name.toLowerCase().includes('david') || 
          v.name.toLowerCase().includes('mark') ||
          v.name.toLowerCase().includes('andi') ||
          v.name.toLowerCase().includes('budi')
        );
        if (male) return male;
      }
      return matchingLangVoices[0];
    }

    // Fallback to any available voice
    if (isATC) {
      const femaleFallback = this.voices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira'));
      if (femaleFallback) return femaleFallback;
    }
    return this.voices[0] || null;
  }

  private processQueue() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.isProcessing = false;
      return;
    }

    if (this.queue.length === 0) {
      this.isProcessing = false;
      this.currentUtterance = null;
      this.stopKeepAlive();
      return;
    }

    this.isProcessing = true;
    const currentItem = this.queue[0];
    const currentToken = ++this.sessionToken;
    this.lastSpokenText = currentItem.text;
    this.lastSpokenTime = Date.now();

    try {
      const targetLang = (currentItem.language || this.currentLanguage) === 'id' ? 'id-ID' : 'en-US';
      const utterance = new SpeechSynthesisUtterance(currentItem.text);
      utterance.lang = targetLang;

      const voice = this.getVoice(targetLang, !!currentItem.isATC);
      if (voice) {
        utterance.voice = voice;
      }

      if (currentItem.isATC) {
        utterance.pitch = 1.05;
        utterance.rate = 1.05;
      } else {
        utterance.pitch = 0.95;
        utterance.rate = 1.0;
      }

      // Safety timeout in case browser never fires onend (e.g. Chrome speech synthesis freeze bug)
      const estimatedDurationMs = Math.max(2500, (currentItem.text.length / 14) * 1000 + 2500);
      let hasEnded = false;

      const finishCurrent = () => {
        if (hasEnded || this.sessionToken !== currentToken) return;
        hasEnded = true;
        this.stopKeepAlive();
        if (this.currentSafetyTimer) {
          clearTimeout(this.currentSafetyTimer);
          this.currentSafetyTimer = null;
        }

        // Pop the completed item
        if (this.queue.length > 0 && this.queue[0].id === currentItem.id) {
          this.queue.shift();
        }

        // Natural tactical radio transmission gap (300ms) before next pilot/tower speech
        if (this.radioGapTimeout) clearTimeout(this.radioGapTimeout);
        this.radioGapTimeout = setTimeout(() => {
          if (this.sessionToken === currentToken) {
            this.processQueue();
          }
        }, 300);
      };

      if (this.currentSafetyTimer) clearTimeout(this.currentSafetyTimer);
      this.currentSafetyTimer = setTimeout(() => {
        if (!hasEnded && this.sessionToken === currentToken) {
          finishCurrent();
        }
      }, estimatedDurationMs);

      utterance.onstart = () => {
        if (this.sessionToken !== currentToken) return;
        this.startKeepAlive();
      };

      utterance.onend = () => {
        finishCurrent();
      };

      utterance.onerror = () => {
        finishCurrent();
      };

      this.currentUtterance = utterance;

      // Resume if paused
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      window.speechSynthesis.speak(utterance);

    } catch (err) {
      console.warn('SpeechSynthesis error:', err);
      if (this.queue.length > 0) this.queue.shift();
      this.isProcessing = false;
      setTimeout(() => {
        if (this.sessionToken === currentToken) {
          this.processQueue();
        }
      }, 200);
    }
  }

  // Workaround for Chrome bug where SpeechSynthesis pauses after ~14 seconds of speech
  private startKeepAlive() {
    this.stopKeepAlive();
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    this.keepAliveInterval = setInterval(() => {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);
  }

  private stopKeepAlive() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  public clearQueue() {
    this.sessionToken = Date.now();
    this.queue = [];
    if (this.currentSafetyTimer) {
      clearTimeout(this.currentSafetyTimer);
      this.currentSafetyTimer = null;
    }
    if (this.radioGapTimeout) {
      clearTimeout(this.radioGapTimeout);
      this.radioGapTimeout = null;
    }
    this.stopKeepAlive();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isProcessing = false;
    this.currentUtterance = null;
  }
}

export const speechManager = new RadioSpeechManager();
