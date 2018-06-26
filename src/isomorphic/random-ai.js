;(function() {
  function wrap(game, utils, {BLACK, WHITE}) {

    function chooseMove(gameState) {
      if (gameState.winner) {
        return null;
      }

      const possibleMoves = gameState.getPieces()
        .filter(cell => cell.piece.getColor() === gameState.currentTurn)
        .map(cell => {
          var targetCells = gameState.gatherMoves([cell.x, cell.y]);

          return targetCells.map(targetCell => {
            return targetCell.cards
              .map(card => {
                return {
                  card: card,
                  sourceCell: [cell.x, cell.y],
                  targetCell: targetCell.cell
                };
              })
              .reduce(utils.flattenReduce, []);
            })
            .reduce(utils.flattenReduce, []);
        })
        .reduce(utils.flattenReduce, []);
      return possibleMoves[Math.floor(Math.random()*possibleMoves.length)];
    }

    return {
      chooseMove
    }
  }

  define([
    'game',
    'utils',
    'colors',
  ], wrap);
})();
