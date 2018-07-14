;(function() {
  function wrap(game, utils, minimaxAI,  minimaxPrune, cards, randomAi) {
    describe('minimax-ai', function() {
      describe('recursiveBestMove', function() {
        var obviousGameData = {
          "board": [
            [
              { "color": "WHITE", "type": "STUDENT" },
              null,
              null,
              null,
              { "color": "BLACK", "type": "STUDENT" }
            ],
            [
              {
                "color": "WHITE", "type": "STUDENT" },
              null,
              null,
              null,
              { "color": "BLACK", "type": "STUDENT" }
            ],
            [
              null,
              null,
              null,
              { "color": "WHITE", "type": "MASTER" },
              { "color": "BLACK", "type": "MASTER" }
            ],
            [
              { "color": "WHITE", "type": "STUDENT" },
              null,
              null,
              null,
              { "color": "BLACK", "type": "STUDENT" }
            ],
            [
              { "color": "WHITE", "type": "STUDENT" },
              null,
              null,
              null,
              { "color": "BLACK", "type": "STUDENT" }
            ]
          ],
          "deck": [
            {
              "name": "Eel",
              "moves": [ [ -1, 1 ], [ -1, -1 ], [ 0, 1 ] ],
              "hand": "WHITE0",
              "group": "Arcane Wonders",
              "type": "SIMPLE"
            },
            {
              "name": "Rooster",
              "moves": [ [ -1, -1 ], [ -1, 0 ], [ 1, 0 ], [ 1, 1 ] ],
              "hand": "WHITE1",
              "group": "Arcane Wonders",
              "type": "SIMPLE"
            },
            {
              "name": "Rabbit",
              "moves": [ [ -1, -1 ], [ 1, 1 ], [ 2, 0 ] ],
              "hand": "BLACK0",
              "group": "Arcane Wonders",
              "type": "SIMPLE"
            },
            {
              "name": "Crab",
              "moves": [ [ 2, 0 ], [ -2, 0 ], [ 0, 1 ] ],
              "hand": "BLACK1",
              "group": "Arcane Wonders",
              "type": "SIMPLE"
            },
            {
              "name": "Ox",
              "moves": [ [ 0, 1 ], [ 0, -1 ], [ 1, 0 ] ],
              "hand": "TRANSFER",
              "group": "Arcane Wonders",
              "type": "SIMPLE"
            }
          ],
          "currentTurn": "WHITE",
          "started": true,
          "winner": null,
          "terminated": null
        };

        it('makes the super obvious move', function() {
          const gs = new game.GameState().loadState(obviousGameData),
            move = minimaxAI.recursiveBestMove(gs, 5),
            pruneMove = minimaxPrune.recursiveBestMove(gs, 5);
          expect(move.card.getId() === pruneMove.card.getId()).toBe(true);
          expect(utils.arrayEquals(move.sourceCell, pruneMove.sourceCell)).toBe(true);
          expect(utils.arrayEquals(move.targetCell, pruneMove.targetCell)).toBe(true);
        });

        it('same moves over random sample', function() {
          for(let i=0; i<10; i++){
            let gameState = new game.GameState().initialize(cards.deck);
            gameState.start();
            while(!gameState.terminated){
              let move = minimaxAI.recursiveBestMove(gameState, 3);
              let pruneMove = minimaxPrune.recursiveBestMove(gameState, 3);
              expect(move.card.getId() === pruneMove.card.getId()).toBe(true);
              expect(utils.arrayEquals(move.sourceCell, pruneMove.sourceCell)).toBe(true);
              expect(utils.arrayEquals(move.targetCell, pruneMove.targetCell)).toBe(true);
              let randomMove = randomAi.chooseMove(gameState);
              gameState.executeMove(randomMove.sourceCell, randomMove.targetCell, randomMove.card);
            }
          }
        });
      });
    });
  }

  define([
    'game',
    'utils',
    'minimax-ai',
    'minimax-prune',
    'cards',
    'random-ai'
    ], wrap);
})();
