/*
For this exercise I created a Kirbylike character - distinctive enough to not be a close derivative, but close enough to bear a resemblance. The idea is for it to be an interactive puppet that changes animation if a certaina area clicked or a button is pressed, returning to the default state every time an animation is finished. To this end I created 5 sets of unique animations, each with their own frame counter, which are toggled between when states are changed. One animation is mirrored depending on which hand is clicked/what button is pressed.

In addition, a changeable background is featured, toggled between using the arrow keys. I created two backgrounds, though the system used allows more to be added relatively easly. The second background features a falling snow animation created using code.

Not intended to be copyright infringement on the Kirby IP by Nintendo, and is held to be fair use for educational purposes.

Run here: https://editor.p5js.org/geokreye/sketches/s82DhfAKN

-----------------------------------------------------------------

Controls:
Click eyes / B - blink
Click mouth / S - smile
Click feet / spacebar - jump
Click left arm / L = wave left arm
Click right arm / R = wave right arm
Left arrow - cycle backgrounds left
Right arrow - cycle backgrounds right
*/

// constants
const FRAMERATE = 10; // how many frames to wait before updating
const DEBUG = false; // change this to true to see click hitboxes
const NUM_BGS = 2; // amount of background states present (ONLY CHANGE IF ADDING/REMOVING BACKGROUNDS)
const MAX_COOLDOWN = 20; // how many frames to wait before allowing background to be changed again

// idle animation
let ldkIdle = [];
let idleIndex = 0;

// blink animation
let ldkBlink = [];
let blinkIndex = 0;

// smile animation
let ldkSmile = [];
let smileIndex = 0;

// wave animations
let ldkWave = [];
let waveIndex = 0;

// jump animation
let ldkJump = [];
let jumpIndex = 0;

// background 1
let bg1 = [];
let bg1Index = 0;

// background 2 ground
let bg2;

// current animation state and whether state can be changed (i.e. can click to change state)
let animState = 0;
let canClick = true;

// current background state & cooldown
let bgState = 0;
let cooldown = 0;

// snow animation stuff
let snowObjects = []; // contains all created snow parricles
const MAX_SNOW_OBJECTS = 500; // maximum amount of snow objects in snow animation that can be onscreen at once
const SNOW_SIZE = 5; // radius of snow particles
const MIN_SNOW_DEVIATION = -20; // mininum snow deviation during movement
const MAX_SNOW_DEVIATION = 20; // roughly the maximum snow deviation during movement
const FALL_SPEED = 10; // amount to move each particle down by per frame

function preload() {
  // get idle animation
  for (let i = 1; i <= 5; i++) {
    ldkIdle.push(loadImage("Idle/LDKIdle" + str(i).padStart(4, "0") + ".png"));
    // get blink animation 1
    ldkBlink.push(
      loadImage("Blink/LDKBlink" + str(i).padStart(4, "0") + ".png")
    );
  }

  // get blink animation 2
  for (let i = 4; i > 0; i--) {
    append(
      ldkBlink,
      loadImage("Blink/LDKBlink" + str(i).padStart(4, "0") + ".png")
    );
  }

  // get smile animation 1
  for (let i = 1; i <= 8; i++) {
    ldkSmile.push(
      loadImage("Smile/LDKSmile" + str(i).padStart(4, "0") + ".png")
    );
  }

  // get smile a; inimation 2
  for (let i = 7; i > 0; i--) {
    append(
      ldkSmile,
      loadImage("Smile/LDKSmile" + str(i).padStart(4, "0") + ".png")
    );
  }

  // get wave animation 1
  for (let i = 1; i <= 9; i++) {
    ldkWave.push(loadImage("Wave/LDKWave" + str(i).padStart(4, "0") + ".png"));
  }

  // get wave animation 2
  for (let i = 8; i > 0; i--) {
    ldkWave.push(loadImage("Wave/LDKWave" + str(i).padStart(4, "0") + ".png"));
  }

  // get jump animation
  for (let i = 1; i <= 9; i++) {
    ldkJump.push(loadImage("Jump/LDKJump" + str(i).padStart(4, "0") + ".png"));
  }

  // get background 1
  for (let i = 1; i <= 5; i++) {
    bg1.push(
      loadImage("Background 1/E4BG1_" + str(i).padStart(4, "0") + ".png")
    );
  }

  // get background 2 ground
  bg2 = loadImage("E4BG2_Ground.png");
}

// sets up canvas
function setup() {
  createCanvas(800, 600);
}

// main draw function
function draw() {
  // clear
  background(220);

  // background
  drawBackground();

  // animation
  drawAnimation();

  // interaction points
  canClick = animState == 0;
  if (canClick) {
    stateDeterminer();
  }
  backgroundState();

  // debug display
  if (DEBUG && canClick) {
    showHitboxes();
  }
}

// returns whether the mouse is within the square defined by the given coords
function mouseInBounds(x1, y1, x2, y2) {
  return x2 >= mouseX && mouseX >= x1 && y2 >= mouseY && mouseY >= y1;
}

// shows where the user can click if debug mode is enabled
function showHitboxes() {
  rectMode(CENTER);
  rect(width / 2 - 20, height / 2 + 50, 50, 50); // smile
  rect(width / 2 - 20, height / 2 - 50, 160, 120); // blink
  rect(width / 2 - 190, height / 2, 100, 130); // wave left
  rect(width / 2 + 150, height / 2, 100, 130); // wave right
  rect(width / 2 - 20, height / 2 + 125, 320, 80); // jump
  rectMode(CORNERS);
}

// determines state on click
function stateDeterminer() {
  if (
    (mouseIsPressed &&
      mouseInBounds(
        width / 2 - 45,
        height / 2 + 25,
        width / 2 + 30,
        height / 2 + 75
      )) ||
    (keyIsPressed && key == "s")
  ) {
    // smile
    smileIndex = 0;
    animState = 1;
  } else if (
    (mouseIsPressed &&
      mouseInBounds(
        width / 2 - 100,
        height / 2 - 110,
        width / 2 + 60,
        height / 2 + 10
      )) ||
    (keyIsPressed && key == "b")
  ) {
    // blink
    blinkIndex = 0;
    animState = 2;
  } else if (
    (mouseIsPressed &&
      mouseInBounds(
        width / 2 - 240,
        height / 2 - 70,
        width / 2 - 140,
        height / 2 + 70
      )) ||
    (keyIsPressed && key == "l")
  ) {
    // wave left
    waveIndex = 0;
    animState = 3;
  } else if (
    (mouseIsPressed &&
      mouseInBounds(
        width / 2 + 100,
        height / 2 - 70,
        width / 2 + 200,
        height / 2 + 70
      )) ||
    (keyIsPressed && key == "r")
  ) {
    // wave right
    waveIndex = 0;
    animState = 4;
  } else if (
    (mouseIsPressed &&
      mouseInBounds(
        width / 2 - 180,
        height / 2 + 85,
        width / 2 + 140,
        height / 2 + 165
      )) ||
    (keyIsPressed && key == " ")
  ) {
    // jump
    jumpIndex = 0;
    animState = 5;
  }
}

function drawAnimation() {
  if (animState == 0) {
    // idle
    image(ldkIdle[idleIndex], 0, 0);
    if (frameCount % FRAMERATE == 0) {
      idleIndex = (idleIndex + 1) % ldkIdle.length;
    }
  } else if (animState == 1) {
    // smile
    image(ldkSmile[smileIndex], 0, 0);
    if (frameCount % FRAMERATE == 0) {
      smileIndex = (smileIndex + 1) % ldkSmile.length;

      // end animation
      if (smileIndex == 0) {
        idleIndex = 0;
        animState = 0;
      }
    }
  } else if (animState == 2) {
    // blink
    image(ldkBlink[blinkIndex], 0, 0);
    if (frameCount % FRAMERATE == 0) {
      blinkIndex = (blinkIndex + 1) % ldkBlink.length;

      // end animation
      if (blinkIndex == 0) {
        idleIndex = 0;
        animState = 0;
      }
    }
  } else if (animState == 3) {
    // wave left
    push(); // save default scale
    scale(-1, 1); // change scale

    // animate
    image(ldkWave[waveIndex], -width + 40, 0);
    if (frameCount % FRAMERATE == 0) {
      waveIndex = (waveIndex + 1) % ldkWave.length;

      // end animation
      if (waveIndex == 0) {
        idleIndex = 0;
        animState = 0;
      }
    }
    pop(); // restore default scale
  } else if (animState == 4) {
    // wave right
    image(ldkWave[waveIndex], 0, 0);
    if (frameCount % FRAMERATE == 0) {
      waveIndex = (waveIndex + 1) % ldkWave.length;

      // end animation
      if (waveIndex == 0) {
        idleIndex = 0;
        animState = 0;
      }
    }
  } else if (animState == 5) {
    // jump
    image(ldkJump[jumpIndex], 0, 0);
    if (frameCount % FRAMERATE == 0) {
      jumpIndex = (jumpIndex + 1) % ldkJump.length;

      // end animation
      if (jumpIndex == 0) {
        idleIndex = 0;
        animState = 0;
      }
    }
  }
}

// draws background
function drawBackground() {
  if (bgState == 0) {
    // background 1
    image(bg1[bg1Index], 0, 0);
    if (frameCount % FRAMERATE == 0) {
      bg1Index = (bg1Index + 1) % bg1.length;
    }
  } else if (bgState == 1) {
    // background 2
    background(128, 165, 188);
    snowAnimation();
    image(bg2, 0, 0);
  }

  // debug BG identifier
  if (DEBUG) {
    push();
    textSize(50);
    text(str(bgState + 1), 10, 50);
    pop();
  }
}

// determines background state if left and right arrrow keys are pressed; also updates background change cooldown when on it
function backgroundState() {
  if (cooldown == 0 && keyIsPressed) {
    if (keyCode == RIGHT_ARROW) {
      // change background state by 1
      bgState = (bgState + 1) % NUM_BGS;
      if (DEBUG) {
        print("Change to background state " + (bgState + 1));
      }

      // set cooldown
      cooldown = MAX_COOLDOWN;
    } else if (keyCode == LEFT_ARROW) {
      // change background state by -1
      bgState = (bgState - 1) % NUM_BGS;
      // correction for modulo behavior
      if (bgState == -1) {
        bgState = NUM_BGS - 1;
      }
      if (DEBUG) {
        print("Change to background state " + (bgState + 1));
      }

      // clear snow animation if bgState isn't 1 (background isn't bg 2)
      if (bgState != 1) {
        snowObjects = [];
      }

      // set cooldown
      cooldown = MAX_COOLDOWN;
    }
  } else if (cooldown > 0) {
    // decrease cooldown
    cooldown--;
  }
}

// animates snow
function snowAnimation() {
  if (snowObjects.length < MAX_SNOW_OBJECTS) {
    // create 0-3 additional snow particles
    for (let i = 0; i < int(random(0, 4)); i++) {
      startX = random(0, 801); // determine starting X coordinate
      snowObjects.push(new SnowParticle(startX, 0));
      if (DEBUG) {
        print("Snow particle created");
      }
    }
  }

  // update snow particles
  for (let i = 0; i < snowObjects.length; i++) {
    // delete any snow particles below a certain point
    if (snowObjects[i].y > height / 2) {
      snowObjects.splice(i, 1);
      if (DEBUG) {
        print("Deleting extraneous snow particle");
      }
    } else {
      // draw snow particles
      snowObjects[i].draw();

      // update snow particles' position
      if (frameCount % FRAMERATE == 0) {
        xDeviation = random(MIN_SNOW_DEVIATION, MAX_SNOW_DEVIATION); // determine x deviation
        snowObjects[i].x += xDeviation;
        snowObjects[i].y += FALL_SPEED;
      }
    }
  }
}

// class for snow particles
class SnowParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  draw() {
    push();
    fill("snow");
    stroke("black");
    ellipse(this.x, this.y, SNOW_SIZE);
    pop();
  }
}
