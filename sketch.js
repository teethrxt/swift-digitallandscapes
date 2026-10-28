// this is my swift digital landscapes project :) i really wanted to think about swifts and how they stay in chimmenys and in flight for most of thier life and just make some fun stuff for the background in ms paint! 
//it also kinda eludes to the fact that they are endangered, they have so much to go through now to even migrate, theres loss of hisotrical chimmenys, capped metal flutes, and window collsions :( 
// i didnt realize i needed to add controller support for this, so i kept in the mouse stuff too so u can still influence the swift with ur mouse and use arrow keys + controller
// Zach Rashid Art 151 10/26/2026 

let controller;
let swift, sky, mic;
let trail = [];
let soundLevel = 0;
let birdX, birdY;
let hueVal = 0;
let micOn = false;

function preload () {
  // ADD THESE FILES WHEN UR DONE W THEM
  swift = loadImage("swift.gif");
  sky = loadImage("skyzone.gif");
}

function setup () {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 255);
  imageMode(CENTER);

  // start in middle of the screen
  birdX = width / 2;
  birdY = height / 2;

  // Button to make things happen (i love buttons)
  let startBtn = createButton("FLY");
  startBtn.position(20, 20);

  mic = new p5.AudioIn();

  startBtn.mousePressed(() => {
    userStartAudio();

    if (micOn) {
      micOn = false;
      mic.stop();
      startBtn.html("FLY");
    } else {
      mic.start();
      micOn = true;
      startBtn.html("FLYING"); // #mic and #button who up starting they button
    }
  });
}

function draw () {
  background(0);

  // grab audio level if mic is turned on
  if (micOn) {
    soundLevel = mic.getLevel();
  }

  // louding it up a bit so its LOUD and EXPLODES
  let loudness = constrain(soundLevel * 50, 0, 1);

  // background sky fade reacting to sound 
  push();
  let alpha = map(loudness, 0, 1, 210, 45);
  alpha += sin(frameCount * 0.03) * 20;
  tint(0, 0, 100, alpha);
  image(sky, width / 2, height / 2, width, height);
  pop();

  let speed = 0.02 + loudness * 0.10;

  // flight math - circular path mixed with loudness
  let flightX = width / 2 + sin(frameCount * speed) * width * 0.35;
  let flightY = height / 2 + cos(frameCount * speed) * height * 0.3;

  // this was so lerp the bird towards the target + some mouse offset the formula i used was A + (B-A) * speed A is the swift and B is the target postion
  // i looked up gradual motion for P5 and used https://www.geeksforgeeks.org/javascript/p5-js-lerp-function/ and https://p5js.org/reference/p5/lerp/
  birdX = lerp(birdX, flightX + (mouseX - width / 2) * 0.3, speed);
  birdY = lerp(birdY, flightY + (mouseY - height / 2) * 0.3, speed);

  // Controller handles movement too
  controller = navigator.getGamepads ?
    navigator.getGamepads()[0] :
    null;

  let moveX = 0;
  let moveY = 0;

  // Keyboard movement backup
  if (keyIsDown(LEFT_ARROW)) moveX -= 1;
  if (keyIsDown(RIGHT_ARROW)) moveX += 1;
  if (keyIsDown(UP_ARROW)) moveY -= 1;
  if (keyIsDown(DOWN_ARROW)) moveY += 1;

  // Controller left joystick
  if (controller) {
    if (Math.abs(controller.axes[0]) > 0.15) {
      moveX += controller.axes[0];
    }
    if (Math.abs(controller.axes[1]) > 0.15) {
      moveY += controller.axes[1];
    }
  }

  // Move the swift
  birdX += moveX * 5;
  birdY += moveY * 5;
// constrain to keep swift in the canvaas https://p5js.org/reference/p5/constrain/
  birdX = constrain(birdX, 0, width);
  birdY = constrain(birdY, 0, height);

  //  TRAIL GENERATION inspired by nyan catt
  //I used an array to store little particles that appear around the swift. I used random numbers to spread them out, and draw each one as a small square. The colors cycle through different hues, and the amount of particles changes depending on the sound level and mouse movement. I also snapped their positions to a 6-pixel grid to give the trail a pixel lookk that contarsts from the more neautral colors in the back
  let movement = dist(mouseX, mouseY, pmouseX, pmouseY);
  let amount = 1 + floor(loudness * 40) + floor(constrain(movement / 10, 0, 4));

  for (let i = 0; i < amount; i++) {
    let spread = 20 + loudness * 350;

    trail.push({
      x: birdX + random(-spread, spread),
      y: birdY + random(-spread, spread),
      hue: hueVal
    });

    hueVal = (hueVal + 4) % 360;
  }

  // keep array from getting too huge cus my computer was struggling
  if (trail.length > 500) {
    trail.splice(0, 10);
  }

  // draw the trail, used https://editor.p5js.org/_annalena/sketches/hnf8OGD_J as reference 
  for (let i = 0; i < trail.length; i++) {
    let p = trail[i];
    push();
    fill(p.hue, 90, 100);
    noStroke();
    // snapping to a grid for da pixel look
    rect(round(p.x / 6) * 6, round(p.y / 6) * 6, 6, 6);
    pop();
  }

  // draw the bird on top
  push();
  image(swift, birdX, birdY, 110, 75);
  pop();

}

// Press 'c' to clear the canvas trail if it gets too messy
function keyPressed () {
  if (key === "c" || key === "C") {
    trail = [];
  }
}

function windowResized () {
  resizeCanvas(windowWidth, windowHeight);
}