// Note definitions for treble and bass clef
// key: VexFlow format (lowercase "note/octave")
// midi: MIDI note number
// name: display name (letter + octave)

// Treble clef: middle C (1 ledger line below) up to A5 (1 ledger line above)
export const TREBLE_NOTES = [
  { key: 'c/4', midi: 60, name: 'C4' },
  { key: 'c#/4', midi: 61, name: 'C#4' },
  { key: 'd/4', midi: 62, name: 'D4' },
  { key: 'e/4', midi: 64, name: 'E4' },
  { key: 'f/4', midi: 65, name: 'F4' },
  { key: 'f#/4', midi: 66, name: 'F#4' },
  { key: 'g/4', midi: 67, name: 'G4' },
  { key: 'g#/4', midi: 68, name: 'G#4' },
  { key: 'a/4', midi: 69, name: 'A4' },
  { key: 'b/4', midi: 71, name: 'B4' },
  { key: 'c/5', midi: 72, name: 'C5' },
  { key: 'c#/5', midi: 73, name: 'C#5' },
  { key: 'd/5', midi: 74, name: 'D5' },
  { key: 'e/5', midi: 76, name: 'E5' },
  { key: 'f/5', midi: 77, name: 'F5' },
  { key: 'f#/5', midi: 78, name: 'F#5' },
  { key: 'g/5', midi: 79, name: 'G5' },
  { key: 'a/5', midi: 81, name: 'A5' },
];

// Bass clef: G2 up to middle C (1 ledger line above)
export const BASS_NOTES = [
  { key: 'g/2', midi: 43, name: 'G2' },
  { key: 'a/2', midi: 45, name: 'A2' },
  { key: 'b/2', midi: 47, name: 'B2' },
  { key: 'c/3', midi: 48, name: 'C3' },
  { key: 'c#/3', midi: 49, name: 'C#3' },
  { key: 'd/3', midi: 50, name: 'D3' },
  { key: 'e/3', midi: 52, name: 'E3' },
  { key: 'f/3', midi: 53, name: 'F3' },
  { key: 'f#/3', midi: 54, name: 'F#3' },
  { key: 'g/3', midi: 55, name: 'G3' },
  { key: 'g#/3', midi: 56, name: 'G#3' },
  { key: 'a/3', midi: 57, name: 'A3' },
  { key: 'b/3', midi: 59, name: 'B3' },
  { key: 'c/4', midi: 60, name: 'C4' },
];

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const CLEF_MODES = {
  TREBLE: 'treble',
  BASS: 'bass',
  GRAND: 'grand',
};

export const LEVELS = {
  treble: [
    { id: 'treble-1', name: 'Staff Lines', description: 'Every Good Boy Does Fine', noteNames: ['E4', 'G4', 'B4', 'D5', 'F5'] },
    { id: 'treble-2', name: 'Staff Spaces', description: 'FACE', noteNames: ['F4', 'A4', 'C5', 'E5'] },
    { id: 'treble-3', name: 'Full Staff + Middle C', description: 'All staff notes plus middle C', noteNames: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5'] },
    { id: 'treble-4', name: 'Ledger Lines', description: 'Add middle C below + G5/A5 above', noteNames: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5'] },
    { id: 'treble-5', name: 'Sharps', description: 'Common sharps: F♯, C♯, G♯', noteNames: ['C4', 'C#4', 'D4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'B4', 'C5', 'C#5', 'D5', 'E5', 'F5', 'F#5', 'G5', 'A5'] },
    { id: 'treble-6', name: 'Chords 1', description: 'Major & minor triads', chords: [
        { name: 'C Major', key: 'c/4', keys: ['c/4', 'e/4', 'g/4'], midi: 60, type: 'chord' },
        { name: 'D Minor', key: 'd/4', keys: ['d/4', 'f/4', 'a/4'], midi: 62, type: 'chord' },
        { name: 'E Minor', key: 'e/4', keys: ['e/4', 'g/4', 'b/4'], midi: 64, type: 'chord' },
        { name: 'F Major', key: 'f/4', keys: ['f/4', 'a/4', 'c/5'], midi: 65, type: 'chord' },
        { name: 'G Major', key: 'g/4', keys: ['g/4', 'b/4', 'd/5'], midi: 67, type: 'chord' },
        { name: 'A Minor', key: 'a/4', keys: ['a/4', 'c/5', 'e/5'], midi: 69, type: 'chord' },
    ]},
    { id: 'treble-7', name: 'Chords 2', description: 'Major, minor & flat-key triads', chords: [
        { name: 'C Major', key: 'c/4', keys: ['c/4', 'e/4', 'g/4'], midi: 60, type: 'chord' },
        { name: 'C Minor', key: 'c/4', keys: ['c/4', 'eb/4', 'g/4'], midi: 60, type: 'chord' },
        { name: 'D Major', key: 'd/4', keys: ['d/4', 'f#/4', 'a/4'], midi: 62, type: 'chord' },
        { name: 'D Minor', key: 'd/4', keys: ['d/4', 'f/4', 'a/4'], midi: 62, type: 'chord' },
        { name: 'Eb Major', key: 'eb/4', keys: ['eb/4', 'g/4', 'bb/4'], midi: 63, type: 'chord' },
        { name: 'E Major', key: 'e/4', keys: ['e/4', 'g#/4', 'b/4'], midi: 64, type: 'chord' },
        { name: 'E Minor', key: 'e/4', keys: ['e/4', 'g/4', 'b/4'], midi: 64, type: 'chord' },
        { name: 'F Major', key: 'f/4', keys: ['f/4', 'a/4', 'c/5'], midi: 65, type: 'chord' },
        { name: 'F Minor', key: 'f/4', keys: ['f/4', 'ab/4', 'c/5'], midi: 65, type: 'chord' },
        { name: 'G Major', key: 'g/4', keys: ['g/4', 'b/4', 'd/5'], midi: 67, type: 'chord' },
        { name: 'G Minor', key: 'g/4', keys: ['g/4', 'bb/4', 'd/5'], midi: 67, type: 'chord' },
        { name: 'Ab Major', key: 'ab/4', keys: ['ab/4', 'c/5', 'eb/5'], midi: 68, type: 'chord' },
        { name: 'A Major', key: 'a/4', keys: ['a/4', 'c#/5', 'e/5'], midi: 69, type: 'chord' },
        { name: 'A Minor', key: 'a/4', keys: ['a/4', 'c/5', 'e/5'], midi: 69, type: 'chord' },
        { name: 'Bb Major', key: 'bb/4', keys: ['bb/4', 'd/5', 'f/5'], midi: 70, type: 'chord' },
        { name: 'B Minor', key: 'b/4', keys: ['b/4', 'd/5', 'f#/5'], midi: 71, type: 'chord' },
        { name: 'B Dim', key: 'b/4', keys: ['b/4', 'd/5', 'f/5'], midi: 71, type: 'chord' },
    ]},
    { id: 'treble-8', name: 'Everything', description: 'All notes + chords mixed',
      noteNames: ['C4', 'C#4', 'D4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'B4', 'C5', 'C#5', 'D5', 'E5', 'F5', 'F#5', 'G5', 'A5'],
      chords: [
        { name: 'C Major', key: 'c/4', keys: ['c/4', 'e/4', 'g/4'], midi: 60, type: 'chord' },
        { name: 'C Minor', key: 'c/4', keys: ['c/4', 'eb/4', 'g/4'], midi: 60, type: 'chord' },
        { name: 'D Major', key: 'd/4', keys: ['d/4', 'f#/4', 'a/4'], midi: 62, type: 'chord' },
        { name: 'D Minor', key: 'd/4', keys: ['d/4', 'f/4', 'a/4'], midi: 62, type: 'chord' },
        { name: 'Eb Major', key: 'eb/4', keys: ['eb/4', 'g/4', 'bb/4'], midi: 63, type: 'chord' },
        { name: 'E Major', key: 'e/4', keys: ['e/4', 'g#/4', 'b/4'], midi: 64, type: 'chord' },
        { name: 'E Minor', key: 'e/4', keys: ['e/4', 'g/4', 'b/4'], midi: 64, type: 'chord' },
        { name: 'F Major', key: 'f/4', keys: ['f/4', 'a/4', 'c/5'], midi: 65, type: 'chord' },
        { name: 'F Minor', key: 'f/4', keys: ['f/4', 'ab/4', 'c/5'], midi: 65, type: 'chord' },
        { name: 'G Major', key: 'g/4', keys: ['g/4', 'b/4', 'd/5'], midi: 67, type: 'chord' },
        { name: 'G Minor', key: 'g/4', keys: ['g/4', 'bb/4', 'd/5'], midi: 67, type: 'chord' },
        { name: 'Ab Major', key: 'ab/4', keys: ['ab/4', 'c/5', 'eb/5'], midi: 68, type: 'chord' },
        { name: 'A Major', key: 'a/4', keys: ['a/4', 'c#/5', 'e/5'], midi: 69, type: 'chord' },
        { name: 'A Minor', key: 'a/4', keys: ['a/4', 'c/5', 'e/5'], midi: 69, type: 'chord' },
        { name: 'Bb Major', key: 'bb/4', keys: ['bb/4', 'd/5', 'f/5'], midi: 70, type: 'chord' },
        { name: 'B Minor', key: 'b/4', keys: ['b/4', 'd/5', 'f#/5'], midi: 71, type: 'chord' },
        { name: 'B Dim', key: 'b/4', keys: ['b/4', 'd/5', 'f/5'], midi: 71, type: 'chord' },
      ],
    },
  ],
  bass: [
    { id: 'bass-1', name: 'Staff Lines', description: 'Good Boys Do Fine Always', noteNames: ['G2', 'B2', 'D3', 'F3', 'A3'] },
    { id: 'bass-2', name: 'Staff Spaces', description: 'All Cows Eat Grass', noteNames: ['A2', 'C3', 'E3', 'G3'] },
    { id: 'bass-3', name: 'Full Staff + Ledger', description: 'All staff notes plus B above', noteNames: ['G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3'] },
    { id: 'bass-4', name: 'Ledger Lines', description: 'Add ledger lines both ways', noteNames: ['G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'] },
    { id: 'bass-5', name: 'Sharps', description: 'Common sharps: F♯, C♯, G♯', noteNames: ['G2', 'A2', 'B2', 'C3', 'C#3', 'D3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'B3', 'C4'] },
    { id: 'bass-6', name: 'Chords 1', description: 'Major & minor triads', chords: [
        { name: 'C Major', key: 'c/3', keys: ['c/3', 'e/3', 'g/3'], midi: 48, type: 'chord' },
        { name: 'D Minor', key: 'd/3', keys: ['d/3', 'f/3', 'a/3'], midi: 50, type: 'chord' },
        { name: 'E Minor', key: 'e/3', keys: ['e/3', 'g/3', 'b/3'], midi: 52, type: 'chord' },
        { name: 'F Major', key: 'f/3', keys: ['f/3', 'a/3', 'c/4'], midi: 53, type: 'chord' },
        { name: 'G Major', key: 'g/2', keys: ['g/2', 'b/2', 'd/3'], midi: 43, type: 'chord' },
        { name: 'A Minor', key: 'a/2', keys: ['a/2', 'c/3', 'e/3'], midi: 45, type: 'chord' },
    ]},
    { id: 'bass-7', name: 'Chords 2', description: 'Major, minor & flat-key triads', chords: [
        { name: 'C Major', key: 'c/3', keys: ['c/3', 'e/3', 'g/3'], midi: 48, type: 'chord' },
        { name: 'C Minor', key: 'c/3', keys: ['c/3', 'eb/3', 'g/3'], midi: 48, type: 'chord' },
        { name: 'D Major', key: 'd/3', keys: ['d/3', 'f#/3', 'a/3'], midi: 50, type: 'chord' },
        { name: 'D Minor', key: 'd/3', keys: ['d/3', 'f/3', 'a/3'], midi: 50, type: 'chord' },
        { name: 'Eb Major', key: 'eb/3', keys: ['eb/3', 'g/3', 'bb/3'], midi: 51, type: 'chord' },
        { name: 'E Major', key: 'e/3', keys: ['e/3', 'g#/3', 'b/3'], midi: 52, type: 'chord' },
        { name: 'E Minor', key: 'e/3', keys: ['e/3', 'g/3', 'b/3'], midi: 52, type: 'chord' },
        { name: 'F Major', key: 'f/3', keys: ['f/3', 'a/3', 'c/4'], midi: 53, type: 'chord' },
        { name: 'F Minor', key: 'f/3', keys: ['f/3', 'ab/3', 'c/4'], midi: 53, type: 'chord' },
        { name: 'G Major', key: 'g/2', keys: ['g/2', 'b/2', 'd/3'], midi: 43, type: 'chord' },
        { name: 'G Minor', key: 'g/2', keys: ['g/2', 'bb/2', 'd/3'], midi: 43, type: 'chord' },
        { name: 'Ab Major', key: 'ab/2', keys: ['ab/2', 'c/3', 'eb/3'], midi: 44, type: 'chord' },
        { name: 'A Major', key: 'a/2', keys: ['a/2', 'c#/3', 'e/3'], midi: 45, type: 'chord' },
        { name: 'A Minor', key: 'a/2', keys: ['a/2', 'c/3', 'e/3'], midi: 45, type: 'chord' },
        { name: 'Bb Major', key: 'bb/2', keys: ['bb/2', 'd/3', 'f/3'], midi: 46, type: 'chord' },
        { name: 'B Minor', key: 'b/2', keys: ['b/2', 'd/3', 'f#/3'], midi: 47, type: 'chord' },
        { name: 'B Dim', key: 'b/2', keys: ['b/2', 'd/3', 'f/3'], midi: 47, type: 'chord' },
    ]},
    { id: 'bass-8', name: 'Everything', description: 'All notes + chords mixed',
      noteNames: ['G2', 'A2', 'B2', 'C3', 'C#3', 'D3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'B3', 'C4'],
      chords: [
        { name: 'C Major', key: 'c/3', keys: ['c/3', 'e/3', 'g/3'], midi: 48, type: 'chord' },
        { name: 'C Minor', key: 'c/3', keys: ['c/3', 'eb/3', 'g/3'], midi: 48, type: 'chord' },
        { name: 'D Major', key: 'd/3', keys: ['d/3', 'f#/3', 'a/3'], midi: 50, type: 'chord' },
        { name: 'D Minor', key: 'd/3', keys: ['d/3', 'f/3', 'a/3'], midi: 50, type: 'chord' },
        { name: 'Eb Major', key: 'eb/3', keys: ['eb/3', 'g/3', 'bb/3'], midi: 51, type: 'chord' },
        { name: 'E Major', key: 'e/3', keys: ['e/3', 'g#/3', 'b/3'], midi: 52, type: 'chord' },
        { name: 'E Minor', key: 'e/3', keys: ['e/3', 'g/3', 'b/3'], midi: 52, type: 'chord' },
        { name: 'F Major', key: 'f/3', keys: ['f/3', 'a/3', 'c/4'], midi: 53, type: 'chord' },
        { name: 'F Minor', key: 'f/3', keys: ['f/3', 'ab/3', 'c/4'], midi: 53, type: 'chord' },
        { name: 'G Major', key: 'g/2', keys: ['g/2', 'b/2', 'd/3'], midi: 43, type: 'chord' },
        { name: 'G Minor', key: 'g/2', keys: ['g/2', 'bb/2', 'd/3'], midi: 43, type: 'chord' },
        { name: 'Ab Major', key: 'ab/2', keys: ['ab/2', 'c/3', 'eb/3'], midi: 44, type: 'chord' },
        { name: 'A Major', key: 'a/2', keys: ['a/2', 'c#/3', 'e/3'], midi: 45, type: 'chord' },
        { name: 'A Minor', key: 'a/2', keys: ['a/2', 'c/3', 'e/3'], midi: 45, type: 'chord' },
        { name: 'Bb Major', key: 'bb/2', keys: ['bb/2', 'd/3', 'f/3'], midi: 46, type: 'chord' },
        { name: 'B Minor', key: 'b/2', keys: ['b/2', 'd/3', 'f#/3'], midi: 47, type: 'chord' },
        { name: 'B Dim', key: 'b/2', keys: ['b/2', 'd/3', 'f/3'], midi: 47, type: 'chord' },
      ],
    },
  ],
  grand: [
    { id: 'grand-1', name: 'Staff Lines', description: 'Line notes in both clefs', trebleNoteNames: ['E4', 'G4', 'B4', 'D5', 'F5'], bassNoteNames: ['G2', 'B2', 'D3', 'F3', 'A3'] },
    { id: 'grand-2', name: 'All Staff Notes', description: 'Both clefs with middle C', trebleNoteNames: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5'], bassNoteNames: ['G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3'] },
    { id: 'grand-3', name: 'Full Range', description: 'Everything including ledger lines', trebleNoteNames: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5'], bassNoteNames: ['G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'] },
    { id: 'grand-4', name: 'With Sharps', description: 'Full range with common sharps', trebleNoteNames: ['C4', 'C#4', 'D4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'B4', 'C5', 'C#5', 'D5', 'E5', 'F5', 'F#5', 'G5', 'A5'], bassNoteNames: ['G2', 'A2', 'B2', 'C3', 'C#3', 'D3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'B3', 'C4'] },
    { id: 'grand-5', name: 'Chords 1', description: 'Major & minor triads', chords: [
        { name: 'C Major', key: 'c/4', keys: ['c/4', 'e/4', 'g/4'], midi: 60, type: 'chord', clef: 'treble' },
        { name: 'D Minor', key: 'd/4', keys: ['d/4', 'f/4', 'a/4'], midi: 62, type: 'chord', clef: 'treble' },
        { name: 'E Minor', key: 'e/4', keys: ['e/4', 'g/4', 'b/4'], midi: 64, type: 'chord', clef: 'treble' },
        { name: 'F Major', key: 'f/4', keys: ['f/4', 'a/4', 'c/5'], midi: 65, type: 'chord', clef: 'treble' },
        { name: 'G Major', key: 'g/2', keys: ['g/2', 'b/2', 'd/3'], midi: 43, type: 'chord', clef: 'bass' },
        { name: 'A Minor', key: 'a/2', keys: ['a/2', 'c/3', 'e/3'], midi: 45, type: 'chord', clef: 'bass' },
    ]},
    { id: 'grand-6', name: 'Chords 2', description: 'Major, minor & flat-key triads', chords: [
        { name: 'C Major', key: 'c/4', keys: ['c/4', 'e/4', 'g/4'], midi: 60, type: 'chord', clef: 'treble' },
        { name: 'C Minor', key: 'c/4', keys: ['c/4', 'eb/4', 'g/4'], midi: 60, type: 'chord', clef: 'treble' },
        { name: 'D Major', key: 'd/4', keys: ['d/4', 'f#/4', 'a/4'], midi: 62, type: 'chord', clef: 'treble' },
        { name: 'D Minor', key: 'd/4', keys: ['d/4', 'f/4', 'a/4'], midi: 62, type: 'chord', clef: 'treble' },
        { name: 'Eb Major', key: 'eb/4', keys: ['eb/4', 'g/4', 'bb/4'], midi: 63, type: 'chord', clef: 'treble' },
        { name: 'E Major', key: 'e/4', keys: ['e/4', 'g#/4', 'b/4'], midi: 64, type: 'chord', clef: 'treble' },
        { name: 'E Minor', key: 'e/4', keys: ['e/4', 'g/4', 'b/4'], midi: 64, type: 'chord', clef: 'treble' },
        { name: 'F Major', key: 'f/4', keys: ['f/4', 'a/4', 'c/5'], midi: 65, type: 'chord', clef: 'treble' },
        { name: 'F Minor', key: 'f/4', keys: ['f/4', 'ab/4', 'c/5'], midi: 65, type: 'chord', clef: 'treble' },
        { name: 'G Major', key: 'g/2', keys: ['g/2', 'b/2', 'd/3'], midi: 43, type: 'chord', clef: 'bass' },
        { name: 'G Minor', key: 'g/2', keys: ['g/2', 'bb/2', 'd/3'], midi: 43, type: 'chord', clef: 'bass' },
        { name: 'Ab Major', key: 'ab/2', keys: ['ab/2', 'c/3', 'eb/3'], midi: 44, type: 'chord', clef: 'bass' },
        { name: 'A Major', key: 'a/2', keys: ['a/2', 'c#/3', 'e/3'], midi: 45, type: 'chord', clef: 'bass' },
        { name: 'A Minor', key: 'a/2', keys: ['a/2', 'c/3', 'e/3'], midi: 45, type: 'chord', clef: 'bass' },
        { name: 'Bb Major', key: 'bb/4', keys: ['bb/4', 'd/5', 'f/5'], midi: 70, type: 'chord', clef: 'treble' },
        { name: 'B Minor', key: 'b/4', keys: ['b/4', 'd/5', 'f#/5'], midi: 71, type: 'chord', clef: 'treble' },
        { name: 'B Dim', key: 'b/4', keys: ['b/4', 'd/5', 'f/5'], midi: 71, type: 'chord', clef: 'treble' },
    ]},
    { id: 'grand-7', name: 'Everything', description: 'All notes + chords mixed',
      trebleNoteNames: ['C4', 'C#4', 'D4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'B4', 'C5', 'C#5', 'D5', 'E5', 'F5', 'F#5', 'G5', 'A5'],
      bassNoteNames: ['G2', 'A2', 'B2', 'C3', 'C#3', 'D3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'B3', 'C4'],
      chords: [
        { name: 'C Major', key: 'c/4', keys: ['c/4', 'e/4', 'g/4'], midi: 60, type: 'chord', clef: 'treble' },
        { name: 'C Minor', key: 'c/4', keys: ['c/4', 'eb/4', 'g/4'], midi: 60, type: 'chord', clef: 'treble' },
        { name: 'D Major', key: 'd/4', keys: ['d/4', 'f#/4', 'a/4'], midi: 62, type: 'chord', clef: 'treble' },
        { name: 'D Minor', key: 'd/4', keys: ['d/4', 'f/4', 'a/4'], midi: 62, type: 'chord', clef: 'treble' },
        { name: 'Eb Major', key: 'eb/4', keys: ['eb/4', 'g/4', 'bb/4'], midi: 63, type: 'chord', clef: 'treble' },
        { name: 'E Major', key: 'e/4', keys: ['e/4', 'g#/4', 'b/4'], midi: 64, type: 'chord', clef: 'treble' },
        { name: 'E Minor', key: 'e/4', keys: ['e/4', 'g/4', 'b/4'], midi: 64, type: 'chord', clef: 'treble' },
        { name: 'F Major', key: 'f/4', keys: ['f/4', 'a/4', 'c/5'], midi: 65, type: 'chord', clef: 'treble' },
        { name: 'F Minor', key: 'f/4', keys: ['f/4', 'ab/4', 'c/5'], midi: 65, type: 'chord', clef: 'treble' },
        { name: 'G Major', key: 'g/2', keys: ['g/2', 'b/2', 'd/3'], midi: 43, type: 'chord', clef: 'bass' },
        { name: 'G Minor', key: 'g/2', keys: ['g/2', 'bb/2', 'd/3'], midi: 43, type: 'chord', clef: 'bass' },
        { name: 'Ab Major', key: 'ab/2', keys: ['ab/2', 'c/3', 'eb/3'], midi: 44, type: 'chord', clef: 'bass' },
        { name: 'A Major', key: 'a/2', keys: ['a/2', 'c#/3', 'e/3'], midi: 45, type: 'chord', clef: 'bass' },
        { name: 'A Minor', key: 'a/2', keys: ['a/2', 'c/3', 'e/3'], midi: 45, type: 'chord', clef: 'bass' },
        { name: 'Bb Major', key: 'bb/4', keys: ['bb/4', 'd/5', 'f/5'], midi: 70, type: 'chord', clef: 'treble' },
        { name: 'B Minor', key: 'b/4', keys: ['b/4', 'd/5', 'f#/5'], midi: 71, type: 'chord', clef: 'treble' },
        { name: 'B Dim', key: 'b/4', keys: ['b/4', 'd/5', 'f/5'], midi: 71, type: 'chord', clef: 'treble' },
      ],
    },
  ],
};

export const ADVANCEMENT = { minNotes: 10, minAccuracy: 0.85 };

// Set to true to require sequential level completion, false to unlock all levels
export const LEVELS_LOCKED = false;

// Guitar tab positions for treble clef notes.
// Key = written note name (as shown on staff).
// Guitar sounds one octave below written, so each position gives the sounding pitch.
// str: 1 = high e, 6 = low E.  fret: 0 = open string.
export const GUITAR_TABS = {
  C4:  { str: 5, fret: 3 },  // A-string 3rd fret  → C3
  'C#4': { str: 5, fret: 4 },  // A-string 4th fret  → C#3
  D4:  { str: 4, fret: 0 },  // D-string open      → D3
  E4:  { str: 4, fret: 2 },  // D-string 2nd fret  → E3
  F4:  { str: 4, fret: 3 },  // D-string 3rd fret  → F3
  'F#4': { str: 4, fret: 4 },  // D-string 4th fret  → F#3
  G4:  { str: 3, fret: 0 },  // G-string open      → G3
  'G#4': { str: 3, fret: 1 },  // G-string 1st fret  → G#3
  A4:  { str: 3, fret: 2 },  // G-string 2nd fret  → A3
  B4:  { str: 2, fret: 0 },  // B-string open      → B3
  C5:  { str: 2, fret: 1 },  // B-string 1st fret  → C4
  'C#5': { str: 2, fret: 2 },  // B-string 2nd fret  → C#4
  D5:  { str: 2, fret: 3 },  // B-string 3rd fret  → D4
  E5:  { str: 1, fret: 0 },  // e-string open      → E4
  F5:  { str: 1, fret: 1 },  // e-string 1st fret  → F4
  'F#5': { str: 1, fret: 2 },  // e-string 2nd fret  → F#4
  G5:  { str: 1, fret: 3 },  // e-string 3rd fret  → G4
  A5:  { str: 1, fret: 5 },  // e-string 5th fret  → A4
  // Flat enharmonic entries for chord hints
  Eb4: { str: 4, fret: 1 },  // D-string 1st fret  → Eb3
  Ab4: { str: 3, fret: 1 },  // G-string 1st fret  → Ab3  (= G#4)
  Bb4: { str: 3, fret: 3 },  // G-string 3rd fret  → Bb3
  Eb5: { str: 2, fret: 4 },  // B-string 4th fret  → Eb4
};

// Proper guitar chord voicings for chord hint diagrams.
// frets: [str6(E), str5(A), str4(D), str3(G), str2(B), str1(e)], -1 = muted, 0 = open.
// baseFret: first fret shown in diagram (default 1 = open position).
// barre: optional { fret, fromStr, toStr } for barre indicator (str 1=high e, 6=low E).
export const GUITAR_CHORD_SHAPES = {
  // fingers: 0 = not pressed, 1 = index, 2 = middle, 3 = ring, 4 = pinky
  // ── Major chords ───────────────────────
  'C Major':  { frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
  'D Major':  { frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2] },
  'Eb Major': { frets: [-1, -1, 1, 3, 4, 3], fingers: [0, 0, 1, 2, 4, 3] },
  'E Major':  { frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] },
  'F Major':  { frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, fromStr: 1, toStr: 6 } },
  'G Major':  { frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3] },
  'Ab Major': { frets: [4, 6, 6, 5, 4, 4], fingers: [1, 3, 4, 2, 1, 1], baseFret: 4, barre: { fret: 4, fromStr: 1, toStr: 6 } },
  'A Major':  { frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0] },
  'Bb Major': { frets: [-1, 1, 3, 3, 3, 1], fingers: [0, 1, 3, 3, 3, 1], barre: { fret: 1, fromStr: 1, toStr: 5 } },
  // ── Minor chords ───────────────────────
  'C Minor':  { frets: [-1, 3, 5, 5, 4, 3], fingers: [0, 1, 3, 4, 2, 1], baseFret: 3, barre: { fret: 3, fromStr: 1, toStr: 5 } },
  'D Minor':  { frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1] },
  'E Minor':  { frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] },
  'F Minor':  { frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, fromStr: 1, toStr: 6 } },
  'G Minor':  { frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], baseFret: 3, barre: { fret: 3, fromStr: 1, toStr: 6 } },
  'A Minor':  { frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0] },
  'B Minor':  { frets: [-1, 2, 4, 4, 3, 2], fingers: [0, 1, 3, 4, 2, 1], baseFret: 2, barre: { fret: 2, fromStr: 1, toStr: 5 } },
  // ── Diminished ─────────────────────────
  'B Dim':    { frets: [-1, 2, 3, 4, 3, -1], fingers: [0, 1, 2, 4, 3, 0] },
};

export const FEEDBACK_DELAYS = {
  correct: [800, 700, 600, 500, 400, 400, 350, 350],
  wrong: [2000, 1800, 1500, 1200, 1000, 1000, 900, 900],
};

// Build lookup maps for fast name -> note object resolution
const trebleByName = {};
TREBLE_NOTES.forEach(n => { trebleByName[n.name] = n; });
const bassByName = {};
BASS_NOTES.forEach(n => { bassByName[n.name] = n; });

export function resolveNotePool(clefMode, levelIndex) {
  const levelDefs = LEVELS[clefMode];
  if (!levelDefs || levelIndex < 0 || levelIndex >= levelDefs.length) return [];

  const level = levelDefs[levelIndex];

  // Pure chord levels (no noteNames) return chord objects directly
  if (level.chords && !level.noteNames && !level.trebleNoteNames) {
    return level.chords.map(c => ({ ...c }));
  }

  if (clefMode === CLEF_MODES.GRAND) {
    const pool = [];
    (level.trebleNoteNames || []).forEach(name => {
      const note = trebleByName[name];
      if (note) pool.push({ ...note, clef: 'treble' });
    });
    (level.bassNoteNames || []).forEach(name => {
      const note = bassByName[name];
      if (note) pool.push({ ...note, clef: 'bass' });
    });
    if (level.chords) {
      level.chords.forEach(c => pool.push({ ...c }));
    }
    return pool;
  }

  const lookup = clefMode === CLEF_MODES.BASS ? bassByName : trebleByName;
  const pool = (level.noteNames || []).map(name => lookup[name]).filter(Boolean).map(n => ({ ...n }));
  if (level.chords) {
    level.chords.forEach(c => pool.push({ ...c }));
  }
  return pool;
}
