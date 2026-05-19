export function chooseBotMove(game) {
  const legalMoves = game.getLegalMoves();
  if (legalMoves.length === 0) return null;

  const attackMove = legalMoves.find((move) => game.wouldCompleteBox(move));
  if (attackMove) return attackMove;

  const safeMove = legalMoves.find((move) => !game.wouldCreateThirdSide(move));
  if (safeMove) return safeMove;

  return legalMoves[0];
}
