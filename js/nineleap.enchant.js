enchant.nineleap = { assets: ['images/start.png', 'images/end.png'] };
enchant.nineleap.Game = enchant.Class.create(enchant.Game, {
    initialize: function(width, height) {
        enchant.Game.call(this, width, height);
        this.addEventListener('load', function() {
            var game = this;
            this.startScene = new SplashScene();
            this.startScene.image = this.assets['images/start.png'];
						this.startScene.label = 'Press any Key to Start...';
            this.startScene.addEventListener('touchend', function() {
                if (game.currentScene == this) game.popScene();
            });
            this.addEventListener('keydown', function() {
                if (this.currentScene == this.startScene) this.popScene();
                this.removeEventListener('keydown', arguments.callee);
            });
            this.pushScene(this.startScene);

            this.endScene = new SplashScene();
            this.endScene.image = this.assets['images/end.png'];
        });
    },
    end: function(score, result) {
        this.pushScene(this.endScene);
        if (location.hostname == 'r.jsgames.jp') {
            var submit = function() {
                var id = location.pathname.match(/^\/games\/(\d+)/)[1]; 
                location.replace([
                    'http://9leap.net/games/', id, '/result',
                    '?score=', encodeURIComponent(score),
                    '&result=', encodeURIComponent(result)
                ].join(''));
            }
            this.endScene.addEventListener('touchend', submit);
            window.setTimeout(submit, 3000);
        }
        this.end = function() {};
    }
});

enchant.nineleap.SplashScene = enchant.Class.create(enchant.Scene, {
    image: {
        get: function() {
            return this._image;
        },
        set: function(image) {
            this._image = image;

            while (this.firstChild) {
                this.removeChild(this.firstChild);
            }
            var sprite = new Sprite(image.width, image.height);
            sprite.image = image;
            sprite.x = (this.width - image.width) / 2;
            sprite.y = (this.height - image.height) / 2;
            this.addChild(sprite);
        }
    }, 
		label: {
			get: function() {
            return this._label;
        },
        set: function(label) {
            this._label = label;

						let introLabel = new Label(label);
						introLabel.x = (this.width - introLabel.width) / 2;
						introLabel.y = (this.height - introLabel.height - 150) / 2;
						console.log(introLabel.x)
						console.log(introLabel.y)
						introLabel.color = '#fff';
						introLabel.textAlign = 'center';
						introLabel.font = "18px 'Source Code Pro'";
						this.addChild(introLabel);
        }
	}
});
