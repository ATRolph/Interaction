const gameEngine = new GameEngine();
var canvasWidth;
var canvasHeight;

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

function Circle() {
    this.colors = ["Red", "Green"];
    this.color = Math.floor(Math.random() * 50 / 48.5); // 1 in 25 Chance to be sick.
    if (this.color === 1) {
        this.radius = 15;
    } else {
        this.radius = Math.random() * 10 + 5;
    }
    this.area = Math.PI * Math.pow(this.radius, 2);
    this.closestPredator = null;
    this.closestPrey = null;
    this.closestFood = null;
    this.closestPredatorDistance = Infinity;
    this.closestPreyDistance = Infinity;
    this.closestFoodDistance = Infinity;
    this.velocity = {x: 0, y: 0};
    this.speed = 100;
    let startX = Math.random() * (canvasWidth - this.radius);
    let startY = Math.random() * (canvasHeight - this.radius);
    for (let i = 0; i < gameEngine.entities.length; i++) {
        if (centerDistance(this, i) === 0 && gameEngine.entities[i] instanceof Circle) {
            break;
        } else if (i === gameEngine.entities.length - 1) {
            Entity.call(this, gameEngine, startX, startY);
        }
    }     
};

Circle.prototype = new Entity();
Circle.prototype.constructor = Circle;

Circle.prototype.eat = function (other) {
    return centerDistance(this, other) < this.radius - other.radius;
};

Circle.prototype.collideLeft = function () {
    return this.x < 0;
};

Circle.prototype.collideRight = function () {
    return this.x > canvasWidth;
};

Circle.prototype.collideTop = function () {
    return this.y < 0;
};

Circle.prototype.collideBottom = function () {
    return this.y > canvasHeight;
};

Circle.prototype.update = function () {
    Entity.prototype.update.call(this);
    this.x += this.velocity.x * gameEngine.clockTick;
    this.y += this.velocity.y * gameEngine.clockTick;
    this.closestPredator = null;
    this.closestPrey = null;
    this.closestFood = null;
    this.closestPreyDistance = Infinity;
    this.closestPredatorDistance = Infinity;
    this.closestFoodDistance = Infinity;
    this.max = 100000;
    if (this.collideLeft()) this.x = 0;
    if (this.collideRight()) this.x = canvasWidth;
    if (this.collideTop()) this.y = 0;
    if (this.collideBottom()) this.y = canvasHeight;
    for (var i = 0; i < gameEngine.entities.length; i++) {
        let ent = gameEngine.entities[i];
        if (this != ent && this.eat(ent)) {
            if (ent.color === 1 && ent instanceof Circle) {
                this.removeFromWorld = true;
                ent.removeFromWorld = true;
            } else if (this.area > ent.area) {
                if (ent.color === 1 && ent instanceof Food && this.area != this.max) {
                    this.area *= 5;
                } else if (this.area != this.max) {
                    if (this.area + ent.area > this.max) {
                        this.area = this.max;
                    } else {
                        this.area += ent.area;
                    }
                }
                this.radius = Math.sqrt(this.area / Math.PI);
                ent.removeFromWorld = true;
                // let scaledSpeed = this.speed / (this.radius / 20);
                // this.velocity.x = scaledSpeed * (this.velocity.x / this.speed);
                // this.velocity.y = scaledSpeed * (this.velocity.y / this.speed); 
                // this.speed = scaledSpeed;  
            }
        }
        if (ent instanceof Food) {
            if (ent.color === 1 && edgeDistance(this, ent) <= 200) {
                if (this.closestFood) {
                    if (this.closestFood.color === 1) {
                        if (edgeDistance(this, ent) < this.closestFoodDistance) {
                            this.closestFood = ent;
                            this.closestFoodDistance = edgeDistance(this, ent)
                        }
                    } else {
                        this.closestFood = ent;
                        this.closestFoodDistance = edgeDistance(this, ent);
                    }
                } else {
                    this.closestFood = ent;
                    this.closestFoodDistance = edgeDistance(this, ent);
                }
            } else {
                if (edgeDistance(this, ent) < this.closestFoodDistance) {
                    if (this.closestFood) {
                        if (this.closestFood.color != 1) {
                            this.closestFood = ent;
                            this.closestFoodDistance = edgeDistance(this, ent);
                        }
                    } else {
                        this.closestFood = ent;
                        this.closestFoodDistance = edgeDistance(this, ent);
                    }
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
        if (this.closestPredator && this.closestPrey && this.closestFood) {
            let newXDir = 0;
            let newYDir = 0;
            if (this.closestFood.color === 1 && this.area != this.max) {
                newXDir = this.closestFood.x - this.x;
                newYDir = this.closestFood.y - this.y;
            } else if (this.closestPredatorDistance <= this.closestPreyDistance) {
                newXDir = this.x - this.closestPredator.x;
                newYDir = this.y - this.closestPredator.y;
            } else if (this.closestPreyDistance <= this.closestFoodDistance || this.area > 2000) {
                newXDir = this.closestPrey.x - this.x;
                newYDir = this.closestPrey.y - this.y;
            } else {
                newXDir = this.closestFood.x - this.x;
                newYDir = this.closestFood.y - this.y;
            }
            let newMagnitude = Math.sqrt(newXDir * newXDir + newYDir * newYDir);
            this.velocity.x = this.speed * (newXDir / newMagnitude);
            this.velocity.y = this.speed * (newYDir / newMagnitude);          
        } else if (this.closestPrey && this.closestFood) {
            let newXDir = 0;
            let newYDir = 0;
            if (this.closestFood.color === 1 && this.area != this.max) {
                newXDir = this.closestFood.x - this.x;
                newYDir = this.closestFood.y - this.y;
            } else if (this.closestPreyDistance <= this.closestFoodDistance || this.area > 2000) {
                newXDir = this.closestPrey.x - this.x;
                newYDir = this.closestPrey.y - this.y;
            } else {
                newXDir = this.closestFood.x - this.x;
                newYDir = this.closestFood.y - this.y;
            }
            let newMagnitude = Math.sqrt(newXDir * newXDir + newYDir * newYDir);
            this.velocity.x = this.speed * (newXDir / newMagnitude);
            this.velocity.y = this.speed * (newYDir / newMagnitude);         
        }
        // else {
        //     let newXDir = this.closestFood.x - this.x;
        //     let newYDir = this.closestFood.y - this.y;
        //     let newMagnitude = Math.sqrt(newXDir * newXDir + newYDir * newYDir);
        //     this.velocity.x = this.speed * (newXDir / newMagnitude);
        //     this.velocity.y = this.speed * (newYDir / newMagnitude);
        // } 
    }
}
Circle.prototype.draw = function (ctx) {
    ctx.fillStyle = "White";
    ctx.textAlign = "center";
    if (this.color === 1) {
        ctx.fillText("Infected", this.x, this.y - this.radius);
        ctx.fillStyle = this.colors[this.color];
    } else if (this.area === this.max) {
        ctx.fillText("Size: Max", this.x, this.y - this.radius);
        ctx.fillStyle = "Red";
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

function Food() {
    this.colors = ["Cyan", "Yellow"];
    this.color = Math.floor(Math.random() * 100 / 99) // 1 in 100 Chance to be super food
    if (this.color === 1) {
        this.radius = 4;
    } else {
        this.radius = Math.floor(Math.random() * 3 + 1);
    }
    this.area = Math.PI * Math.pow(this.radius, 2);
    let startX = Math.random() * (canvasWidth - this.radius);
    let startY = Math.random() * (canvasHeight - this.radius);
    for (let i = 0; i < gameEngine.entities.length; i++) {
        if (centerDistance(this, i) === 0 && gameEngine.entities[i] instanceof Circle) {
            break;
        } else if (i === gameEngine.entities.length - 1) {
            Entity.call(this, gameEngine, startX, startY);
        }
    } 
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

////////////////////////////////////////////////////
////////////////////////////////////////////////////
////////////////////////////////////////////////////

function God() {};

God.prototype = new Entity();
God.prototype.constructor = God;

God.prototype.update = function () {
    Entity.prototype.update.call(this);
    let circleCount = 0;
    let foodCount = 0;
    for (let i = 0; i < gameEngine.entities.length; i++) {
        if (gameEngine.entities[i] instanceof Circle) {
            circleCount++;
        } else if (gameEngine.entities[i] instanceof Food) {
            foodCount++;
        }
    }
    while (circleCount < 100) {
        let circle = new Circle();
        gameEngine.addEntity(circle);
        circleCount++;
    }
    while (foodCount < 500) {
        let food = new Food();
        gameEngine.addEntity(food);
        foodCount++;
    }
}

God.prototype.draw = function (ctx) { };

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/960px-Blank_Go_board.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
    for (var i = 0; i < 100; i++) {
        var circle = new Circle();
        gameEngine.addEntity(circle);
    }
    for (var i = 0; i < 500; i++) {
        var food = new Food();
        gameEngine.addEntity(food);
    }
    var god = new God();
    gameEngine.addEntity(god); // To recreate in case map is wiped by super food.
    gameEngine.init(ctx);
    gameEngine.start();
});
