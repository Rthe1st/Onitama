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

    function recursiveBestMove(gameState, depth, ourTeam=gameState.currentTurn, weights=defaultWeights) {
      if(depth < 1){
        console.log("Depth should start be a minimum of 1");
      }
      var currentBest = -Infinity;
      let moves = getMoves(gameState);
      if(moves.length == 0){
        //pick a random card to hand over
        //console.log("no move possible");
          return {
          card: gameState.getAvailableCards(gameState.currentTurn)[0],
          sourceCell: null,
          targetCell: null
        };
      }
      let chosenMove;
      for(let move of moves){
        let moveValue;
        let newGameState = branchAndMove(move, gameState);
        if (depth-1 == 0 || newGameState.terminated) {
          moveValue = baseEvalState(ourTeam, newGameState, weights);
        }else{
          moveValue = minMoveValue(newGameState, depth-1, ourTeam, weights);
        }
        if(currentBest < moveValue){
          currentBest = moveValue;
          chosenMove = move;
        }
      }
      return chosenMove;
    }

    function minMoveValue(gameState, depth, ourTeam, weights) {
      const possibleMoves = getMoves(gameState);
      //if no moves are possible, state value will be worst possible (Infinity)
      var currentBest = Infinity;
      for(let move of getMoves(gameState)){
        let moveValue;
        let newGameState = branchAndMove(move, gameState);
        if (depth-1 == 0 || newGameState.terminated) {
          moveValue = baseEvalState(ourTeam, newGameState, weights);
        }else{
          moveValue = maxMoveValue(newGameState, depth-1, ourTeam, weights);
        }
        currentBest = Math.min(currentBest, moveValue);
      }
      return currentBest;
    }

    function maxMoveValue(gameState, depth, ourTeam, weights) {
      const possibleMoves = getMoves(gameState);
      //if no moves are possible, state value will be worst possible (Infinity)
      var currentBest = -Infinity;
      for(let move of getMoves(gameState)){
        let newGameState = branchAndMove(move, gameState);
        if (depth-1 == 0 || newGameState.terminated) {
          moveValue = baseEvalState(ourTeam, newGameState, weights);
        }else{
          moveValue = minMoveValue(newGameState, depth-1, ourTeam, weights);
        }
        currentBest = Math.max(currentBest, moveValue);
      }
      return currentBest;
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
