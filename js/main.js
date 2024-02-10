enchant();

let game, player, enemies, bottles;
let survivalTime = 0, gameScore = 0, bottleTime = 0;

// Player Class
let Player = enchant.Class.create(enchant.Sprite, {
	initialize: function() {
		Sprite.call(this, 32, 32);
		this.image = game.assets['images/chara1.png'];
		this.frame = [0,0,1,1,0,0,2,2];
		this.x = game.width / 2 - this.width / 2;
		this.y = 240 - this.height / 2;
		let playerSpeed = 2, bulletFrame = 8;
		
		this.addEventListener('enterframe', function() {
			
			if (bottleTime == 0) {
				playerSpeed = 2;
				bulletFrame = 8;
			}
			if (bottleTime == 300) {
				playerSpeed *= 2;
				bulletFrame /= 2;
			}
			if (bottleTime <= 300 && bottleTime > 0) {
				bottleTime--;
			}
			
			if(game.input.left && this.x > 0) {
				this.x -= playerSpeed;
				this.scaleX = -1;
			}
			if(game.input.right && this.x < (game.width - player.width)) {
				this.x += playerSpeed;
				this.scaleX = 1;
			}
			if(game.input.up && this.y > 0) {
				this.y -= playerSpeed;
			}
			if(game.input.down && this.y < (game.height - player.height)) {
				this.y += playerSpeed;
			}
			if(game.input.space && game.frame % bulletFrame == 0) {
				let bullet = new Bullet(this.x, this.y);
			}
			
			for (let i in bottles) {
				if(bottles[i].intersect(this)) {
					bottles[i].remove();
					bottleTime = 300;
				}
			}
		});
		game.rootScene.addChild(this);
	}
});

// Enemy Class
let Enemy = enchant.Class.create(enchant.Sprite, {
	initialize: function (x, y) {
		Sprite.call(this, 32, 32);
		this.image = game.assets['images/chara1.png'];
		this.frame = [5,5,6,6,5,5,7,7];
		this.x = x;
		this.y = y;
		
		this.addEventListener('enterframe', function() {
			
			let speed = 2;
			let angle = Math.atan2(player.y - this.y, player.x - this.x);
			this.x += speed * Math.cos(angle);
			this.y += speed * Math.sin(angle);
			if(this.x < player.x) {
				this.scaleX = 1;
			}
			if(this.x > player.x) {
				this.scaleX = -1;
			}
			
			if(player.within(this, 15)) {
				player.frame = 3;
				game.end();
			}
			
		});
		game.rootScene.addChild(this);
	}, 
	remove: function() {
		game.rootScene.removeChild(this);
		delete enemies[this.key];
	}
});

// Bullet Class
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
					this.remove();
					gameScore += 10;
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

// Item Class 
let Item = enchant.Class.create(enchant.Sprite, {
	initialize: function (x, y, frame) {
		Sprite.call(this, 16, 16);
		this.image = game.assets['images/bullet.png'];
		this.frame = frame;
		this.x = x;
		this.y = y;
		
		this.addEventListener('enterframe', function () {
			if (this.frame == 30 && this.intersect(player)) {
				this.remove();
				gameScore += 100;
			}
		});
		game.rootScene.addChild(this);
	}, 
	remove: function() {
		game.rootScene.removeChild(this);
		if (this.frame == 12) bottles.pop(this);
		if (this.frame == 30) delete this;
	}
});

window.onload = function() {
	game = new Game(600, 320);
	game.preload('images/chara1.png', 'images/bullet.png');
	game.keybind(32, "space");
	game.fps = 30;
	
	game.onload = function() {
		player = new Player();
		
		bottles = [];
		enemies = new Array();
		let generateEnemyTime = 90; // 最初は3sごとにEnemyが出てくる
		
		game.rootScene.addEventListener('enterframe', function() {
			
			// スピードアップボトルは15sごとに出てくる、Sceneで1個のみ
			if (survivalTime != 0 && survivalTime % 450 == 0 && bottles.length < 1) {
				let bottle = new Item(randomNumber(game.width - 16), randomNumber(game.height - 16), 12);
				bottles.push(bottle);
			}
			
			// Coin 20sごとに出てくる、100ポイントもらえる
			if (survivalTime != 0 && survivalTime % 600 == 0) {
				let coin = new Item(randomNumber(game.width - 16), randomNumber(game.height - 16), 30);
			}
			
			// Enemy出てくるのを早くする
			if (survivalTime % 150 == 0 && generateEnemyTime > 15) {
				generateEnemyTime -= 15;
			}
			if (survivalTime != 0 && survivalTime % generateEnemyTime == 0) {
				createEnemy();
			}
		});
		
		let labels = new Label();
		let seconds = 0, minutes = 0;
		labels.x = 10;
		labels.y = 10;
		labels.color = '#fff';
		labels.font = "18px 'Source Code Pro'";
		labels.addEventListener('enterframe', function(){
			survivalTime++;
			
			// minutes and seconds 
			minutes = Math.floor(survivalTime / (game.fps * 60));
			seconds = Math.floor((survivalTime / game.fps) % 60);
			
			this.text = `Survival Time: ${minutes < 10 ? '0'+minutes : minutes} : ${seconds < 10 ? '0'+seconds 
			: seconds}<br>Score: ${gameScore}<br>`;
			
			if (bottleTime > 0) {
				this.text += `Speed Up: ${Math.round((bottleTime / game.fps) % 60)}s`;
			}
		});
		game.rootScene.addChild(labels);
	};
	
	game.start();
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
	let enemy = new Enemy(x, y);
	enemy.key = game.frame;
	enemies[game.frame] = enemy;
}

function randomNumber(limits) {
	return Math.floor(Math.random() * (limits));
}