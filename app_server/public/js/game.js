/*Global Game Controller using phaser */

var game = new Phaser.Game(800, 600, Phaser.AUTO, '#game-panel', { preload: preload, create: create, update: update , render: render });

function preload() {
  game.load.spritesheet('PJIdle', 'assets/PJIdle.png', 80, 157)
  //game.load.spritesheet('PJJumping', 'assets/PJJumping.png', 107, 161)
  //game.load.spritesheet('PJRunning', 'assets/PJRunning.png', 104, 156)
  game.load.image('sky', 'assets/Sky.png')
  //game.load.image('tile', 'assets/Tile.png')
}

var socket

var player

var enemies

var sky

var platforms;

var cursors


function create() {
  socket = io.connect()
  //Characteristics of the world
  game.world.setBounds(-500, -500, 1000, 1000)
  game.physics.startSystem(Phaser.Physics.ARCADE);

  sky = game.add.tileSprite(0, 0, 800, 600, 'sky')
  sky.fixedToCamera= true

  //PLAYER VARIABLES INITIALISATION
  var startX = Math.round(Math.random() * (1000) - 500)
  var startY = 0
  var dir = 'right'

  player = game.add.sprite(startX, startY, 'PJIdle')
  game.physics.arcade.enable(player);

  player.body.bounce.y = 0.2;
  player.body.gravity.y = 300;
  player.body.collideWorldBounds = true;

  game.camera.follow(player)
  game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300)
  game.camera.focusOnXY(0, 0)


  enemies = []
  setEventHandlers()
  //game.input.onDown.add(changeTexture, this);
  cursors = game.input.keyboard.createCursorKeys();
}

var setEventHandlers = function () {
  // Socket connection successful
  socket.on('connect', onSocketConnected)

  // Socket disconnection
  socket.on('disconnect', onSocketDisconnect)

  // New player message received
  socket.on('new player', onNewPlayer)

  // Player move message received
  socket.on('move player', onMovePlayer)

  // Player removed message received
  socket.on('remove player', onRemovePlayer)
}

// Socket connected
function onSocketConnected () {
  console.log('Connected to socket server')

  // Reset enemies on reconnect
  enemies.forEach(function (enemy) {
    enemy.player.kill()
  })
  enemies = []

  // Send local player data to the game server
  socket.emit('new player', { x: player.x, y: player.y})
}

// Socket disconnected
function onSocketDisconnect () {
  console.log('Disconnected from socket server')
}

// New player
function onNewPlayer (data) {
  console.log('New player connected:', data.id)

  // Avoid possible duplicate players
  var duplicate = playerById(data.id)
  if (duplicate) {
    console.log('Duplicate player!')
    return
  }

  // Add new player to the remote players array
  enemies.push(new RemotePlayer(data.id, game, player, data.x, data.y))

}

// Move player
function onMovePlayer (data) {
  var movePlayer = playerById(data.id)
  console.log('On move player:', movePlayer);
  // Player not found
  if (!movePlayer) {
    console.log('Player not found: ', data.id)
    return
  }

  // Update player position
  movePlayer.player.x = data.x
  movePlayer.player.y = data.y
}

// Remove player
function onRemovePlayer (data) {
  var removePlayer = playerById(data.id)
  // Player not found
  if (!removePlayer) {
    console.log('Player not found: ', data.id)
    return
  }

  removePlayer.player.kill()

  // Remove player from array
  enemies.splice(enemies.indexOf(removePlayer), 1)
}

function update () {

  player.body.velocity.x = 0;

    if (cursors.left.isDown)
    {
        //  Move to the left
        player.body.velocity.x = -150;

    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        player.body.velocity.x = 150;

    }
    else
    {
        //  Stand still
        player.animations.stop();

        player.frame = 4;
    }

  socket.emit('move player', { x: player.x, y: player.y })
}

function render () {

}

// Find player by ID
function playerById (id) {
  for (var i = 0; i < enemies.length; i++) {
    if (enemies[i].player.name === id) {
      return enemies[i]
    }
  }

  return false
}
