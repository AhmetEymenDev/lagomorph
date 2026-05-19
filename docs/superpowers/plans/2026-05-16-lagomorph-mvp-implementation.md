# Lagomorph MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first playable Lagomorph browser MVP for local two-player and user-vs-bot Dots and Boxes matches.

**Architecture:** Keep game rules in DOM-free modules, render the board with Canvas, and use HTML/CSS for setup, HUD, score, and controls. The bot reads public game state and returns legal moves without mutating state directly.

**Tech Stack:** Vanilla JavaScript ES modules, HTML5 Canvas, CSS custom properties, Vite, Node's built-in test runner.

---

## File Structure

- `package.json`: npm scripts for dev server and tests.
- `index.html`: app shell, setup controls, canvas, scoreboard, status, restart.
- `src/core/Game.js`: board state, move validation, scoring, turn handling, game-over logic, public helpers.
- `src/core/Bot.js`: tactical move selection using attack, safe move, fallback priorities.
- `src/core/Game.test.js`: RED/GREEN tests for game rules and bot behavior.
- `src/main.js`: DOM controller, canvas renderer, pointer-to-edge mapping, bot turn loop.
- `src/style.css`: responsive app styling, themes, HUD, score and capture animations.

## Task 1: Test Harness And Core Rule Tests

**Files:**
- Modify: `package.json`
- Create: `src/core/Game.test.js`

- [ ] **Step 1: Add Node test and Vite scripts**

```json
{
  "name": "lagomorph",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "test": "node --test"
  },
  "devDependencies": {
    "vite": "^5.4.0"
  }
}
```

- [ ] **Step 2: Write failing tests for initialization, moves, captures, bonus turns, game over, and bot behavior**

Use `node:test` and `node:assert/strict`. Import `Game` and `chooseBotMove`.

- [ ] **Step 3: Run tests to verify RED**

Run: `npm test`

Expected: FAIL because `Game` and `Bot` exports are not implemented.

## Task 2: Game Core

**Files:**
- Modify: `src/core/Game.js`
- Test: `src/core/Game.test.js`

- [ ] **Step 1: Implement minimal `Game` API**

Required API:

```js
new Game({ rows, cols, players })
game.getState()
game.getLegalMoves()
game.isLegalMove(move)
game.applyMove(move)
game.getBoxEdges(row, col)
game.countBoxSides(row, col)
```

- [ ] **Step 2: Run tests to verify game rules pass**

Run: `npm test`

Expected: game-rule tests PASS, bot tests still FAIL until Task 3.

## Task 3: Bot Strategy

**Files:**
- Create: `src/core/Bot.js`
- Test: `src/core/Game.test.js`

- [ ] **Step 1: Implement `chooseBotMove(game)`**

Priority:

1. Complete any available box.
2. Prefer moves that do not create a three-sided box.
3. Choose the first remaining legal move as deterministic fallback.

- [ ] **Step 2: Run tests to verify all core tests pass**

Run: `npm test`

Expected: PASS.

## Task 4: Browser MVP

**Files:**
- Modify: `index.html`
- Modify: `src/main.js`
- Modify: `src/style.css`

- [ ] **Step 1: Build app shell**

Add setup controls for mode, grid size, theme, start, restart, scoreboard, status, capture banner, and canvas.

- [ ] **Step 2: Wire DOM controller and renderer**

Create a `Game`, render the board, map pointer coordinates to nearest unclaimed edge, apply human moves, and process bot turns after a short delay.

- [ ] **Step 3: Add responsive theme styling**

Support `The Warren` and `The Harvest` via root CSS classes and renderer tokens.

## Task 5: Verification

**Files:**
- No new files required.

- [ ] **Step 1: Run automated tests**

Run: `npm test`

Expected: PASS.

- [ ] **Step 2: Run the dev server**

Run: `npm run dev -- --port 5173`

Expected: Vite serves the app on `http://127.0.0.1:5173/`.

- [ ] **Step 3: Browser smoke test**

Verify start screen, two-player mode, user-vs-bot mode, theme toggle, small grid, large grid, scoring, bonus turns, and game-over message.
