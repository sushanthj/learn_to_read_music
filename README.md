# Sight-Reading Trainer

A browser-based music sight-reading trainer that helps you learn to read notes on the treble, bass, and grand staff. Built with vanilla JS and [VexFlow](https://www.vexflow.com/) for music notation rendering.

**[Try it live](https://sushanthj.github.io/learn_to_read_music/)**

## Features

### Music Composition Tool
Create your own sheet music with an intuitive interface:
- **Multiple note durations** — Whole, half, quarter, eighth, and sixteenth notes
- **Accidentals** — Add sharps, flats, or naturals to any note
- **Multiple measures** — Add as many measures as needed for your composition
- **Time signatures** — Support for 4/4, 3/4, 2/4, and 6/8
- **Multiple clefs** — Compose in treble, bass, or grand staff
- **Export** — Download your composition as JSON for later use

Access the composer at `compose.html` or via the navigation tabs.

### Progressive Curriculum
Work through 4 levels per clef, starting with the basics and building up:

| Level | Treble Clef | Bass Clef |
|-------|------------|-----------|
| 1 - Staff Lines | E G B D F — *"Every Good Boy Does Fine"* | G B D F A — *"Good Boys Do Fine Always"* |
| 2 - Staff Spaces | F A C E — *"FACE"* | A C E G — *"All Cows Eat Grass"* |
| 3 - Full Staff | All 9 staff notes | All 9 staff notes |
| 4 - Ledger Lines | C4–A5 (13 notes) | G2–C4 (11 notes) |

Grand Staff mode combines both clefs across 3 levels.

### Smart Practice
- **Weak-note weighting** — Notes you struggle with appear 2–4x more often
- **Rolling advancement** — Score 85%+ on your last 10 notes to unlock the next level
- **Speed progression** — Feedback timing gets faster as you level up
- **Persistent progress** — Your level, per-note accuracy, and best streaks are saved in localStorage

### Input Methods
- **Click/Tap** — Note buttons on screen
- **Keyboard** — Press A–G keys
- **MIDI** — Connect a MIDI keyboard for exact pitch matching
- **Microphone** — Use guitar or piano with real-time pitch detection (supports guitar and piano modes)

## Getting Started

No build step required. Just serve the files:

```bash
# Clone and open
git clone https://github.com/sushanthj/learn_to_read_music.git
cd learn_to_read_music

# Serve locally (pick any method)
python3 -m http.server 8000
# or
npx serve .
```

Then open `http://localhost:8000` in your browser.

## Tech Stack

- **Vanilla JS** (ES modules, no framework)
- **VexFlow 5** for staff/note rendering
- **Web MIDI API** for hardware keyboard input
- **localStorage** for progress persistence
- **Zero dependencies** — no npm, no build tools

## Project Structure

```
├── index.html              # Main practice page
├── compose.html            # Music composition tool
├── css/
│   ├── style.css           # Styles (light/dark mode)
│   └── compose.css         # Composer-specific styles
└── js/
    ├── app.js              # Entry point, wiring
    ├── compose.js          # Composition tool logic
    ├── config.js           # Note data, level definitions
    ├── progressManager.js  # localStorage persistence
    ├── noteGenerator.js    # Weighted random note selection
    ├── quizManager.js      # Quiz engine, level advancement
    ├── uiController.js     # DOM updates, event handling
    ├── staffRenderer.js    # VexFlow rendering
    ├── midiHandler.js      # Web MIDI API
    └── micHandler.js       # Microphone pitch detection
```

## License

MIT

# Credits

Praveen started this project and I added some extra features on top of it.

[Praveen Venkatesh](https://github.com/praveenVnktsh/piano-learning)