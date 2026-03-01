import { NOTE_NAMES } from './config.js';

// ─── Tuning constants ─────────────────────────────────────────────────────────
const CONFIDENCE   = 0.82;   // NSDF peak threshold (0–1); higher = stricter
const POLL_MS   = 80;    // ms between pitch-detection runs
const BUF_SIZE  = 2048;  // AnalyserNode buffer size (power-of-2); ~46 ms @ 44.1 kHz

export class MicHandler {
  constructor({ onNoteOn, onStatusChange, onLevelUpdate }) {
    this.onNoteOn       = onNoteOn;
    this.onStatusChange = onStatusChange;
    this.onLevelUpdate  = onLevelUpdate  || null;
    this.transpose      = 0;     // semitones to add after detection; set to 12 for guitar mode
    this.minRms         = 0.06;  // user-adjustable baseline gate (default = 40% of slider)
    this.stableFrames   = 2;     // consecutive frames required to confirm a note attack
    this.audioCtx       = null;
    this.analyser       = null;
    this.stream         = null;
    this._buf           = null;
    this._timer         = null;
    this._smoothRms     = 0;
    this._lastMidi      = -1;
    this._pendingMidi   = -1;
    this._stableCount   = 0;
  }

  static isSupported() {
    return !!(navigator.mediaDevices?.getUserMedia && window.AudioContext);
  }

  async connect() {
    if (!MicHandler.isSupported()) {
      this.onStatusChange('Unsupported');
      return false;
    }

    // Clean up any existing connection first
    if (this.audioCtx) this.disconnect();

    try {
      this.stream   = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.audioCtx = new AudioContext();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = BUF_SIZE;
      this.audioCtx.createMediaStreamSource(this.stream).connect(this.analyser);

      this._buf   = new Float32Array(BUF_SIZE);
      this._timer = setInterval(() => this._tick(), POLL_MS);
      this.onStatusChange('Listening');
      return true;
    } catch (err) {
      this.onStatusChange(err.name === 'NotAllowedError' ? 'Denied' : 'Error');
      return false;
    }
  }

  disconnect() {
    if (this._timer !== null) { clearInterval(this._timer); this._timer = null; }
    this.stream?.getTracks().forEach(t => t.stop());
    this.stream   = null;
    this.audioCtx?.close();
    this.audioCtx  = null;
    this.analyser  = null;
    this._smoothRms   = 0;
    this._lastMidi    = -1;
    this._pendingMidi = -1;
    this.onLevelUpdate?.(0);
    this.onStatusChange('Disconnected');
  }

  /**
   * Called every POLL_MS ms while the mic is active.
   *
   * Stage 1 — Hard floor (before NSDF, cheap)
   *   Smoothed RMS (EMA, α=0.2).  Below minRms×0.25 → silent, reset & bail.
   *
   * Stage 2 — Frequency-scaled threshold (after NSDF)
   *   Lower strings are naturally louder, so the effective threshold is scaled:
   *     < 200 Hz → ×1.4,  200–330 Hz → ×1.0,  330–550 Hz → ×0.55,  > 550 Hz → ×0.4
   *   Signal above the floor but below the scaled threshold (string decaying)
   *   does NOT reset state, preventing re-fire on the decay tail.
   *
   * Then a stability filter (stableFrames consecutive identical frames) and a
   * silence-required guard finish the pipeline before a note is emitted.
   */
  _tick() {
    if (!this.analyser) return;
    this.analyser.getFloatTimeDomainData(this._buf);

    // Smoothed RMS — drives level meter
    let ss = 0;
    for (let i = 0; i < this._buf.length; i++) ss += this._buf[i] * this._buf[i];
    this._smoothRms = 0.8 * this._smoothRms + 0.2 * Math.sqrt(ss / this._buf.length);
    this.onLevelUpdate?.(this._smoothRms);

    // Stage 1: hard floor
    if (this._smoothRms < this.minRms * 0.25) {
      this._lastMidi = -1; this._pendingMidi = -1;
      return;
    }

    const freq = _nsdfPitch(this._buf, this.audioCtx.sampleRate);
    if (freq === null) {
      this._lastMidi = -1; this._pendingMidi = -1;
      return;
    }

    // Stage 2: frequency-scaled threshold (louder low strings get higher bar)
    //   < 200 Hz (E2/A2 strings)      → ×1.4
    //   200–330 Hz (D/G/B strings)     → ×1.0
    //   330–550 Hz (high-E open–mid)   → ×0.55
    //   > 550 Hz  (high-E upper frets) → ×0.4
    const scale = freq < 200 ? 1.4 : freq < 330 ? 1.0 : freq < 550 ? 0.55 : 0.4;
    if (this._smoothRms < this.minRms * scale) return;  // decaying — don't reset state

    const midi = Math.round(12 * Math.log2(freq / 440) + 69) + this.transpose;
    if (midi < 36 || midi > 108) return;

    // Stability filter: require stableFrames consecutive frames before firing
    if (midi !== this._pendingMidi) { this._pendingMidi = midi; this._stableCount = 1; return; }
    if (++this._stableCount < this.stableFrames) return;

    // Silence required to re-fire the same note (prevents bleed-over to next question)
    if (midi === this._lastMidi) return;
    this._lastMidi = midi;

    const letter = NOTE_NAMES[midi % 12];
    const octave = Math.floor(midi / 12) - 1;
    this.onNoteOn({ midi, name: `${letter}${octave}`, letter });
  }
}

// ─── McLeod Pitch Method (NSDF) ──────────────────────────────────────────────
//
// For each lag τ, the Normalized Square Difference Function is:
//
//              2 × Σ x[j]·x[j+τ]
//   NSDF(τ) = ─────────────────────
//              Σ (x[j]² + x[j+τ]²)
//
// A peak at NSDF ≈ 1 means the signal repeats almost perfectly at lag τ,
// giving a fundamental frequency of sampleRate / τ.  The normalization makes
// it far more robust than raw autocorrelation for harmonic-rich timbres
// (guitar, voice) where overtones can create misleading correlation peaks.
//
function _nsdfPitch(buf, sampleRate) {
  const N = buf.length;

  // Lag bounds that cover the guitar/instrument range with a little headroom
  const minLag = Math.floor(sampleRate / 1400);  // ≈ 1400 Hz ceiling
  const maxLag = Math.ceil(sampleRate / 55);      // ≈  55 Hz floor

  // Build NSDF for each lag of interest
  const nsdf = new Float32Array(maxLag + 1);
  for (let tau = minLag; tau <= maxLag; tau++) {
    let acf = 0, m = 0;
    const len = N - tau;
    for (let j = 0; j < len; j++) {
      acf += buf[j] * buf[j + tau];
      m   += buf[j] * buf[j] + buf[j + tau] * buf[j + tau];
    }
    nsdf[tau] = m === 0 ? 0 : 2 * acf / m;
  }

  // Advance past the strong initial peak at τ≈0 by skipping to the first
  // zero-crossing, then to the first positive run beyond it
  let tau = minLag;
  while (tau <= maxLag && nsdf[tau] >= 0) tau++;
  while (tau <= maxLag && nsdf[tau] <  0) tau++;

  // Walk positive runs; accept the first run whose peak clears CONFIDENCE
  let bestTau = -1, bestVal = -Infinity;
  while (tau <= maxLag) {
    if (nsdf[tau] > bestVal) { bestVal = nsdf[tau]; bestTau = tau; }
    if (nsdf[tau] < 0) {
      if (bestVal >= CONFIDENCE) break;   // accept this run's peak
      bestVal = -Infinity; bestTau = -1;  // below threshold — keep searching
    }
    tau++;
  }

  if (bestTau < 1 || bestVal < CONFIDENCE) return null;

  // Parabolic interpolation for sub-sample lag accuracy
  const y0 = nsdf[bestTau - 1];
  const y1 = bestVal;
  const y2 = bestTau + 1 <= maxLag ? nsdf[bestTau + 1] : y1;
  const denom = 2 * (2 * y1 - y0 - y2);
  const refined = denom === 0 ? bestTau : bestTau + (y0 - y2) / denom;

  return sampleRate / refined;
}
