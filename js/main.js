enchant();

let game, player, enemies;
let gameActive = false, enemyInterval, survivalTime = 0;

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
			this.move();
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
	move: function() {
		this.x += 30 * player.scaleX;
	},
	remove: function() {
		game.rootScene.removeChild(this);
		delete this;
	}
});

window.onload = function() {
	game = new Game(480, 320);
	game.preload('images/chara1.png', 'images/bullet.png');
	game.keybind(32, "space");
	game.fps = 30;
	
	game.onload = function() {
		player = new Player();
		game.rootScene.addChild(player);
		
		enemies = [];
		
		let generateEnemyTime = 3000;
		
		this.addEventListener('keydown', function() {
			if (!gameActive) {
				enemyInterval = setInterval(createEnemy, generateEnemyTime);
				gameActive = true;
			}
		});
		
		// 10秒までは 3s、10-20秒の間は 2s、20秒以上は 1sごとにEnemyを作る
		game.rootScene.addEventListener('enterframe', function() {
			if (survivalTime % 300 == 0 && generateEnemyTime >= 1000) {
				generateEnemyTime -= 1000;
				console.log(generateEnemyTime);
				clearInterval(enemyInterval);
				enemyInterval = setInterval(createEnemy, generateEnemyTime);
			}
		});
		
		let timeLabel = new Label('Survival Time: 00 : 00');
		let milliSeconds = 0, seconds = 0, minutes = 0;
		timeLabel.x = 10;
		timeLabel.y = 10;
		timeLabel.color = '#fff';
		timeLabel.addEventListener('enterframe', function(){
			if (gameActive) {
				survivalTime++;
				milliSeconds++;
			}
			// minutes and seconds 
			if (milliSeconds > game.fps) {
				seconds++;
				milliSeconds = 0;
			}
			if (seconds > 60) {
				minutes++;
				milliSeconds = 0;
				seconds = 0;
			}
			
			this.text = `Survival Time: ${minutes < 10 ? '0'+minutes : minutes} : ${seconds < 10 ? '0'+seconds : seconds}`;
		});
		game.rootScene.addChild(timeLabel);
	};
	
	game.debug();
};

function createEnemy() {
	var enemy = new Enemy(Math.random() * 480, Math.random() * 320);
	game.rootScene.addChild(enemy);
	enemies.push(enemy);
}