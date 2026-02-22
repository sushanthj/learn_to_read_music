import { LEVELS, GUITAR_TABS, GUITAR_CHORD_SHAPES, LEVELS_LOCKED } from './config.js';

export class UIController {
  constructor({ onNoteGuess, onClefChange, onInputModeChange, onLevelSelect, onInstrumentModeChange, onMicThresholdChange }) {
    this.onNoteGuess            = onNoteGuess;
    this.onClefChange           = onClefChange;
    this.onInputModeChange      = onInputModeChange;
    this.onLevelSelect          = onLevelSelect          || (() => {});
    this.onInstrumentModeChange = onInstrumentModeChange || (() => {});
    this.onMicThresholdChange   = onMicThresholdChange   || (() => {});
    this._currentHintNote       = null;
    this._instrumentMode        = 'piano';

    this.feedbackEl = document.getElementById('feedback');
    this.scoreEl = document.getElementById('score');
    this.accuracyEl = document.getElementById('accuracy');
    this.streakEl = document.getElementById('streak');
    this.bestStreakEl = document.getElementById('best-streak');

    // Level UI elements
    this.levelBadgeEl = document.getElementById('level-badge');
    this.levelNameEl = document.getElementById('level-name');
    this.levelDescEl = document.getElementById('level-description');
    this.progressBarEl = document.getElementById('progress-bar');
    this.progressTextEl = document.getElementById('progress-text');
    this.levelDropdownEl = document.getElementById('level-dropdown');
    this.levelSelectorBtn = document.getElementById('level-selector-btn');
    this.levelUpOverlay = document.getElementById('level-up-overlay');
    this.levelUpLevel = document.getElementById('level-up-level');
    this.levelUpName = document.getElementById('level-up-name');
    this.levelUpDesc = document.getElementById('level-up-desc');

    this.setupNoteButtons();
    this.setupClefButtons();
    this.setupKeyboard();
    this.setupInputModeToggle();
    this.setupLevelSelector();
    this.setupInstrumentMode();
    this.setupHintToggle();
    this.setupMicControls();
  }

  setupNoteButtons() {
    this.noteButtonsContainer = document.getElementById('note-buttons');
  }

  setAnswerOptions(options) {
    if (!this.noteButtonsContainer) return;
    this.noteButtonsContainer.innerHTML = '';

    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'note-btn';
      btn.textContent = opt;
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        this.onNoteGuess(opt);
      });
      this.noteButtonsContainer.appendChild(btn);
    });
  }

  setupClefButtons() {
    const buttons = document.querySelectorAll('.clef-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.onClefChange(btn.dataset.clef);
      });
    });
  }

  setupKeyboard() {
    document.addEventListener('keydown', (e) => {
      const key = e.key.toUpperCase();
      if ('ABCDEFG'.includes(key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        const guess = e.shiftKey ? key + '#' : key;
        this.onNoteGuess(guess);

        const btn = [...document.querySelectorAll('.note-btn')].find(b => b.textContent === guess);
        if (btn) {
          btn.classList.add('pressed');
          setTimeout(() => btn.classList.remove('pressed'), 150);
        }
      }
    });
  }

  setupInputModeToggle() {
    const midiToggle  = document.getElementById('midi-toggle');
    const micToggle   = document.getElementById('mic-toggle');
    const noteButtons = document.getElementById('note-buttons');

    const setMode = (mode) => {
      this.onInputModeChange(mode);
      noteButtons?.classList.toggle('hidden', mode !== 'click');
    };

    if (midiToggle) {
      midiToggle.addEventListener('change', (e) => {
        if (e.target.checked && micToggle) {
          micToggle.checked = false;
          document.getElementById('mic-controls')?.classList.add('hidden');
        }
        setMode(e.target.checked ? 'midi' : 'click');
      });
    }

    if (micToggle) {
      micToggle.addEventListener('change', (e) => {
        if (e.target.checked && midiToggle) midiToggle.checked = false;
        document.getElementById('mic-controls')?.classList.toggle('hidden', !e.target.checked);
        setMode(e.target.checked ? 'mic' : 'click');
      });
    }
  }

  setupLevelSelector() {
    if (this.levelSelectorBtn) {
      this.levelSelectorBtn.addEventListener('click', () => {
        this.levelDropdownEl.classList.toggle('hidden');
      });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.levelDropdownEl.classList.contains('hidden') &&
          !this.levelDropdownEl.contains(e.target) &&
          e.target !== this.levelSelectorBtn &&
          !this.levelSelectorBtn.contains(e.target)) {
        this.levelDropdownEl.classList.add('hidden');
      }
    });
  }

  showFeedback(correct, noteName, delay) {
    this.feedbackEl.textContent = correct ? 'Correct!' : `Wrong — it was ${noteName}`;
    this.feedbackEl.className = 'feedback ' + (correct ? 'correct' : 'wrong');

    const buttons = document.querySelectorAll('.note-btn');
    buttons.forEach(b => b.disabled = true);

    const feedbackDelay = delay || (correct ? 800 : 2000);
    setTimeout(() => {
      this.feedbackEl.className = 'feedback';
      this.feedbackEl.textContent = '\u00A0';
      buttons.forEach(b => b.disabled = false);
    }, feedbackDelay);
  }

  updateScore(stats) {
    this.scoreEl.textContent = `${stats.score} / ${stats.total}`;
    this.accuracyEl.textContent = `${stats.accuracy}%`;
    this.streakEl.textContent = stats.streak;
    this.bestStreakEl.textContent = stats.bestStreak;
  }

  updateLevelDisplay(info) {
    if (!info) return;

    this.levelBadgeEl.textContent = `Level ${info.currentLevel + 1}`;
    this.levelNameEl.textContent = info.levelName;
    this.levelDescEl.textContent = info.levelDescription;

    if (info.isMaxLevel) {
      this.progressBarEl.style.width = '100%';
      this.progressBarEl.classList.add('met');
      this.progressTextEl.textContent = 'Max level reached!';
    } else {
      const progressPct = Math.min((info.recentCount / info.minNotes) * 100, 100);
      const accuracyMet = info.recentCount >= info.minNotes && info.recentAccuracy >= info.minAccuracy;
      this.progressBarEl.style.width = `${progressPct}%`;
      this.progressBarEl.classList.toggle('met', accuracyMet);

      if (info.recentCount < info.minNotes) {
        this.progressTextEl.textContent = `${info.recentCount}/${info.minNotes} notes — need 85%+ accuracy to advance`;
      } else {
        const pct = Math.round(info.recentAccuracy * 100);
        this.progressTextEl.textContent = `Last ${info.minNotes}: ${pct}% accuracy (need 85%)`;
      }
    }
  }

  showLevelDropdown(clefMode, currentIdx, unlockedIdx) {
    const levels = LEVELS[clefMode];
    if (!levels) return;

    this.levelDropdownEl.innerHTML = '';

    levels.forEach((level, i) => {
      const isLocked = LEVELS_LOCKED && i > unlockedIdx;
      const isCurrent = i === currentIdx;

      const el = document.createElement('div');
      el.className = 'level-option' + (isCurrent ? ' current' : '') + (isLocked ? ' locked' : '');

      el.innerHTML = `
        <span class="level-option-num">${i + 1}</span>
        <span class="level-option-name">${level.name}</span>
        ${isLocked ? '<span class="level-option-lock">&#128274;</span>' : ''}
      `;

      if (!isLocked) {
        el.addEventListener('click', () => {
          this.onLevelSelect(i);
          this.levelDropdownEl.classList.add('hidden');
        });
      }

      this.levelDropdownEl.appendChild(el);
    });
  }

  showLevelUp(info) {
    this.levelUpLevel.textContent = `Level ${info.level}`;
    this.levelUpName.textContent = info.name;
    this.levelUpDesc.textContent = info.description;
    this.levelUpOverlay.classList.remove('hidden');

    const dismiss = () => {
      this.levelUpOverlay.classList.add('hidden');
      this.levelUpOverlay.removeEventListener('click', dismiss);
    };

    this.levelUpOverlay.addEventListener('click', dismiss);
    setTimeout(dismiss, 2000);
  }

  showMidiStatus(status) {
    const el = document.getElementById('midi-status');
    if (!el) return;
    el.textContent = status;
    el.className = 'midi-status ' + (status === 'Connected' ? 'connected' : 'disconnected');
  }

  hideMidiOption() {
    const midiSection = document.getElementById('midi-section');
    if (midiSection) midiSection.classList.add('hidden');
  }

  showMicStatus(status) {
    const el = document.getElementById('mic-status');
    if (!el) return;
    el.textContent = status;
    el.className = 'midi-status ' + (status === 'Listening' ? 'connected' : 'disconnected');
  }

  hideMicOption() {
    const micSection = document.getElementById('mic-section');
    if (micSection) micSection.classList.add('hidden');
  }

  updateMicLevel(rms) {
    const fill = document.getElementById('mic-meter-fill');
    if (fill) fill.style.width = `${Math.min(rms / 0.3, 1) * 100}%`;
  }

  setupMicControls() {
    const slider = document.getElementById('mic-threshold');
    if (!slider) return;
    const updateMarker = () => {
      const el = document.getElementById('mic-meter-threshold');
      if (el) el.style.left = `${(slider.value / slider.max) * 100}%`;
      this.onMicThresholdChange(parseFloat(slider.value));
    };
    slider.addEventListener('input', updateMarker);
    updateMarker();  // position marker at initial value
  }

  /** Disable or re-enable mic toggle depending on whether the level has chords */
  updateMicAvailability(hasChords) {
    const micToggle = document.getElementById('mic-toggle');
    const micSection = document.getElementById('mic-section');
    const micLabel = micSection?.querySelector('label[for="mic-toggle"]') || micSection?.querySelector('label');
    if (!micToggle) return;

    if (hasChords) {
      // If mic is active, switch back to click mode
      if (micToggle.checked) {
        micToggle.checked = false;
        document.getElementById('mic-controls')?.classList.add('hidden');
        this.onInputModeChange('click');
        document.getElementById('note-buttons')?.classList.remove('hidden');
      }
      micToggle.disabled = true;
      if (micSection) micSection.style.opacity = '0.45';
      if (micSection) micSection.title = 'Mic is not available for chord levels';
      // Show a brief toast notification
      this._showToast('🎤 Mic disabled — chord detection is not supported');
    } else {
      micToggle.disabled = false;
      if (micSection) micSection.style.opacity = '';
      if (micSection) micSection.title = '';
    }
  }

  _showToast(message) {
    let toast = document.getElementById('chord-mic-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'chord-mic-toast';
      toast.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:var(--surface,#1e1e2e);color:var(--text,#cdd6f4);padding:10px 20px;border-radius:8px;font-size:0.85rem;box-shadow:0 4px 12px rgba(0,0,0,0.4);z-index:1000;transition:opacity 0.4s;pointer-events:none;';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => { toast.style.opacity = '0'; }, 3000);
  }

  setupInstrumentMode() {
    document.querySelectorAll('.instrument-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.instrument-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this._instrumentMode = btn.dataset.mode;
        this._updateHintToggleLabel();
        const hintEl = document.getElementById('fingering-hint');
        if (hintEl && !hintEl.classList.contains('hidden')) this._renderHint(hintEl);
        this.onInstrumentModeChange(btn.dataset.mode);
      });
    });
  }

  setupHintToggle() {
    const btn  = document.getElementById('hint-toggle');
    const hint = document.getElementById('fingering-hint');
    if (!btn || !hint) return;
    btn.addEventListener('click', () => {
      const nowHidden = hint.classList.toggle('hidden');
      btn.textContent  = this._hintLabel(!nowHidden);
      if (!nowHidden) this._renderHint(hint);
    });
  }

  updateFingeringHint(note) {
    this._currentHintNote = note;
    const hintEl = document.getElementById('fingering-hint');
    if (!hintEl || hintEl.classList.contains('hidden')) return;
    this._renderHint(hintEl);
  }

  _renderHint(el) {
    if (!this._currentHintNote) { el.innerHTML = ''; return; }
    if (this._currentHintNote.type === 'chord') {
      el.innerHTML = this._instrumentMode === 'guitar'
        ? this._buildChordGuitarSVG(this._currentHintNote.name)
        : this._buildChordPianoSVG(this._currentHintNote.keys);
      return;
    }
    el.innerHTML = this._instrumentMode === 'guitar'
      ? this._buildGuitarTabSVG(this._currentHintNote.name)
      : this._buildPianoSVG(this._currentHintNote.name);
  }

  _hintLabel(visible) {
    const icon = this._instrumentMode === 'guitar' ? '\uD83C\uDFB8' : '\uD83C\uDFB9';
    return `${icon} ${visible ? 'Hide' : 'Show'} hint`;
  }

  _updateHintToggleLabel() {
    const btn  = document.getElementById('hint-toggle');
    const hint = document.getElementById('fingering-hint');
    if (!btn) return;
    btn.textContent = this._hintLabel(hint && !hint.classList.contains('hidden'));
  }

  // Mini piano keyboard SVG — one octave, highlights the target key
  _buildPianoSVG(noteName) {
    const NAMES   = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const W = 24, H = 70, BW = 15, BH = 44;
    const letter  = noteName.replace(/[#\d]/g, '');
    const isSharp = noteName.includes('#');
    const octave  = noteName.replace(/\D/g, '');
    const target  = NAMES.indexOf(letter);
    const primary = getComputedStyle(document.documentElement)
      .getPropertyValue('--primary').trim() || '#4361ee';
    // x-position of each black key (centered in the white-key gap)
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

  // Guitar tab SVG — 6 strings, frets 1-5, circle on target position
  _buildGuitarTabSVG(noteName) {
    const tab = GUITAR_TABS[noteName];
    if (!tab) return `<span style="font-size:0.8rem;color:var(--text-secondary)">No tab for ${noteName}</span>`;

    const STR_NAMES = ['e', 'B', 'G', 'D', 'A', 'E'];
    const LW = 14, OW = 22, NW = 4, FW = 28, SH = 18;
    const totalW = LW + OW + NW + 5 * FW;
    const totalH = 5 * SH + 26;
    const nutX   = LW + OW;
    const primary = getComputedStyle(document.documentElement)
      .getPropertyValue('--primary').trim() || '#4361ee';

    const parts = [`<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}">`];
    for (let s = 0; s < 6; s++) {
      const y  = s * SH + 10;
      const sw = [1, 1, 1.5, 1.5, 2, 2][s];
      parts.push(`<text x="${LW - 2}" y="${y + 4}" text-anchor="end" font-size="11" fill="#999" font-family="monospace">${STR_NAMES[s]}</text>`);
      // Line spans from before the nut (for open-string markers) to end
      parts.push(`<line x1="${LW}" y1="${y}" x2="${totalW}" y2="${y}" stroke="#bbb" stroke-width="${sw}"/>`);
    }
    // Nut bar
    parts.push(`<rect x="${nutX}" y="4" width="${NW}" height="${5 * SH + 12}" fill="#333" rx="1"/>`);
    // Fret dividers
    for (let f = 1; f <= 5; f++) {
      const x = nutX + NW + f * FW;
      parts.push(`<line x1="${x}" y1="4" x2="${x}" y2="${5 * SH + 16}" stroke="#ddd" stroke-width="1"/>`);
    }
    // Note marker
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

  // Chord piano hint — 2-octave keyboard highlighting all chord tones
  _buildChordPianoSVG(keys) {
    const NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const W = 24, H = 70, BW = 15, BH = 44;
    const BLACK_X = [16.5, 40.5, -1, 88.5, 112.5, 136.5, -1];
    const primary = getComputedStyle(document.documentElement)
      .getPropertyValue('--primary').trim() || '#4361ee';

    // Parse VexFlow keys like 'c/4', 'eb/4', 'g/4'
    const notes = keys.map(k => {
      const [notePart, oct] = k.split('/');
      const letter = notePart.charAt(0).toUpperCase();
      const isSharp = notePart.includes('#');
      const isFlat = !isSharp && notePart.length >= 2 && notePart.endsWith('b');
      return { letter, isSharp, isFlat, isBlack: isSharp || isFlat, octave: parseInt(oct) };
    });

    const minOctave = Math.min(...notes.map(n => n.octave));
    const maxOctave = Math.max(...notes.map(n => n.octave));
    const numOctaves = maxOctave - minOctave + 1;
    const totalWhite = numOctaves * 7;

    const parts = [`<svg xmlns="http://www.w3.org/2000/svg" width="${totalWhite * W}" height="${H + 18}">`];

    // White keys
    for (let oct = 0; oct < numOctaves; oct++) {
      for (let i = 0; i < 7; i++) {
        const idx = oct * 7 + i;
        const hit = notes.some(n => !n.isBlack && NAMES.indexOf(n.letter) === i && n.octave === minOctave + oct);
        parts.push(`<rect x="${idx * W + 0.5}" y="0.5" width="${W - 1}" height="${H}" rx="3" fill="${hit ? primary : '#fff'}" stroke="#bbb" stroke-width="1"/>`);
      }
    }

    // Black keys
    for (let oct = 0; oct < numOctaves; oct++) {
      for (let i = 0; i < 7; i++) {
        if (BLACK_X[i] < 0) continue;
        const bx = oct * 7 * W + BLACK_X[i];
        const hit = notes.some(n => {
          if (!n.isBlack || n.octave !== minOctave + oct) return false;
          const li = NAMES.indexOf(n.letter);
          return n.isFlat ? (li - 1 === i) : (li === i);
        });
        parts.push(`<rect x="${bx}" y="0.5" width="${BW}" height="${BH}" rx="2" fill="${hit ? primary : '#222'}" stroke="#222" stroke-width="1"/>`);
      }
    }

    // Labels
    for (const n of notes) {
      const oct = n.octave - minOctave;
      const idx = NAMES.indexOf(n.letter);
      if (n.isSharp) {
        const lx = oct * 7 * W + BLACK_X[idx] + BW / 2;
        parts.push(`<text x="${lx}" y="${BH + 13}" text-anchor="middle" font-size="10" fill="${primary}" font-weight="700" font-family="sans-serif">${n.letter}#${n.octave}</text>`);
      } else if (n.isFlat) {
        const blackIdx = idx - 1;
        const lx = oct * 7 * W + BLACK_X[blackIdx] + BW / 2;
        parts.push(`<text x="${lx}" y="${BH + 13}" text-anchor="middle" font-size="10" fill="${primary}" font-weight="700" font-family="sans-serif">${n.letter}♭${n.octave}</text>`);
      } else {
        const lx = (oct * 7 + idx) * W + W / 2;
        parts.push(`<text x="${lx}" y="${H + 13}" text-anchor="middle" font-size="10" fill="${primary}" font-weight="700" font-family="sans-serif">${n.letter}${n.octave}</text>`);
      }
    }

    parts.push('</svg>');
    return parts.join('');
  }

  // Chord guitar hint — proper chord diagram using GUITAR_CHORD_SHAPES
  _buildChordGuitarSVG(chordName) {
    const shape = GUITAR_CHORD_SHAPES[chordName];
    if (!shape) {
      return `<span style="font-size:0.8rem;color:var(--text-secondary)">No diagram for ${chordName}</span>`;
    }

    const frets = shape.frets;        // [str6(E), str5(A), str4(D), str3(G), str2(B), str1(e)]
    const baseFret = shape.baseFret || 1;
    const barre = shape.barre || null; // { fret, fromStr, toStr }

    const STR_NAMES = ['e', 'B', 'G', 'D', 'A', 'E'];
    const LW = 14, OW = 22, NW = 4, FW = 28, SH = 18;
    const FRETS_SHOWN = 5;
    const totalW = LW + OW + NW + FRETS_SHOWN * FW;
    const totalH = 5 * SH + 26;
    const nutX = LW + OW;
    const primary = getComputedStyle(document.documentElement)
      .getPropertyValue('--primary').trim() || '#4361ee';

    const parts = [`<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}">`];

    // Draw strings and labels
    for (let s = 0; s < 6; s++) {
      const y = s * SH + 10;
      const sw = [1, 1, 1.5, 1.5, 2, 2][s];
      parts.push(`<text x="${LW - 2}" y="${y + 4}" text-anchor="end" font-size="11" fill="#999" font-family="monospace">${STR_NAMES[s]}</text>`);
      parts.push(`<line x1="${LW}" y1="${y}" x2="${totalW}" y2="${y}" stroke="#bbb" stroke-width="${sw}"/>`);
    }

    // Draw nut (thick bar for open position) or position indicator
    if (baseFret === 1) {
      parts.push(`<rect x="${nutX}" y="4" width="${NW}" height="${5 * SH + 12}" fill="#333" rx="1"/>`);
    } else {
      parts.push(`<line x1="${nutX + NW / 2}" y1="4" x2="${nutX + NW / 2}" y2="${5 * SH + 16}" stroke="#999" stroke-width="1"/>`);
      parts.push(`<text x="${nutX + NW + 3}" y="${5 * SH + 25}" font-size="9" fill="#999" font-family="sans-serif">${baseFret}fr</text>`);
    }

    // Draw fret lines
    for (let f = 1; f <= FRETS_SHOWN; f++) {
      const x = nutX + NW + f * FW;
      parts.push(`<line x1="${x}" y1="4" x2="${x}" y2="${5 * SH + 16}" stroke="#ddd" stroke-width="1"/>`);
    }

    // Draw barre indicator if present
    if (barre) {
      const displayPos = barre.fret - baseFret + 1;
      if (displayPos >= 1 && displayPos <= FRETS_SHOWN) {
        const cx = nutX + NW + (displayPos - 0.5) * FW;
        const topS = barre.fromStr - 1;   // str 1 → s index 0
        const botS = barre.toStr - 1;     // str 6 → s index 5
        const topY = topS * SH + 10;
        const botY = botS * SH + 10;
        parts.push(`<rect x="${cx - 6}" y="${topY - 6}" width="12" height="${botY - topY + 12}" fill="${primary}" rx="6" opacity="0.85"/>`);
        // Finger number centered on barre
        const midY = (topY + botY) / 2;
        parts.push(`<text x="${cx}" y="${midY + 4}" text-anchor="middle" font-size="11" fill="white" font-weight="bold" font-family="sans-serif">1</text>`);
      }
    }

    // Draw open/muted indicators and fretted dots with finger numbers
    const fingers = shape.fingers || [];
    for (let s = 0; s < 6; s++) {
      const y = s * SH + 10;
      const fretIdx = 5 - s;  // SVG row s → frets index (str1=frets[5], str6=frets[0])
      const fretVal = frets[fretIdx];
      const finger = fingers[fretIdx] || 0;

      if (fretVal === -1) {
        // Muted string: draw X (larger)
        const cx = nutX - OW / 2;
        parts.push(`<text x="${cx}" y="${y + 5}" text-anchor="middle" font-size="16" fill="#999" font-weight="bold" font-family="sans-serif">✕</text>`);
      } else if (fretVal === 0) {
        // Open string: draw O
        const cx = nutX - OW / 2;
        parts.push(`<circle cx="${cx}" cy="${y}" r="6" fill="none" stroke="${primary}" stroke-width="2"/>`);
      } else {
        // Fretted: draw filled circle (skip if covered by barre)
        const strNum = s + 1;  // s=0→str1(high e), s=5→str6(low E)
        const isBarre = barre && fretVal === barre.fret
          && strNum >= barre.fromStr && strNum <= barre.toStr;
        if (!isBarre) {
          const displayPos = fretVal - baseFret + 1;
          if (displayPos >= 1 && displayPos <= FRETS_SHOWN) {
            const cx = nutX + NW + (displayPos - 0.5) * FW;
            parts.push(`<circle cx="${cx}" cy="${y}" r="8" fill="${primary}"/>`);
            if (finger) {
              parts.push(`<text x="${cx}" y="${y + 4}" text-anchor="middle" font-size="11" fill="white" font-weight="bold" font-family="sans-serif">${finger}</text>`);
            }
          }
        }
      }
    }

    parts.push('</svg>');
    return parts.join('');
  }
}
