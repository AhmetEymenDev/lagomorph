const MIN_SIZE = 3;
const MAX_SIZE = 10;

function clampSize(value) {
  const numeric = Number.parseInt(value, 10);
  if (Number.isNaN(numeric)) return MIN_SIZE;
  return Math.min(MAX_SIZE, Math.max(MIN_SIZE, numeric));
}

function edgeKey(move) {
  return `${move.row},${move.col}`;
}

function cloneEdgeMap(map) {
  return {
    h: { ...map.h },
    v: { ...map.v },
  };
}

export class Game {
  constructor({ rows = 5, cols = 5, players }) {
    if (!Array.isArray(players) || players.length < 2) {
      throw new Error('Game requires at least two players.');
    }

    this.rows = clampSize(rows);
    this.cols = clampSize(cols);
    this.players = players.map((player) => ({ ...player, score: 0 }));
    this.activePlayerIndex = 0;
    this.edges = { h: {}, v: {} };
    this.boxes = Array.from({ length: this.rows * this.cols }, () => null);
    this.isGameOver = false;
    this.lastMove = null;
  }

  getState() {
    return {
      rows: this.rows,
      cols: this.cols,
      players: this.players.map((player) => ({ ...player })),
      activePlayerIndex: this.activePlayerIndex,
      currentPlayer: { ...this.players[this.activePlayerIndex] },
      edges: cloneEdgeMap(this.edges),
      boxes: [...this.boxes],
      isGameOver: this.isGameOver,
      lastMove: this.lastMove ? { ...this.lastMove } : null,
    };
  }

  getLegalMoves() {
    const moves = [];

    for (let row = 0; row <= this.rows; row += 1) {
      for (let col = 0; col < this.cols; col += 1) {
        const move = { orientation: 'h', row, col };
        if (this.isLegalMove(move)) moves.push(move);
      }
    }

    for (let row = 0; row < this.rows; row += 1) {
      for (let col = 0; col <= this.cols; col += 1) {
        const move = { orientation: 'v', row, col };
        if (this.isLegalMove(move)) moves.push(move);
      }
    }

    return moves;
  }

  isLegalMove(move) {
    if (!move || this.isGameOver) return false;
    if (move.orientation === 'h') {
      return (
        move.row >= 0 &&
        move.row <= this.rows &&
        move.col >= 0 &&
        move.col < this.cols &&
        !this.edges.h[edgeKey(move)]
      );
    }

    if (move.orientation === 'v') {
      return (
        move.row >= 0 &&
        move.row < this.rows &&
        move.col >= 0 &&
        move.col <= this.cols &&
        !this.edges.v[edgeKey(move)]
      );
    }

    return false;
  }

  applyMove(move) {
    if (!this.isLegalMove(move)) {
      return { ok: false, reason: 'illegal-move', completedBoxes: [] };
    }

    const player = this.players[this.activePlayerIndex];
    const normalizedMove = {
      orientation: move.orientation,
      row: move.row,
      col: move.col,
    };

    this.edges[normalizedMove.orientation][edgeKey(normalizedMove)] = player.id;
    this.lastMove = normalizedMove;

    const completedBoxes = this.getAdjacentBoxes(normalizedMove).filter(
      (box) => !this.getBoxOwner(box.row, box.col) && this.countBoxSides(box.row, box.col) === 4,
    );

    for (const box of completedBoxes) {
      this.boxes[this.boxIndex(box.row, box.col)] = player.id;
      player.score += 1;
    }

    this.isGameOver = this.boxes.every(Boolean);

    if (completedBoxes.length === 0 && !this.isGameOver) {
      this.activePlayerIndex = (this.activePlayerIndex + 1) % this.players.length;
    }

    return {
      ok: true,
      move: normalizedMove,
      playerId: player.id,
      completedBoxes,
      bonusTurn: completedBoxes.length > 0,
      isGameOver: this.isGameOver,
    };
  }

  getBoxEdges(row, col) {
    return [
      { orientation: 'h', row, col },
      { orientation: 'h', row: row + 1, col },
      { orientation: 'v', row, col },
      { orientation: 'v', row, col: col + 1 },
    ];
  }

  countBoxSides(row, col) {
    return this.getBoxEdges(row, col).filter((move) => this.edges[move.orientation][edgeKey(move)]).length;
  }

  wouldCompleteBox(move) {
    if (!this.isLegalMove(move)) return false;
    return this.getAdjacentBoxes(move).some((box) => this.countBoxSides(box.row, box.col) === 3);
  }

  wouldCreateThirdSide(move) {
    if (!this.isLegalMove(move)) return true;
    return this.getAdjacentBoxes(move).some((box) => this.countBoxSides(box.row, box.col) === 2);
  }

  getAdjacentBoxes(move) {
    if (move.orientation === 'h') {
      return [
        { row: move.row - 1, col: move.col },
        { row: move.row, col: move.col },
      ].filter((box) => this.isBoxCoordinate(box.row, box.col));
    }

    return [
      { row: move.row, col: move.col - 1 },
      { row: move.row, col: move.col },
    ].filter((box) => this.isBoxCoordinate(box.row, box.col));
  }

  getBoxOwner(row, col) {
    return this.boxes[this.boxIndex(row, col)];
  }

  boxIndex(row, col) {
    return row * this.cols + col;
  }

  isBoxCoordinate(row, col) {
    return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
  }
}
