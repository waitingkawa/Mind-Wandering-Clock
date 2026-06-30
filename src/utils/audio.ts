/**
 * Web Audio API Synthesizer for high-quality ambient soundscapes and chimes.
 * Totally self-contained, no external audio files required.
 */

export interface SoundConfig {
  id: string;
  name: string;
  volume: number; // 0 to 1
  isActive: boolean;
}

class RelaxationAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  // Sound States
  private activeSounds: { [key: string]: boolean } = {};
  private volumes: { [key: string]: number } = {
    waves: 0.5,
    rain: 0.4,
    wind: 0.3,
    hum: 0.4,
  };

  // Node References
  private waveNodes: {
    source: AudioBufferSourceNode;
    filter: BiquadFilterNode;
    gain: GainNode;
    lfo: OscillatorNode;
    lfoGain: GainNode;
  } | null = null;

  private rainNodes: {
    source: AudioBufferSourceNode;
    filter: BiquadFilterNode;
    gain: GainNode;
  } | null = null;

  private windNodes: {
    source: AudioBufferSourceNode;
    filter: BiquadFilterNode;
    gain: GainNode;
    lfo: OscillatorNode;
    lfoGain: GainNode;
  } | null = null;

  private humNodes: {
    oscL: OscillatorNode;
    oscR: OscillatorNode;
    pannerL: StereoPannerNode;
    pannerR: StereoPannerNode;
    gain: GainNode;
  } | null = null;

  // Buffers (cached)
  private whiteNoiseBuffer: AudioBuffer | null = null;
  private pinkNoiseBuffer: AudioBuffer | null = null;

  constructor() {
    // Audio context is initialized lazily on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private getWhiteNoiseBuffer(): AudioBuffer {
    if (this.whiteNoiseBuffer) return this.whiteNoiseBuffer;
    if (!this.ctx) throw new Error("AudioContext not initialized");

    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.whiteNoiseBuffer = buffer;
    return buffer;
  }

  private getPinkNoiseBuffer(): AudioBuffer {
    if (this.pinkNoiseBuffer) return this.pinkNoiseBuffer;
    if (!this.ctx) throw new Error("AudioContext not initialized");

    // Paul Kellet's refined method for pink noise generation
    const bufferSize = 4 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.11; // rescale for clipping safety
      b6 = white * 0.115926;
    }
    this.pinkNoiseBuffer = buffer;
    return buffer;
  }

  public toggleSound(soundId: string, isActive: boolean) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.activeSounds[soundId] = isActive;

    if (isActive) {
      this.startSoundNode(soundId);
    } else {
      this.stopSoundNode(soundId);
    }
  }

  public setVolume(soundId: string, volume: number) {
    this.volumes[soundId] = volume;
    if (!this.ctx) return;

    const time = this.ctx.currentTime;
    if (soundId === 'waves' && this.waveNodes) {
      // Ocean wave base volume
      this.waveNodes.gain.gain.linearRampToValueAtTime(volume * 0.25, time + 0.1);
    } else if (soundId === 'rain' && this.rainNodes) {
      this.rainNodes.gain.gain.linearRampToValueAtTime(volume * 0.20, time + 0.1);
    } else if (soundId === 'wind' && this.windNodes) {
      this.windNodes.gain.gain.linearRampToValueAtTime(volume * 0.15, time + 0.1);
    } else if (soundId === 'hum' && this.humNodes) {
      this.humNodes.gain.gain.linearRampToValueAtTime(volume * 0.15, time + 0.1);
    }
  }

  private startSoundNode(soundId: string) {
    if (!this.ctx || !this.masterGain) return;
    const time = this.ctx.currentTime;

    if (soundId === 'waves') {
      if (this.waveNodes) return;

      const source = this.ctx.createBufferSource();
      source.buffer = this.getPinkNoiseBuffer();
      source.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(1.2, time);
      filter.frequency.setValueAtTime(450, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, time); // fade in
      gain.gain.linearRampToValueAtTime(this.volumes.waves * 0.25, time + 2);

      // Slow LFO to swell wave volume and roll wave frequency
      const lfo = this.ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.08, time); // ~12 second wave cycle

      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(250, time); // modulate freq +/- 250Hz

      // Connect LFO to filter frequency
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      // Connect noise source
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      // Start LFO and source
      lfo.start(time);
      source.start(time);

      this.waveNodes = { source, filter, gain, lfo, lfoGain };
    } 
    
    else if (soundId === 'rain') {
      if (this.rainNodes) return;

      const source = this.ctx.createBufferSource();
      source.buffer = this.getPinkNoiseBuffer();
      source.loop = true;

      // Filter to shape rain (smooth rumble and hiss out)
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, time); // fade in
      gain.gain.linearRampToValueAtTime(this.volumes.rain * 0.20, time + 2);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      source.start(time);

      this.rainNodes = { source, filter, gain };
    } 
    
    else if (soundId === 'wind') {
      if (this.windNodes) return;

      const source = this.ctx.createBufferSource();
      source.buffer = this.getPinkNoiseBuffer();
      source.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(4.0, time); // Higher resonance for wind whistle
      filter.frequency.setValueAtTime(500, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(this.volumes.wind * 0.15, time + 2);

      // LFO for gusty/wandering wind
      const lfo = this.ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.04, time); // very slow wandering

      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(300, time); // modulate freq +/- 300Hz

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      lfo.start(time);
      source.start(time);

      this.windNodes = { source, filter, gain, lfo, lfoGain };
    } 
    
    else if (soundId === 'hum') {
      if (this.humNodes) return;

      // Binaural beats (theta wave: 144Hz Left, 150Hz Right -> 6Hz difference)
      const oscL = this.ctx.createOscillator();
      oscL.type = 'sine';
      oscL.frequency.setValueAtTime(144, time);

      const oscR = this.ctx.createOscillator();
      oscR.type = 'sine';
      oscR.frequency.setValueAtTime(150, time);

      // Pan them to left and right ears respectively
      const pannerL = this.ctx.createStereoPanner();
      pannerL.pan.setValueAtTime(-1, time);

      const pannerR = this.ctx.createStereoPanner();
      pannerR.pan.setValueAtTime(1, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(this.volumes.hum * 0.15, time + 2);

      oscL.connect(pannerL);
      oscR.connect(pannerR);

      pannerL.connect(gain);
      pannerR.connect(gain);

      gain.connect(this.masterGain);

      oscL.start(time);
      oscR.start(time);

      this.humNodes = { oscL, oscR, pannerL, pannerR, gain };
    }
  }

  private stopSoundNode(soundId: string) {
    if (!this.ctx) return;
    const time = this.ctx.currentTime;

    if (soundId === 'waves' && this.waveNodes) {
      const nodes = this.waveNodes;
      this.waveNodes = null;
      nodes.gain.gain.setValueAtTime(nodes.gain.gain.value, time);
      nodes.gain.gain.linearRampToValueAtTime(0, time + 1.5);
      setTimeout(() => {
        try {
          nodes.source.stop();
          nodes.lfo.stop();
          nodes.source.disconnect();
          nodes.lfo.disconnect();
          nodes.gain.disconnect();
          nodes.filter.disconnect();
        } catch (e) {}
      }, 1600);
    } 
    
    else if (soundId === 'rain' && this.rainNodes) {
      const nodes = this.rainNodes;
      this.rainNodes = null;
      nodes.gain.gain.setValueAtTime(nodes.gain.gain.value, time);
      nodes.gain.gain.linearRampToValueAtTime(0, time + 1.5);
      setTimeout(() => {
        try {
          nodes.source.stop();
          nodes.source.disconnect();
          nodes.gain.disconnect();
          nodes.filter.disconnect();
        } catch (e) {}
      }, 1600);
    } 
    
    else if (soundId === 'wind' && this.windNodes) {
      const nodes = this.windNodes;
      this.windNodes = null;
      nodes.gain.gain.setValueAtTime(nodes.gain.gain.value, time);
      nodes.gain.gain.linearRampToValueAtTime(0, time + 1.5);
      setTimeout(() => {
        try {
          nodes.source.stop();
          nodes.lfo.stop();
          nodes.source.disconnect();
          nodes.lfo.disconnect();
          nodes.gain.disconnect();
          nodes.filter.disconnect();
        } catch (e) {}
      }, 1600);
    } 
    
    else if (soundId === 'hum' && this.humNodes) {
      const nodes = this.humNodes;
      this.humNodes = null;
      nodes.gain.gain.setValueAtTime(nodes.gain.gain.value, time);
      nodes.gain.gain.linearRampToValueAtTime(0, time + 1.5);
      setTimeout(() => {
        try {
          nodes.oscL.stop();
          nodes.oscR.stop();
          nodes.oscL.disconnect();
          nodes.oscR.disconnect();
          nodes.pannerL.disconnect();
          nodes.pannerR.disconnect();
          nodes.gain.disconnect();
        } catch (e) {}
      }, 1600);
    }
  }

  public playChime() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const time = this.ctx.currentTime;
    
    // Create singing bowl harmonics: fundamental frequency (e.g. 180Hz) + partials
    const frequencies = [180, 273, 498, 621, 745];
    const gains = [0.6, 0.4, 0.25, 0.15, 0.08];
    const decays = [8.0, 6.5, 4.5, 3.5, 2.5]; // seconds to ring

    const chimeGain = this.ctx.createGain();
    chimeGain.gain.setValueAtTime(0.4, time);
    chimeGain.connect(this.masterGain);

    frequencies.forEach((freq, idx) => {
      if (!this.ctx) return;
      
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      const partialGain = this.ctx.createGain();
      partialGain.gain.setValueAtTime(0, time);
      partialGain.gain.linearRampToValueAtTime(gains[idx], time + 0.05); // quick fade-in
      partialGain.gain.exponentialRampToValueAtTime(0.0001, time + decays[idx]); // long decay

      osc.connect(partialGain);
      partialGain.connect(chimeGain);

      osc.start(time);
      osc.stop(time + decays[idx]);
    });
  }

  public setMasterMute(isMuted: boolean) {
    if (!this.ctx || !this.masterGain) return;
    const time = this.ctx.currentTime;
    this.masterGain.gain.linearRampToValueAtTime(isMuted ? 0 : 0.8, time + 0.5);
  }

  public stopAll() {
    Object.keys(this.activeSounds).forEach(id => {
      if (this.activeSounds[id]) {
        this.toggleSound(id, false);
      }
    });
  }
}

export const audioEngine = new RelaxationAudioEngine();
