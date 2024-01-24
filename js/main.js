enchant();

let game, player, enemies;

// Player
let Player = enchant.Class.create(enchant.Sprite, {
	initialize: function() {
		Sprite.call(this, 32, 32);
		this.image = game.assets['image/chara1.png'];
		this.frame = [0,0,1,1,0,0,2,2];
		this.x = game.width / 2 - this.width / 2;
		this.y = game.height / 2 - this.height / 2;
		
		this.addEventListener('enterframe', function() {
			if(game.input.left && this.x > 0) {
				this.x -= 2;
				this.scaleX = -1;
			}
			if(game.input.right && this.x < 288) {
				this.x += 2;
				this.scaleX = 1;
			}
			if(game.input.up && this.y > 0) {
				this.y -= 2;
			}
			if(game.input.down && this.y < 288) {
				this.y += 2;
			}
		});
		
	}
});

// Enemy
let Enemy = enchant.Class.create(enchant.Sprite, {
	initialize: function (x, y) {
		Sprite.call(this, 32, 32);
		this.image = game.assets['image/chara1.png'];
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
		});
	}
});

window.onload = function() {
	game = new Game(320, 320);
	game.preload('image/chara1.png', 'image/bullet.png');
	
	game.onload = function() {
		player = new Player();
		game.rootScene.addChild(player);
		
		enemies = [];
		setInterval(function () {
			var enemy = new Enemy(Math.random() * 320, Math.random() * 320);
			game.rootScene.addChild(enemy);
			enemies.push(enemy);
		}, 3000);
		
	};
	
	game.start();
};

