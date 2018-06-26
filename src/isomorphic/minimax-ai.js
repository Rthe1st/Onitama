;(function() {
  function wrap(game, utils, {BLACK, WHITE}) {
    const defaultWeights = {
      PAWN: 10,
      VICTORY: 1000,
      SKEW: 0,
    };

    function branchAndMove(move, gameState) {
      var branch = gameState.branch();
      move.card = branch.localizeCard(move.card);
      branch.executeMove(move.sourceCell, move.targetCell, move.card);
      return branch;
    }

    function baseEvalState(perspective, gameState, weights=defaultWeights) {
      var value = 0;

      if (gameState.winner === perspective) {
        value += weights.VICTORY;
      } else if (gameState.winner !== null) {
        value -= weights.VICTORY;
      }

      gameState.getPieces()
        .forEach(({piece}) => {
          if (piece.color === perspective) {
            value += weights.PAWN;
          } else {
            value -= weights.PAWN;
          }
        });

      return value;
    }

    function getMoves(gameState){
      return gameState.getPieces()
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

    }

    function recursiveBestMove(gameState, depth, weights=defaultWeights) {

      if(depth < 1){
        console.log("Depth should start be a minimum of 1");
      }
      const possibleMoves = getMoves(gameState)
        .map(move => {
            move.value = stateValueAfterMove(gameState, depth-1, move, weights);
            return move;
          }
        )
        .sort((l, r) => r.value - l.value);
        if(possibleMoves.length == 0){
          //pick a random card to hand over
          return {
            card: gameState.getAvailableCards(gameState.currentTurn)[0],
            sourceCell: null,
            targetCell: null
          };
        }else{
          return possibleMoves[0];
        }
    }

    function stateValueAfterMove(gameState, depth, move, weights) {
      // this function is more like "maxmax" then "minimax"
      // because we let the opponent maximise their heuristic, instead of minimising ours
      // but that ok because the heuristic is symetric between players

      gameState = branchAndMove(move, gameState);
      
      if (depth == 0 || gameState.terminated) {
        let perspective = gameState.currentTurn;
        return baseEvalState(perspective, gameState, weights);
      }else{
        const possibleValues = getMoves(gameState)
        .map(nextMove => stateValueAfterMove(gameState, depth-1, nextMove, weights))
        .sort((l, r) => r - l);
        if(possibleValues.length == 0){
          // read the onitama rules and work out if having to skip a go is good or bad
          //for now, return 0 as a neutral value
        }else{
          return possibleValues[0];
        }
      }
    }

    return {
      defaultWeights,
      baseEvalState,
      recursiveBestMove
    }
  }

  define([
    'game',
    'utils',
    'colors',
  ], wrap);
})();
