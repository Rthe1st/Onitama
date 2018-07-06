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
    
      league = [
        {
            "name": "min_max_1",
            "make_move": (gameState) => {
              return minimax.recursiveBestMove(gameState, 1);
            }
        },
        {
          "name": "min_max_2",
          "make_move": (gameState) => {
            return minimax.recursiveBestMove(gameState, 2);
          }
        },
        {
            "name": "min_max_3",
            "make_move": (gameState) => {
              return minimax.recursiveBestMove(gameState, 3);
            }
        },
        {
          "name": "min_max_4",
          "make_move": (gameState) => {
            return minimax.recursiveBestMove(gameState, 4);
          }
        },
        {
          "name": "random",
          "make_move": (gameState) => {
            return randomAi.chooseMove(gameState);
          }
        },
        {
            "name": "min_max_alpha_beta_3",
            "make_move": (gameState) => {
              return minimaxPrune.recursiveBestMove(gameState, 3);
            }
        },
        {
            "name": "min_max_alpha_beta_4",
            "make_move": (gameState) => {
              return minimaxPrune.recursiveBestMove(gameState, 4);
            }
        },
        {
            "name": "min_max_alpha_beta_5",
            "make_move": (gameState) => {
              return minimaxPrune.recursiveBestMove(gameState, 5);
            }
        }
      ];

      function make_move(){
        if(gameState.terminated){
          ai_1_wins++;
          break
        }
      }

      //player 1 allways goes white
      function ai_game(player_1, player_2){
        let gameState = new game.GameState().initialize(cards.deck);
        gameState.start();
        while(!gameState.terminated){
          if(gameState.turnNumber > 50){
            return "draw";
          }
          let move = player_1(gameState);
          gameState.executeMove(move.sourceCell, move.targetCell, move.card);
          if(gameState.terminated){
            break;
          }
          move = player_2(gameState);
          gameState.executeMove(move.sourceCell, move.targetCell, move.card);
          if(gameState.terminated){
            break;
          }
        }
        return gameState.winner;
      
      }

      function compare_ais(ai_1, ai_2){
        let wins = {"ai_1": 0, "ai_2": 0, "draw": 0};
        for(let i=0; i<50; i++){
          winner = ai_game(ai_1, ai_2);
          if(winner == "WHITE"){
            wins["ai_1"]++;
          }else if(winner == "BLACK"){
            wins["ai_2"]++;
          }else{
            wins["draw"]++;
          }
        }
        for(let i=0; i<50; i++){
          winner = ai_game(ai_2, ai_1);
          if(winner == "WHITE"){
            wins["ai_2"]++;
          }else if(winner == "BLACK"){
            wins["ai_1"]++;
          }else{
            wins["draw"]++;
          }
        }
        return wins;
      }

      function run_league(){
        game_results = [];
        for(let i=0;i<5;i++){
          console.log("Run " + i);
          for(let team_1 of league){
            for(let team_2 of league){
              //console.log(team_1["name"] + " vs " + team_2["name"]);
              if(team_1["name"] !== team_2["name"]){
                  winner = ai_game(team_1["make_move"], team_2["make_move"]);
                  let game_result = {"White": team_1["name"],  "Black": team_2["name"], "winner": winner};
                  game_results.push(game_result);
              }
            }
          }
        }
        return game_results;
      }

    var f = [];
    function factorial (n) {
      if (n == 0 || n == 1)
        return 1;
      if (f[n] > 0)
        return f[n];
      return f[n] = factorial(n-1) * n;
    } 

    //null hypothesis is 50% win chance
    function significance(wins, losses){
      total = wins + losses;
      chance_of_results = Math.pow(0.5, total);
      combinations = factorial(total)/(factorial(wins)*factorial(losses));
      return chance_of_results * combinations;
    }

    function turn_time(ai, number_of_turns=100){
      let turns = 0;
      let aiTimes = [];
      while(true){
        let gameState = new game.GameState().initialize(cards.deck);
        gameState.start();
        while(!gameState.terminated){
          if(turns > number_of_turns){
            return aiTimes;
          }
          let startTime = process.hrtime();
          let move = ai(gameState);
          let [seconds, nanoseconds] = process.hrtime(startTime);
          aiTimes.push(seconds * 1e9 + nanoseconds);
          turns += 1;
          gameState.executeMove(move.sourceCell, move.targetCell, move.card);
        }
      }
    }
    
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

    if(process.argv[2] == "play_off"){
        console.log("Running league");
        let game_results = run_league();
        fs.writeFileSync("./data/game_results.json", JSON.stringify(game_results));
    }else if(process.argv[2] == "turn_time"){
        console.log("Getting turn times");
        let turn_times = {};
        for(let team of league){
            turn_times[team["name"]] = turn_time(team["make_move"]);
        }
        fs.writeFileSync("./data/turn_times.json", JSON.stringify(turn_times));
    }else if(process.argv[2] == "branching_factor"){
        console.log("Getting branching_factor");
        let branching_factors = branching_factor();
        fs.writeFileSync("./data/branching_factors.json", JSON.stringify(branching_factors));
    }
}

requirejs([
  'game',
  'cards',
  'minimax-ai',
  "minimax-prune",
  'random-ai'
], wrap);
