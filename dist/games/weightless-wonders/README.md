# Weightless Wonders — current project notes

This repo is a small educational HTML5 Canvas game that demonstrates gravity, weightlessness, and simple player movement across several levels. The project is modular: each level lives in `levels/levelX.js` and is dynamically imported by the LevelManager in `script.js`.

Summary of the current layout
- `index.html`        — Main menu, level buttons, canvas container and HUD
- `styles.css`        — UI and starfield styles
- `script.js`         — Starfield, LevelManager, asset preloader, and runtime wiring
- `levels/level1.js`  — Microgravity thrust level (astronaut in near-zero-g)
- `levels/level2.js`  — Platformer / Earth-gravity level (was moved from an earlier slot)
- `levels/level3.js`  — Three-zone gravity demo (Earth / Mars / Moon)
- `levels/level4.js`  — Microgravity upward-stars (free-fall chase variant)
- `assets/`           — Images and audio files used by the game

Important: current playable levels and ordering
- The UI still shows Level 1..4. Internally the project supports remapping which JS module backs a visible level number. The active mapping is in `script.js` (the `levelModuleMap`).
    - Visible Level 1 -> `levels/level1.js`
    - Visible Level 2 -> `levels/level4.js` (microgravity upward-stars)
    - Visible Level 3 -> `levels/level2.js` (Earth gravity platformer)
    - Visible Level 4 -> `levels/level3.js` (three-zone gravity demo)

Audio and narration behavior
- The `assets/` folder contains narration mp3 files named `lvl1 voice.mp3`, `lvl2 voice.mp3`, `lvl3 voice.mp3`, and `lvl4 voice.mp3`. Each visible level (1–4) is intended to play the corresponding file.
- Because the modules were remapped (visible level vs module file), many modules still reference `assets.audio.lvl<moduleNumber>Voice`. To keep the files unchanged we implemented a runtime alias in `script.js`: before a module loads we temporarily alias the module's expected `assets.audio.lvl<moduleModuleNumber>Voice` to point to the visible level's `assets.audio.lvl<visibleLevel>Voice` so the narration matches what the player expects.
- The aliasing code waits for the asset preload to finish (or fail) and always restores the original reference after the level run to avoid stale state.

How levels should be implemented
- Each file in `levels/levelX.js` must export two functions:
    - `start(ctx)` — returns a Promise that resolves `true` when the player completes the level and `false` when stopped/aborted.
    - `stop()` — called to stop/reset the level if the manager needs to unload it.
- The `ctx` object provided to `start(ctx)` contains:
    - `canvas` — the canvas DOM element
    - `hud` — the HUD container element (for small text/status updates)
    - `speak(text)` — a helper that uses Web Speech as a fallback (provided by `script.js`)

Assets and naming
- Image assets are loaded by `script.js` from `./assets/` — filenames currently used include `astronaut left.png`, `astronaut right.png`, `star.jpg`, `earth.jpg`, `mars.jpg`, and `moon.jpg`.
- Audio assets used include `option selected.mp3`, `star collected.mp3`, `level passed.mp3`, and the narration files `lvl1 voice.mp3` .. `lvl4 voice.mp3`.

Local testing
1. Start a simple HTTP server from the project root (required for ES module imports and audio playback):

```powershell
python -m http.server 8000
```

2. Open http://localhost:8000 in your browser.

3. Use the menu buttons to select levels. Watch the browser console for import and alias logs (these help verify the narration file used for each visible level).

Notes and next steps
- If you add new level modules or change the visible ordering you may need to update `levelModuleMap` inside `script.js`. A better long-term approach is to make modules read the visible level number from `ctx` instead of hard-coding `lvlXVoice` keys — I can help refactor that to make remapping safer and cleaner.
- If you want an on-screen debug overlay that shows which narration file is selected when a level starts (so you don't need DevTools), tell me and I will add it.

Contact / development
- This project is intended as an educational scaffold. If you'd like me to implement the optional overlay or refactor the narration wiring, say "Add overlay" or "Refactor narration" and I'll continue.
