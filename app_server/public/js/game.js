
/* global game */
var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render })

function preload () {
  game.load.image('sky', 'assets/sky.png')
  game.load.spritesheet('dude', 'assets/dude.png', 32, 48)
  game.load.spritesheet('enemy', 'assets/dude.png', 32, 48)

  game.load.tilemap('mundo', 'assets/tiles.json', null, Phaser.Tilemap.TILED_JSON);
  game.load.image('tiles', 'assets/Tile.png');

}


var socket // Socket connection
var land
var player
var enemies
var currentSpeed = 0
var dir
var cursors
var map;
var layer;
var localPoints = 0

function create () {
  socket = io.connect()
  // Resize our game world to be a 2000 x 2000 square
  //game.world.setBounds(-500, -500, 1000, 1000)
  // Our tiled scrolling background
  game.stage.backgroundColor = '#93a9ea';
  map= game.add.tilemap('mundo')
  map.addTilesetImage('Tile', 'tiles')

  layer = map.createLayer('layer1');
  console.log("MAP", map);
  //map.setCollisionBetween(1, 100000, true, 'blockLayer');
  layer.resizeWorld();
  console.log('WORLD SIZE: ', layer.width, ' * ', layer.height);
  map.setCollisionBetween(1, 200, true, 'layer1');

  //layer.resizeWorld();

  // The base of our player
  var startX = Math.floor((Math.random() * 1100) + 100);
  var startY = 500
  dir = 'right'

  game.stage.disableVisibilityChange = true;

  console.log('STARTING POSITION: ', startX, ' , ', startY);
  player = game.add.sprite(startX, startY, 'dude')
  player.anchor.setTo(0.5, 0.5)
  player.animations.add('move', [5, 6, 7, 8], 8, true)
  player.animations.add('stop', [4], 8, true)

  // This will force it to decelerate and limit its speed
  // player.body.drag.setTo(200, 200)
  game.physics.enable(player, Phaser.Physics.ARCADE);
  player.body.maxVelocity.setTo(400, 400)
  player.body.collideWorldBounds = true

  player.body.gravity.y =400
  player.body.bounce.y = 1;

  // Create some baddies to waste :)
  enemies = []

  player.bringToTop()


  game.camera.follow(player)
  game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300)
  game.camera.focusOnXY(0, 0)

  cursors = game.input.keyboard.createCursorKeys()

  // Start listening for events
  setEventHandlers()
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

  game.physics.arcade.collide(player, layer)



  for (var i = 0; i < enemies.length; i++) {
    if (enemies[i].alive) {
      enemies[i].update()
      game.physics.arcade.collide(player, enemies[i].player, killPlayer, null, null)
    }
  }
  player.body.velocity.x = 0;

    if (cursors.left.isDown)
    {
        //  Move to the left
        player.body.velocity.x = -150;

        player.animations.play('move');

        if (dir=='right'){
          player.scale.x *= -1
          dir='left'
        }
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        player.body.velocity.x = 150;

        player.animations.play('move');
        if (dir=='left'){
          player.scale.x *= -1
          dir='right'
        }
    }
    else
    {
        //  Stand still
        player.animations.stop();
        player.frame = 4;
    }
    /*
    if (cursors.up.isDown) {
      console.log('CURSOR UP IS DOWN!!');
    }
    */

    //  Allow the player to jump if they are touching the ground.
    if (cursors.up.isDown && player.body.onFloor())
    {
        console.log("CURSOR UP IS DOWN AND PLAYER TOUCHING DOWN!!");
        player.body.velocity.y = -500;
        console.log(player.body.velocity.y);
    }

  //sky.tilePosition.x = -game.camera.x
  //sky.tilePosition.y = -game.camera.y

  socket.emit('move player', { x: player.x, y: player.y, angle: player.angle })
}

function render () {

}
function killPlayer(playerCollided, enemyCollided){
  //console.log('PLAYER COLLIDED', playerCollided);
  //console.log('ENEMY COLLIDED', enemyCollided);
  if (playerCollided.body.touching.down) {
    localPoints ++;
    console.log('POINTS', localPoints);
    playerCollided.body.velocity.y = -600
    playerCollided.body.velocity.x = Math.floor((Math.random() * (-500)) + 500);
  }else if (playerCollided.body.touching.up) {
    player.x = Math.floor((Math.random() * 1100) + 100);
    player.y = 500
  }
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
