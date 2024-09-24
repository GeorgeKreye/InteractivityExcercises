/* 
This drawing attempts to replicate one of the flowers in a planter my family owns. I chose it because I thought it would be an interesting
way to use negative space since its petals are not easily represented. It also uses a lot more shapes than required. While this obviously
resulted in more work for myself and I could not produce a 1:1 match to my image, I believe it to be an impressive final product regardless.

Run here: https://editor.p5js.org/geokreye/sketches/GN_JiIkoY
*/
function setup() {
  createCanvas(600, 600);
}

function draw() {
  background(220);
  drawStem();
  drawFlower();
}

// Draws the flower stem
function drawStem() {
  fill(0,230,0);
  stroke(0,200,0);
  strokeWeight(3);
  arc(350,455,300,300,-PI/2,0);
  fill(220);
  arc(350,455,280,280,-PI/2,0);
}

// Draws the flower (petals and center)
function drawFlower() {
  
  // Center back
  fill(255, 255, 0);
  stroke(255, 255, 0);
  strokeWeight(1);
  ellipse(320, 300, 90, 60);
  
  // Petal 1
  stroke(255, 100, 255);
  strokeWeight(3);
  fill(255, 150, 255);
  ellipse(290, 250, 20, 150);
  arc(300, 250, 60, 100, (3 * PI) / 2 - 0.05, PI / 2);
  stroke(255, 150, 255);
  strokeWeight(3);
  fill(250,150,255);
  ellipse(300, 250, 30, 40);
  
  // Petal 2
  stroke(255,100,255);
  ellipse(250,270,70,60);
  stroke(255,150,255);
  ellipse(218,277,10,10);
  fill(220);
  stroke(255,100,255);
  arc(205,255,30,50,0,PI/2+0.2);
  arc(205,305,50,50,-PI/2,0);
  
  // Petal 3
  stroke(255,100,255);
  fill(255,150,255);
  ellipse(250, 320, 100, 60);
  ellipse(240,330,90,70);
  stroke(255, 150, 255);
  noFill();
  strokeWeight(4);
  arc(240,330,90,70,-2*PI/3,0);
  fill(255,150,255);
  ellipse(220,370,40,40);
  fill(220);
  noStroke();
  arc(190,375,50,60,-PI/2+0.5,0.4);
  arc(260,381,90,40,PI+0.1,-0.5);
  arc(220,381,45,45,-0.9,PI+0.9);
  arc(220,385,10,20,-PI,0);
  noFill();
  stroke(255,100,255);
  strokeWeight(3);
  arc(190,375,50,60,-PI/2+0.5,0.4);
  arc(260,381,90,40,PI+0.1,-0.5);
  
  
  // Petal 4
  fill(255,150,255);
  stroke(255, 100, 255);
  arc(350, 300, 100, 100, PI, (3 * PI) / 2 + 1);
  fill(220);
  arc(375, 300, 80, 60, PI, (7 * PI) / 4 - 0.2);
  stroke(255, 100, 255);
  fill(255, 150, 255);
  ellipse(310, 300, 50, 45);
  stroke(255, 150, 255);
  arc(310, 290, 46, 40, -PI / 4, PI / 2);
  
  // Petal 5
  stroke(255, 100, 255);
  ellipse(310, 350, 60, 80);
  ellipse(300, 350, 80, 50);
  noStroke();
  ellipse(310, 350, 57, 77);
  fill(220);
  ellipse(335,350,30,80);
  ellipse(300,397,60,50);
  noFill();
  stroke(255,100,255);
  arc(335, 350, 30, 80, PI / 2+0.25, (3 * PI) / 2-0.1);
  arc(300,397,60,50,-3*PI/4+0.25,-PI/4+0.3);
  
  // Center back correction
  fill(255, 255, 0);
  stroke(255, 255, 0);
  strokeWeight(1);
  arc(320, 300, 90, 60, -PI / 5, PI/2-0.1);
  
  // Petal 4 & 5 corrections
  noFill();
  stroke(255, 100, 255);
  strokeWeight(3);
  arc(375, 300, 80, 60, PI, (7 * PI) / 4 - 0.2);
  arc(335, 350, 30, 80, PI / 2+0.25, (3 * PI) / 2-0.1);
  fill(255, 150, 255);
  ellipse(310, 300, 50, 45);
  stroke(255, 150, 255);
  arc(310, 290, 46, 40, -PI / 4, PI / 2);
  ellipse(325,290,20);
  stroke(255, 100, 255);
  noFill();
  arc(375, 300, 80, 60, PI, (7 * PI) / 4 - 0.2);
  
  // Center front
  fill(255,150,255);
  ellipse(300, 300, 50, 60);
  fill(255, 255, 0);
  ellipse(305,300,50,60);
  strokeWeight(4);
  noFill();
  arc(300,300,50,60,PI/2-0.1,3*PI/2+0.1);
  arc(305,300,50,60,-PI/2,PI/2);
}
