/* ============================================================
   INTERACTIVE AUDIO — Overview Visualizer
   Generates pleasant harp/violin-like tones that respond
   to mouse velocity over the overview visual box.
   
   - Slow movement  → warm, therapeutic, reverb-heavy tones
   - Fast movement   → bright, energetic, rapid arpeggios
   
   Uses pure Web Audio API — no external dependencies.
   Fully self-contained IIFE — does NOT touch any existing code.
   ============================================================ */
(function initInteractiveAudio() {
  'use strict';

  // ---- Bail early if Web Audio API is unavailable ----
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;

  // ---- Target element ----
  const container = document.querySelector('.overview-visual');
  if (!container) return;

  // ---- State ----
  let audioCtx = null;
  let masterGain = null;
  let reverbNode = null;
  let filterNode = null;
  let isInitialized = false;
  let isHovering = false;
  let lastX = 0, lastY = 0;
  let lastTime = 0;
  let currentVelocity = 0;       // smoothed 0–1
  let lastNoteTime = 0;
  let animFrame = null;

  // ---- Musical scale (C major pentatonic — always pleasant) ----
  // Multiple octaves for variety
  const NOTES = [
    261.63, 293.66, 329.63, 392.00, 440.00,   // C4 D4 E4 G4 A4
    523.25, 587.33, 659.25, 783.99, 880.00,   // C5 D5 E5 G5 A5
    1046.50, 1174.66, 1318.51                   // C6 D6 E6
  ];

  // ---- Create impulse response for convolution reverb ----
  function createReverbImpulse(ctx, duration, decay) {
    const rate = ctx.sampleRate;
    const length = rate * duration;
    const impulse = ctx.createBuffer(2, length, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return impulse;
  }

  // ---- Initialize audio context (must be called from user gesture) ----
  function initAudio() {
    if (isInitialized) return;

    try {
      audioCtx = new AudioCtx();

      // Master gain (overall volume — keep it subtle)
      masterGain = audioCtx.createGain();
      masterGain.gain.value = 0.15;
      masterGain.connect(audioCtx.destination);

      // Low-pass filter (warm at rest, bright when fast)
      filterNode = audioCtx.createBiquadFilter();
      filterNode.type = 'lowpass';
      filterNode.frequency.value = 800;
      filterNode.Q.value = 1.0;
      filterNode.connect(masterGain);

      // Reverb (convolution)
      reverbNode = audioCtx.createConvolver();
      reverbNode.buffer = createReverbImpulse(audioCtx, 2.5, 3.5);

      // Reverb wet gain
      const reverbGain = audioCtx.createGain();
      reverbGain.gain.value = 0.6;
      reverbNode.connect(reverbGain);
      reverbGain.connect(masterGain);

      // Store reverb gain for velocity modulation
      reverbNode._wetGain = reverbGain;

      isInitialized = true;
    } catch (e) {
      // Silently fail — site keeps working
      console.warn('Interactive audio: Web Audio init failed', e);
    }
  }

  // ---- Play a single "harp pluck" note ----
  function playNote(freq, velocity) {
    if (!audioCtx || audioCtx.state === 'closed') return;

    // Resume if suspended (browser policy)
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // --- Oscillator (sine + triangle layered = harp-like) ---
    const osc1 = audioCtx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = freq;

    const osc2 = audioCtx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.value = freq * 1.001; // Slight detune for richness

    // --- Envelope (pluck shape) ---
    const env = audioCtx.createGain();
    const attack = 0.005;
    // Shorter decay when fast, longer when slow
    const decay = 0.3 + (1 - velocity) * 1.5;
    const noteVol = 0.12 + velocity * 0.08;

    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(noteVol, now + attack);
    env.gain.exponentialRampToValueAtTime(0.001, now + attack + decay);

    // --- Connect: oscillators → envelope → filter (dry) + reverb (wet) ---
    osc1.connect(env);
    osc2.connect(env);
    env.connect(filterNode);
    env.connect(reverbNode);

    // --- Play and cleanup ---
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + attack + decay + 0.05);
    osc2.stop(now + attack + decay + 0.05);

    // Cleanup references
    osc1.onended = () => { osc1.disconnect(); osc2.disconnect(); env.disconnect(); };
  }

  // ---- Pick a note based on velocity ----
  function pickNote(velocity) {
    // Low velocity → lower octave notes; high velocity → full range
    const maxIndex = Math.floor(3 + velocity * (NOTES.length - 3));
    const idx = Math.floor(Math.random() * maxIndex);
    return NOTES[idx];
  }

  // ---- Update filter & reverb based on velocity ----
  function updateAudioParams(velocity) {
    if (!isInitialized || !audioCtx) return;

    const now = audioCtx.currentTime;

    // Filter: 400Hz (warm/muffled) → 3000Hz (bright/crisp)
    const targetFreq = 400 + velocity * 2600;
    filterNode.frequency.linearRampToValueAtTime(targetFreq, now + 0.1);

    // Reverb wet: 0.7 (lots of reverb, dreamy) → 0.2 (dry, punchy)
    if (reverbNode._wetGain) {
      const targetWet = 0.7 - velocity * 0.5;
      reverbNode._wetGain.gain.linearRampToValueAtTime(targetWet, now + 0.1);
    }

    // Master volume: slightly louder when moving
    const vol = 0.4 + velocity * 0.12;
    masterGain.gain.linearRampToValueAtTime(vol, now + 0.1);
  }

  // ---- Animate visualizer bars to match audio ----
  function animateBars() {
    if (!isHovering) {
      animFrame = null;
      return;
    }

    const bars = container.querySelectorAll('.visual-bar');
    const time = performance.now() * 0.001;

    bars.forEach((bar, i) => {
      // Base animation similar to CSS but now velocity-driven
      const phase = time * (2 + currentVelocity * 4) + i * 0.5;
      const wave = Math.sin(phase) * 0.5 + 0.5;
      const baseScale = 0.3 + wave * 0.7;
      const velocityBoost = currentVelocity * 0.4;
      const scale = Math.min(baseScale + velocityBoost, 1.3);

      bar.style.transform = `scaleY(${scale})`;
      bar.style.opacity = (0.5 + scale * 0.5).toString();
    });

    animFrame = requestAnimationFrame(animateBars);
  }

  // ---- Reset bars to default CSS animation ----
  function resetBars() {
    const bars = container.querySelectorAll('.visual-bar');
    bars.forEach(bar => {
      bar.style.transform = '';
      bar.style.opacity = '';
    });
  }

  // ---- Mouse event handlers ----
  function onMouseEnter(e) {
    // Initialize audio on first hover (counts as user gesture)
    initAudio();
    isHovering = true;
    lastX = e.clientX;
    lastY = e.clientY;
    lastTime = performance.now();
    currentVelocity = 0;
    lastNoteTime = 0;

    // Start bar animation loop
    if (!animFrame) {
      animFrame = requestAnimationFrame(animateBars);
    }

    // Add a subtle glow class
    container.classList.add('audio-active');
  }

  function onMouseMove(e) {
    if (!isHovering) return;

    const now = performance.now();
    const dt = now - lastTime;
    if (dt < 16) return; // ~60fps cap

    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const rawSpeed = dist / dt; // px/ms

    // Normalize: 0 = still, 1 = very fast (~3 px/ms)
    const normalized = Math.min(rawSpeed / 3, 1);

    // Smooth with exponential moving average
    currentVelocity = currentVelocity * 0.75 + normalized * 0.25;

    // Update audio parameters continuously
    updateAudioParams(currentVelocity);

    // Trigger notes at velocity-dependent intervals
    // Slow → one note every 600ms; Fast → every 80ms
    const interval = 600 - currentVelocity * 520;
    if (now - lastNoteTime > interval && currentVelocity > 0.02) {
      playNote(pickNote(currentVelocity), currentVelocity);
      lastNoteTime = now;
    }

    lastX = e.clientX;
    lastY = e.clientY;
    lastTime = now;
  }

  function onMouseLeave() {
    isHovering = false;
    currentVelocity = 0;

    // Cancel bar animation and reset to CSS defaults
    if (animFrame) {
      cancelAnimationFrame(animFrame);
      animFrame = null;
    }
    resetBars();

    // Remove glow class
    container.classList.remove('audio-active');
  }

  // ---- Attach listeners ----
  container.addEventListener('mouseenter', onMouseEnter);
  container.addEventListener('mousemove', onMouseMove);
  container.addEventListener('mouseleave', onMouseLeave);

  // ---- Inject minimal CSS for the audio-active glow (additive, non-destructive) ----
  const style = document.createElement('style');
  style.textContent = `
    .overview-visual.audio-active {
      box-shadow: 0 0 60px rgba(201,168,76,0.15), 0 0 120px rgba(201,168,76,0.05);
      transition: box-shadow 0.4s ease;
    }
    .overview-visual.audio-active .visual-note-display {
      filter: drop-shadow(0 0 80px rgba(201,168,76,0.7));
      transition: filter 0.3s ease;
    }
    .overview-visual.audio-active .visual-bar {
      /* Override CSS animation when JS is driving the bars */
      animation: none !important;
      transition: transform 0.08s ease-out, opacity 0.08s ease-out;
      transform-origin: bottom center;
    }
  `;
  document.head.appendChild(style);

})();