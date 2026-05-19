import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseBotMove } from './Bot.js';
import { Game } from './Game.js';

const players = [
  { id: 'p1', name: 'Ahmet', color: '#e85d3f', isBot: false },
  { id: 'p2', name: 'Lagomorph Bot', color: '#2f9e44', isBot: true },
];

function newGame(options = {}) {
  return new Game({
    rows: options.rows ?? 3,
    cols: options.cols ?? 3,
    players: options.players ?? players,
  });
}

test('initializes a clamped board and player scores', () => {
  const small = newGame({ rows: 1, cols: 99 });
  const state = small.getState();

  assert.equal(state.rows, 3);
  assert.equal(state.cols, 10);
  assert.equal(state.currentPlayer.id, 'p1');
  assert.deepEqual(
    state.players.map((player) => player.score),
    [0, 0],
  );
  assert.equal(small.getLegalMoves().length, 2 * 3 * 10 + 3 + 10);
});

test('claims exactly one edge and advances turn for a non-capturing move', () => {
  const game = newGame();
  const result = game.applyMove({ orientation: 'h', row: 0, col: 0 });

  assert.equal(result.ok, true);
  assert.equal(result.completedBoxes.length, 0);
  assert.equal(game.getState().edges.h['0,0'], 'p1');
  assert.equal(game.getState().currentPlayer.id, 'p2');
});

test('rejects an already claimed edge without changing turn', () => {
  const game = newGame();
  game.applyMove({ orientation: 'h', row: 0, col: 0 });
  const result = game.applyMove({ orientation: 'h', row: 0, col: 0 });

  assert.equal(result.ok, false);
  assert.equal(result.reason, 'illegal-move');
  assert.equal(game.getState().currentPlayer.id, 'p2');
});

test('awards a point and preserves turn when completing a box', () => {
  const game = newGame();

  game.applyMove({ orientation: 'h', row: 0, col: 0 });
  game.applyMove({ orientation: 'h', row: 1, col: 0 });
  game.applyMove({ orientation: 'v', row: 0, col: 0 });
  const result = game.applyMove({ orientation: 'v', row: 0, col: 1 });

  assert.equal(result.completedBoxes.length, 1);
  assert.equal(result.completedBoxes[0].row, 0);
  assert.equal(result.completedBoxes[0].col, 0);
  assert.equal(game.getState().players[1].score, 1);
  assert.equal(game.getState().currentPlayer.id, 'p2');
});

test('awards two points when one edge completes two boxes', () => {
  const game = newGame();
  const setupMoves = [
    { orientation: 'h', row: 0, col: 0 },
    { orientation: 'v', row: 0, col: 0 },
    { orientation: 'h', row: 1, col: 0 },
    { orientation: 'h', row: 0, col: 1 },
    { orientation: 'v', row: 0, col: 2 },
    { orientation: 'h', row: 1, col: 1 },
  ];

  for (const move of setupMoves) {
    game.applyMove(move);
  }

  const result = game.applyMove({ orientation: 'v', row: 0, col: 1 });

  assert.equal(result.completedBoxes.length, 2);
  assert.equal(game.getState().players[0].score, 2);
  assert.equal(game.getState().currentPlayer.id, 'p1');
});

test('sets game over when all boxes are owned', () => {
  const game = newGame({ rows: 3, cols: 3 });

  for (const move of game.getLegalMoves()) {
    game.applyMove(move);
  }

  const state = game.getState();
  assert.equal(state.isGameOver, true);
  assert.equal(state.boxes.filter(Boolean).length, 9);
});

test('bot completes an available box', () => {
  const game = newGame();

  game.applyMove({ orientation: 'h', row: 0, col: 0 });
  game.applyMove({ orientation: 'h', row: 1, col: 0 });
  game.applyMove({ orientation: 'v', row: 0, col: 0 });

  assert.deepEqual(chooseBotMove(game), { orientation: 'v', row: 0, col: 1 });
});

test('bot avoids creating a third side when a safe move exists', () => {
  const game = newGame();

  game.applyMove({ orientation: 'h', row: 0, col: 0 });
  game.applyMove({ orientation: 'v', row: 0, col: 0 });

  const move = chooseBotMove(game);

  assert.notDeepEqual(move, { orientation: 'h', row: 1, col: 0 });
  assert.notDeepEqual(move, { orientation: 'v', row: 0, col: 1 });
});
