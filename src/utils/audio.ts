class AmbientSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private oscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
  private intervals: number[] = [];
  private theme: 'fantasy' | 'cyberpunk' | 'space' | 'mute' = 'mute';
  private volume: number = 0.3;
  private lfo: OscillatorNode | null = null;
  private isRunning: boolean = false;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass();
    
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

    // Warm Low Pass Filter
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    this.filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    // Filter Modulation LFO (breathing effect)
    this.lfo = this.ctx.createOscillator();
    this.lfo.type = 'sine';
    this.lfo.frequency.setValueAtTime(0.1, this.ctx.currentTime); // 10s period
    
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(300, this.ctx.currentTime); // sweep filter +-300Hz

    this.lfo.connect(lfoGain);
    lfoGain.connect(this.filter.frequency);
    this.lfo.start();

    this.filter.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
  }

  public async start(theme: 'fantasy' | 'cyberpunk' | 'space') {
    this.init();
    if (!this.ctx || !this.filter || !this.masterGain) return;
    
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    
    this.stopAllSoundSources();
    this.theme = theme;
    this.isRunning = true;

    if (theme === 'fantasy') {
      this.playFantasyTheme();
    } else if (theme === 'cyberpunk') {
      this.playCyberpunkTheme();
    } else if (theme === 'space') {
      this.playSpaceTheme();
    }
  }

  public stop() {
    this.isRunning = false;
    this.theme = 'mute';
    this.stopAllSoundSources();
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 0.1);
    }
  }

  public getTheme() {
    return this.theme;
  }

  private stopAllSoundSources() {
    // Clear intervals
    this.intervals.forEach(id => window.clearInterval(id));
    this.intervals = [];

    // Stop and disconnect all oscillators
    this.oscillators.forEach(item => {
      try {
        item.osc.stop();
        item.osc.disconnect();
        item.gain.disconnect();
      } catch {
        // Already stopped
      }
    });
    this.oscillators = [];
  }

  private playFantasyTheme() {
    if (!this.ctx || !this.filter) return;
    
    // Mystical minor chords slowly fading in and out
    // Roots: C3 (130.81Hz), Eb3 (155.56Hz), G3 (196.00Hz), Bb3 (233.08Hz), C4 (261.63Hz)
    const baseFreqs = [130.81, 196.00, 233.08, 261.63, 311.13]; // Cm7 structure
    const now = this.ctx.currentTime;

    baseFreqs.forEach((freq, index) => {
      if (!this.ctx || !this.filter) return;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = index % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      
      gain.gain.setValueAtTime(0, now);
      
      osc.connect(gain);
      gain.connect(this.filter);
      osc.start(now);
      
      this.oscillators.push({ osc, gain });

      // Slow breathing animation per voice (out of phase)
      const pulseVolume = () => {
        if (!this.ctx || !this.isRunning || this.theme !== 'fantasy') return;
        const time = this.ctx.currentTime;
        const speed = 4 + index * 1.5; // Seconds per cycle
        const phase = index * (Math.PI / 4);
        const amp = 0.05 + 0.03 * Math.sin((time * Math.PI * 2) / speed + phase);
        gain.gain.linearRampToValueAtTime(amp, time + 1);
      };

      pulseVolume();
      const intervalId = window.setInterval(pulseVolume, 1000);
      this.intervals.push(intervalId);
    });
  }

  private playSpaceTheme() {
    if (!this.ctx || !this.filter) return;
    
    // Deep dark ambient drone + random sparkling stars
    const now = this.ctx.currentTime;
    
    // Low frequency drone
    const droneFreqs = [55.00, 55.40, 110.00, 165.00]; // A1, beating A1, A2, E3
    droneFreqs.forEach((freq, index) => {
      if (!this.ctx || !this.filter) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      
      const val = index === 0 ? 0.15 : 0.06;
      gain.gain.setValueAtTime(val, now);
      
      osc.connect(gain);
      gain.connect(this.filter);
      osc.start(now);
      this.oscillators.push({ osc, gain });
    });

    // Random sparkling stars (synthesizer blips)
    const triggerStar = () => {
      if (!this.ctx || !this.filter || !this.isRunning || this.theme !== 'space') return;
      
      const time = this.ctx.currentTime;
      
      // Select a nice pitch from pentatonic minor
      const root = 440; // A4
      const scale = [1, 1.2, 1.33, 1.5, 1.8]; // Minor Pentatonic
      const multiplier = scale[Math.floor(Math.random() * scale.length)] * (Math.random() > 0.5 ? 2 : 4);
      const freq = root * multiplier;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      
      // Slow attack, long release
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.04, time + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 4);
      
      osc.connect(gain);
      gain.connect(this.filter);
      osc.start(time);
      osc.stop(time + 4.1);
      
      // Clean up reference after finished playing
      setTimeout(() => {
        osc.disconnect();
        gain.disconnect();
      }, 5000);
    };

    const intervalId = window.setInterval(triggerStar, 3000);
    this.intervals.push(intervalId);
  }

  private playCyberpunkTheme() {
    if (!this.ctx || !this.filter) return;
    
    // Steady rhythmic base + arpeggiator
    const now = this.ctx.currentTime;
    
    // Base drone for stability
    const oscD = this.ctx.createOscillator();
    const gainD = this.ctx.createGain();
    oscD.type = 'triangle';
    oscD.frequency.setValueAtTime(73.42, now); // D2
    gainD.gain.setValueAtTime(0.1, now);
    oscD.connect(gainD);
    gainD.connect(this.filter);
    oscD.start(now);
    this.oscillators.push({ osc: oscD, gain: gainD });

    // Pentatonic scale arpeggio notes
    const arpFreqs = [146.83, 164.81, 196.00, 220.00, 261.63, 293.66]; // D3, E3, G3, A3, C4, D4
    let step = 0;
    
    const triggerArp = () => {
      if (!this.ctx || !this.filter || !this.isRunning || this.theme !== 'cyberpunk') return;
      
      const time = this.ctx.currentTime;
      const freq = arpFreqs[step % arpFreqs.length];
      
      // Occasionally introduce octaves or random variations
      let finalFreq = freq;
      if (Math.random() > 0.8) finalFreq *= 2; 
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sawtooth'; // retro buzz
      osc.frequency.setValueAtTime(finalFreq, time);
      
      // Plucky filter sweep just for this voice
      const localFilter = this.ctx.createBiquadFilter();
      localFilter.type = 'lowpass';
      localFilter.frequency.setValueAtTime(400, time);
      localFilter.frequency.exponentialRampToValueAtTime(1800, time + 0.05);
      localFilter.frequency.exponentialRampToValueAtTime(300, time + 0.35);
      
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.08, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.4);
      
      osc.connect(localFilter);
      localFilter.connect(gain);
      gain.connect(this.filter);
      
      osc.start(time);
      osc.stop(time + 0.5);
      
      setTimeout(() => {
        osc.disconnect();
        localFilter.disconnect();
        gain.disconnect();
      }, 600);

      step++;
    };

    const intervalId = window.setInterval(triggerArp, 300); // 100 BPM at 16th or similar arpeggio
    this.intervals.push(intervalId);
  }

  public playSuccessSound() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'triangle';
    
    // Play arpeggiated magical chime (E5 -> G5 -> C6)
    osc.frequency.setValueAtTime(659.25, now); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.08); // G5
    osc.frequency.setValueAtTime(1046.50, now + 0.16); // C6

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.5, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

    osc.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 0.5);
  }
}

export const synth = new AmbientSynthesizer();
