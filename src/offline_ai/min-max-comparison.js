var requirejs = require('requirejs');

requirejs.config({
  nodeRequire: require,
  paths: {
    'game': '../isomorphic/game',
    'colors': '../isomorphic/colors',
    'cards': '../isomorphic/cards',
    'utils': '../isomorphic/utils',
    'minimax-ai': '../isomorphic/minimax-ai',
    'minimax-prune': '../isomorphic/minimax-pruning-ai',
    'random-ai': '../isomorphic/random-ai'
  }
});

function wrap(
    game,
    cards,
    minimax,
    minimaxPrune,
    randomAi) {

      var fs = require('fs');
        
    function branching_factor(number_of_games=20000){
        let branching_factor = [];
        for(let i=0; i<number_of_games; i++){
          let gameState = new game.GameState().initialize(cards.deck);
          gameState.start();
          while(!gameState.terminated){
            branching_factor.push([gameState.turnNumber, gameState.gatherMovesForPlayer().length]);
            let move = randomAi.chooseMove(gameState);
            gameState.executeMove(move.sourceCell, move.targetCell, move.card);
          }
        }
        return branching_factor;
      }

    function time_move(number_of_turns=100000){
      let turns = 0;
      let moveFunctions = [
        "executeMove",
        "unsafeExecuteMove",
        "cutExecuteMove"
      ];
      let moveTimes = {"randomMove": []};
      for(let moveFunction of moveFunctions){
        moveTimes[moveFunction] = [];
      }
      while(true){
        let gameState = new game.GameState().initialize(cards.deck);
        gameState.start();
        while(!gameState.terminated){
          if(turns > number_of_turns){
            return moveTimes;
          }
          let startTime = process.hrtime();
          let move = randomAi.chooseMove(gameState);
          let [seconds, nanoseconds] = process.hrtime(startTime);
          moveTimes["randomMove"].push(seconds * 1e9 + nanoseconds);
          turns += 1;
          for(let moveFunction of moveFunctions){
            var branch = gameState.branch();
            var move_card = branch.localizeCard(move.card);    
            let startTime = process.hrtime();
            branch[moveFunction](move.sourceCell, move.targetCell, move_card);
            let [seconds, nanoseconds] = process.hrtime(startTime);
            moveTimes[moveFunction].push(seconds * 1e9 + nanoseconds);              
          }
          gameState.executeMove(move.sourceCell, move.targetCell, move.card);
        }
      }
    }

    if(process.argv[2] == "play_off"){
        console.log("Running league");
        let game_results = run_league();
        fs.writeFileSync("./data/game_results.json", JSON.stringify(game_results));
    }else if(process.argv[2] == "all_v_all"){
        console.log("All v all");
        let results = all_v_all();
        fs.writeFileSync("./data/all_v_all.json", JSON.stringify(results));
    }else if(process.argv[2] == "turn_time"){
        console.log("Getting turn times");
        let turn_times = {};
        for(let team of league){
            turn_times[team["name"]] = turn_time(team["make_move"]);
        }
        fs.writeFileSync("./data/turn_times.json", JSON.stringify(turn_times));
    }else{
        console.log("nothing");
    }
}

requirejs([
  'game',
  'cards',
  'minimax-ai',
  "minimax-prune",
  'random-ai'
], wrap);
