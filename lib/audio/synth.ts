// lib/audio/synth.ts

// Singleton pour l'AudioContext (créé au premier geste utilisateur)
let audioCtx: AudioContext | null = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
};

// Générateur de bruit blanc (pour les explosions/impacts)
const createNoiseBuffer = (ctx: AudioContext) => {
  const bufferSize = ctx.sampleRate * 2; // 2 secondes de bruit
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
};

let noiseBuffer: AudioBuffer | null = null;

export const playSfx = (
  type: "hit" | "step" | "magic" | "ui_hover" | "ui_click" | "level_up"
) => {
  const ctx = initAudio();
  const t = ctx.currentTime;
  const gain = ctx.createGain();
  gain.connect(ctx.destination);

  if (type === "hit") {
    // IMPACT : Bruit sec + Onde carrée grave
    if (!noiseBuffer) noiseBuffer = createNoiseBuffer(ctx);
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = noiseBuffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.setValueAtTime(1000, t);
    noiseFilter.frequency.exponentialRampToValueAtTime(100, t + 0.1);

    noiseSrc.connect(noiseFilter);
    noiseFilter.connect(gain);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    noiseSrc.start(t);
    noiseSrc.stop(t + 0.15);

    // Punch
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);
    osc.connect(gain);
    osc.start(t);
    osc.stop(t + 0.1);
  } else if (type === "step") {
    // PAS : Bruit très court et filtré
    if (!noiseBuffer) noiseBuffer = createNoiseBuffer(ctx);
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 400; // Son de pierre/terre

    src.connect(filter);
    filter.connect(gain);

    gain.gain.setValueAtTime(0.1, t); // Volume faible
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

    src.start(t);
    src.stop(t + 0.05);
  } else if (type === "magic") {
    // MAGIE : Onde sinusoïdale montante (Laser/Powerup style)
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.linearRampToValueAtTime(600, t + 0.2);

    // Tremolo
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 15;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 50;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start(t);
    lfo.stop(t + 0.3);

    osc.connect(gain);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.3);

    osc.start(t);
    osc.stop(t + 0.3);
  } else if (type === "ui_hover") {
    // UI HOVER : Bip très court aigu
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(800, t);
    osc.connect(gain);
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.03);
    osc.start(t);
    osc.stop(t + 0.03);
  } else if (type === "ui_click") {
    // UI CLICK : Bip double
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.setValueAtTime(800, t + 0.05);
    osc.connect(gain);
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    osc.start(t);
    osc.stop(t + 0.1);
  } else if (type === "level_up") {
    // LEVEL UP : Arpège
    const notes = [440, 554, 659, 880]; // A major
    let now = t;
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.frequency.value = freq;
      const noteGain = ctx.createGain();
      noteGain.gain.setValueAtTime(0.1, now);
      noteGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      osc.connect(noteGain);
      noteGain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
      now += 0.1;
    });
  }
};
