var requirejs = require('requirejs');

requirejs.config({
  nodeRequire: require,
  paths: {
    'game': '../isomorphic/game',
    'colors': '../isomorphic/colors',
    'cards': '../isomorphic/cards',
    'utils': '../isomorphic/utils',
    'minimax-ai': '../isomorphic/minimax-ai',
    'random-ai': '../isomorphic/random-ai'
  }
});

function wrap(
    game,
    colors,
    cards,
    utils,
    minimax,
    randomAi) {
    
      league = [
        {
          "name": "min_max_3",
          "make_move": (gameState) => {
            return minimax.recursiveBestMove(gameState, 3);
          }
        },
        {
          "name": "min_max_2",
          "make_move": (gameState) => {
            return minimax.recursiveBestMove(gameState, 2);
          }
        },
        {
          "name": "min_max_1",
          "make_move": (gameState) => {
            return minimax.recursiveBestMove(gameState, 1);
          }
        },
        {
          "name": "min_max_6",
          "make_move": (gameState) => {
            return minimax.recursiveBestMove(gameState, 6);
          }
        },
        {
          "name": "random",
          "make_move": (gameState) => {
            return randomAi.chooseMove(gameState);
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
        turns = 0;
        while(!gameState.terminated){
          if(gameState.turnNumber > 50){
            return "draw";
          }
          let move = player_1(gameState);
          if(move == null){
            return "draw";
          }
          gameState.executeMove(move.sourceCell, move.targetCell, move.card);
          if(gameState.terminated){
            break;
          }
          move = player_2(gameState);
          gameState.executeMove(move.sourceCell, move.targetCell, move.card);
          if(gameState.terminated){
            if(move == null){
              return "draw";
            }
            break;
          }
        }
        return gameState.winner;
      
      }

      function compare_ais(ai_1, ai_2){
        let wins = {"ai_1": 0, "ai_2": 0, "draw": 0};
        for(let i=0; i<100; i++){
          winner = ai_game(ai_1, ai_2);
          if(winner == "WHITE"){
            wins["ai_1"]++;
          }else if(winner == "BLACK"){
            wins["ai_2"]++;
          }else{
            wins["draw"]++;
          }
        }
        for(let i=0; i<10; i++){
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
        results = [];
        game_results = [];
        for(let team of league){
          results[team["name"]] = {"wins": 0, "draws": 0, "loses": 0};
        }
        for(let i=0;i<5;i++){
          for(let team_1 of league){
            for(let team_2 of league){
              if(team_1["name"] !== team_2["name"]){
                  winner = ai_game(team_1["make_move"], team_2["make_move"]);
                  let game_result = {"White": team_1["name"],  "Black": team_2["name"], "winner": winner};
                  console.log(game_result);
                  game_results.push(game_result);
                  if(winner == "WHITE"){
                    results[team_1["name"]]["wins"]++;
                    results[team_2["name"]]["loses"]++;
                  }else if(winner == "BLACK"){
                    results[team_2["name"]]["wins"]++;
                    results[team_1["name"]]["loses"]++;
                  }else{
                    results[team_1["name"]]["draws"]++;
                    results[team_2["name"]]["draws"]++;
                  }
              }
          }
        }
      }
      return results;
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
    //results = run_league();
    //console.log(results);
    wins = compare_ais(league[2]["make_move"], league[2]["make_move"]);
    console.log(wins);
    console.log(significance(wins["ai_1"], wins["ai_2"]));
}

requirejs([
  'game',
  'colors', 
  'cards',
  'utils',
  'minimax-ai',
  'random-ai'
], wrap);
