import { NOTE_NAMES } from './config.js';

export class MIDIHandler {
  constructor({ onNoteOn, onStatusChange }) {
    this.onNoteOn = onNoteOn;
    this.onStatusChange = onStatusChange;
    this.midiAccess = null;
    this.activeInputs = new Set();
  }

  static isSupported() {
    return !!navigator.requestMIDIAccess;
  }

  async connect() {
    if (!MIDIHandler.isSupported()) {
      this.onStatusChange('Unsupported');
      return false;
    }

    try {
      this.midiAccess = await navigator.requestMIDIAccess();
      this.midiAccess.onstatechange = (e) => this.handleStateChange(e);
      this.bindInputs();
      return true;
    } catch (err) {
      this.onStatusChange('Denied');
      return false;
    }
  }

  disconnect() {
    this.activeInputs.forEach(input => {
      input.onmidimessage = null;
    });
    this.activeInputs.clear();
    this.onStatusChange('Disconnected');
  }

  bindInputs() {
    // Clear old bindings
    this.activeInputs.forEach(input => {
      input.onmidimessage = null;
    });
    this.activeInputs.clear();

    const inputs = this.midiAccess.inputs;
    if (inputs.size === 0) {
      this.onStatusChange('No device');
      return;
    }

    inputs.forEach(input => {
      input.onmidimessage = (msg) => this.handleMessage(msg);
      this.activeInputs.add(input);
    });

    this.onStatusChange('Connected');
  }

  handleStateChange(e) {
    this.bindInputs();
  }

  handleMessage(msg) {
    const [status, note, velocity] = msg.data;

    // Note On: status byte 0x90-0x9F with velocity > 0
    if ((status & 0xf0) === 0x90 && velocity > 0) {
      const noteName = NOTE_NAMES[note % 12];
      const octave = Math.floor(note / 12) - 1;
      this.onNoteOn({
        midi: note,
        name: `${noteName}${octave}`,
        letter: noteName,
      });
    }
  }
}

// Alias for backwards compatibility
export { MIDIHandler as MidiHandler };
