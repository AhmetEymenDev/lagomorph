# Lagomorph Theme Animated MVP Design

Date: 2026-05-16
Status: Approved for planning

## Goal

Build the first playable Lagomorph MVP as a browser-based Dots and Boxes game with a distinctive rabbit/carrot theme, animated feedback, and two game modes:

- Two local players on the same device.
- User vs Bot with a simple tactical bot.

The MVP should prioritize a correct and responsive game loop over broad feature coverage. It should feel like Lagomorph from the first run through themed visuals, hover feedback, score pop effects, and box-capture animations.

## Scope

Included:

- Start screen with mode selection: `2 Players` or `User vs Bot`.
- Grid size selection from `3x3` to `10x10`.
- Theme selection and in-game theme toggle: `The Warren` and `The Harvest`.
- Canvas-rendered grid, dots, available edges, claimed edges, and captured boxes.
- Turn handling, score tracking, bonus turn on capture, and game-over detection.
- Basic bot that can complete boxes, avoid obviously dangerous moves where possible, and otherwise choose a fallback move.
- Animated feedback for hover preview, edge placement, captured boxes, score changes, and combo/capture messaging.

Excluded from this MVP:

- Online multiplayer.
- Player account system.
- Five-player slot system.
- Advanced bot difficulty levels.
- Persistent match history.
- Full particle system beyond lightweight CSS/canvas effects.

## Architecture

Use a Canvas-first game surface with HTML/CSS for surrounding UI.

The game state should be managed by a small JavaScript core that knows nothing about DOM layout beyond receiving actions and returning state. Canvas rendering should read that state and draw the board. HTML controls should handle setup, scoreboard, theme toggle, restart, and game-over display.

Core units:

- `Game`: owns config, players, current turn, edges, boxes, scoring, move validation, capture detection, bonus turns, and game-over state.
- `Bot`: receives the current game state and returns one legal edge move.
- `Renderer`: draws the board to canvas using the active theme and interaction state.
- `UI Controller`: wires DOM events to game actions, updates scoreboard/status text, and coordinates animation classes.

This separation keeps rules testable without canvas and keeps rendering replaceable without changing the game logic.

## Data Model

The board represents boxes as `rows x cols`. Dots therefore form a `(rows + 1) x (cols + 1)` lattice.

Edges should be addressed by orientation and grid coordinate:

```js
{ orientation: 'h', row: 0, col: 0 }
{ orientation: 'v', row: 0, col: 0 }
```

Horizontal edges use `row: 0..rows`, `col: 0..cols - 1`.
Vertical edges use `row: 0..rows - 1`, `col: 0..cols`.

Boxes should store owner information separately from edge ownership. A move can complete zero, one, or two boxes.

Players:

```js
{
  id: 'p1',
  name: 'Ahmet',
  color: '#e85d3f',
  isBot: false,
  score: 0
}
```

In `User vs Bot`, player two is `Lagomorph Bot` with `isBot: true`.

## Game Flow

1. User selects mode, grid size, and theme.
2. UI creates a new `Game` instance and a canvas renderer.
3. Pointer movement over canvas maps screen coordinates to the nearest legal unclaimed edge and stores it as hover state.
4. Pointer click attempts the hovered edge move.
5. The game core validates the move, claims the edge, checks completed boxes, updates score, and either keeps or advances the turn.
6. UI triggers capture and score animations for any completed boxes.
7. If current player is the bot, the controller waits briefly, asks the bot for a move, and applies it. Bonus turns allow the bot to continue after each capture.
8. When all boxes are owned, the UI shows the winner or draw state.

## Bot Behavior

The bot uses a deterministic priority strategy with random tie-breaking:

1. Attack: if any legal edge completes a box, play one of those moves.
2. Safety: otherwise, prefer legal moves that do not create a box with three claimed sides for the opponent.
3. Fallback: if no safe move exists, choose any legal move.

The bot should use the same public move APIs as a human click. It must not mutate state directly.

## Themes And Visual Design

`The Warren`:

- Grass-like background.
- Fence-like claimed edges.
- Captured boxes show a rabbit-themed mark.
- Hover preview uses warm green/gold highlights.

`The Harvest`:

- Soil-like background.
- Rake/furrow-like claimed edges.
- Captured boxes show a carrot-themed mark.
- Hover preview uses orange/earth highlights.

The theme system should be CSS-variable driven for UI and renderer-token driven for canvas. Runtime theme changes should not reset game state.

## Animation Design

Animations should be meaningful but lightweight:

- Edge placement: short draw/fade emphasis on the new edge.
- Hover preview: translucent glow on the nearest legal edge.
- Capture: box fill pop plus rabbit/carrot mark scaling into place.
- Score pop: active player's score briefly translates upward and scales.
- Combo/capture banner: text appears when a player completes at least one box, with stronger copy for consecutive captures.

Animations must not block input except during the bot delay. The game core remains synchronous; animation is presentation-only.

## Error Handling

- Invalid or already claimed edge clicks are ignored.
- Canvas coordinate mapping should tolerate clicks outside the board by returning no edge.
- Grid input is clamped to `3..10`.
- If bot move selection returns no move while the game is not over, the controller should fail safely by checking legal moves again and ending the game only if none exist.

## Testing And Verification

Minimum verification:

- Game initializes for `3x3`, default size, and `10x10`.
- Human move claims exactly one edge.
- Completing a box awards one point and preserves the turn.
- Completing two boxes with one edge awards two points.
- Non-capturing moves advance the turn.
- Game ends when all boxes are owned.
- Bot completes an available box.
- Bot avoids a dangerous third side when a safe move exists.
- Theme toggle changes visuals without resetting score or board state.

Manual browser verification should include both modes, both themes, a small grid, and a larger grid.

## Implementation Notes

Use the existing vanilla JavaScript direction from the README. Avoid adding a framework for this MVP. A lightweight dev setup such as Vite is acceptable if needed to run modules cleanly, but the architecture should remain plain HTML, CSS, and JavaScript.

The current repo has empty scaffold files. Implementation should preserve user changes and only modify files needed for the MVP.
