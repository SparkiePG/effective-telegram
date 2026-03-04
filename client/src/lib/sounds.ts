let audioCtx: AudioContext | null = null;
let _muted = false;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
    (window as any).__xdoro_audio_ctx = audioCtx;
  }
  if (!_muted && audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

export function isSoundMuted(): boolean {
  return _muted;
}

export function setSoundMuted(muted: boolean) {
  _muted = muted;
  if (audioCtx) {
    if (muted) audioCtx.suspend();
    else audioCtx.resume();
  }
}

function createGain(ctx: AudioContext, volume: number): GainNode {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  return gain;
}

function createFilter(ctx: AudioContext, type: BiquadFilterType, freq: number, q = 1): BiquadFilterNode {
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.frequency.setValueAtTime(freq, ctx.currentTime);
  filter.Q.setValueAtTime(q, ctx.currentTime);
  return filter;
}

function addReverb(ctx: AudioContext, source: AudioNode, dest: AudioNode, delayTime = 0.03, feedback = 0.2, mix = 0.15) {
  const dry = createGain(ctx, 1 - mix);
  const wet = createGain(ctx, mix);
  const delay = ctx.createDelay();
  delay.delayTime.setValueAtTime(delayTime, ctx.currentTime);
  const fb = createGain(ctx, feedback);
  const lpf = createFilter(ctx, "lowpass", 3000);

  source.connect(dry);
  dry.connect(dest);

  source.connect(delay);
  delay.connect(lpf);
  lpf.connect(fb);
  fb.connect(delay);
  lpf.connect(wet);
  wet.connect(dest);
}

function createDistortion(ctx: AudioContext, amount = 20): WaveShaperNode {
  const shaper = ctx.createWaveShaper();
  const samples = 44100;
  const curve = new Float32Array(samples);
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1;
    curve[i] = ((Math.PI + amount) * x) / (Math.PI + amount * Math.abs(x));
  }
  shaper.curve = curve;
  shaper.oversample = "4x";
  return shaper;
}

function playLayered(
  configs: Array<{
    freq: number;
    type: OscillatorType;
    volume: number;
    detune?: number;
    attack?: number;
    decay?: number;
    sustain?: number;
    release?: number;
    duration: number;
    freqEnd?: number;
  }>,
  options?: {
    filterType?: BiquadFilterType;
    filterFreq?: number;
    filterQ?: number;
    reverb?: boolean;
    reverbDelay?: number;
    reverbFeedback?: number;
    reverbMix?: number;
    distortion?: number;
    delay?: number;
  }
) {
  const ctx = getCtx();
  const t = ctx.currentTime + (options?.delay || 0);
  const master = createGain(ctx, 1);

  let output: AudioNode = master;

  if (options?.distortion) {
    const dist = createDistortion(ctx, options.distortion);
    master.connect(dist);
    output = dist;
  }

  if (options?.filterType) {
    const filter = createFilter(ctx, options.filterType, options.filterFreq || 2000, options.filterQ || 1);
    if (output === master) {
      master.connect(filter);
    } else {
      output.connect(filter);
    }
    output = filter;
  }

  if (options?.reverb) {
    addReverb(ctx, output, ctx.destination, options.reverbDelay || 0.03, options.reverbFeedback || 0.25, options.reverbMix || 0.15);
  } else {
    output.connect(ctx.destination);
  }

  configs.forEach((cfg) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const attack = cfg.attack || 0.005;
    const decay = cfg.decay || 0.05;
    const sustain = cfg.sustain || 0.3;
    const release = cfg.release || cfg.duration * 0.4;
    const totalDur = cfg.duration;

    osc.type = cfg.type;
    osc.frequency.setValueAtTime(cfg.freq, t);
    if (cfg.detune) osc.detune.setValueAtTime(cfg.detune, t);
    if (cfg.freqEnd) osc.frequency.exponentialRampToValueAtTime(cfg.freqEnd, t + totalDur);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(cfg.volume, t + attack);
    gain.gain.linearRampToValueAtTime(cfg.volume * sustain, t + attack + decay);
    gain.gain.setValueAtTime(cfg.volume * sustain, t + totalDur - release);
    gain.gain.exponentialRampToValueAtTime(0.001, t + totalDur);

    osc.connect(gain);
    gain.connect(master);
    osc.start(t);
    osc.stop(t + totalDur);
  });
}

function playNoise(
  duration: number,
  volume = 0.05,
  options?: {
    filterType?: BiquadFilterType;
    filterFreq?: number;
    filterQ?: number;
    attack?: number;
    release?: number;
    distortion?: number;
    delay?: number;
  }
) {
  const ctx = getCtx();
  const t = ctx.currentTime + (options?.delay || 0);
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const gain = ctx.createGain();
  const attack = options?.attack || 0.003;
  const release = options?.release || duration * 0.6;
  gain.gain.setValueAtTime(0.001, t);
  gain.gain.linearRampToValueAtTime(volume, t + attack);
  gain.gain.setValueAtTime(volume, t + duration - release);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

  const filter = createFilter(ctx, options?.filterType || "highpass", options?.filterFreq || 3000, options?.filterQ || 1);

  source.connect(filter);
  filter.connect(gain);

  if (options?.distortion) {
    const dist = createDistortion(ctx, options.distortion);
    gain.connect(dist);
    dist.connect(ctx.destination);
  } else {
    gain.connect(ctx.destination);
  }

  source.start(t);
  source.stop(t + duration);
}

function playMetallicClink(freq: number, volume: number, delay = 0) {
  playLayered(
    [
      { freq, type: "sine", volume, duration: 0.12, attack: 0.001, decay: 0.02, sustain: 0.1, release: 0.08 },
      { freq: freq * 2.756, type: "sine", volume: volume * 0.4, duration: 0.1, attack: 0.001, decay: 0.01, sustain: 0.05, release: 0.06 },
      { freq: freq * 5.404, type: "sine", volume: volume * 0.15, duration: 0.06, attack: 0.001, decay: 0.01, sustain: 0.02, release: 0.03 },
    ],
    { filterType: "bandpass", filterFreq: freq * 3, filterQ: 2, reverb: true, reverbDelay: 0.02, reverbFeedback: 0.15, reverbMix: 0.2, delay }
  );
}

export const sfx = {
  click: () => {
    playLayered(
      [
        { freq: 800, type: "sine", volume: 0.08, duration: 0.06, attack: 0.001, decay: 0.01, sustain: 0.1, release: 0.03 },
        { freq: 1200, type: "triangle", volume: 0.03, duration: 0.04, attack: 0.001, decay: 0.01, sustain: 0.05, release: 0.02 },
      ],
      { filterType: "lowpass", filterFreq: 4000, filterQ: 0.7 }
    );
  },

  flip: () => {
    playLayered(
      [
        { freq: 600, type: "sine", volume: 0.07, duration: 0.08, attack: 0.002, decay: 0.02, sustain: 0.2, release: 0.04, freqEnd: 900 },
        { freq: 1200, type: "triangle", volume: 0.03, duration: 0.06, attack: 0.001, decay: 0.01, sustain: 0.1, release: 0.03 },
      ],
      { filterType: "bandpass", filterFreq: 1500, filterQ: 1.5 }
    );
    playNoise(0.04, 0.02, { filterType: "bandpass", filterFreq: 5000, filterQ: 3, delay: 0.02 });
    setTimeout(() => {
      playLayered([
        { freq: 900, type: "sine", volume: 0.07, duration: 0.06, attack: 0.001, decay: 0.02, sustain: 0.15, release: 0.03 },
        { freq: 1350, type: "triangle", volume: 0.03, duration: 0.05, attack: 0.001, decay: 0.01, sustain: 0.1, release: 0.02 },
      ]);
    }, 50);
  },

  match: () => {
    const notes = [523, 659, 784];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        playLayered(
          [
            { freq, type: "sine", volume: 0.1, duration: 0.15, attack: 0.003, decay: 0.03, sustain: 0.4, release: 0.08 },
            { freq: freq * 2, type: "sine", volume: 0.03, duration: 0.12, attack: 0.002, decay: 0.02, sustain: 0.2, release: 0.06 },
            { freq, type: "triangle", volume: 0.04, duration: 0.12, detune: 5, attack: 0.003, decay: 0.02, sustain: 0.3, release: 0.06 },
          ],
          { reverb: true, reverbDelay: 0.025, reverbFeedback: 0.2, reverbMix: 0.18 }
        );
      }, i * 80);
    });
  },

  mismatch: () => {
    playLayered(
      [
        { freq: 300, type: "triangle", volume: 0.07, duration: 0.18, attack: 0.005, decay: 0.04, sustain: 0.3, release: 0.1 },
        { freq: 303, type: "sawtooth", volume: 0.02, duration: 0.15, attack: 0.005, decay: 0.03, sustain: 0.2, release: 0.08 },
      ],
      { filterType: "lowpass", filterFreq: 1200, filterQ: 1 }
    );
    setTimeout(() => {
      playLayered(
        [
          { freq: 250, type: "triangle", volume: 0.07, duration: 0.22, attack: 0.005, decay: 0.05, sustain: 0.25, release: 0.12 },
          { freq: 253, type: "sawtooth", volume: 0.02, duration: 0.18, attack: 0.005, decay: 0.04, sustain: 0.2, release: 0.1 },
        ],
        { filterType: "lowpass", filterFreq: 1000, filterQ: 1 }
      );
    }, 100);
  },

  coin: () => {
    playMetallicClink(988, 0.08);
    playMetallicClink(1319, 0.08, 0.06);
  },

  upgrade: () => {
    const notes = [440, 554, 659, 880];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        playLayered(
          [
            { freq, type: "sine", volume: 0.09, duration: 0.12, attack: 0.003, decay: 0.02, sustain: 0.4, release: 0.06 },
            { freq: freq * 2, type: "sine", volume: 0.03, duration: 0.1, attack: 0.002, decay: 0.015, sustain: 0.2, release: 0.05 },
            { freq, type: "triangle", volume: 0.04, detune: 7, duration: 0.1, attack: 0.003, decay: 0.02, sustain: 0.3, release: 0.05 },
          ],
          { reverb: true, reverbDelay: 0.02, reverbFeedback: 0.15, reverbMix: 0.12 }
        );
      }, i * 70);
    });
  },

  attack: () => {
    playNoise(0.1, 0.07, { filterType: "bandpass", filterFreq: 2000, filterQ: 2, attack: 0.001, release: 0.06, distortion: 15 });
    playLayered(
      [
        { freq: 200, type: "sawtooth", volume: 0.05, duration: 0.15, attack: 0.001, decay: 0.03, sustain: 0.2, release: 0.08, freqEnd: 80 },
        { freq: 400, type: "square", volume: 0.02, duration: 0.08, attack: 0.001, decay: 0.02, sustain: 0.1, release: 0.04, freqEnd: 150 },
      ],
      { distortion: 10, filterType: "lowpass", filterFreq: 1500 }
    );
  },

  heal: () => {
    const notes = [392, 523, 659];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        playLayered(
          [
            { freq, type: "sine", volume: 0.09, duration: 0.14, attack: 0.005, decay: 0.03, sustain: 0.5, release: 0.07 },
            { freq: freq * 1.5, type: "sine", volume: 0.03, duration: 0.12, attack: 0.004, decay: 0.02, sustain: 0.3, release: 0.06 },
            { freq, type: "triangle", volume: 0.04, detune: 3, duration: 0.12, attack: 0.005, decay: 0.03, sustain: 0.4, release: 0.06 },
          ],
          { reverb: true, reverbDelay: 0.04, reverbFeedback: 0.3, reverbMix: 0.25 }
        );
      }, i * 80);
    });
  },

  hit: () => {
    playNoise(0.06, 0.06, { filterType: "bandpass", filterFreq: 1500, filterQ: 1.5, attack: 0.001, release: 0.04, distortion: 25 });
    playLayered(
      [
        { freq: 150, type: "square", volume: 0.04, duration: 0.1, attack: 0.001, decay: 0.02, sustain: 0.1, release: 0.06, freqEnd: 60 },
        { freq: 80, type: "sawtooth", volume: 0.03, duration: 0.12, attack: 0.001, decay: 0.02, sustain: 0.15, release: 0.07 },
      ],
      { distortion: 20, filterType: "lowpass", filterFreq: 800 }
    );
  },

  superEffective: () => {
    const notes = [523, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        playLayered(
          [
            { freq, type: "square", volume: 0.06, duration: 0.1, attack: 0.001, decay: 0.02, sustain: 0.3, release: 0.05 },
            { freq, type: "sine", volume: 0.06, duration: 0.12, attack: 0.002, decay: 0.02, sustain: 0.4, release: 0.06 },
            { freq: freq * 2, type: "sine", volume: 0.02, duration: 0.08, attack: 0.001, decay: 0.015, sustain: 0.15, release: 0.04 },
          ],
          { reverb: true, reverbDelay: 0.015, reverbFeedback: 0.2, reverbMix: 0.15 }
        );
      }, i * 60);
    });
  },

  victory: () => {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        playLayered(
          [
            { freq, type: "sine", volume: 0.1, duration: 0.25, attack: 0.005, decay: 0.04, sustain: 0.5, release: 0.12 },
            { freq: freq * 2, type: "sine", volume: 0.04, duration: 0.2, attack: 0.004, decay: 0.03, sustain: 0.3, release: 0.1 },
            { freq, type: "triangle", volume: 0.05, detune: 4, duration: 0.22, attack: 0.005, decay: 0.03, sustain: 0.4, release: 0.1 },
            { freq: freq * 1.5, type: "sine", volume: 0.025, duration: 0.18, attack: 0.003, decay: 0.025, sustain: 0.2, release: 0.08 },
          ],
          { reverb: true, reverbDelay: 0.035, reverbFeedback: 0.3, reverbMix: 0.25 }
        );
      }, i * 120);
    });
  },

  defeat: () => {
    const notes = [440, 370, 311, 262];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        playLayered(
          [
            { freq, type: "triangle", volume: 0.08, duration: 0.3, attack: 0.008, decay: 0.06, sustain: 0.3, release: 0.15 },
            { freq, type: "sine", volume: 0.05, detune: -8, duration: 0.28, attack: 0.008, decay: 0.05, sustain: 0.25, release: 0.14 },
            { freq: freq * 0.5, type: "sine", volume: 0.03, duration: 0.25, attack: 0.01, decay: 0.05, sustain: 0.2, release: 0.12 },
          ],
          { filterType: "lowpass", filterFreq: 1500 - i * 200, filterQ: 0.8, reverb: true, reverbDelay: 0.05, reverbFeedback: 0.35, reverbMix: 0.3 }
        );
      }, i * 150);
    });
  },

  place: () => {
    playLayered(
      [
        { freq: 660, type: "sine", volume: 0.07, duration: 0.06, attack: 0.001, decay: 0.01, sustain: 0.2, release: 0.03 },
        { freq: 990, type: "triangle", volume: 0.025, duration: 0.04, attack: 0.001, decay: 0.008, sustain: 0.1, release: 0.02 },
      ],
      { filterType: "lowpass", filterFreq: 3000 }
    );
  },

  draw: () => {
    playLayered(
      [
        { freq: 440, type: "triangle", volume: 0.07, duration: 0.15, attack: 0.005, decay: 0.03, sustain: 0.3, release: 0.08 },
        { freq: 440, type: "sine", volume: 0.04, detune: -5, duration: 0.13, attack: 0.005, decay: 0.025, sustain: 0.25, release: 0.07 },
      ],
      { reverb: true }
    );
    setTimeout(() => {
      playLayered(
        [
          { freq: 440, type: "triangle", volume: 0.07, duration: 0.15, attack: 0.005, decay: 0.03, sustain: 0.3, release: 0.08 },
          { freq: 440, type: "sine", volume: 0.04, detune: -5, duration: 0.13, attack: 0.005, decay: 0.025, sustain: 0.25, release: 0.07 },
        ],
        { reverb: true }
      );
    }, 200);
  },

  jump: () => {
    const ctx = getCtx();
    const t = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(300, t);
    osc1.frequency.exponentialRampToValueAtTime(650, t + 0.1);
    gain1.gain.setValueAtTime(0.001, t);
    gain1.gain.linearRampToValueAtTime(0.09, t + 0.01);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(600, t);
    osc2.frequency.exponentialRampToValueAtTime(1300, t + 0.1);
    gain2.gain.setValueAtTime(0.001, t);
    gain2.gain.linearRampToValueAtTime(0.03, t + 0.01);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(ctx.destination);
    gain2.connect(ctx.destination);
    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.15);
    osc2.stop(t + 0.12);
  },

  collectStar: () => {
    playLayered(
      [
        { freq: 1047, type: "sine", volume: 0.08, duration: 0.08, attack: 0.001, decay: 0.015, sustain: 0.3, release: 0.04 },
        { freq: 1047 * 2, type: "sine", volume: 0.025, duration: 0.06, attack: 0.001, decay: 0.01, sustain: 0.15, release: 0.03 },
      ],
      { reverb: true, reverbDelay: 0.015, reverbFeedback: 0.12, reverbMix: 0.1 }
    );
    setTimeout(() => {
      playLayered(
        [
          { freq: 1319, type: "sine", volume: 0.08, duration: 0.1, attack: 0.001, decay: 0.02, sustain: 0.35, release: 0.05 },
          { freq: 1319 * 2, type: "sine", volume: 0.025, duration: 0.08, attack: 0.001, decay: 0.015, sustain: 0.2, release: 0.04 },
        ],
        { reverb: true, reverbDelay: 0.02, reverbFeedback: 0.15, reverbMix: 0.12 }
      );
    }, 50);
  },

  die: () => {
    const ctx = getCtx();
    const t = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();
    const dist = createDistortion(ctx, 8);

    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(400, t);
    osc1.frequency.exponentialRampToValueAtTime(60, t + 0.5);
    gain1.gain.setValueAtTime(0.001, t);
    gain1.gain.linearRampToValueAtTime(0.07, t + 0.01);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    osc2.type = "square";
    osc2.frequency.setValueAtTime(300, t);
    osc2.frequency.exponentialRampToValueAtTime(40, t + 0.45);
    gain2.gain.setValueAtTime(0.001, t);
    gain2.gain.linearRampToValueAtTime(0.03, t + 0.01);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    const lpf = createFilter(ctx, "lowpass", 2000);
    lpf.frequency.exponentialRampToValueAtTime(200, t + 0.5);

    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(lpf);
    gain2.connect(lpf);
    lpf.connect(dist);
    dist.connect(ctx.destination);
    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.5);
    osc2.stop(t + 0.45);

    playNoise(0.15, 0.03, { filterType: "bandpass", filterFreq: 800, filterQ: 1, attack: 0.001, release: 0.1 });
  },

  spin: () => {
    for (let i = 0; i < 8; i++) {
      const freq = 400 + Math.random() * 400;
      setTimeout(() => {
        playLayered(
          [
            { freq, type: "sine", volume: 0.035, duration: 0.05, attack: 0.001, decay: 0.01, sustain: 0.15, release: 0.02 },
            { freq: freq * 1.5, type: "triangle", volume: 0.012, duration: 0.04, attack: 0.001, decay: 0.008, sustain: 0.1, release: 0.015 },
          ],
          { filterType: "bandpass", filterFreq: 2000, filterQ: 1.5 }
        );
      }, i * 60);
    }
  },

  slotWin: () => {
    const notes = [523, 659, 784, 880, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        playLayered(
          [
            { freq, type: "sine", volume: 0.09, duration: 0.18, attack: 0.003, decay: 0.03, sustain: 0.45, release: 0.09 },
            { freq: freq * 2, type: "sine", volume: 0.03, duration: 0.15, attack: 0.002, decay: 0.02, sustain: 0.25, release: 0.07 },
            { freq, type: "triangle", volume: 0.04, detune: 5, duration: 0.15, attack: 0.003, decay: 0.025, sustain: 0.35, release: 0.07 },
          ],
          { reverb: true, reverbDelay: 0.025, reverbFeedback: 0.2, reverbMix: 0.18 }
        );
      }, i * 100);
    });
  },

  jackpot: () => {
    const notes = [523, 659, 784, 1047, 1319, 1568];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        playLayered(
          [
            { freq, type: "sine", volume: 0.1, duration: 0.25, attack: 0.004, decay: 0.04, sustain: 0.5, release: 0.12 },
            { freq: freq * 1.5, type: "sine", volume: 0.05, duration: 0.22, attack: 0.003, decay: 0.03, sustain: 0.35, release: 0.1 },
            { freq: freq * 2, type: "sine", volume: 0.03, duration: 0.2, attack: 0.003, decay: 0.025, sustain: 0.25, release: 0.08 },
            { freq, type: "triangle", volume: 0.04, detune: 6, duration: 0.2, attack: 0.004, decay: 0.03, sustain: 0.3, release: 0.09 },
          ],
          { reverb: true, reverbDelay: 0.03, reverbFeedback: 0.3, reverbMix: 0.25 }
        );
        playMetallicClink(freq * 2, 0.04);
      }, i * 100);
    });
  },

  reelTick: () => {
    playLayered(
      [
        { freq: 500, type: "sine", volume: 0.05, duration: 0.03, attack: 0.001, decay: 0.005, sustain: 0.1, release: 0.015 },
        { freq: 1500, type: "triangle", volume: 0.02, duration: 0.02, attack: 0.001, decay: 0.004, sustain: 0.05, release: 0.01 },
      ],
      { filterType: "bandpass", filterFreq: 3000, filterQ: 2 }
    );
  },

  menuOpen: () => {
    playLayered(
      [
        { freq: 400, type: "sine", volume: 0.06, duration: 0.1, attack: 0.003, decay: 0.02, sustain: 0.3, release: 0.05, freqEnd: 700 },
        { freq: 600, type: "triangle", volume: 0.025, duration: 0.08, attack: 0.002, decay: 0.015, sustain: 0.2, release: 0.04, freqEnd: 1050 },
      ],
      { filterType: "lowpass", filterFreq: 4000, filterQ: 0.7 }
    );
  },

  menuClose: () => {
    playLayered(
      [
        { freq: 700, type: "sine", volume: 0.06, duration: 0.1, attack: 0.003, decay: 0.02, sustain: 0.3, release: 0.05, freqEnd: 400 },
        { freq: 1050, type: "triangle", volume: 0.025, duration: 0.08, attack: 0.002, decay: 0.015, sustain: 0.2, release: 0.04, freqEnd: 600 },
      ],
      { filterType: "lowpass", filterFreq: 3500, filterQ: 0.7 }
    );
  },

  levelUp: () => {
    const notes = [523, 659, 784, 1047, 1319];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        playLayered(
          [
            { freq, type: "sine", volume: 0.1, duration: 0.15, attack: 0.003, decay: 0.025, sustain: 0.5, release: 0.07 },
            { freq: freq * 2, type: "sine", volume: 0.04, duration: 0.12, attack: 0.002, decay: 0.02, sustain: 0.3, release: 0.06 },
            { freq, type: "triangle", volume: 0.05, detune: 8, duration: 0.13, attack: 0.003, decay: 0.02, sustain: 0.35, release: 0.06 },
            { freq: freq * 3, type: "sine", volume: 0.015, duration: 0.1, attack: 0.002, decay: 0.015, sustain: 0.15, release: 0.05 },
          ],
          { reverb: true, reverbDelay: 0.03, reverbFeedback: 0.25, reverbMix: 0.2 }
        );
      }, i * 65);
    });
    setTimeout(() => {
      playNoise(0.15, 0.03, { filterType: "highpass", filterFreq: 6000, filterQ: 1, attack: 0.01, release: 0.1 });
    }, 300);
  },

  countdown: () => {
    playLayered(
      [
        { freq: 440, type: "sine", volume: 0.08, duration: 0.12, attack: 0.002, decay: 0.02, sustain: 0.3, release: 0.06 },
        { freq: 880, type: "sine", volume: 0.025, duration: 0.08, attack: 0.001, decay: 0.015, sustain: 0.15, release: 0.04 },
      ],
      { filterType: "lowpass", filterFreq: 3000 }
    );
  },

  whoosh: () => {
    playNoise(0.2, 0.06, { filterType: "bandpass", filterFreq: 2000, filterQ: 3, attack: 0.01, release: 0.15 });
    const ctx = getCtx();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(2000, t + 0.1);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.2);
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.04, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  },

  bell: () => {
    const fundamentals = [880, 880 * 2.76, 880 * 5.4, 880 * 8.93];
    const volumes = [0.08, 0.04, 0.02, 0.01];
    const durations = [0.6, 0.4, 0.25, 0.15];
    fundamentals.forEach((freq, i) => {
      playLayered(
        [
          { freq, type: "sine", volume: volumes[i], duration: durations[i], attack: 0.001, decay: 0.05, sustain: 0.15, release: durations[i] * 0.6 },
        ],
        { reverb: true, reverbDelay: 0.04, reverbFeedback: 0.35, reverbMix: 0.3 }
      );
    });
  },

  powerUp: () => {
    for (let i = 0; i < 6; i++) {
      const freq = 600 + i * 200;
      setTimeout(() => {
        playLayered(
          [
            { freq, type: "sine", volume: 0.07, duration: 0.08, attack: 0.002, decay: 0.015, sustain: 0.3, release: 0.04 },
            { freq: freq * 2, type: "sine", volume: 0.025, duration: 0.06, attack: 0.001, decay: 0.01, sustain: 0.15, release: 0.03 },
            { freq: freq * 1.5, type: "triangle", volume: 0.02, duration: 0.06, attack: 0.002, decay: 0.012, sustain: 0.2, release: 0.03 },
          ],
          { reverb: true, reverbDelay: 0.02, reverbFeedback: 0.15, reverbMix: 0.12 }
        );
      }, i * 45);
    }
    setTimeout(() => {
      playNoise(0.12, 0.025, { filterType: "highpass", filterFreq: 8000, filterQ: 2, attack: 0.005, release: 0.08 });
    }, 250);
  },

  error: () => {
    playLayered(
      [
        { freq: 200, type: "square", volume: 0.06, duration: 0.15, attack: 0.002, decay: 0.03, sustain: 0.25, release: 0.08 },
        { freq: 203, type: "sawtooth", volume: 0.025, duration: 0.13, attack: 0.002, decay: 0.025, sustain: 0.2, release: 0.07 },
      ],
      { filterType: "lowpass", filterFreq: 800, filterQ: 1 }
    );
    setTimeout(() => {
      playLayered(
        [
          { freq: 160, type: "square", volume: 0.06, duration: 0.2, attack: 0.002, decay: 0.04, sustain: 0.2, release: 0.1 },
          { freq: 163, type: "sawtooth", volume: 0.025, duration: 0.18, attack: 0.002, decay: 0.035, sustain: 0.18, release: 0.09 },
        ],
        { filterType: "lowpass", filterFreq: 600, filterQ: 1 }
      );
    }, 120);
  },

  notification: () => {
    const notes = [880, 1100];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        playLayered(
          [
            { freq, type: "sine", volume: 0.07, duration: 0.12, attack: 0.003, decay: 0.02, sustain: 0.4, release: 0.06 },
            { freq: freq * 2, type: "sine", volume: 0.02, duration: 0.1, attack: 0.002, decay: 0.015, sustain: 0.2, release: 0.05 },
          ],
          { reverb: true, reverbDelay: 0.025, reverbFeedback: 0.2, reverbMix: 0.15 }
        );
      }, i * 100);
    });
  },
};
