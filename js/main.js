enchant();

let game, player, enemies, enemyInterval, bottles;
let gameActive = false, survivalTime = 0;

// Player
let Player = enchant.Class.create(enchant.Sprite, {
	initialize: function() {
		Sprite.call(this, 32, 32);
		this.image = game.assets['images/chara1.png'];
		this.frame = [0,0,1,1,0,0,2,2];
		this.x = game.width / 2 - this.width / 2;
		this.y = 240 - this.height / 2;
		
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
			if(game.input.space && game.frame % 5 == 0) {
				let bullet = new Bullet(this.x, this.y);
			}
		});
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
	initialize: function (x, y) {
		Sprite.call(this, 16, 16);
		this.image = game.assets['images/bullet.png'];
		this.frame = 54;
		
		let bulletX;
		if(player.scaleX == -1) {
			this.x = x - 16;
			this.direction = -1;
		}	
		if(player.scaleX == 1) {
			this.x = x + 32;
			this.direction = 1;
		}
		this.y = y + 8;
		this.moveSpeed = 10;
		
		this.addEventListener('enterframe', function () {
			this.x += this.moveSpeed * this.direction;
			
			if (this.x < 0 || this.x > game.width) {
				this.remove();
			}
			
			for (let i in enemies) {
				if(enemies[i].intersect(this)) {
					enemies[i].remove();
				}
			}
			
		});
		game.rootScene.addChild(this);
	},
	remove: function () {
			game.rootScene.removeChild(this);
			delete this;
	}
});

// SpeedBottle 
let SpeedBottle = enchant.Class.create(enchant.Sprite, {
	initialize: function (x, y) {
		Sprite.call(this, 16, 16);
		this.image = game.assets['images/bullet.png'];
		this.frame = 12;
		this.x = x;
		this.y = y;
		
		game.rootScene.addChild(this);
	}
});

window.onload = function() {
	game = new Game(480, 320);
	game.preload('images/chara1.png', 'images/bullet.png');
	game.keybind(32, "space");
	game.fps = 30;
	
	game.onload = function() {
		bottles = [];
		let bottleX, bottleY;
		game.rootScene.addEventListener('enterframe', function() {
			if (survivalTime != 0 && survivalTime % 450 == 0) {
				bottleX = Math.floor(Math.random() * (game.width - 16));
				bottleY = Math.floor(Math.random() * (game.height - 16));
				bottle = new SpeedBottle(bottleX, bottleY);
				bottles.push(bottle);
			}
		});
		
		player = new Player();
		game.rootScene.addChild(player);
		
		enemies = [];
		let generateEnemyTime = 3000;
		// 10秒までは 3s、10-20秒の間は 2s、20秒以上は 1sごとにEnemyを作る
		game.rootScene.addEventListener('enterframe', function() {
			
			if (survivalTime > 5 && !gameActive) {	// 始め
				enemyInterval = setInterval(createEnemy, generateEnemyTime);
				gameActive = true;
			}
			if (survivalTime % 300 == 0 && generateEnemyTime > 1000) {
				generateEnemyTime -= 1000;
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
			survivalTime++;
			milliSeconds++;
			
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
	let margin = 60;
	let x, y;
	if (Math.random() < 0.5) {	// 上下、左右を決めるため
			// 左右からでる
			x = Math.random() < 0.5 ? -margin : game.width + margin;
			y = Math.floor(Math.random() * (game.height + 2 * margin) - margin);
	} else {
			// 上下からでる
			x = Math.floor(Math.random() * (game.width + 2 * margin) - margin);
			y = Math.random() < 0.5 ? -margin : game.height + margin;
	}
	var enemy = new Enemy(x, y);
	game.rootScene.addChild(enemy);
	enemies.push(enemy);
}