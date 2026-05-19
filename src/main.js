import { chooseBotMove } from './core/Bot.js';
import { Game } from './core/Game.js';
import './style.css';

const THEMES = {
  warren: {
    board: '#7caf61',
    boardAlt: '#6da756',
    dot: '#fff7dc',
    edge: '#7a4a27',
    hover: 'rgba(255, 230, 128, 0.72)',
    box: 'rgba(255, 246, 196, 0.44)',
    mark: '🐰',
  },
  harvest: {
    board: '#9a6a3a',
    boardAlt: '#80542f',
    dot: '#ffe2a8',
    edge: '#f08c2e',
    hover: 'rgba(255, 190, 84, 0.76)',
    box: 'rgba(255, 158, 67, 0.36)',
    mark: '🥕',
  },
};

const canvas = document.querySelector('#gameCanvas');
const ctx = canvas.getContext('2d');
const modeSelect = document.querySelector('#modeSelect');
const gridSize = document.querySelector('#gridSize');
const gridValue = document.querySelector('#gridValue');
const themeSelect = document.querySelector('#themeSelect');
const startButton = document.querySelector('#startButton');
const restartButton = document.querySelector('#restartButton');
const themeToggle = document.querySelector('#themeToggle');
const scoreboard = document.querySelector('#scoreboard');
const statusText = document.querySelector('#statusText');
const captureBanner = document.querySelector('#captureBanner');

let game = null;
let hoverMove = null;
let botThinking = false;

function createPlayers(mode) {
  return [
    { id: 'p1', name: 'Ahmet', color: '#e85d3f', isBot: false },
    {
      id: 'p2',
      name: mode === 'bot' ? 'Lagomorph Bot' : 'Oyuncu 2',
      color: mode === 'bot' ? '#2f9e44' : '#3772ff',
      isBot: mode === 'bot',
    },
  ];
}

function startGame() {
  const size = Number.parseInt(gridSize.value, 10);
  game = new Game({
    rows: size,
    cols: size,
    players: createPlayers(modeSelect.value),
  });
  hoverMove = null;
  botThinking = false;
  setTheme(themeSelect.value);
  updateUI();
  draw();
  maybeRunBot();
}

function setTheme(theme) {
  document.body.classList.toggle('theme-warren', theme === 'warren');
  document.body.classList.toggle('theme-harvest', theme === 'harvest');
  themeSelect.value = theme;
  draw();
}

function toggleTheme() {
  setTheme(themeSelect.value === 'warren' ? 'harvest' : 'warren');
}

function updateUI(lastResult = null) {
  if (!game) return;
  const state = game.getState();
  scoreboard.innerHTML = state.players
    .map(
      (player) => `
        <article class="score ${player.id === state.currentPlayer.id ? 'active' : ''}" style="--player:${player.color}">
          <span>${player.name}</span>
          <strong>${player.score}</strong>
        </article>
      `,
    )
    .join('');

  if (state.isGameOver) {
    const topScore = Math.max(...state.players.map((player) => player.score));
    const winners = state.players.filter((player) => player.score === topScore);
    statusText.textContent = winners.length > 1 ? 'Berabere.' : `${winners[0].name} kazandı.`;
  } else {
    statusText.textContent = `${state.currentPlayer.name} sırası`;
  }

  if (lastResult?.completedBoxes.length) {
    showCapture(lastResult.completedBoxes.length > 1 ? 'COMBO!' : `${state.currentPlayer.name} alan kaptı`);
    const activeScore = scoreboard.querySelector('.score.active strong');
    activeScore?.animate(
      [
        { transform: 'translateY(0) scale(1)' },
        { transform: 'translateY(-8px) scale(1.18)' },
        { transform: 'translateY(0) scale(1)' },
      ],
      { duration: 360, easing: 'cubic-bezier(.2,.8,.2,1)' },
    );
  }
}

function showCapture(text) {
  captureBanner.textContent = text;
  captureBanner.classList.remove('show');
  requestAnimationFrame(() => captureBanner.classList.add('show'));
}

function boardMetrics(state) {
  const padding = 58;
  const width = canvas.width - padding * 2;
  const height = canvas.height - padding * 2;
  const cell = Math.min(width / state.cols, height / state.rows);
  const boardWidth = cell * state.cols;
  const boardHeight = cell * state.rows;
  return {
    cell,
    left: (canvas.width - boardWidth) / 2,
    top: (canvas.height - boardHeight) / 2,
  };
}

function draw() {
  if (!game) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }

  const state = game.getState();
  const theme = THEMES[themeSelect.value];
  const metrics = boardMetrics(state);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = theme.board;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = theme.boardAlt;
  for (let i = -canvas.height; i < canvas.width; i += 42) {
    ctx.fillRect(i, 0, 18, canvas.height);
  }

  drawBoxes(state, metrics, theme);
  drawEdges(state, metrics, theme);
  if (hoverMove && game.isLegalMove(hoverMove)) drawEdge(hoverMove, metrics, theme.hover, 10);
  drawDots(state, metrics, theme);
}

function drawBoxes(state, metrics, theme) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${Math.max(22, metrics.cell * 0.34)}px "Segoe UI Emoji", sans-serif`;

  state.boxes.forEach((ownerId, index) => {
    if (!ownerId) return;
    const row = Math.floor(index / state.cols);
    const col = index % state.cols;
    const player = state.players.find((item) => item.id === ownerId);
    const x = metrics.left + col * metrics.cell;
    const y = metrics.top + row * metrics.cell;
    ctx.fillStyle = theme.box;
    ctx.fillRect(x + 8, y + 8, metrics.cell - 16, metrics.cell - 16);
    ctx.fillStyle = player?.color ?? '#fff';
    ctx.fillText(theme.mark, x + metrics.cell / 2, y + metrics.cell / 2);
  });
}

function drawEdges(state, metrics, theme) {
  for (const [key, playerId] of Object.entries(state.edges.h)) {
    const [row, col] = key.split(',').map(Number);
    const player = state.players.find((item) => item.id === playerId);
    drawEdge({ orientation: 'h', row, col }, metrics, player?.color ?? theme.edge, 8);
  }

  for (const [key, playerId] of Object.entries(state.edges.v)) {
    const [row, col] = key.split(',').map(Number);
    const player = state.players.find((item) => item.id === playerId);
    drawEdge({ orientation: 'v', row, col }, metrics, player?.color ?? theme.edge, 8);
  }
}

function drawEdge(move, metrics, color, width) {
  const x = metrics.left + move.col * metrics.cell;
  const y = metrics.top + move.row * metrics.cell;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (move.orientation === 'h') {
    ctx.moveTo(x, y);
    ctx.lineTo(x + metrics.cell, y);
  } else {
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + metrics.cell);
  }
  ctx.stroke();
}

function drawDots(state, metrics, theme) {
  ctx.fillStyle = theme.dot;
  ctx.strokeStyle = 'rgba(55, 35, 20, .18)';
  ctx.lineWidth = 2;
  for (let row = 0; row <= state.rows; row += 1) {
    for (let col = 0; col <= state.cols; col += 1) {
      ctx.beginPath();
      ctx.arc(metrics.left + col * metrics.cell, metrics.top + row * metrics.cell, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }
}

function getPointerMove(event) {
  if (!game) return null;
  const rect = canvas.getBoundingClientRect();
  const state = game.getState();
  const metrics = boardMetrics(state);
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;
  const candidates = [];

  for (const move of game.getLegalMoves()) {
    const startX = metrics.left + move.col * metrics.cell;
    const startY = metrics.top + move.row * metrics.cell;
    const center =
      move.orientation === 'h'
        ? { x: startX + metrics.cell / 2, y: startY }
        : { x: startX, y: startY + metrics.cell / 2 };
    candidates.push({ move, distance: Math.hypot(center.x - x, center.y - y) });
  }

  candidates.sort((a, b) => a.distance - b.distance);
  return candidates[0]?.distance < metrics.cell * 0.42 ? candidates[0].move : null;
}

function applyMove(move) {
  if (!game || !move) return;
  const result = game.applyMove(move);
  if (!result.ok) return;
  hoverMove = null;
  updateUI(result);
  draw();
  maybeRunBot();
}

function maybeRunBot() {
  if (!game || botThinking) return;
  const state = game.getState();
  if (state.isGameOver || !state.currentPlayer.isBot) return;
  botThinking = true;
  window.setTimeout(() => {
    const move = chooseBotMove(game);
    botThinking = false;
    if (move) applyMove(move);
  }, 420);
}

gridSize.addEventListener('input', () => {
  gridValue.textContent = `${gridSize.value} x ${gridSize.value}`;
});
themeSelect.addEventListener('change', () => setTheme(themeSelect.value));
themeToggle.addEventListener('click', toggleTheme);
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);
canvas.addEventListener('pointermove', (event) => {
  if (botThinking || game?.getState().currentPlayer.isBot) return;
  hoverMove = getPointerMove(event);
  draw();
});
canvas.addEventListener('pointerleave', () => {
  hoverMove = null;
  draw();
});
canvas.addEventListener('click', () => {
  if (botThinking || game?.getState().currentPlayer.isBot) return;
  applyMove(hoverMove);
});

startGame();
