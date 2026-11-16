'use client';

const MUTE_STORAGE_KEY = 'alerta_cero_muted';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.muted = window.localStorage.getItem(MUTE_STORAGE_KEY) === 'true';
      } catch {
        this.muted = false;
      }
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined' || this.muted) return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  isMuted(): boolean {
    return this.muted;
  }

  setMuted(mute: boolean): void {
    this.muted = mute;
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(MUTE_STORAGE_KEY, String(mute));
      } catch {
        // Ignore storage errors
      }
    }
  }

  toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.14,
    delay = 0,
    endFreq?: number
  ) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  /** Crisp card snap / swoosh */
  playCard() {
    this.playTone(320, 0.08, 'triangle', 0.14, 0, 620);
    this.playTone(540, 0.06, 'sine', 0.08, 0.04, 780);
  }

  /** Protective shield applied */
  playShieldAdded() {
    this.playTone(440, 0.14, 'sine', 0.12, 0);
    this.playTone(660, 0.22, 'triangle', 0.12, 0.08);
  }

  /** Hazard / risk alarm */
  playRiskAlarm() {
    this.playTone(580, 0.14, 'sawtooth', 0.09, 0, 420);
    this.playTone(580, 0.16, 'sawtooth', 0.09, 0.18, 360);
  }

  /** ISO 45001 certification chime */
  playIsoCertified() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.24, 'triangle', 0.13, idx * 0.075);
    });
  }

  /** Countdown tick */
  playCountdownTick(urgent = false) {
    if (urgent) {
      this.playTone(880, 0.06, 'square', 0.06, 0);
    } else {
      this.playTone(620, 0.035, 'sine', 0.04, 0);
    }
  }

  /** Round resolution sweep */
  playRoundResolve() {
    this.playTone(392, 0.12, 'triangle', 0.11, 0);
    this.playTone(523.25, 0.16, 'triangle', 0.11, 0.08);
  }

  /** Global labor inspection klaxon */
  playGlobalInspection() {
    this.playTone(440, 0.18, 'sawtooth', 0.08, 0);
    this.playTone(554.37, 0.18, 'sawtooth', 0.08, 0.16);
    this.playTone(659.25, 0.28, 'triangle', 0.12, 0.32);
  }

  /** Victory fanfare */
  playVictory() {
    const melody = [
      { f: 523.25, d: 0.14, t: 0 },
      { f: 659.25, d: 0.14, t: 0.12 },
      { f: 783.99, d: 0.14, t: 0.24 },
      { f: 1046.5, d: 0.45, t: 0.36 },
      { f: 783.99, d: 0.14, t: 0.54 },
      { f: 1046.5, d: 0.55, t: 0.68 },
    ];
    melody.forEach((m) => {
      this.playTone(m.f, m.d, 'triangle', 0.14, m.t);
    });
  }

  /** Soft error buzz */
  playError() {
    this.playTone(220, 0.14, 'sawtooth', 0.07, 0, 160);
  }
}

export const soundEngine = new SoundEngine();
