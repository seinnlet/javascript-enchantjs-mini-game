enchant();

let game, player, enemies;
let survivalTime = 0, gameActive = false, enemyInterval;

// Player
let Player = enchant.Class.create(enchant.Sprite, {
	initialize: function() {
		Sprite.call(this, 32, 32);
		this.image = game.assets['images/chara1.png'];
		this.frame = [0,0,1,1,0,0,2,2];
		this.x = game.width / 2 - this.width / 2;
		this.y = 240 - this.height / 2;
		this.bullets = [];
		
		this.addEventListener('enterframe', function() {
			if(game.input.left && this.x > 0) {
				this.x -= 2;
				this.scaleX = -1;
				this.bullets = [];
			}
			if(game.input.right && this.x < (game.width-player.width)) {
				this.x += 2;
				this.scaleX = 1;
			}
			if(game.input.up && this.y > 0) {
				this.y -= 2;
			}
			if(game.input.down && this.y < (game.height-player.height)) {
				this.y += 2;
			}
			
			if(game.input.space) {
				this.shootBullet();
			}
		});
	},
	shootBullet: function() {
		let bulletX;
		if(this.scaleX == -1) {
			bulletX = this.x - 16;
		}	
		if(this.scaleX == 1) {
			bulletX = this.x + 32;
		}
		let bullet = new Bullet(bulletX, this.y + 8);
		game.rootScene.addChild(bullet);
		this.bullets.push(bullet);
	}
});

// Enemy
let Enemy = enchant.Class.create(enchant.Sprite, {
	initialize: function (x, y) {
		Sprite.call(this, 32, 32);
		this.image = game.assets['images/chara1.png'];
		this.frame = [5,5,6,6,5,5,7,7];
		this.x = x;
		this.y = y;
		
		this.addEventListener('enterframe', function() {
			
			let speed = 2;
			var angle = Math.atan2(player.y - this.y, player.x - this.x);
			this.x += speed * Math.cos(angle);
			this.y += speed * Math.sin(angle);
			if(this.x < player.x) {
				this.scaleX = 1;
			}
			if(this.x > player.x) {
				this.scaleX = -1;
			}
			
			if(player.within(this, 8)) {
				game.end();
				clearInterval(enemyInterval);
			}
		});
	}, 
	remove: function() {
		game.rootScene.removeChild(this);
		delete enemies[this.key];
	}
});

// Bullet
let Bullet = enchant.Class.create(enchant.Sprite, {
	initialize: function(x, y) {
		Sprite.call(this, 16, 16);
		this.image = game.assets['images/bullet.png'];
		this.frame = 54;
		this.x = x;
		this.y = y;
		
		this.addEventListener('enterframe', function () {
			// this.move();
			console.log(player.bullets)
			if (this.x < 0 || this.x > game.width) {
				this.remove();
				player.bullets.splice(player.bullets.indexOf(this), 1);
			}
			
			for (var i in enemies) {
				if(enemies[i].intersect(this)) {
					this.remove();
					enemies[i].remove();
					player.bullets.splice(player.bullets.indexOf(this), 1);
				}
			}
		});
	},
//	move: function() {
//		this.x += 40 * player.scaleX;
//	},
	remove: function() {
		game.rootScene.removeChild(this);
		delete this;
	}
});

window.onload = function() {
	game = new Game(480, 320);
	game.preload('images/chara1.png', 'images/bullet.png');
	game.keybind(32, "space");
	
	game.onload = function() {
		player = new Player();
		game.rootScene.addChild(player);
		
		enemies = [];
		
		player.addEventListener('enterframe', function() {
			if (game.input.left || game.input.right || game.input.up || game.input.down || game.input.space) {
				if (!gameActive) {
					enemyInterval = setInterval(function() {
							var enemy = new Enemy(Math.random() * 480, Math.random() * 320);
							game.rootScene.addChild(enemy);
							enemies.push(enemy);
						}, 3000);
					gameActive = true;
				}
			}
		});
		
		let timeLabel = new Label('Survival Time: 00 : 00');
		timeLabel.x = 10;
		timeLabel.y = 10;
		timeLabel.color = '#fff';
		timeLabel.addEventListener('enterframe', function(){
			survivalTime++;
			
			// minutes and seconds 
			let minutes = Math.floor(survivalTime / 60);
			let seconds = survivalTime % 60;
			
			this.text = `Survival Time: ${minutes < 10 ? '0'+minutes : minutes} : ${seconds < 10 ? '0'+seconds : seconds}`;
		});
		game.rootScene.addChild(timeLabel);
	};
	
	game.start();
};