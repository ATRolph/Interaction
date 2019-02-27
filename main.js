
// GameBoard code below
const gameEngine = new GameEngine();

function centerDistance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function edgeDistance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy) - a.radius - b.radius;
}

function Circle(game) {
    this.colors = ["Red", "Green"];
    // console.log(Math.random() * 25);
    this.color = Math.floor(Math.random() * 50 / 49); // 1 in 50 Chance to be sick.
    if (this.color === 1) {
        this.radius = 15;
    } else {
        this.radius = Math.random() * 10 + 5;
    }
    // this.radius = 10;
    this.area = Math.PI * Math.pow(this.radius, 2);
  
    this.closestPredator = null;
    this.closestPredatorDistance = 600;
    this.closestPrey = null;
    this.closestPreyDistance = 600;
    this.closestFood = null;
    this.closestFoodDistance = 600;
    this.velocity = { x: 0, y: 0 };
    this.speed = 50;
    Entity.call(this, game, this.radius + Math.random() * (600 - this.radius * 2),
        this.radius + Math.random() * (600 - this.radius * 2));
};

Circle.prototype = new Entity();
Circle.prototype.constructor = Circle;

Circle.prototype.eat = function (other) {
    return centerDistance(this, other) < this.radius - other.radius;
};

Circle.prototype.collideLeft = function () {
    // return (this.x - this.radius) < 0;
    return this.x < 0;
};

Circle.prototype.collideRight = function () {
    // return (this.x + this.radius) > 600;
    return this.x > 600;
};

Circle.prototype.collideTop = function () {
    // return (this.y - this.radius) < 0;
    return this.y < 0;
};

Circle.prototype.collideBottom = function () {
    // return (this.y + this.radius) > 600;
    return this.y > 600;
};

Circle.prototype.update = function () {
    Entity.prototype.update.call(this);
    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;
    this.closestPredator = null;
    this.closestPrey = null;
    this.closestFood = null;
    this.closestPreyDistance = 600;
    this.closestPredatorDistance = 600;
    this.closestFoodDistance = 600;
    if (this.collideLeft()) this.x = 0;
    if (this.collideRight()) this.x = 600;
    if (this.collideTop()) this.y = 0;
    if (this.collideBottom()) this.y = 600;
    for (var i = 0; i < this.game.entities.length; i++) {
        let ent = this.game.entities[i];
        if (this != ent && this.eat(ent)) {
            if (ent.color === 1 && ent instanceof Circle) {
                this.removeFromWorld = true;
                ent.removeFromWorld = true;
                // for (let i = 0; i < 1; i++) {
                //     let circle = new Circle(gameEngine);
                //     gameEngine.addEntity(circle);
                // }               
            } else if (this.area > ent.area) {
                if (ent.color === 1 && ent instanceof Food) {
                    this.area *= 20;
                    // ent.removeFromWorld = true;
                    // let food = new Food(gameEngine);
                    // gameEngine.addEntity(food);
                } else {
                    if (ent instanceof Circle) {
                        // let circle = new Circle(gameEngine);
                        // ent.removeFromWorld = true;
                        // gameEngine.addEntity(circle);
                    } else {
                        // let food = new Food(gameEngine);
                        // ent.removeFromWorld = true;
                        // gameEngine.addEntity(food);
                    }
                    this.area += ent.area;                   
                }
                this.radius = Math.sqrt(this.area / Math.PI);
                ent.removeFromWorld = true;
                // let scaledSpeed = this.speed * 10  / this.radius;
                // this.velocity.x = scaledSpeed * (this.velocity.x / this.speed);
                // this.velocity.y = scaledSpeed * (this.velocity.y / this.speed); 
                // this.speed = scaledSpeed;  
            }
        }
        if (ent instanceof Food) {
            if (ent.color === 1) {
                    this.closestFood = ent;
                    this.closestFoodDistance = 0;
            } else if (this.area <= 300) {
                if (edgeDistance(this, ent) < this.closestFoodDistance) {
                    this.closestFood = ent;
                    this.closestFoodDistance = edgeDistance(this, ent);
                }
            }
        }
        if (this.area - ent.area > 0 && ent instanceof Circle && this != ent) {
            if (edgeDistance(this, ent) < this.closestPreyDistance) {
                this.closestPrey = ent;
                this.closestPreyDistance = edgeDistance(this, ent);
            } else if (edgeDistance(this, ent) === this.closestPreyDistance) {
                if (this.closestPrey.area < ent.area) {
                    this.closestPrey = ent;
                    this.closestPreyDistance = edgeDistance(this, ent);
                }
            }
        }
        if (ent.area - this.area > 0 && ent instanceof Circle && this != ent) {
            if (edgeDistance(this, ent) < this.closestPredatorDistance) {
                this.closestPredator = ent;
                this.closestPredatorDistance = edgeDistance(this, ent);
            }
        }
    if (this.closestFood) {
        let newXDir = this.closestFood.x - this.x;
        let newYDir = this.closestFood.y - this.y;
        let newMagnitude = Math.sqrt(newXDir * newXDir + newYDir * newYDir);
        this.velocity.x = this.speed * (newXDir / newMagnitude);
        this.velocity.y = this.speed * (newYDir / newMagnitude);
    } else if (this.closestPredator && this.closestPrey) {
        let newXDir = 0;
        let newYDir = 0;
        if (this.closestPredatorDistance <= this.closestPreyDistance) {
            newXDir = this.x - this.closestPredator.x;
            newYDir = this.y - this.closestPredator.y;
        } else {
            newXDir = this.closestPrey.x - this.x;
            newYDir = this.closestPrey.y - this.y;
        }
        let newMagnitude = Math.sqrt(newXDir * newXDir + newYDir * newYDir);
        this.velocity.x = this.speed * (newXDir / newMagnitude);
        this.velocity.y = this.speed * (newYDir / newMagnitude);
        // console.log(this.speed);             
    } else if (this.closestPredator) {
        let newXDir = this.x - this.closestPredator.x;
        let newYDir = this.y - this.closestPredator.y;
        let newMagnitude = Math.sqrt(newXDir * newXDir + newYDir * newYDir);
        this.velocity.x = this.speed * (newXDir / newMagnitude);
        this.velocity.y = this.speed * (newYDir / newMagnitude);
        // console.log(this.speed); 
    } else if (this.closestPrey) {
        let newXDir = this.closestPrey.x - this.x;
        let newYDir = this.closestPrey.y - this.y;
        let newMagnitude = Math.sqrt(newXDir * newXDir + newYDir * newYDir);
        this.velocity.x = this.speed * (newXDir / newMagnitude);
        this.velocity.y = this.speed * (newYDir / newMagnitude);
        // console.log(this.speed); 
    }
}
}
Circle.prototype.draw = function (ctx) {
    ctx.fillStyle = "White";
    ctx.textAlign = "center"; 
    if (this.color === 1) {
        ctx.fillText("SICK", this.x, this.y - this.radius);
        ctx.fillStyle = this.colors[this.color];
    } else {
        ctx.fillText("Size: " + Math.round(this.area), this.x, this.y - this.radius);
        ctx.fillStyle = "rgb(" + this.radius * 3 + " , 0, 100)";
    }
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
};

////////////////////////////////////////////////////
////////////////////////////////////////////////////
////////////////////////////////////////////////////

function Food(game) {
    this.colors = ["Cyan", "Yellow"];
    this.color = Math.floor(Math.random() * 100 / 99) // 1 in 100 Chance to be super food
    if (this.color === 1) {
        this.radius = 4;
    } else {
        this.radius = Math.floor(Math.random() * 3 + 1);
    }
    this.area = Math.PI * Math.pow(this.radius, 2);
    Entity.call(this, game,
    this.radius + Math.random() * (600 - this.radius * 2),
    this.radius + Math.random() * (600 - this.radius * 2));
};

Food.prototype = new Entity();
Food.prototype.constructor = Food;

Food.prototype.update = function () {
    Entity.prototype.update.call(this);
};

Food.prototype.draw = function (ctx) {
    ctx.textAlign = "center"; 
    ctx.fillStyle = "White";
    if (this.color === 1) {
        ctx.fillText("Super Food", this.x, this.y);
    }  
    ctx.beginPath();
    ctx.fillStyle = this.colors[this.color]; 
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
};
///////////////////////////
///////////////////////////
///////////////////////////

function God(game) {};

God.prototype = new Entity();
God.prototype.constructor = God;

God.prototype.update = function () {
    Entity.prototype.update.call(this);
    let circleCount = 0;
    for (let i = 0; i < gameEngine.entities.length; i++) {
        if (gameEngine.entities[i] instanceof Circle) {
            circleCount++;
        }
    }
    while (circleCount < 25) {
        let circle = new Circle(gameEngine);
        gameEngine.addEntity(circle);
        circleCount++;
    }

    let foodCount = 0;
    for (let i = 0; i < gameEngine.entities.length; i++) {
        if (gameEngine.entities[i] instanceof Food) {
            foodCount++;
        }
    }
    while (foodCount < 100) {
        let food = new Food(gameEngine);
        gameEngine.addEntity(food);
        foodCount++;
    }
}

God.prototype.draw = function (ctx) {};

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/960px-Blank_Go_board.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    // for (var i = 0; i < 12; i++) {
    //     let circle = new Circle(gameEngine);
    //     gameEngine.addEntity(circle);
    // }
    for (var i = 0; i < 25; i++) {
        var circle = new Circle(gameEngine);
        gameEngine.addEntity(circle);
    }
    for (var i = 0; i < 100; i++) {
        var food = new Food(gameEngine);
        gameEngine.addEntity(food);
    }
    var god = new God(gameEngine);
    gameEngine.addEntity(god); // To recreate in case map is wiped by super food.
    gameEngine.init(ctx);
    gameEngine.start();
});
