//ChatGPT was used to help fix bugs and debug the code.
//CATCH THE SUGAR

//variables
let sceneIntro;
let sceneGame;
let sceneEnd;

let currentScene = "intro"; // "intro" | "game" | "end"

// Assets
let imgIntroBg, imgGameBg;
let imgStartBtn, imgTryAgainBtn;
let imgCup, imgSugar, imgLemon;
let imgCongrats, imgLost;
let interFont;

// Score
let score = 0;
const WIN_SCORE = 10;

// ---------- PRELOAD ----------
function preload() {
  imgIntroBg = loadImage("backround.png");
  imgGameBg = loadImage("gamebg.png");

  imgStartBtn = loadImage("startbutton.png");
  imgTryAgainBtn = loadImage("tryagain.png");

  imgCup = loadImage("cup.png");
  imgSugar = loadImage("sugar.png");
  imgLemon = loadImage("lemon.png");

  imgCongrats = loadImage("congrats.png");
  imgLost = loadImage("lost.png");

  interFont = loadFont("interfont.ttf");
}

// ---------- SETUP ----------
function setup() {
  createCanvas(800, 800);

  // create scenes
  sceneIntro = new IntroScene();
  sceneGame = new GameScene();
  sceneEnd = new EndScene();

  // set initial scene
  currentScene = "intro";
}

//draw
function draw() {
  background(250);

  if (currentScene === "intro") {
    sceneIntro.display();
  }

  if (currentScene === "game") {
    sceneGame.display();
  }

  if (currentScene === "end") {
    sceneEnd.display();
  }
}

// MOUSE
function mousePressed() {
  // scenes use their own buttons, but we forward the click
  if (currentScene === "intro") sceneIntro.handleMousePressed();
  if (currentScene === "end") sceneEnd.handleMousePressed();
}

//SCENES

class IntroScene {
  constructor() {
    this.bg = imgIntroBg;

    // button in the middle (slightly up)
    this.startBtn = new Button(width / 2, height / 2 - 25, 150, 40, imgStartBtn);

    // when clicked -> go to game
    this.startBtn.addListener(() => {
      resetGame();
      currentScene = "game";
    });
  }

  display() {
    // background
    imageMode(CORNER);
    image(this.bg, 0, 0, width, height);

    // start button
    this.startBtn.draw();
  }

  handleMousePressed() {
    this.startBtn.handleClick();
  }
}

class GameScene {
  constructor() {
    this.bg = imgGameBg;

    // player (cup)
    this.player = new Player(imgCup);

    // falling items
    this.sugars = [];
    this.lemons = [];

    // spawn counters
    this.sugarCounter = 0;
    this.lemonCounter = 0;
  }

  display() {
    // background
    imageMode(CORNER);
    image(this.bg, 0, 0, width, height);

    // update player
    this.player.update();
    this.player.draw();

    // spawn items
    this.spawnItems();

    // update items + collisions
    this.updateSugars();
    this.updateLemons();

    // draw score (during game) with #665438
    this.drawScoreUI();
  }

  spawnItems() {
    // sugar spawns more often
    this.sugarCounter++;
    if (this.sugarCounter >= 28) {
      this.sugars.push(new FallingItem("sugar", imgSugar));
      this.sugarCounter = 0;
    }

    // lemon spawns less often
    this.lemonCounter++;
    if (this.lemonCounter >= 110) {
      this.lemons.push(new FallingItem("lemon", imgLemon));
      this.lemonCounter = 0;
    }
  }

  updateSugars() {
    for (let i = this.sugars.length - 1; i >= 0; i--) {
      this.sugars[i].update();
      this.sugars[i].draw();

      if (this.sugars[i].hitsPlayer(this.player)) {
        score++;
        this.sugars.splice(i, 1);

        if (score >= WIN_SCORE) {
          sceneEnd.setResult("win");
          currentScene = "end";
          return;
        }
        continue;
      }

      if (this.sugars[i].offscreen()) {
        this.sugars.splice(i, 1);
      }
    }
  }

  updateLemons() {
    for (let i = this.lemons.length - 1; i >= 0; i--) {
      this.lemons[i].update();
      this.lemons[i].draw();

      if (this.lemons[i].hitsPlayer(this.player)) {
        sceneEnd.setResult("lose");
        currentScene = "end";
        return;
      }

      if (this.lemons[i].offscreen()) {
        this.lemons.splice(i, 1);
      }
    }
  }

  drawScoreUI() {
    push();
    textFont(interFont);
    fill("#665438");
    textAlign(LEFT, TOP);
    textSize(28);
    text("Score: " + score + "/" + WIN_SCORE, 40, 30);
    pop();
  }
}

class EndScene {
  constructor() {
    this.result = "win"; // "win" or "lose"
    this.bg = imgCongrats;

    this.tryBtn = new Button(width / 2, height * 0.75, 150, 40, imgTryAgainBtn);
    this.tryBtn.addListener(() => {
      resetGame();
      currentScene = "intro";
    });
  }

  setResult(result) {
    this.result = result;
    this.bg = (result === "win") ? imgCongrats : imgLost;
  }

  display() {
    imageMode(CORNER);
    image(this.bg, 0, 0, width, height);

    // score on end screens with #FFF555
    push();
    textFont(interFont);
    fill("#FFF555");
    textAlign(CENTER, CENTER);
    textSize(28);
    text("Score: " + score, width / 2, height * 0.62);
    pop();

    this.tryBtn.draw();
  }

  handleMousePressed() {
    this.tryBtn.handleClick();
  }
}

//CLASSES

class Button {
  constructor(x, y, w, h, img) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.img = img;
    this.listeners = [];
  }

  addListener(fn) {
    this.listeners.push(fn);
  }

  isMouseOver() {
    return (
      mouseX > this.x - this.w / 2 &&
      mouseX < this.x + this.w / 2 &&
      mouseY > this.y - this.h / 2 &&
      mouseY < this.y + this.h / 2
    );
  }

  handleClick() {
    if (this.isMouseOver()) {
      for (let i = 0; i < this.listeners.length; i++) {
        this.listeners[i]();
      }
    }
  }

  draw() {
    imageMode(CENTER);
    image(this.img, this.x, this.y, this.w, this.h);
  }
}

class Player {
  constructor(img) {
    this.img = img;
    this.x = width / 2;
    this.y = height - 120;

    this.w = 140;
    this.h = 140;

    this.speed = 7;
  }

  update() {
    if (keyIsDown(LEFT_ARROW)) this.x -= this.speed;
    if (keyIsDown(RIGHT_ARROW)) this.x += this.speed;

    this.x = constrain(this.x, this.w / 2 + 10, width - this.w / 2 - 10);
  }

  draw() {
    imageMode(CENTER);
    image(this.img, this.x, this.y, this.w, this.h);
  }

  // simple rectangle bounds for collisions
  getBounds() {
    return {
      left: this.x - this.w * 0.45,
      right: this.x + this.w * 0.45,
      top: this.y - this.h * 0.35,
      bottom: this.y + this.h * 0.35
    };
  }
}

class FallingItem {
  constructor(type, img) {
    this.type = type; // "sugar" or "lemon"
    this.img = img;

    this.x = random(40, width - 40);
    this.y = -40;

    this.vy = random(4, 7);

    if (this.type === "sugar") {
      this.w = 44;
      this.h = 44;
    } else {
      this.w = 58;
      this.h = 58;
    }
  }

  update() {
    this.y += this.vy;
  }

  draw() {
    imageMode(CENTER);
    image(this.img, this.x, this.y, this.w, this.h);
  }

  offscreen() {
    return this.y > height + 60;
  }

  hitsPlayer(player) {
    const b = player.getBounds();

    const left = this.x - this.w / 2;
    const right = this.x + this.w / 2;
    const top = this.y - this.h / 2;
    const bottom = this.y + this.h / 2;

    return (
      right > b.left &&
      left < b.right &&
      bottom > b.top &&
      top < b.bottom
    );
  }
}

//RESET

function resetGame() {
  score = 0;

  // rebuild game scene state
  sceneGame = new GameScene();
}