// Web Audio API sound effects — no external audio files needed
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let ctx = null;

function getCtx() {
  if (!ctx) ctx = new AudioCtx();
  return ctx;
}

function playTone(freq, duration, type = 'sine', volume = 0.15) {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    gain.gain.setValueAtTime(volume, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + duration);
  } catch {}
}

export function playComplete() {
  // Ascending chime — success
  playTone(523, 0.12, 'sine', 0.12);
  setTimeout(() => playTone(659, 0.12, 'sine', 0.12), 80);
  setTimeout(() => playTone(784, 0.2, 'sine', 0.1), 160);
}

export function playClick() {
  // Short click
  playTone(800, 0.06, 'square', 0.05);
}

export function playStatusChange() {
  // Subtle two-tone
  playTone(440, 0.1, 'sine', 0.08);
  setTimeout(() => playTone(554, 0.15, 'sine', 0.08), 80);
}

export function playDelete() {
  // Descending low tone
  playTone(330, 0.1, 'sine', 0.1);
  setTimeout(() => playTone(220, 0.2, 'sine', 0.08), 80);
}

export function playCreate() {
  // Bright ascending
  playTone(587, 0.1, 'sine', 0.1);
  setTimeout(() => playTone(740, 0.15, 'sine', 0.1), 100);
}
