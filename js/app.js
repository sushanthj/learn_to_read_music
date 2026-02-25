import { CLEF_MODES } from './config.js';
import { renderNote } from './staffRenderer.js';
import { QuizManager } from './quizManager.js';
import { UIController } from './uiController.js';
import { MIDIHandler } from './midiHandler.js';
import { MicHandler } from './micHandler.js';
import { ProgressManager } from './progressManager.js';

const staffContainer = document.getElementById('staff');

let currentClef    = CLEF_MODES.TREBLE;
let inputMode      = 'click';
let instrumentMode = 'piano';
let lastNote       = null;
let midiHandler    = null;
let micHandler     = null;

const progressManager = new ProgressManager();

const quiz = new QuizManager({
  clefMode: currentClef,
  inputMode: inputMode,
  progressManager,
  onNewNote: (note) => {
    lastNote = note;
    renderNote(staffContainer, note, currentClef);
    ui.updateFingeringHint(note);
    if (note.options) {
      ui.setAnswerOptions(note.options);
    }
  },
  onFeedback: (correct, noteName, delay) => {
    ui.showFeedback(correct, noteName, delay);
  },
  onScoreUpdate: (stats) => {
    ui.updateScore(stats);
  },
  onLevelUp: (info) => {
    ui.showLevelUp(info);
    ui.updateLevelDisplay(quiz.getProgressInfo());
    ui.showLevelDropdown(currentClef, quiz.getProgressInfo().currentLevel, quiz.getProgressInfo().unlockedLevel);
  },
  onProgressUpdate: (info) => {
    ui.updateLevelDisplay(info);
  },
  onAdvancementReady: (info) => {
    ui.showAdvancementPrompt(
      info,
      () => {
        quiz.acceptAdvancement();
      },
      () => {
        quiz.declineAdvancement();
      },
    );
  },
});

const ui = new UIController({
  onNoteGuess: (letter) => {
    if (inputMode === 'click') {
      quiz.checkAnswer(letter);
    }
  },
  onClefChange: (clef) => {
    currentClef = clef;
    quiz.setClefMode(clef);
    const info = quiz.getProgressInfo();
    ui.showLevelDropdown(currentClef, info.currentLevel, info.unlockedLevel);
    ui.updateMicAvailability(info.hasChords);
  },
  onInputModeChange: (mode) => {
    inputMode = mode;
    quiz.setInputMode(mode);
    if (mode !== 'midi') midiHandler?.disconnect();
    if (mode !== 'mic')  micHandler?.disconnect();
    if (mode === 'midi') initMidi();
    if (mode === 'mic')  initMic();
  },
  onLevelSelect: (idx) => {
    quiz.setLevel(idx);
    const info = quiz.getProgressInfo();
    ui.showLevelDropdown(currentClef, info.currentLevel, info.unlockedLevel);
    ui.updateMicAvailability(info.hasChords);
  },
  onInstrumentModeChange: (mode) => {
    instrumentMode = mode;
    if (micHandler) micHandler.transpose = mode === 'guitar' ? 12 : 0;
  },
  onMicThresholdChange: (val) => { if (micHandler) micHandler.minRms = val; },
});

async function initMidi() {
  if (!MIDIHandler.isSupported()) { ui.hideMidiOption(); return; }
  if (!midiHandler) midiHandler = new MIDIHandler({
    onNoteOn: (noteInfo) => { if (inputMode === 'midi') quiz.checkAnswer(noteInfo.midi); },
    onStatusChange: (status) => ui.showMidiStatus(status),
  });
  await midiHandler.connect();
}

async function initMic() {
  if (!MicHandler.isSupported()) { ui.hideMicOption(); return; }
  if (!micHandler) micHandler = new MicHandler({
    onNoteOn:      (noteInfo) => { if (inputMode === 'mic') quiz.checkAnswer(noteInfo.midi); },
    onStatusChange: (status)  => ui.showMicStatus(status),
    onLevelUpdate:  (rms)     => ui.updateMicLevel(rms),
  });
  micHandler.transpose = instrumentMode === 'guitar' ? 12 : 0;
  await micHandler.connect();
}

// Check MIDI support on load
if (!MIDIHandler.isSupported()) {
  ui.hideMidiOption();
}

// Check microphone support on load
if (!MicHandler.isSupported()) {
  ui.hideMicOption();
}

// Initialize level dropdown and start the quiz
const initialInfo = quiz.getProgressInfo();
ui.showLevelDropdown(currentClef, initialInfo.currentLevel, initialInfo.unlockedLevel);
ui.updateMicAvailability(initialInfo.hasChords);

quiz.start();
