var RemotePlayer = function (index, game, player, startX, startY) {
  var x = startX
  var y = startY

  this.game = game
  this.player = player

  this.player = game.add.sprite(x, y, 'PJIdle')
  this.player.animations.add('idle', [0, 1, 2, 3], 8, true)
  this.player.anchor.setTo(0.5, 0.5)

  this.player.name = index.toString()

  game.physics.enable(this.player, Phaser.Physics.ARCADE)
  game.physics.arcade.enable(this.player);



  this.lastPosition = { x: x, y: y}
}

RemotePlayer.prototype.update = function () {
  if (this.player.x !== this.lastPosition.x || this.player.y !== this.lastPosition.y) {
    this.player.play('idle')
    console.log('playing idle remote');
  } else {
    this.player.play('idle')
    console.log('playing idle remote');
  }

  this.lastPosition.x = this.player.x
  this.lastPosition.y = this.player.y
}
