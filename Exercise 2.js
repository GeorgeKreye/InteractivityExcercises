// USE CHROME BROWSER
// Microphone input is not working in Safari or Firefox.

/*
This Is Just To Say
by William Carlos Williams

  I have eaten
the plums
that were in
the icebox

and which
you were probably
saving
for breakfast

Forgive me
they were delicious
so sweet
and so cold
*/

/* 
The concept of this was to make an avatar that is a plum as is described in the poem I selected, and making the animation be like taking a bite out of it.
The goal was to create a minimalistic mask that looked like a plum yet used few shapes to achieve the look. I found making the 'bite' animation map well to my voice to be difficult,
since it was hard to judge the exact values I would need for the arcs to look correct. 

Run here: https://editor.p5js.org/geokreye/sketches/Wdgx3c9Bv
*/

let mic;
let vol = 0;

function setup() {
  createCanvas(600, 600);

  // create and start audio input
  mic = new p5.AudioIn();
  mic.start();
}

function draw() {
  background(200);

  // get the overall volume (between 0 and 1.0)
  let v = mic.getLevel();
  // "smooth" the volume variable with an easing function
  vol += (v - vol) / 3;

  // START DRAWING HERE
  strokeWeight(3);
  stroke(70, 0, 100);
  fill(100, 0, 155);
  ellipse(width / 2, height / 2, 400, 400);
  noStroke();
  fill(90, 0, 135);
  ellipse(width / 2 - 10, height / 2 - 175, 110, 50);
  noFill();
  stroke(90, 0, 135);
  strokeWeight(10);
  arc(width / 2, height / 2, 395, 395, PI / 4, (5 * PI) / 4);
  stroke(70, 0, 100);
  strokeWeight(8);
  arc(width / 2, height / 2, 100, 400, PI / 2 + 0.3, (3 * PI) / 2 - 0.04);
  strokeWeight(8);
  stroke(215, 215, 150);
  arc(width / 2 - 20, height / 2 - 200, 20, 100, -PI / 2.2, 0);
  noStroke();
  fill(200, 100, 200);
  ellipse(width / 2 + 60, height / 2 - 50, 50, 100);

  // draw an ellipse with width (0-300)
  // based on volume (0-1)
  let d = map(vol, 0.0, 1.0, 0, 300);

  // change arc length based on volume (close approx. to width change's effect on circumfrence)
  let l = map(vol, 0.0, 1.0, PI / 2, PI / 6);

  // bite negative space
  fill(200);
  noStroke();
  ellipse(width / 2 - 145, height / 2 - 145, d, d);
  ellipse(
    width / 2 - 145 - d * 0.5,
    height / 2 - 145 + d * 0.5,
    d * 0.8,
    d * 0.8
  );
  ellipse(
    width / 2 - 145 + d * 0.5,
    height / 2 - 145 - d * 0.5,
    d * 0.8,
    d * 0.8
  );

  // bite inside
  stroke(255, 210, 30, d * 10);
  strokeWeight(5);
  arc(width / 2 - 145, height / 2 - 145, d, d, -0.2, PI / 2 + 0.2);
  arc(
    width / 2 - 145 - d * 0.5,
    height / 2 - 145 + d * 0.5,
    d * 0.8,
    d * 0.8,
    0,
    l
  );
  arc(
    width / 2 - 145 + d * 0.5,
    height / 2 - 145 - d * 0.5,
    d * 0.8,
    d * 0.8,
    PI / 2 - l,
    PI / 2
  );
}
