/*
My Exercise 5 is a cell simulation with 2 modes: solo (not eating other cells) and teams (eating cells of different teams/colors). The latter mode is essentially a zero-player game. The 'growing in size by eating' and 'cells only being able to eat other cells if they are smaller in size' mechanics were inspired by agar.io, but similarities end there. I tried to go with a minimalistic look for the non-static elements, but I decided to make a gradient using lerp for the simulation background (representing water) so it didn't look too simplistic. I also tried to compartmentalize as much as I could into functions and classes, though I think I could organize the functions themselves better if I had time.

I also decided that instead of having an end state, I would spawn in new cells whenever all of them died. This means the simulation can technically go on forever (barring certain limitations of computers and such that can throw a spanner in the works).

Creature-creature interaction mainly occurs in teams mode, though some interaction (mainly, eating the food left behind by dead cells, as well as pressure from population) does occur in solo.

Run here: https://editor.p5js.org/geokreye/sketches/jQhGXEMfQ
------

Title background - https://www.pexels.com/photo/cell-seen-under-microscope-11198495/
*/

// cell parameters
const MAX_DEVIATION = 10; // movement deviation
const MITOSIS_SIZE = 6; // size to split into two cells at (if not overpopulated)
const MAX_SIZE = 8; // maximum size before cell dies from being oversized
const LIFESPAN = 9600; // how long a cell should live
const DEFAULT_CELL_COLOR = "#48F0CC";
const NUCLEUS_COLOR = "#69147b";
const NUCLEUS_OFFSET = 2.5; // y offset of nucleus
const NUCLEUS_SIZE = 3; // multiplier of nucleus size
const STARTING_CELLS = 3; // how many cells to spawn at start (per team if in team mode)
const EAT_DISTANCE = 2; // how far from cell edge to eat food
const MIN_CELL_AMOUNT = 1; // mininum cell population (spontaneous cell generation of up to starting amount if below this)
const MAX_CELL_AMOUNT = 20; // maximum cell population (stop mitosis and kills oldest cells by overpopulation)
const LIFESPAN_EAT_BONUS = 600; // bonus time alloted for eating
let canMitosis = true; // whether mitosis is currently allowed

// food parameters
const MAX_DECAY = 1500; // how long until food should be deleted
let FOOD_COLOR = [179, 201, 198]; // array for easy alpha changing
const STARTING_FOOD = 50; // how many food objects to spawn at start
const MIN_FOOD_AMOUNT = 25; // the mininum amount of food objects to have onscreen at once
const MAX_FOOD_AMOUNT = 100; // the maximum amount of food objects to have onscreen at once

// whether debug mode is enabled
const DEBUG = false;

// framerate
const FRAMERATE = 24;

// whether the sim has started
let started = false;

// object arrays
let cells = []; // living cells
let food = []; // nonliving food

// team mode
const DEFAULT_TEAM_MODE = false; // whether team mode is on by default
const DEFAULT_TEAM_AMOUNT = 2; // default amount of teams
const MIN_TEAMS = 2; // minimum number of teams
const MAX_TEAMS = 6; // maximum nunber of teams
let teamMode = DEFAULT_TEAM_MODE; // whether team mode is on
let teams = DEFAULT_TEAM_AMOUNT; // amount of teams
let teamColors = []; // colors for team mode

// menu
let MENU_BACKGROUND; // background image
const BUTTON_FILL = "rgb(255,255,255)"; // button color
const HOVERING_FILL = "rgb(0,150,0)"; // button hovering color
let currentMenu = 0; // menu state

// simulation background (p5.color format, so set in setup)
let SIM_BG_1;
let SIM_BG_2;

function preload() {
  // load background image
  MENU_BACKGROUND = loadImage("pexels-fayette-reynolds-ms-11198495.jpeg");
}

function setup() {
  // create canvas and set framerate
  createCanvas(600, 600);
  frameRate(FRAMERATE);

  // p5.color constants
  SIM_BG_1 = color(10, 240, 240);
  SIM_BG_2 = color(0, 0, 100);
}

function draw() {
  // clear canvas
  background(255);

  // differentation between start screens and simulation
  if (!started) {
    menu();
  } else {
    // background
    backgroundGradient();

    // cells
    for (let i = 0; i < cells.length; i++) {
      cells[i].display();
      cells[i].update();
      if (cells[i].dead) {
        deleteFromArray(cells, cells[i], i);
      }
    }

    // food
    for (let i = 0; i < food.length; i++) {
      food[i].display();
      food[i].update();
      if (food[i].rotten) {
        deleteFromArray(food, food[i], i);
      }
    }

    // enforce min and max cells
    checkCellAmount();

    //enforce min and max food
    checkFoodAmount();
  }

  // debug warning
  if (DEBUG) {
    push();
    translate(50, height - 25);
    textSize(20);
    textStyle(BOLDITALIC);
    fill("red");
    text("DEBUG", 0, 0);
    pop();
  }
}

// class for living cells
class Cell {
  constructor(startX, startY, index, team) {
    this.position = createVector(startX, startY, fill, index);
    this.prevPosition = createVector(startX, startY, fill, index);
    this.size = 1; // size of cell
    this.time = 0; // time cell has been alive
    this.index = index; // index in cells array (hopefully)
    this.team = team; // index in teams & team colors arrays (hopefully)
    // make fill the team fill if teamMode is on
    if (teamMode) {
      this.fill = teamColors[team];
    } else {
      // default fill
      this.fill = teamColors[0];
    }
    this.dead = false; // whether cell is dead & marked for deletion
  }

  // rendering
  display() {
    push();

    // set drawing origin to cell position
    translate(this.position.x, this.position.y);

    // debug box for showing eating area
    if (DEBUG) {
      push();
      stroke(0);
      fill(255);
      rectMode(CENTER);
      rect(0, 0, this.size * 10 + EAT_DISTANCE);
      pop();
    }

    // draw cell main body
    stroke(0);
    fill(this.fill);
    ellipse(0, 0, this.size * 10);

    // calculate angle of movement
    let dir = createVector(
      this.position.x - this.prevPosition.x,
      this.position.y - this.prevPosition.y
    ).normalize();
    let angle = dir.heading();

    // draw nucleus (faces angle of movement)
    fill(NUCLEUS_COLOR);
    rotate(angle);
    ellipse(0, 0 + NUCLEUS_OFFSET * this.size, this.size * NUCLEUS_SIZE);
    if (DEBUG) {
      stroke(255, 0, 0);
      strokeWeight(2);
      line(0, 0, 0, 0 + NUCLEUS_OFFSET * this.size * 3);
    }
    pop();
  }

  // update function
  update() {
    // only update if not marked for deletion
    if (!this.dead) {
      this.move(); // movement
      this.lookForFood(); // check for edible food
      // fallback mitosis check (used when oversized & mitosis is allowed again)
      if (canMitosis && this.size >= MITOSIS_SIZE) {
        this.mitosis();
      }
      if (teamMode) {
        this.lookForEnemyCells(); // check for edible cells on other teams
      }
      this.age(); // age (and kill if lifespan exceeded)
    }
  }

  // random movement
  move() {
    // save old position for angle calculation later
    this.prevPosition = this.position.copy();

    // calculate actual max deviation
    let adjDeviation = MAX_DEVIATION + 1 - this.size;

    // update position
    this.position.x += random(-adjDeviation, adjDeviation);
    this.position.y += random(-adjDeviation, adjDeviation);

    // enforce bounds
    if (this.position.x < 0) {
      this.position.x = 0;
    } else if (this.position.x > width) {
      this.position.x = width;
    }
    if (this.position.y < 0) {
      this.position.y = 0;
    } else if (this.position.y > height) {
      this.position.y = height;
    }
  }

  // detection of food
  lookForFood() {
    // redundancy condition to prevent eating own death-food
    if (!this.dead) {
      for (let i = 0; i < food.length; i++) {
        // eat if eating range overlap and smaller than or equal in size to this cell
        if (checkIfEdible(this, food[i]) && food[i].size <= this.size) {
          this.eat(food[i]);
        }
      }
    }
  }

  // detection of enemy cells (team mode only)
  lookForEnemyCells() {
    for (let i = 0; i < cells.length; i++) {
      // eat if eating range overlap, on an enemy team, and smaller than this cell
      if (
        checkIfEdible(this, cells[i]) &&
        cells[i].team != this.team &&
        cells[i].size < this.size
      ) {
        this.eatEnemy(cells[i]);
      }
    }
  }

  // 'eats' food (marking it for deletion), applies lifespan bonus, and triggers a size increase
  eat(food) {
    this.grow(food.size); // grow this cell
    this.time -= LIFESPAN_EAT_BONUS; // add additional life
    food.remove(); // remove food
  }

  // 'eats' enemy cells (marking it for deletion), applies lifespan bonus, and triggers a size increase (team mode only)
  eatEnemy(cell) {
    this.grow(cell.size); // grow this cell
    this.time -= LIFESPAN_EAT_BONUS; // add additional life
    cell.eaten(); // remove cell without leaving behind food
  }

  // size increase
  grow(increase) {
    this.size += increase;
    if (this.size >= MITOSIS_SIZE && canMitosis) {
      this.mitosis();
    } else if (this.size > MAX_SIZE) {
      // die if oversized
      this.kill();
    }
  }

  // cell division
  mitosis() {
    // determine new positions
    let xDeviation = random(-MAX_DEVIATION, MAX_DEVIATION);
    let yDeviation = random(-MAX_DEVIATION, MAX_DEVIATION);
    let new1 = createVector(
      this.position.x + xDeviation,
      this.position.y + yDeviation
    );
    let new2 = createVector(
      this.position.x - xDeviation,
      this.position.y - yDeviation
    );

    // update original
    this.position = new1;
    this.size = 1;

    // create duplicate
    cells.push(new Cell(new2.x, new2.y, cells.length, this.team));
  }

  // aging
  age() {
    // increment age
    this.time++;

    // don't allow negative time values
    if (this.time < 0) {
      this.time = 0;
    }

    // kill cell if age limit reached
    if (this.time >= LIFESPAN / FRAMERATE) {
      if (DEBUG) {
        print("Cell " + (this.index + 1) + " reached age limit, killing");
      }
      this.kill();
    }
  }

  // kills this cell
  kill() {
    // kill cell (mark it for deletion)
    this.dead = true;

    // spawn spread of food proportional to current size (apoptosis)
    for (let i = 0; i < this.size; i++) {
      let spreadX = random(
        this.position.x - this.size * 10,
        this.position.x + this.size * 10
      );
      let spreadY = random(
        this.position.y - this.size * 10,
        this.position.y + this.size * 10
      );
      food.push(new Food(spreadX, spreadY, 1, food.length));
    }
  }

  // kill this cell without spawning food
  eaten() {
    this.dead = true;
  }
}

// class for nonliving food
class Food {
  constructor(x, y, size, index) {
    this.position = createVector(x, y); // position of food in worldspace
    this.size = size; // size of food (determines size gain upon being eaten)
    this.index = index; // index in food array upon creation
    this.decay = 0; // decay amount
    this.rotten = false; // whether this instance is marked for deletion
  }

  // renders food
  display() {
    push();

    // fade food based on decay
    let fade = map(this.decay, 0, MAX_DECAY, 0, 255);
    stroke(0, 100, 0, 255 - fade);
    let fadeFill = arrAlphaToColor(FOOD_COLOR, 255 - fade);
    fill(fadeFill);

    // draw food
    ellipse(this.position.x, this.position.y, this.size * 10);
    pop();
  }

  // update function
  update() {
    // don't update rot if marked for deletion
    if (!this.rotten) {
      this.rot();
    }
  }

  // updates decay
  rot() {
    this.decay++;
    if (this.decay >= MAX_DECAY) {
      this.remove();
    }
  }

  // marks for deletion
  remove() {
    this.rotten = true;
  }
}

// creates starting cells
function startingCells(amount) {
  for (let i = 0; i < amount; i++) {
    x = random(0, width);
    y = random(0, height);
    cells.push(new Cell(x, y, cells.length, 0));
  }
}

function startingFood(amount) {
  for (let i = 0; i < amount; i++) {
    let x = random(0, width);
    let y = random(0, height);
    food.push(new Food(x, y, 1, food.length));
  }
}

function printArray(arr) {
  out = "[";
  for (let i = 0; i < arr.length - 1; i++) {
    out += arr[i] + ", ";
  }
  out += arr[arr.length - 1] + "]";
  return out;
}

// deletes element from array
function deleteFromArray(arr, element, index) {
  delete element;
  arr.splice(index, 1);
}

// helper function that checks for cell-food or cell-cell overlap
function checkIfEdible(a, b) {
  // calculate checkbox size
  let lookLength = a.size * 10 + EAT_DISTANCE;

  // calculate bounds
  let fXMin = b.position.x - b.size * 10;
  let fXMax = b.position.x + b.size * 10;
  let fYMin = b.position.y - b.size * 10;
  let fYMax = b.position.y + b.size * 10;

  // loop for checking x positions in checkbox
  for (
    let xL = a.position.x - lookLength;
    xL <= a.position.x + lookLength;
    xL++
  ) {
    // loop for checking y positions in checkbox
    for (
      let yL = a.position.y - lookLength;
      yL <= a.position.y + lookLength;
      yL++
    ) {
      // check if (xL,yL) is in bounds
      if (xL >= fXMin && xL <= fXMax && yL >= fYMin && yL <= fYMax) {
        // return true if in bounds
        return true;
      }
    }
  }

  // return false if not in bounds
  return false;
}

// creates starting cells in team mode for a given team
function startingCellsTeam(amount, team) {
  for (let i = 0; i < amount; i++) {
    let x = random(0, width);
    let y = random(0, height);
    cells.push(new Cell(x, y, cells.length, team));
  }
}

// sets up the simulation
function startSim() {
  startingFood(STARTING_FOOD);
  // starting cells
  if (teamMode) {
    // create teams
    for (let i = 0; i < teams; i++) {
      // create starting cells
      startingCellsTeam(STARTING_CELLS, i);
    }
  } else {
    // set default color
    teamColors.push(DEFAULT_CELL_COLOR);

    // create starting cells
    startingCells(STARTING_CELLS);
  }
  started = true;
}

// checks whether max or min food amount has been exceeded and adds or removes food accordingly
function checkFoodAmount() {
  // check if over or under food amount bounds
  if (food.length < MIN_FOOD_AMOUNT) {
    // calculate defecit
    let defecit = MIN_FOOD_AMOUNT - food.length;

    // create food instances to fill defecit
    for (let i = 0; i < defecit; i++) {
      let x = random(0, width);
      let y = random(0, height);
      food.push(new Food(x, y, 1, food.length));
    }
  } else if (food.length > MAX_FOOD_AMOUNT) {
    // calculate excess
    let excess = food.length - MAX_FOOD_AMOUNT;

    // remove oldest food instances to trim excess
    for (let i = 0; i < excess; i++) {
      food[i].remove();
    }
  }
}

// checks whether cell amount is excessive
function checkCellAmount() {
  // kill excess cells
  if (cells.length > MAX_CELL_AMOUNT) {
    // calculate excess
    let excess = cells.length - MAX_CELL_AMOUNT;

    // kill oldest cells (by overpopulation) to remove excess
    for (let i = 0; i < excess; i++) {
      cells[i].kill();
    }
  } else if (cells.length < MIN_CELL_AMOUNT) {
    // determine amount of cells to add
    let newCells = int(random(1, STARTING_CELLS + 1));
    if (DEBUG) {
      print("Spontaneously generating " + newCells + " new cells");
    }

    // add new cells (sponantoneous life via however it started)
    for (let i = 0; i < newCells; i++) {
      let team = 0;

      // set to random team if in team mode
      if (teamMode) {
        team = int(random(0, teams));
      }

      // determine random starting position
      let x = random(0, width);
      let y = random(0, height);

      // add cell
      cells.push(new Cell(x, y, cells.length, team));
    }
  }
}

// turns array into color string, including an alpha value
function arrAlphaToColor(arr, alpha) {
  return "rgba(" + arr[0] + "," + arr[1] + "," + arr[2] + "," + alpha + ")";
}

// handles menu display and interaction
function menu() {
  // background
  image(MENU_BACKGROUND,0,0);

  // rotating background cell
  push();
  translate(150, 400);
  fill(DEFAULT_CELL_COLOR);
  ellipse(0, 0, 250);
  rotate((frameCount / 6) % TWO_PI);
  fill(NUCLEUS_COLOR);
  ellipse(0, 50, 80);
  pop();

  // title
  push();
  textAlign(CENTER);
  textSize(50);
  textStyle(BOLD);
  stroke(255);
  text("CELLS", width / 2, height / 4);
  pop();

  // menus
  if (currentMenu == 0) {
    // title screen
    menu0();
  } else if (currentMenu == 1) {
    // teams menu
    menu1();
  }
}

// title screen interaction
function menu0Interaction() {
  // check if mouse has been pressed
  if (mouseIsPressed) {
    // check if any buttons has been pressed
    if (mouseHovering(width / 2, height / 2 - 55, 100, 50)) {
      // start simulation immediately if solo mode is chosen
      startSim();
    } else if (mouseHovering(width / 2, height / 2 + 45, 100, 50)) {
      // set to team mode
      teamMode = true;

      // go to teams menu
      currentMenu++;
    }
  }
}

// returns whether the mouse is hovering over a particular region
function mouseHovering(centerX, centerY, width, height) {
  // determine bounds
  let minX = centerX - width / 2;
  let maxX = centerX + width / 2;
  let minY = centerY - height / 2;
  let maxY = centerY + height / 2;

  // return check result
  return mouseX >= minX && mouseX <= maxX && mouseY >= minY && mouseY <= maxY;
}

// teams menu interaction
function menu1Interaction() {
  // check if mouse has been pressed
  if (mouseIsPressed) {
    // check if any buttons have been pressed
    if (mouseHovering(width - width / 3, height / 2 - 50, 100, 50)) {
      // randomly generate team colors
      for (let i = 0; i < teams; i++) {
        teamColors.push(randomColor());
      }

      // start sim
      startSim();
    } else if (
      mouseHovering(width / 4 + 55, height / 2.5, 50, 50) &&
      teams < MAX_TEAMS
    ) {
      // increase no. of teams
      teams++;
    } else if (
      mouseHovering(width / 4 - 55, height / 2.5, 50, 50) &&
      teams > MIN_TEAMS
    ) {
      // decrease no. of teams
      teams--;
    } else if (mouseHovering(width - width / 3, height / 2 + 50, 100, 50)) {
      // disable team mode
      teamMode = false;

      // go back to title
      currentMenu = 0;
    }
  }
}

// returns a random color
function randomColor() {
  return (
    "rgb(" +
    int(random(0, 256)) +
    "," +
    int(random(0, 256)) +
    "," +
    int(random(0, 256)) +
    ")"
  );
}

// draws background vertical gradient for simulation
function backgroundGradient() {
  // loop
  for (let i = 0; i <= height; i++) {
    // determine color
    let inter = map(i, 0, height, 0, 1);
    let c = lerpColor(SIM_BG_1, SIM_BG_2, inter);

    // draw line of color
    stroke(c);
    line(0, i, width, i);
  }
}

// title screen
function menu0() {
  // menu text alingment
  push();
  textAlign(CENTER);

  // options
  push();
  textSize(20);
  push();
  rectMode(CENTER);

  // upper button
  if (mouseHovering(width / 2, height / 2 - 55, 100, 50)) {
    fill(HOVERING_FILL);
  } else {
    fill(BUTTON_FILL);
  }
  rect(width / 2, height / 2 - 55, 100, 50);

  // lower button
  if (mouseHovering(width / 2, height / 2 + 45, 100, 50)) {
    fill(HOVERING_FILL);
  } else {
    fill(BUTTON_FILL);
  }
  rect(width / 2, height / 2 + 45, 100, 50);
  pop();

  // button text
  text("Solo", width / 2, height / 2 - 50);
  text("Teams", width / 2, height / 2 + 50);
  pop();
  pop();

  // menu interaction
  menu0Interaction();
}

// teams menu
function menu1() {
  // menu text alingment
  push();
  textAlign(CENTER);

  // team amount header
  push();
  textSize(24);
  text("No. of teams", width / 4, height / 3);
  pop();

  // team amount display
  push();
  // boxes/buttons
  rectMode(CENTER);

  // main box
  fill(BUTTON_FILL);
  rect(width / 4, height / 2.5, 60, 50);

  // increase button
  if (mouseHovering(width / 4 + 55, height / 2.5, 50, 50)) {
    fill(HOVERING_FILL);
  } else {
    fill(BUTTON_FILL);
  }
  rect(width / 4 + 55, height / 2.5, 50, 50);

  // decrease button
  if (mouseHovering(width / 4 - 55, height / 2.5, 50, 50)) {
    fill(HOVERING_FILL);
  } else {
    fill(BUTTON_FILL);
  }
  rect(width / 4 - 55, height / 2.5, 50, 50);
  pop();

  // text
  push();
  textSize(20);

  // team amount
  text("" + teams, width / 4, height / 2.5 + 7.5);

  // plus & minus
  text("+", width / 4 + 55, height / 2.5 + 5);
  text("-", width / 4 - 55, height / 2.5 + 5);
  pop();

  // state change buttons
  push();
  rectMode(CENTER);

  // start button
  if (mouseHovering(width - width / 3, height / 2 - 50, 100, 50)) {
    fill(HOVERING_FILL);
  } else {
    fill(BUTTON_FILL);
  }
  rect(width - width / 3, height / 2 - 50, 100, 50);

  // back button
  if (mouseHovering(width - width / 3, height / 2 + 50, 100, 50)) {
    fill(HOVERING_FILL);
  } else {
    fill(BUTTON_FILL);
  }
  rect(width - width / 3, height / 2 + 50, 100, 50);
  pop();

  // text
  push();
  textSize(20);

  // start text
  text("Start", width - width / 3, height / 2 - 45);

  // back text
  text("Back", width - width / 3, height / 2 + 55);
  pop();
  pop();

  // menu interaction
  menu1Interaction();
}
