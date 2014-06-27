
Boulderdash.Game = function (game) {

    this.grid;

};

Boulderdash.Game.prototype = {

	create: function () {
        this.lastUpdated = 0;
        this.cursors = this.input.keyboard.createCursorKeys();
        this.restart_key = this.input.keyboard.addKey(Phaser.Keyboard.R);
        this.quit_key = this.input.keyboard.addKey(Phaser.Keyboard.Q);


        this.grid = [];
        this.gridSize = 10;
        for (var i=0; i < this.gridSize; i++) {
            this.grid.push([]);
            for (var j=0; j < this.gridSize; j++) {
                this.grid[i].push({holds: null});
            }
        }

        this.rocks = []; // Array of 1D rock
        this.numRocks = 50;
        var tmp = [];
        for (var i=0; i < this.gridSize*this.gridSize; i++) {
            tmp.push(i);
        }
        tmp = shuffle(tmp);
        for (var i=0; i < this.numRocks; i++) {
            var rock = tmp.pop();
            this.rocks.push(rock);
        }
        this.gameWon = false;
        console.assert(this.rocks.length == this.numRocks);

        this.ground = this.add.tileSprite(0, 0, 320, 320, 'ground');
        this.ground.scale.setTo(2, 2);

        for (var i=0; i < this.gridSize; i++) {
            var tmpSprite = this.add.sprite(2*32*9, 2*32*i, 'goal');
            tmpSprite.scale.setTo(2, 2);
        }

        for (var i=0; i < this.numRocks; i++) {
            var rockX = this.rocks[i]%this.gridSize;
            var rockY = Math.floor(this.rocks[i]/this.gridSize);
            this.grid[rockX][rockY] = this.add.sprite(rockX*2*32, rockY*2*32, 'rock');
            this.grid[rockX][rockY].holds = 'rock'
            this.grid[rockX][rockY].scale.setTo(2, 2);
        }

        var start = tmp.pop();
        var startX = start%this.gridSize;
        var startY = Math.floor(start/this.gridSize);

        this.player = this.add.sprite(startX*2*32, startY*2*32, 'player');  
        this.player.scale.setTo(2, 2);   

        this.playerGroup = this.add.group();

        this.playerLeft = this.playerGroup.create(startX*2*32, startY*2*32, 'playerLeft');
        this.playerRight = this.playerGroup.create(startX*2*32, startY*2*32, 'playerRight');
        this.playerUp = this.playerGroup.create(startX*2*32, startY*2*32, 'playerUp');
        this.playerDown = this.playerGroup.create(startX*2*32, startY*2*32, 'playerDown');

        this.playerGroup.setAll('visible', false);   
        this.playerGroup.setAll('scale.x', 2);
        this.playerGroup.setAll('scale.y', 2);

        // Fisher-Yates Shuffle
        // http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
        function shuffle(array) {
            var counter = array.length, temp, index;

            // While there are elements in the array
            while (counter > 0) {
                // Pick a random index
                index = Math.floor(Math.random() * counter);

                // Decrease counter by 1
                counter--;

                // And swap the last element with it
                temp = array[counter];
                array[counter] = array[index];
                array[index] = temp;
            }

            return array;
        }
	},

	update: function () {
        if (this.restart_key.isDown) {
            this.restartGame();
        }
        if (this.quit_key.isDown) {
            this.quitGame();
        }
        var gridX, gridY;
        if (++this.lastUpdated > 6) {
            this.lastUpdated = 0;
        }
        if (this.lastUpdated%20 == 0) {
            if (this.cursors.left.isDown) {
                this.playerLeft.visible = true;
                //if (this.grid[pixToGrid(this.player.x)-1][pixToGrid(this.player.y)] == null) {
                gridX = pixToGrid(this.player.x)-1;   
                gridY = pixToGrid(this.player.y);
                if (this.grid[gridX] !== undefined) {
                    if (this.grid[gridX][gridY].holds === null) {
                        this.player.x -= 64;
                        this.playerGroup.setAll('x', this.player.x);
                    }
                    else if (this.grid[gridX][gridY].holds === 'rock') {
                        if (this.grid[gridX-1] !== undefined) {
                            if (this.grid[gridX-1][gridY].holds === null) {
                                // Move rock
                                this.grid[gridX][gridY].x -= 2*32;
                                this.grid[gridX-1][gridY] = this.grid[gridX][gridY];
                                this.grid[gridX][gridY] = {holds: null};
                                // Move player
                                this.player.x -= 2*32;         
                                this.playerGroup.setAll('x', this.player.x);  
                            }            
                        }
                    }
                }
            }
            else if (this.cursors.right.isDown) {
                this.playerRight.visible = true;        
                gridX = pixToGrid(this.player.x)+1;   
                gridY = pixToGrid(this.player.y);
                if (this.grid[gridX] !== undefined) {
                    if (this.grid[gridX][gridY].holds === null) {
                        this.player.x += 64;
                        this.playerGroup.setAll('x', this.player.x);
                    }
                    else if (this.grid[gridX][gridY].holds === 'rock') {
                        if (this.grid[gridX+1] !== undefined) {
                            if (this.grid[gridX+1][gridY].holds === null) {
                                // Move rock
                                this.grid[gridX][gridY].x += 2*32;
                                this.grid[gridX+1][gridY] = this.grid[gridX][gridY];
                                this.grid[gridX][gridY] = {holds: null};
                                // Move player
                                this.player.x += 2*32;         
                                this.playerGroup.setAll('x', this.player.x);  
                            }            
                        }
                    }
                }
            }
            else if (this.cursors.up.isDown) {
                this.playerUp.visible = true;
                gridX = pixToGrid(this.player.x);   
                gridY = pixToGrid(this.player.y)-1;
                if (this.grid[gridX][gridY] !== undefined) {
                    if (this.grid[gridX][gridY].holds === null) {
                        this.player.y -= 64;
                        this.playerGroup.setAll('y', this.player.y);
                    }
                    else if (this.grid[gridX][gridY].holds === 'rock') {
                        if (this.grid[gridX][gridY-1] !== undefined) {
                            if (this.grid[gridX][gridY-1].holds === null) {
                                // Move rock
                                this.grid[gridX][gridY].y -= 2*32;
                                this.grid[gridX][gridY-1] = this.grid[gridX][gridY];
                                this.grid[gridX][gridY] = {holds: null};
                                // Move player
                                this.player.y -= 2*32;         
                                this.playerGroup.setAll('y', this.player.y);  
                            }
                        }
                    }
                }
            }
            else if (this.cursors.down.isDown) {
                this.playerDown.visible = true;
                gridX = pixToGrid(this.player.x);   
                gridY = pixToGrid(this.player.y)+1;
                if (this.grid[gridX][gridY] !== undefined) {
                    if (this.grid[gridX][gridY].holds === null) {
                        this.player.y += 64;
                        this.playerGroup.setAll('y', this.player.y);
                    }
                    else if (this.grid[gridX][gridY].holds === 'rock') {
                        if (this.grid[gridX][gridY+1] !== undefined) {
                            if (this.grid[gridX][gridY+1].holds === null) {
                                // Move rock
                                this.grid[gridX][gridY].y += 2*32;
                                this.grid[gridX][gridY+1] = this.grid[gridX][gridY];
                                this.grid[gridX][gridY] = {holds: null};
                                // Move player
                                this.player.y += 2*32;         
                                this.playerGroup.setAll('y', this.player.y);  
                            }
                        }
                    }
                }
            }
            else {
                this.playerGroup.setAll('visible', false);
            }
        }

        // Win condition
        if (pixToGrid(this.player.x) == 9) {
            this.state.start('Game');
        }
    
        function wallLength(x, y) {

        }

        function pixToGrid(x) {
            return (x / (32*2))%10;
        }
	},

	quitGame: function () {

		this.state.start('MainMenu');
	},

    restartGame: function() {
        this.state.start('Game');
    }

};
