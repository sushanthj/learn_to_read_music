const { Renderer, Stave, StaveNote, Voice, Formatter, Accidental, StaveConnector } = VexFlow;

class CompositionManager {
  constructor() {
    this.clef = 'treble';
    this.timeSignature = '4/4';
    this.measures = [[]]; // Array of measures, each containing notes
    this.currentMeasure = 0;
    this.selectedDuration = 'w';
    this.selectedAccidental = '';
    this.mode = 'add'; // 'add', 'delete', 'rest'
    this.staveRefs = [];
    
    this.staffContainer = document.getElementById('composition-staff');
    this.renderer = null;
    this.context = null;
    
    this.initUI();
    this._resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(this._resizeTimer);
      this._resizeTimer = setTimeout(() => this.render(), 150);
    });
    try {
      this.initStaff();
      this.render();
    } catch (e) {
      console.error('Compose init error:', e);
    }
  }

  initUI() {
    // Clef buttons
    document.querySelectorAll('.clef-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.clef-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.clef = e.target.dataset.clef;
        this.render();
      });
    });

    // Time signature
    document.getElementById('time-signature').addEventListener('change', (e) => {
      this.timeSignature = e.target.value;
      this.render();
    });

    // Duration buttons
    document.querySelectorAll('.duration-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.duration-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.selectedDuration = e.target.dataset.duration;
      });
    });

    // Accidental buttons
    document.querySelectorAll('.accidental-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.accidental-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.selectedAccidental = e.target.dataset.accidental;
      });
    });

    // Mode button for rest (toggle)
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const isActive = e.target.classList.contains('active');
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        if (!isActive) {
          e.target.classList.add('active');
          this.mode = e.target.dataset.mode;
        } else {
          this.mode = 'add';
        }
      });
    });

    // Measure controls
    document.getElementById('add-measure-btn').addEventListener('click', () => {
      this.measures.push([]);
      this.render();
    });

    document.getElementById('remove-measure-btn').addEventListener('click', () => {
      if (this.measures.length > 1) {
        this.measures.pop();
        this.render();
      }
    });

    // Tool buttons
    document.getElementById('play-btn').addEventListener('click', () => this.playComposition());
    document.getElementById('clear-btn').addEventListener('click', () => this.clear());
    document.getElementById('download-btn').addEventListener('click', () => this.download());

    // Staff interaction handlers
    // Left click = add note, Right click = remove note
    this.staffContainer.addEventListener('click', (e) => {
      if (this._wasDragging) {
        this._wasDragging = false;
        return;
      }
      this.handleStaffClick(e, 'add');
    });
    this.staffContainer.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.handleStaffClick(e, 'delete');
    });

    // Touch: single tap = add, double tap = delete
    let lastTap = 0;
    this.staffContainer.addEventListener('touchend', (e) => {
      const now = Date.now();
      const timeSinceLastTap = now - lastTap;
      
      if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
        // Double tap - delete
        e.preventDefault();
        this.handleTouchEvent(e, 'delete');
        lastTap = 0;
      } else {
        // Single tap - add (with delay to check for double tap)
        lastTap = now;
        setTimeout(() => {
          if (lastTap === now) {
            this.handleTouchEvent(e, 'add');
          }
        }, 300);
      }
    });

    // Drag to move notes
    this.setupDragToMove();
  }

  setupDragToMove() {
    let draggedNote = null;
    let dragStartY = 0;
    this._wasDragging = false;

    const getEventCoords = (e) => {
      const rect = this.staffContainer.getBoundingClientRect();
      if (e.touches) {
        return {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top
        };
      }
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const startDrag = (e) => {
      this._wasDragging = false;
      const coords = getEventCoords(e);
      const noteInfo = this.findNoteAtPosition(coords.x, coords.y);
      if (noteInfo) {
        draggedNote = noteInfo;
        dragStartY = coords.y;
        this._wasDragging = true;
        e.preventDefault();
      }
    };

    const onDrag = (e) => {
      if (!draggedNote) return;
      e.preventDefault();
      const rect = this.staffContainer.getBoundingClientRect();
      let curY;
      if (e.touches) {
        curY = e.touches[0].clientY - rect.top;
      } else {
        curY = e.clientY - rect.top;
      }
      const staveRef = this.staveRefs.find(r => r.measureIndex === draggedNote.measureIndex && r.clef === draggedNote.clef);
      if (staveRef) {
        const newNote = this.yToNote(curY, staveRef.stave, staveRef.clef);
        const measure = this.measures[draggedNote.measureIndex];
        if (measure[draggedNote.noteIndex] && measure[draggedNote.noteIndex].keys[0] !== newNote) {
          measure[draggedNote.noteIndex].keys = [newNote];
          this.render();
        }
      }
    };

    const endDrag = (e) => {
      if (!draggedNote) return;
      draggedNote = null;
    };

    this.staffContainer.addEventListener('mousedown', startDrag);
    this.staffContainer.addEventListener('mousemove', onDrag);
    this.staffContainer.addEventListener('mouseup', endDrag);
    this.staffContainer.addEventListener('touchstart', startDrag, { passive: false });
    this.staffContainer.addEventListener('touchmove', onDrag, { passive: false });
    this.staffContainer.addEventListener('touchend', endDrag);
  }

  findNoteAtPosition(x, y) {
    for (const ref of this.staveRefs) {
      const s = ref.stave;
      const topY = s.getYForLine(0) - 40;
      const botY = s.getYForLine(4) + 40;
      if (y >= topY && y <= botY && x >= s.getX() && x <= s.getX() + s.getWidth()) {
        const measure = this.measures[ref.measureIndex];
        if (measure.length === 0) continue;

        let closestIdx = -1;
        let closestDist = Infinity;
        for (let i = 0; i < measure.length; i++) {
          const noteClef = measure[i].clef || 'treble';
          if (this.clef === 'grand' && noteClef !== ref.clef) continue;
          if (measure[i]._x !== undefined) {
            const dist = Math.abs(x - measure[i]._x);
            if (dist < closestDist) {
              closestDist = dist;
              closestIdx = i;
            }
          }
        }

        if (closestIdx >= 0 && closestDist < 40) {
          return {
            measureIndex: ref.measureIndex,
            noteIndex: closestIdx,
            clef: ref.clef
          };
        }
      }
    }
    return null;
  }

  handleTouchEvent(e, action) {
    if (!e.changedTouches || e.changedTouches.length === 0) return;
    const touch = e.changedTouches[0];
    const rect = this.staffContainer.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    this.processStaffInteraction(x, y, action);
  }

  initStaff() {
    this.staffContainer.innerHTML = '';
    this.renderer = new Renderer(this.staffContainer, Renderer.Backends.SVG);
  }

  handleStaffClick(e, action = 'add') {
    const rect = this.staffContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.processStaffInteraction(x, y, action);
  }

  processStaffInteraction(x, y, action) {
    // Find which stave was clicked using stored references
    let clicked = null;
    for (const ref of this.staveRefs) {
      const s = ref.stave;
      const topY = s.getYForLine(0) - 40;
      const botY = s.getYForLine(4) + 40;
      if (y >= topY && y <= botY && x >= s.getX() && x <= s.getX() + s.getWidth()) {
        clicked = ref;
        break;
      }
    }
    if (!clicked) {
      return;
    }

    const { measureIndex, stave, clef } = clicked;

    if (action === 'delete') {
      const noteInfo = this.findNoteAtPosition(x, y);
      if (noteInfo) {
        this.measures[noteInfo.measureIndex].splice(noteInfo.noteIndex, 1);
        this.render();
      }
      return;
    }

    const note = this.yToNote(y, stave, clef);

    if (action === 'rest' || this.mode === 'rest') {
      this.addRest(measureIndex, clef);
    } else {
      this.addNote(note, measureIndex, clef);
    }
  }

  yToNote(y, stave, clef) {
    const topLineY = stave.getYForLine(0);
    const spacing = stave.getSpacingBetweenLines();
    const halfSpace = spacing / 2;
    const halfLines = Math.round((y - topLineY) / halfSpace);

    // Notes from 2 above top line to 2 below bottom line
    const trebleNotes = [
      'a/5', 'g/5', 'f/5', 'e/5', 'd/5', 'c/5',
      'b/4', 'a/4', 'g/4', 'f/4', 'e/4', 'd/4', 'c/4',
    ];
    const bassNotes = [
      'c/4', 'b/3', 'a/3', 'g/3', 'f/3', 'e/3',
      'd/3', 'c/3', 'b/2', 'a/2', 'g/2',
    ];

    const notes = clef === 'treble' ? trebleNotes : bassNotes;
    const index = halfLines + 2; // offset for 2 notes above top line
    return notes[Math.max(0, Math.min(index, notes.length - 1))];
  }

  addNote(notePitch, measureIndex = 0, clef = 'treble') {
    const measure = this.measures[measureIndex];
    
    // Check if measure is full based on time signature
    if (this.isMeasureFull(measure)) {
      return;
    }

    const noteData = {
      type: 'note',
      keys: [notePitch],
      duration: this.selectedDuration,
      accidental: this.selectedAccidental,
      clef: clef
    };

    measure.push(noteData);
    this.render();
  }

  addRest(measureIndex = 0, clef = 'treble') {
    const measure = this.measures[measureIndex];
    
    if (this.isMeasureFull(measure)) {
      return;
    }

    const restData = {
      type: 'rest',
      duration: this.selectedDuration + 'r',
      clef: clef
    };

    measure.push(restData);
    this.render();
  }

  isMeasureFull(measure) {
    const [beats, beatValue] = this.timeSignature.split('/').map(Number);
    const maxDuration = beats;
    
    let currentDuration = 0;
    const durationMap = { 'w': 4, 'h': 2, 'q': 1, '8': 0.5, '16': 0.25 };
    
    for (const item of measure) {
      const dur = item.duration.replace('r', '');
      currentDuration += durationMap[dur] || 1;
    }

    return currentDuration >= maxDuration;
  }

  render() {
    try {
      this.initStaff();
      this.staveRefs = [];

      const containerWidth = this.staffContainer.clientWidth || 580;
      const [numBeats, beatValue] = this.timeSignature.split('/').map(Number);
      const renderClef = (this.clef === 'grand') ? 'treble' : this.clef;
      const rowHeight = this.clef === 'grand' ? 250 : 150;

      const MARGIN = 20;
      const CLEF_W = 80;     // extra width for clef + time-sig on first measure
      const NOTE_W = 28;     // estimated px per note
      const MIN_MW = 80;     // minimum measure width
      const availWidth = containerWidth - MARGIN * 2;

      // Estimate note-area width each measure needs
      const mEst = this.measures.map(m =>
        Math.max(Math.max(m.length, 1) * NOTE_W + 20, MIN_MW)
      );

      // Pack measures into rows
      const rows = [];
      let curRow = [];
      let curW = CLEF_W;          // first row reserves space for clef + ts

      this.measures.forEach((measure, i) => {
        if (curRow.length > 0 && curW + mEst[i] > availWidth) {
          rows.push(curRow);
          curRow = [];
          curW = 0;               // subsequent rows have no clef overhead
        }
        curRow.push({ measure, idx: i, est: mEst[i] });
        curW += mEst[i];
      });
      if (curRow.length > 0) rows.push(curRow);

      // Size the SVG canvas
      this.renderer.resize(containerWidth, rows.length * rowHeight + 60);
      this.context = this.renderer.getContext();

      let y = 40;

      rows.forEach((row, ri) => {
        if (ri > 0) y += rowHeight;
        const isFirstRow = ri === 0;
        const clefExtra = isFirstRow ? CLEF_W : 0;
        const scaleBase = availWidth - clefExtra;
        const estTotal = row.reduce((s, m) => s + m.est, 0);

        let x = MARGIN;

        row.forEach((m, mi) => {
          const baseW = (m.est / estTotal) * scaleBase;
          const w = baseW + (isFirstRow && mi === 0 ? clefExtra : 0);
          const showClef = isFirstRow && mi === 0;

          if (this.clef === 'grand') {
            const treble = new Stave(x, y, w);
            const bass = new Stave(x, y + 80, w);
            if (showClef) {
              treble.addClef('treble').addTimeSignature(this.timeSignature);
              bass.addClef('bass').addTimeSignature(this.timeSignature);
            }
            treble.setContext(this.context).draw();
            bass.setContext(this.context).draw();
            if (showClef) {
              new StaveConnector(treble, bass).setType('brace').setContext(this.context).draw();
            }
            this.staveRefs.push({ stave: treble, measureIndex: m.idx, clef: 'treble' });
            this.staveRefs.push({ stave: bass, measureIndex: m.idx, clef: 'bass' });

            const tNotes = m.measure.filter(n => (n.clef || 'treble') === 'treble');
            const bNotes = m.measure.filter(n => n.clef === 'bass');
            this._drawMeasureNotes(tNotes, treble, 'treble', numBeats, beatValue, w);
            this._drawMeasureNotes(bNotes, bass, 'bass', numBeats, beatValue, w);
          } else {
            const stave = new Stave(x, y, w);
            if (showClef) stave.addClef(renderClef).addTimeSignature(this.timeSignature);
            stave.setContext(this.context).draw();
            this.staveRefs.push({ stave, measureIndex: m.idx, clef: renderClef });
            this._drawMeasureNotes(m.measure, stave, renderClef, numBeats, beatValue, w);
          }

          x += w;
        });
      });
    } catch (e) {
      console.error('Render error:', e);
    }
    this.saveToLocalStorage();
  }

  saveToLocalStorage() {
    const cleanMeasures = this.measures.map(measure =>
      measure.map(({ _x, ...rest }) => rest)
    );
    const data = {
      clef: this.clef,
      timeSignature: this.timeSignature,
      measures: cleanMeasures
    };
    localStorage.setItem('composition', JSON.stringify(data));
  }

  _drawMeasureNotes(measure, stave, clef, numBeats, beatValue, staveWidth) {
    if (measure.length === 0) return;

    try {
      const notes = measure.map(item => {
        if (item.type === 'rest') {
          return new StaveNote({
            keys: ['b/4'],
            duration: item.duration,
            clef: clef
          });
        } else {
          const note = new StaveNote({
            keys: item.keys,
            duration: item.duration,
            clef: clef
          });

          if (item.accidental) {
            note.addModifier(new Accidental(item.accidental), 0);
          }

          return note;
        }
      });

      // Calculate beats used so notes pack proportionally to the left
      const durationMap = { 'w': 4, 'h': 2, 'q': 1, '8': 0.5, '16': 0.25 };
      let totalBeats = 0;
      for (const item of measure) {
        const dur = item.duration.replace('r', '');
        totalBeats += durationMap[dur] || 1;
      }

      const availableWidth = stave.getNoteEndX() - stave.getNoteStartX();
      const usedFraction = Math.min(totalBeats / numBeats, 1);
      const formatWidth = Math.min(
        Math.max(usedFraction * availableWidth, notes.length * 25),
        availableWidth
      );

      const voice = new Voice({ num_beats: numBeats, beat_value: beatValue });
      voice.setMode(Voice.Mode.SOFT);
      voice.addTickables(notes);

      new Formatter().joinVoices([voice]).format([voice], formatWidth);
      voice.draw(this.context, stave);

      notes.forEach((vfNote, i) => {
        try { measure[i]._x = vfNote.getAbsoluteX(); } catch (ex) { /* skip */ }
      });
    } catch (e) {
      console.error('Error rendering notes:', e);
    }
  }

  playComposition() {
    this.saveToLocalStorage();
    window.location.href = 'practice.html';
  }

  clear() {
    if (confirm('Clear all measures?')) {
      this.measures = [[]];
      this.render();
    }
  }

  download() {
    const data = {
      clef: this.clef,
      timeSignature: this.timeSignature,
      measures: this.measures
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'composition.json';
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Initialize composition manager
window.compositionManager = new CompositionManager();
