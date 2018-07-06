;(function() {
  function wrap(game, utils, {BLACK, WHITE}) {
    
    // implements alpha-beta prunning
    // https://en.wikipedia.org/wiki/Alpha%E2%80%93beta_pruning

    // to do this, we have to replace the max-max method used before with a true min-max

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

    function recursiveBestMove(gameState, depth, ourTeam, weights=defaultWeights) {

      if(depth < 1){
        console.log("Depth should start be a minimum of 1");
      }
      //if no moves are possible, state value will be worst possible (Infinity)
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
      for(let  move of moves){
        let moveValue = minStateValueAfterMove(gameState, depth-1, move, ourTeam, weights, currentBest);
        if(Math.max(currentBest, moveValue)){
          currentBest = moveValue;
          chosenMove = move;
        }
      }
      return chosenMove;
    }

    function minStateValueAfterMove(gameState, depth, move, ourTeam, weights, parentMax) {

      gameState = branchAndMove(move, gameState);
      
      if (depth == 0 || gameState.terminated) {
        let perspective = gameState.currentTurn;
        return baseEvalState(ourTeam, gameState, ourTeam, weights);
      }else{
        const possibleMoves = getMoves(gameState);
        //if no moves are possible, state value will be worst possible (Infinity)
        var currentBest = Infinity;
        for(let nextMove of getMoves(gameState)){
          let moveValue = maxStateValueAfterMove(gameState, depth-1, nextMove, ourTeam, weights, currentBest);
          //this is the pruning
          if(moveValue <= parentMax){
            //return value won't actualy be used
            return moveValue;
          }else if(Math.min(currentBest, moveValue)){
            currentBest = moveValue;
          }
        }
        return currentBest;
      }
    }

    function maxStateValueAfterMove(gameState, depth, move, ourTeam, weights, parentMin) {

      gameState = branchAndMove(move, gameState);
      
      if (depth == 0 || gameState.terminated) {
        let perspective = gameState.currentTurn;
        return baseEvalState(ourTeam, gameState, ourTeam, weights);
      }else{
        const possibleMoves = getMoves(gameState);
        //if no moves are possible, state value will be worst possible (Infinity)
        var currentBest = -Infinity;
        for(let nextMove of getMoves(gameState)){
          let moveValue = minStateValueAfterMove(gameState, depth-1, nextMove, ourTeam, weights, currentBest);
          //this is the pruning
          if(moveValue >= parentMin){
            //return value won't actualy be used
            return moveValue;
          }else if(Math.max(currentBest, moveValue)){
            currentBest = moveValue;
          }
        }
        return currentBest;
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
