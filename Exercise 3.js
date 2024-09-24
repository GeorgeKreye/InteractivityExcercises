/*
The general theme of this drawing application is simplicity. The one-button (only left click required) functionality is simplistic
(with the bonus of making it guaranteed to be usable on any computer so long as it has some means of clicking), and the minimalism of the UI and tools ensures simplicity.
However, I also included a 'wacky' brush that doesn't follow this philosophy, changing size and hue on different cycles and not being in the control of the user aside of where it is drawn.

Run here: https://editor.p5js.org/geokreye/sketches/YkfqjXCqj
*/

// constants
let MIN_SIZE = 0.5;
let MAX_SIZE = 50;

// variables
let previousMouseX = 0;
let previousMouseY = 0;
let mode = 0;
let brushSize = 10;
let hue = 0;
let sat = 0;
let bri = 0;
let brushMode = 0;
let wackyHue = 0;
let canChangeMode = true;
let canChangeBrushMode = true;
let wackySize = MIN_SIZE;
let wackySizeReverse = false;

function setup() {
  // canvas
  createCanvas(800, 800);

  // modes
  colorMode(HSB);
  rectMode(CENTER);

  // background
  background(100);
}

function draw() {
  // clear
  if (keyIsDown(ESCAPE)) {
    background(100);
  }

  // brush tool
  if (mouseIsPressed && mouseY > 100) {
    if (mode == 0) {
      // endpoint
      fill(hue, sat, bri);
      noStroke();
      if (brushMode == 0 || brushMode == 1) {
        ellipse(mouseX, mouseY, brushSize);
      } else if (brushMode == 2) {
        rect(mouseX, mouseY, brushSize);
      } else if (brushMode == 3) {
        wackyXSpread = mouseX;
        wackyYSpread = mouseY;
        fill(wackyHue, 100, 100);
        rect(wackyXSpread, wackyYSpread, wackySize);
      }

      // line connecting previous position and endpoint (continous mode)
      if (brushMode == 0) {
        strokeWeight(brushSize);
        stroke(hue, sat, bri);
        line(previousMouseX, previousMouseY, mouseX, mouseY);
      } else if (brushMode == 3) {
        strokeWeight(wackySize / 2);
        stroke(wackyHue, 100, 100);
        line(previousMouseX, previousMouseY, mouseX, mouseY);
        wackyHue = (wackyHue + 1) % 360;
        if (!wackySizeReverse) {
          wackySize = map(wackyHue, 0, 359, MIN_SIZE, MAX_SIZE);
          if (wackySize == MAX_SIZE) {
            wackySizeReverse = true;
          }
        } else {
          wackySize = map(wackyHue, 0, 359, MAX_SIZE, MIN_SIZE);
          if (wackySize == MIN_SIZE) {
            wackySizeReverse = false;
          }
        }
      }
    } else if (mode == 1) {
      // erase tool
      noStroke();
      fill(100);
      ellipse(mouseX, mouseY, brushSize);
      strokeWeight(brushSize);
      stroke(100);
      line(previousMouseX, previousMouseY, mouseX, mouseY);
    }
  }

  // UI
  rectMode(CORNERS);
  fill("white");
  stroke("black");
  strokeWeight(3);
  rect(0, 0, 100, 100);
  rect(100, 0, 800, 100);
  rect(200, 0, 800, 100);
  rect(540, 0, 800, 100);
  rect(710, 0, 800, 50);
  rect(710, 50, 800, 100);
  rectMode(CENTER);

  // UI text
  if (brushMode == 3) {
  sizePercent = (1 / (MAX_SIZE/wackySize)) * 100;
} else {
  sizePercent = (1 / (MAX_SIZE / brushSize)) * 100;
}
  textSize(12);
  if (mode == 0 && brushMode == 3) {
    text(
      "Hue: " +
        wackyHue +
        "\nSat: " +
        sat +
        "\nBri: " +
        bri +
        "\nSize: " +
        sizePercent,
      550,
      30
    );
  } else {
    text(
      "Hue: " +
        hue +
        "\nSat: " +
        sat +
        "\nBri: " +
        bri +
        "\nSize: " +
        sizePercent,
      550,
      30
    );
  }

  // tool display
  if (mode == 0) {
    // current brush
    if (brushMode == 0) {
      strokeWeight(brushSize);
      stroke(hue, sat, bri);
      line(25, 50, 75, 50);
    } else if (brushMode == 3) {
      strokeWeight(wackySize / 2);
      stroke(wackyHue, 100, 100);
      line(25, 50, 75, 50);
      fill(wackyHue, 100, 100);
      noStroke();
      rect(25, 50, wackySize);
      rect(75, 50, wackySize);
    } else {
      fill(hue, sat, bri);
      noStroke();
      if (brushMode == 1) {
        ellipse(50, 50, brushSize);
      } else if (brushMode == 2) {
        rect(50, 50, brushSize);
      }
    }
  } else if (mode == 1) {
    fill(100);
    strokeWeight(3);
    stroke(0);
    ellipse(50, 50, brushSize);
  }

  // controls
  if (mode == 0) {
    if (brushMode != 3) {
      // HSB bars
      rectMode(CORNERS);
      noFill();
      stroke(0);
      strokeWeight(3);
      fill(255);
      // HSB bars - border
      rect(210, 20, 530, 80);
      // HSB bars - gradients
      strokeWeight(1);
      for (let i = 0; i < 360; i++) {
        // hue
        a = map(i, 0, 360, 210, 530);
        b = map(i + 1, 0, 360, 210, 530);
        fill(i, sat, bri);
        stroke(i, sat, bri);
        rect(a, 20, b, 40);
      }
      for (let i = 0; i < 100; i++) {
        // sat
        a = map(i, 0, 100, 210, 530);
        b = map(i + 1, 0, 100, 210, 530);
        fill(hue, i, bri);
        stroke(hue, i, bri);
        rect(a, 40, b, 60);
      }
      for (let i = 0; i < 100; i++) {
        // bri
        a = map(i, 0, 100, 210, 530);
        b = map(i + 1, 0, 100, 210, 530);
        fill(hue, sat, i);
        stroke(hue, sat, i);
        rect(a, 60, b, 80);
      }

      //HSB bars - current
      stroke(0);
      strokeWeight(3);
      fill(255);
      hX = map(hue, 0, 360, 210, 530); // hue
      rect(hX - 5, 20, hX + 5, 40);
      sX = map(sat, 0, 100, 210, 530); // sat
      rect(sX - 5, 40, sX + 5, 60);
      bX = map(bri, 0, 100, 210, 530); // bri
      rect(bX - 5, 60, bX + 5, 80);
      rectMode(CENTER);

      // HSB controls
      if (mouseX >= 210 && mouseX <= 530) {
        // hue
        if (mouseIsPressed && mouseY >= 20 && mouseY <= 40) {
          hue = map(mouseX, 210, 530, 0, 360);
        }
        // sat
        if (mouseIsPressed && mouseY > 40 && mouseY <= 60) {
          sat = map(mouseX, 210, 530, 0, 100);
        }
        // bri
        if (mouseIsPressed && mouseY > 60 && mouseY <= 80) {
          bri = map(mouseX, 210, 530, 0, 100);
        }
      }
    } else {
      rectMode(CORNERS);
      // hue bar - border
      strokeWeight(3);
      fill(255);
      stroke(0);
      rect(210, 20, 530, 80);

      // hue bar - gradient
      strokeWeight(1);
      for (let i = 0; i < 360; i++) {
        a = map(i, 0, 360, 210, 530);
        b = map(i + 1, 0, 360, 210, 530);
        fill(i, 100, 100);
        stroke(i, 100, 100);
        rect(a, 20, b, 80);
      }

      // hue bar - current
      strokeWeight(3);
      stroke(0);
      fill(255);
      hX = map(wackyHue, 0, 360, 210, 530);
      rect(hX - 5, 20, hX + 5, 80);
      rectMode(CENTER);
    }
  } else if (mode == 1) {
    // Eraser bar
    rectMode(CORNERS);
    rect(210, 20, 530, 80);
    rectMode(CENTER);
  }

  // size controls
  strokeWeight(3);
  // BG
  triangle(150, 80, 150 - MAX_SIZE / 2, 20, 150 + MAX_SIZE / 2, 20);
  // current
  if (mode == 0 && brushMode == 3) {
    sY = map(wackySize, MIN_SIZE, MAX_SIZE, 80, 20);
  } else {
    sY = map(brushSize, MIN_SIZE, MAX_SIZE, 80, 20);
  }
  strokeWeight(5);
  line(120, sY, 180, sY);
  // control
  if (mouseX >= 120 && mouseX <= 180) {
    if (mouseIsPressed && mouseY >= 20 && mouseY <= 80) {
      brushSize = map(mouseY, 20, 80, MAX_SIZE, MIN_SIZE);
    }
  }

  // mode controls
  if (mouseX >= 710 && mouseX <= 800) {
    rectMode(CORNERS);
    stroke(0);
    strokeWeight(3);
    fill(100, 50, 100);
    if (mouseY <= 50) {
      // mode
      rect(710, 0, 800, 50);
      if (mouseIsPressed && canChangeMode) {
        mode = (mode + 1) % 2;
        canChangeMode = false;
      }
      canChangeBrushMode = true;
    } else if (mouseY > 50 && mouseY <= 100) {
      if (mode == 0) {
        // brush mode
        rect(710, 50, 800, 100);
        if (mouseIsPressed && canChangeBrushMode) {
          brushMode = (brushMode + 1) % 4;
          canChangeBrushMode = false;
        }
      } else {
        // show that button is inactive
        fill(0, 50, 100);
        rect(710, 50, 800, 100);
      }
      canChangeMode = true;
    } else {
      canChangeMode = true;
      canChangeBrushMode = true;
    }
    rectMode(CENTER);
  } else {
    canChangeMode = true;
    canChangeBrushMode = true;
  }

  // mode control text
  strokeWeight(1);
  fill(0);
  textSize(20);
  textAlign(CENTER);
  text("MODE", 755, 30);
  text("BRUSH", 755, 80);
  textAlign(LEFT);

  // update previous mouse position
  previousMouseX = mouseX;
  previousMouseY = mouseY;
}
