import { MIDIHandler } from './midiHandler.js';
import { MicHandler } from './micHandler.js';
import { GUITAR_TABS } from './config.js';

const { Renderer, Stave, StaveNote, Formatter, Accidental, StaveConnector } = VexFlow;

class PracticeManager {
  constructor() {
    this.composition = null;
    this.tempo = 60;
    this.subdivision = 1;
    this.isPlaying = false;
    this.audioContext = null;

    // Current practice state
    this.currentMeasureIndex = 0;
    this.noteHitStatus = [];   // per-note: true = hit, false = missed, null = pending
    this.beatInMeasure = 0;
    this.timerID = null;
    this.nextBeatTime = 0;
    this.lookahead = 25;        // ms
    this.scheduleAhead = 0.1;   // seconds

    // Rendering
    this.staffContainer = document.getElementById('practice-staff');

    // Input handlers
    this.midiHandler = null;
    this.micHandler = null;
    this.instrumentMode = 'piano';
    this.hintEnabled = false;

    // Track which note in the measure is currently "active" for input matching
    this.activeNoteIdx = -1;

    this.initUI();
    this.loadFromLocalStorage();
    if (this.composition) {
      this.renderCurrentMeasure();
    }
  }

  // ── UI Setup ──────────────────────────────────────────────────────────────

  initUI() {
    document.getElementById('load-btn').addEventListener('click', () => {
      document.getElementById('load-composition').click();
    });

    document.getElementById('load-composition').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          this.composition = JSON.parse(ev.target.result);
          this.resetPractice();
          this.renderCurrentMeasure();
        } catch (err) {
          alert('Invalid composition file');
        }
      };
      reader.readAsText(file);
    });

    // Tempo controls
    document.getElementById('tempo-down').addEventListener('click', () => this.adjustTempo(-5));
    document.getElementById('tempo-up').addEventListener('click', () => this.adjustTempo(5));

    // BPM slider
    const bpmSlider = document.getElementById('bpm-slider');
    if (bpmSlider) {
      bpmSlider.value = this.tempo;
      bpmSlider.addEventListener('input', () => {
        this.tempo = parseInt(bpmSlider.value);
        document.getElementById('tempo-display').textContent = this.tempo;
      });
    }

    // Subdivision
    document.querySelectorAll('.subdiv-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.subdiv-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.subdivision = parseInt(e.target.dataset.subdiv);
      });
    });

    // Play/Stop
    document.getElementById('play-practice-btn').addEventListener('click', () => this.startPractice());
    document.getElementById('stop-practice-btn').addEventListener('click', () => this.stopPractice());

    // MIDI
    document.getElementById('midi-toggle').addEventListener('change', async (e) => {
      if (e.target.checked) {
        if (!this.midiHandler) {
          this.midiHandler = new MIDIHandler({
            onNoteOn: (info) => this.handleInputNote(info.midi),
            onStatusChange: (s) => this.setStatus('midi-status', s),
          });
        }
        await this.midiHandler.connect();
      } else if (this.midiHandler) {
        this.midiHandler.disconnect();
      }
    });

    // Mic
    document.getElementById('mic-toggle').addEventListener('change', async (e) => {
      const micControls = document.getElementById('practice-mic-controls');
      if (e.target.checked) {
        micControls?.classList.remove('hidden');
        if (!this.micHandler) {
          this.micHandler = new MicHandler({
            onNoteOn: (info) => this.handleInputNote(info.midi),
            onStatusChange: (s) => this.setStatus('mic-status', s),
            onLevelUpdate: (rms) => this.updateMicLevel(rms),
          });
        }
        await this.micHandler.connect();
        this.micHandler.transpose = this.instrumentMode === 'guitar' ? 12 : 0;
      } else {
        micControls?.classList.add('hidden');
        if (this.micHandler) this.micHandler.disconnect();
      }
      this._updateInstrumentToggleVisibility();
    });

    // Hint toggle — controls both fingering hint and note buttons
    document.getElementById('hint-toggle').addEventListener('change', (e) => {
      this.hintEnabled = e.target.checked;
      const noteButtons = document.getElementById('practice-note-buttons');
      if (this.hintEnabled) {
        noteButtons?.classList.remove('hidden');
        if (this.isPlaying) this._updateHint();
      } else {
        noteButtons?.classList.add('hidden');
        const el = document.getElementById('practice-hint');
        if (el) { el.innerHTML = ''; el.classList.add('hidden'); }
      }
      this._updateInstrumentToggleVisibility();
    });

    // Shared instrument mode toggle (piano vs guitar)
    document.querySelectorAll('#instrument-toggle-section .instrument-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#instrument-toggle-section .instrument-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.instrumentMode = btn.dataset.mode;
        if (this.micHandler) {
          this.micHandler.transpose = this.instrumentMode === 'guitar' ? 12 : 0;
        }
        if (this.isPlaying && this.hintEnabled) this._updateHint();
      });
    });

    // Mic threshold slider
    const micSlider = document.getElementById('practice-mic-threshold');
    if (micSlider) {
      const updateThreshold = () => {
        const el = document.getElementById('practice-mic-meter-threshold');
        if (el) el.style.left = `${(micSlider.value / micSlider.max) * 100}%`;
        if (this.micHandler) this.micHandler.minRms = parseFloat(micSlider.value);
      };
      micSlider.addEventListener('input', updateThreshold);
      updateThreshold();
    }
  }

  setStatus(id, text) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = text;
      el.className = 'input-status' + (text === 'Connected' || text === 'Listening' ? ' connected' : '');
    }
  }

  updateMicLevel(rms) {
    const fill = document.getElementById('practice-mic-meter-fill');
    if (fill) fill.style.width = `${Math.min(rms / 0.3, 1) * 100}%`;
  }

  adjustTempo(delta) {
    this.tempo = Math.max(1, Math.min(200, this.tempo + delta));
    document.getElementById('tempo-display').textContent = this.tempo;
    const slider = document.getElementById('bpm-slider');
    if (slider) slider.value = this.tempo;
  }

  loadFromLocalStorage() {
    const data = localStorage.getItem('composition');
    if (!data) return;
    try {
      this.composition = JSON.parse(data);
    } catch (e) {
      console.error('Failed to load composition:', e);
    }
  }

  updateMeasureLabel() {
    const el = document.getElementById('measure-label');
    if (!this.composition) {
      el.textContent = 'No composition loaded';
      return;
    }
    const total = this.composition.measures.length;
    el.textContent = `Measure ${this.currentMeasureIndex + 1} / ${total}`;
  }

  // ── Rendering (single measure at a time) ──────────────────────────────────

  renderCurrentMeasure() {
    if (!this.composition) return;

    this.updateMeasureLabel();
    this.staffContainer.innerHTML = '';

    const measure = this.composition.measures[this.currentMeasureIndex];
    if (!measure) return;

    const renderer = new Renderer(this.staffContainer, Renderer.Backends.SVG);
    const clef = this.composition.clef;
    const isGrand = clef === 'grand';
    const height = isGrand ? 280 : 180;
    renderer.resize(580, height);
    const ctx = renderer.getContext();

    const staveWidth = 500;
    const x = 40;
    const y = 20;

    const [numBeats, beatValue] = this.composition.timeSignature.split('/').map(Number);

    if (isGrand) {
      const treble = new Stave(x, y, staveWidth).addClef('treble').addTimeSignature(this.composition.timeSignature);
      const bass = new Stave(x, y + 100, staveWidth).addClef('bass').addTimeSignature(this.composition.timeSignature);
      treble.setContext(ctx).draw();
      bass.setContext(ctx).draw();
      new StaveConnector(treble, bass).setType('brace').setContext(ctx).draw();

      const trebleNotes = measure.filter(n => (n.clef || 'treble') === 'treble');
      const bassNotes = measure.filter(n => n.clef === 'bass');

      this._drawAndCollect(trebleNotes, treble, 'treble', ctx, staveWidth);
      this._drawAndCollect(bassNotes, bass, 'bass', ctx, staveWidth);
    } else {
      const renderClef = clef || 'treble';
      const stave = new Stave(x, y, staveWidth).addClef(renderClef).addTimeSignature(this.composition.timeSignature);
      stave.setContext(ctx).draw();
      this._drawAndCollect(measure, stave, renderClef, ctx, staveWidth);
    }

    // Reset hit status for all notes in this measure
    // null = not yet judged; rests stay null (we don't validate them)
    this.noteHitStatus = measure.map(() => null);

    this._updateStaffColors();
    this.buildNoteButtons();
  }

  _drawAndCollect(noteDataArr, stave, clef, ctx, staveWidth) {
    if (noteDataArr.length === 0) return;

    const vexNotes = noteDataArr.map(item => {
      if (item.type === 'rest') {
        return new StaveNote({ keys: ['b/4'], duration: item.duration, clef });
      }
      const note = new StaveNote({ keys: item.keys, duration: item.duration, clef });
      if (item.accidental) note.addModifier(new Accidental(item.accidental), 0);
      return note;
    });

    try {
      Formatter.FormatAndDraw(ctx, stave, vexNotes);
    } catch (e) {
      console.error('Error rendering notes:', e);
    }
  }

  // Map a measure-array index to the SVG .vf-stavenote index.
  // Grand staff renders treble notes first, then bass notes in the SVG.
  _measureToSvgIndex(measureIdx) {
    const measure = this.composition?.measures[this.currentMeasureIndex] || [];
    if (this.composition?.clef !== 'grand') return measureIdx;

    const note = measure[measureIdx];
    const clef = note?.clef || 'treble';
    const sameClefBefore = measure.slice(0, measureIdx)
      .filter(n => (n.clef || 'treble') === clef).length;
    if (clef === 'bass') {
      const trebleCount = measure.filter(n => (n.clef || 'treble') === 'treble').length;
      return trebleCount + sameClefBefore;
    }
    return sameClefBefore;
  }

  // Unified staff coloring — applies active highlight, correct/wrong colors
  // directly via inline styles so it works regardless of VexFlow's SVG structure.
  _updateStaffColors() {
    const svg = this.staffContainer.querySelector('svg');
    if (!svg) return;

    const ACTIVE  = '#00E5FF';
    const CORRECT = '#2ecc71';
    const WRONG   = '#e74c3c';

    const noteGroups = svg.querySelectorAll('.vf-stavenote');
    const measure = this.composition?.measures[this.currentMeasureIndex] || [];

    // Clear all inline color overrides first
    noteGroups.forEach(g => {
      g.querySelectorAll('*').forEach(el => {
        el.style.removeProperty('fill');
        el.style.removeProperty('stroke');
      });
    });

    // Apply per-note colors
    measure.forEach((note, i) => {
      if (note.type === 'rest') return;

      let color = null;
      if (this.noteHitStatus[i] === true)       color = CORRECT;
      else if (this.noteHitStatus[i] === false) color = WRONG;
      else if (i === this.activeNoteIdx && this.isPlaying) color = ACTIVE;

      if (!color) return;

      const svgIdx = this._measureToSvgIndex(i);
      const group = noteGroups[svgIdx];
      if (group) {
        group.querySelectorAll('*').forEach(el => {
          el.style.setProperty('fill', color, 'important');
          el.style.setProperty('stroke', color, 'important');
        });
      }
    });

    this._updateNoteButtonStates();
  }

  // ── Practice loop ─────────────────────────────────────────────────────────

  startPractice() {
    if (this.isPlaying) return;
    if (!this.composition || this.composition.measures.length === 0) {
      alert('No composition loaded. Create one in Compose mode or load a file.');
      return;
    }

    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.audioContext.state === 'suspended') this.audioContext.resume();

    this.isPlaying = true;
    this.currentMeasureIndex = 0;
    this.resetMeasureState();
    this.renderCurrentMeasure();

    this.beatInMeasure = 0;
    this.nextBeatTime = this.audioContext.currentTime + 0.05;
    this.measureStartTime = this.nextBeatTime;
    this.scheduler();
  }

  stopPractice() {
    this.isPlaying = false;
    clearTimeout(this.timerID);
    this.activeNoteIdx = -1;

    // Clear active highlights
    const hintEl = document.getElementById('practice-hint');
    if (hintEl) { hintEl.innerHTML = ''; hintEl.classList.add('hidden'); }
    this._updateStaffColors();
  }

  resetMeasureState() {
    const measure = this.composition.measures[this.currentMeasureIndex] || [];
    this.noteHitStatus = measure.map(() => null);
    this.activeNoteIdx = -1;
  }

  resetPractice() {
    this.stopPractice();
    this.currentMeasureIndex = 0;
  }

  // ── Metronome scheduling ──────────────────────────────────────────────────

  scheduler() {
    if (!this.isPlaying) return;

    while (this.nextBeatTime < this.audioContext.currentTime + this.scheduleAhead) {
      this.scheduleBeat(this.nextBeatTime, this.beatInMeasure);
      this.advanceBeat();
    }

    // Update active note at scheduler resolution (every ~25ms)
    // This ensures eighth notes between metronome clicks get tracked
    this.updateActiveNote();

    this.timerID = setTimeout(() => this.scheduler(), this.lookahead);
  }

  scheduleBeat(time, beat) {
    const [numBeats] = this.composition.timeSignature.split('/').map(Number);
    const totalClicks = numBeats * this.subdivision;
    const isAccent = (beat % this.subdivision === 0);
    const isDownbeat = (beat === 0);

    // Metronome click
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.frequency.value = isDownbeat ? 1000 : isAccent ? 800 : 600;
    gain.gain.setValueAtTime(isAccent ? 0.5 : 0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
    osc.start(time);
    osc.stop(time + 0.05);
  }

  advanceBeat() {
    const [numBeats] = this.composition.timeSignature.split('/').map(Number);
    const totalClicks = numBeats * this.subdivision;
    const secondsPerClick = 60.0 / this.tempo / this.subdivision;

    this.nextBeatTime += secondsPerClick;
    this.beatInMeasure++;

    if (this.beatInMeasure >= totalClicks) {
      // End of measure — schedule at the actual end time so the last note
      // stays highlighted for its full duration instead of being cut short
      // by the scheduler's lookahead.
      this.beatInMeasure = 0;
      const endTime = this.nextBeatTime;
      const delay = Math.max(0, (endTime - this.audioContext.currentTime) * 1000);
      setTimeout(() => {
        if (!this.isPlaying) return;
        this.measureStartTime = endTime;
        this.onMeasureEnd();
      }, delay);
    }
  }

  // Continuously track which note is active based on elapsed time
  // This runs at scheduler resolution (~25ms) so eighth notes between
  // metronome clicks get properly highlighted.
  updateActiveNote() {
    if (!this.isPlaying || !this.measureStartTime) return;

    const measure = this.composition.measures[this.currentMeasureIndex] || [];
    if (measure.length === 0) return;

    const elapsed = this.audioContext.currentTime - this.measureStartTime;
    const secondsPerBeat = 60.0 / this.tempo;
    const beatPosition = elapsed / secondsPerBeat;

    const durationMap = { 'w': 4, 'h': 2, 'q': 1, '8': 0.5, '16': 0.25 };
    let cumBeats = 0;
    for (let i = 0; i < measure.length; i++) {
      const dur = measure[i].duration.replace('r', '');
      const noteBeats = durationMap[dur] || 1;
      if (beatPosition >= cumBeats && beatPosition < cumBeats + noteBeats) {
        if (this.activeNoteIdx !== i) {
          this.activeNoteIdx = i;
          this._updateStaffColors();
          this._updateHint();
        }
        return;
      }
      cumBeats += noteBeats;
    }
  }

  onMeasureEnd() {
    if (!this.isPlaying) return;

    // Mark any unjudged non-rest notes (null) as wrong
    const measure = this.composition.measures[this.currentMeasureIndex] || [];
    this.noteHitStatus = this.noteHitStatus.map((v, i) =>
      measure[i]?.type === 'rest' ? null : (v === null ? false : v)
    );
    this._updateStaffColors();

    // Only check non-rest notes for pass/fail
    const allCorrect = this.noteHitStatus.every((v, i) =>
      measure[i]?.type === 'rest' || v === true
    );
    if (allCorrect) {
      if (this.currentMeasureIndex < this.composition.measures.length - 1) {
        this.currentMeasureIndex++;
      }
    }
    // If not all correct, loop same measure

    this.resetMeasureState();
    this.renderCurrentMeasure();

    // measureStartTime is set by the advanceBeat setTimeout caller
    // using the captured endTime (this.nextBeatTime is stale by now).
  }

  // ── Note buttons ──────────────────────────────────────────────────────────

  buildNoteButtons() {
    const container = document.getElementById('practice-note-buttons');
    if (!container) return;
    container.innerHTML = '';

    const measure = this.composition.measures[this.currentMeasureIndex] || [];

    measure.forEach((note, i) => {
      const btn = document.createElement('button');
      btn.className = 'practice-note-btn' + (note.type === 'rest' ? ' rest-btn' : '');
      btn.textContent = this._noteLabel(note);
      btn.dataset.index = i;

      if (note.type !== 'rest') {
        btn.addEventListener('click', () => this.handleNoteButtonClick(i));
      }

      container.appendChild(btn);
    });
  }

  _noteLabel(noteData) {
    if (noteData.type === 'rest') {
      const durLabels = { 'wr': 'W rest', 'hr': 'H rest', 'qr': 'Q rest', '8r': '8th rest', '16r': '16th rest' };
      return durLabels[noteData.duration] || 'Rest';
    }
    // Convert VexFlow key like 'c#/4' to 'C#4'
    const key = noteData.keys[0];
    const parts = key.split('/');
    let name = parts[0].toUpperCase();
    if (noteData.accidental === '#' && !name.includes('#')) name += '#';
    if (noteData.accidental === 'b' && !name.includes('B')) name += 'b';
    return name + parts[1];
  }

  _updateNoteButtonStates() {
    const container = document.getElementById('practice-note-buttons');
    if (!container) return;
    const buttons = container.querySelectorAll('.practice-note-btn');

    const measure = this.composition?.measures[this.currentMeasureIndex] || [];
    buttons.forEach((btn, i) => {
      btn.classList.remove('correct', 'wrong', 'active-note');
      const isRest = measure[i]?.type === 'rest';
      if (!isRest) {
        if (this.noteHitStatus[i] === true) {
          btn.classList.add('correct');
        } else if (this.noteHitStatus[i] === false) {
          btn.classList.add('wrong');
        }
      }
      if (i === this.activeNoteIdx && this.isPlaying) {
        btn.classList.add('active-note');
      }
    });
  }

  handleNoteButtonClick(noteIndex) {
    if (!this.isPlaying) return;

    const measure = this.composition.measures[this.currentMeasureIndex] || [];
    const expected = measure[noteIndex];
    if (!expected || expected.type === 'rest') return;

    const idx = this.activeNoteIdx;

    if (noteIndex === idx) {
      // Clicked the correct active note on beat
      this.noteHitStatus[idx] = true;
    } else if (idx >= 0 && idx < measure.length) {
      // Clicked wrong note — mark the clicked one as wrong
      this.noteHitStatus[noteIndex] = false;
    }

    this._updateStaffColors();
  }

  // ── Input handling (MIDI + Mic) ───────────────────────────────────────────

  handleInputNote(midiNote) {
    if (!this.isPlaying) return;

    const measure = this.composition.measures[this.currentMeasureIndex] || [];
    if (measure.length === 0) return;

    const idx = this.activeNoteIdx;
    if (idx < 0 || idx >= measure.length) return;

    const expected = measure[idx];

    // If a rest is active, ignore input — we only validate actual notes
    if (expected.type === 'rest') return;

    // Convert expected pitch to MIDI number for comparison
    const expectedMidi = this.pitchToMidi(expected.keys[0], expected.accidental);
    if (expectedMidi === null) return;

    if (midiNote === expectedMidi) {
      this.noteHitStatus[idx] = true;
    } else {
      this.noteHitStatus[idx] = false;
    }
    this._updateStaffColors();
  }

  // ── UI helpers ────────────────────────────────────────────────────────────

  _updateInstrumentToggleVisibility() {
    const micOn = document.getElementById('mic-toggle')?.checked;
    const hintOn = document.getElementById('hint-toggle')?.checked;
    const section = document.getElementById('instrument-toggle-section');
    if (section) {
      section.classList.toggle('hidden', !micOn && !hintOn);
    }
  }

  // ── Hint rendering ──────────────────────────────────────────────────────

  _updateHint() {
    const el = document.getElementById('practice-hint');
    if (!el) return;

    if (!this.hintEnabled) {
      el.classList.add('hidden');
      return;
    }

    const measure = this.composition?.measures[this.currentMeasureIndex] || [];
    const note = measure[this.activeNoteIdx];
    if (!note || note.type === 'rest') {
      el.classList.add('hidden');
      return;
    }

    el.classList.remove('hidden');
    const noteName = this._noteLabel(note);
    el.innerHTML = this.instrumentMode === 'guitar'
      ? this._buildGuitarTabSVG(noteName)
      : this._buildPianoSVG(noteName);
  }

  _buildPianoSVG(noteName) {
    const NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const W = 24, H = 70, BW = 15, BH = 44;
    const letter = noteName.replace(/[#\d]/g, '');
    const isSharp = noteName.includes('#');
    const octave = noteName.replace(/\D/g, '');
    const target = NAMES.indexOf(letter);
    const primary = getComputedStyle(document.documentElement)
      .getPropertyValue('--primary').trim() || '#4361ee';
    const BLACK_X = [16.5, 40.5, -1, 88.5, 112.5, 136.5, -1];

    const parts = [`<svg xmlns="http://www.w3.org/2000/svg" width="${7 * W}" height="${H + 18}">`];
    for (let i = 0; i < 7; i++) {
      const fill = (!isSharp && i === target) ? primary : '#fff';
      parts.push(`<rect x="${i * W + 0.5}" y="0.5" width="${W - 1}" height="${H}" rx="3" fill="${fill}" stroke="#bbb" stroke-width="1"/>`);
    }
    for (let i = 0; i < 7; i++) {
      if (BLACK_X[i] >= 0) {
        const fill = (isSharp && i === target) ? primary : '#222';
        parts.push(`<rect x="${BLACK_X[i]}" y="0.5" width="${BW}" height="${BH}" rx="2" fill="${fill}" stroke="#222" stroke-width="1"/>`);
      }
    }
    if (target >= 0) {
      const lx = isSharp ? BLACK_X[target] + BW / 2 : target * W + W / 2;
      const ly = isSharp ? BH + 13 : H + 13;
      parts.push(`<text x="${lx}" y="${ly}" text-anchor="middle" font-size="10" fill="${primary}" font-weight="700" font-family="sans-serif">${letter}${isSharp ? '#' : ''}${octave}</text>`);
    }
    parts.push('</svg>');
    return parts.join('');
  }

  _buildGuitarTabSVG(noteName) {
    const tab = GUITAR_TABS[noteName];
    if (!tab) return `<span style="font-size:0.8rem;color:var(--text-secondary)">No tab for ${noteName}</span>`;

    const STR_NAMES = ['e', 'B', 'G', 'D', 'A', 'E'];
    const LW = 14, OW = 22, NW = 4, FW = 28, SH = 18;
    const totalW = LW + OW + NW + 5 * FW;
    const totalH = 5 * SH + 26;
    const nutX = LW + OW;
    const primary = getComputedStyle(document.documentElement)
      .getPropertyValue('--primary').trim() || '#4361ee';

    const parts = [`<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}">`];
    for (let s = 0; s < 6; s++) {
      const y = s * SH + 10;
      const sw = [1, 1, 1.5, 1.5, 2, 2][s];
      parts.push(`<text x="${LW - 2}" y="${y + 4}" text-anchor="end" font-size="11" fill="#999" font-family="monospace">${STR_NAMES[s]}</text>`);
      parts.push(`<line x1="${LW}" y1="${y}" x2="${totalW}" y2="${y}" stroke="#bbb" stroke-width="${sw}"/>`);
    }
    parts.push(`<rect x="${nutX}" y="4" width="${NW}" height="${5 * SH + 12}" fill="#333" rx="1"/>`);
    for (let f = 1; f <= 5; f++) {
      const x = nutX + NW + f * FW;
      parts.push(`<line x1="${x}" y1="4" x2="${x}" y2="${5 * SH + 16}" stroke="#ddd" stroke-width="1"/>`);
    }
    const sy = (tab.str - 1) * SH + 10;
    if (tab.fret === 0) {
      const ox = nutX - OW / 2;
      parts.push(`<circle cx="${ox}" cy="${sy}" r="6" fill="none" stroke="${primary}" stroke-width="2"/>`);
      parts.push(`<text x="${ox}" y="${totalH - 4}" text-anchor="middle" font-size="9" fill="${primary}" font-family="sans-serif">open</text>`);
    } else {
      const cx = nutX + NW + (tab.fret - 0.5) * FW;
      parts.push(`<circle cx="${cx}" cy="${sy}" r="8" fill="${primary}"/>`);
      parts.push(`<text x="${cx}" y="${sy + 4}" text-anchor="middle" font-size="11" fill="white" font-weight="bold" font-family="sans-serif">${tab.fret}</text>`);
    }
    parts.push('</svg>');
    return parts.join('');
  }

  pitchToMidi(key, accidental) {
    // key like 'c/4', 'f#/5', etc.
    const parts = key.split('/');
    if (parts.length !== 2) return null;

    let noteName = parts[0].toLowerCase();
    const octave = parseInt(parts[1]);
    if (isNaN(octave)) return null;

    // Apply accidental from the note data
    if (accidental === '#' && !noteName.includes('#')) {
      noteName += '#';
    } else if (accidental === 'b') {
      // Handle flats by converting to equivalent sharp
      const flatMap = { 'db': 'c#', 'eb': 'd#', 'fb': 'e', 'gb': 'f#', 'ab': 'g#', 'bb': 'a#', 'cb': 'b' };
      noteName = flatMap[noteName + 'b'] || noteName;
    }

    const noteMap = { 'c': 0, 'c#': 1, 'd': 2, 'd#': 3, 'e': 4, 'f': 5, 'f#': 6, 'g': 7, 'g#': 8, 'a': 9, 'a#': 10, 'b': 11 };
    const semitone = noteMap[noteName];
    if (semitone === undefined) return null;

    return (octave + 1) * 12 + semitone;
  }
}

window.practiceManager = new PracticeManager();
