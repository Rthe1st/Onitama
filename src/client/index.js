;(function() {
  requirejs.config({
    paths: {
      'socket.io': '/socket.io/socket.io'
    }
  });

  requirejs([
    'socket.io',
    'd3',
    'game',
    'perspective',
    'cards',
    'logger',
    'chat',
    'utils',
    'colors'
  ], function(io, d3, game, Perspective, cards, Logger, Chat, utils, {WHITE, BLACK}) {
    const socket = io.connect('/sockets/game'),
      logger = new Logger(document.getElementById('log-lines')),
      chat = new Chat(document.getElementById('chat-box'), socket, logger);
    var roleRequested = false,
      gameState = null;

    socket.on('->assignRole', function(msg) {
      gameState = new game.GameState().loadState(msg.gameState);

      const svg = document.getElementById('game-board'),
        perspective = new Perspective(gameState, msg.color, svg, socket, logger);

      logger.setPerspective(perspective);
      logger.info(`Joined game as ${ utils.niceName(msg.color) }.`);

      d3.select('.landing-screen').style('display', 'none');
      d3.select('.game-container').style('display', 'flex');
    });

    socket.on('participantDisconnected', function(msg) {
      if (msg.color === WHITE) {
        console.info('White has abandoned the game.');
      } else if (msg.color === BLACK) {
        console.info('Black has abandoned the game.');
      } else {
        console.info('An observer has stopped watching the game.');
      }
    });

    socket.on('roleAssigned', function(msg) {
      logger.info(`${ utils.niceName(msg.color) } has joined the game.`);
    });

    socket.on('gameStarted', function(msg) {
      logger.info('Both players are present, the game begins.');
      gameState.start();
    });

    socket.on('moveAccepted', function(msg) {
      console.info('Last move was accepted by the server.');
    });

    socket.on('moveMade', function(msg) {
      const card = gameState.localizeCard(msg.card),
        color = gameState.getCellContents(...msg.initialPosition).getColor();

      logger.logMove(`The ${ utils.niceName(color) } player moved from ${ utils.niceCoords(msg.initialPosition) } to ${ utils.niceCoords(msg.targetPosition) } by playing the ${ card.name } card.`, msg);

      gameState.executeMove(
        msg.initialPosition,
        msg.targetPosition,
        card);
    });

    socket.on('gameTerminated', function(msg) {
      gameState.terminate();
      logger.info(`Game concluded because ${ msg.reason }`);
    });

    socket.on('disconnect', function(msg) {
      logger.info('Disconnected...');
    });

    socket.on('applicationError', function(msg) {
      logger.error('Application error!' + msg);
    });

    d3.select('#name-form').on('submit', function() {
      d3.event.preventDefault();

      if (roleRequested) {
        return;
      }

      logger.info('Joining game...');
      socket.emit('requestRole', {
        gameSessionId: window.onifig.gameSessionId,
        name: d3.select('#name').node().value
      });

      roleRequested = true;
    });
  });

})();
