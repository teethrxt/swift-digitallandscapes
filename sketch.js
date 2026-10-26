// this is my swift digital landscapes project :) i really wanted to think about swifts and how they stay in chimmenys and in flight for most of thier life and just make some fun stuff for the background in ms paint! 
//it also kinda eludes to the fact that they are endangered, they have so much to go through now to even migrate, theres loss of hisotrical chimmenys, capped metal flutes, and window collsions :( 
// Zach Rashid Art 151 10/26/2026 


let swift, sky, mic;
let trail = [];
let soundLevel = 0;
let birdX, birdY;
let hueVal = 0;
let micOn = false;

function preload() {
  // ADD THESE FILES WHEN UR DONE W THEM
  swift = loadImage("swift.gif");
  sky = loadImage("skyzone.gif");
}

function setup() {
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

function draw() {
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

  // lerp the bird towards the target + some mouse offset 
  birdX = lerp(birdX, flightX + (mouseX - width / 2) * 0.3, speed);
  birdY = lerp(birdY, flightY + (mouseY - height / 2) * 0.3, speed);

  //  TRAIL GENERATION inspired by nyan catt
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

  // draw the little trail blocks
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

  // left over fill statement from somewhere else, leaving it just in case
  fill(0, 0, 100);
}

// Press 'c' to clear the canvas trail if it gets too messy
function keyPressed() {
  if (key === "c" || key === "C") {
    trail = [];
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}