// this is my swift digital landscapes project :) i really wanted to think about swifts and how they stay in chimmenys and in flight for most of thier life and just make some fun stuff for the background in ms paint!
//it also kinda eludes to the fact that they are endangered, they have so much to go through now to even migrate, theres loss of hisotrical chimmenys, capped metal flutes, and window collsions :(
// i didnt realize i needed to add controller support for this, so i kept in the mouse stuff too so u can still influence the swift with ur mouse and use arrow keys + controller

//REVISIONS
//swift can be moved using the left joystick on the controller or the arrow keys on the keyboard. Pressing A (spacebar) generates more pixels, B (C key) clears the pixel trail, X (V key) increases the spread of the pixels, and Y (M key) pauses or resumes the background music. The FLY button activates the microphone and starts the music. Mouse movement also influences the swift's flight path and particle density, while louder sounds increase the swift's speed, the amount and spread of pixels, and change the background's opacity. Multiple buttons can be held at the same time
// Zach Rashid Art 151 10/26/2026

let controller;
let swift, sky, mic, music;
let trail = [];
let soundLevel = 0;
let birdX, birdY;
let hueVal = 0;
let micOn = false;

// keeps track of whether the music button was already pressed
let musicPressed = false;

function preload () {
  swift = loadImage("swift.gif");
  sky = loadImage("skyzone.gif");

  // music source: https://www.youtube.com/watch?v=pEmtXsW2bD8
  music = loadSound("music.mp3");
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

  // controls how loud the background music is
  music.setVolume(0.4);

  startBtn.mousePressed(() => {
    userStartAudio();

    if (micOn) {
      micOn = false;
      mic.stop();
      soundLevel = 0;
      music.pause();
      startBtn.html("FLY");
    } else {
      mic.start();
      micOn = true;

      if (!music.isPlaying()) {
        music.loop();
      }

      startBtn.html("FLYING"); 
      // #mic and #button who up starting they button
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

  // this was so lerp the bird towards the target + some mouse offset
  // the formula i used was A + (B-A) * speed
  // A is the swift and B is the target position
  // https://www.geeksforgeeks.org/javascript/p5-js-lerp-function/
  // https://p5js.org/reference/p5/lerp/

  birdX = lerp(birdX, flightX + (mouseX - width / 2) * 0.3, speed);
  birdY = lerp(birdY, flightY + (mouseY - height / 2) * 0.3, speed);

  // Controller handles movement too
  controller = navigator.getGamepads ?
    navigator.getGamepads()[0] :
    null;

  let moveX = 0;
  let moveY = 0;

  // extra variables to control the pixels
  let extraPixels = 0;
  let extraSpread = 0;
  let clearTrail = false;

  // Keyboard movement backup
  if (keyIsDown(LEFT_ARROW)) moveX -= 1;
  if (keyIsDown(RIGHT_ARROW)) moveX += 1;
  if (keyIsDown(UP_ARROW)) moveY -= 1;
  if (keyIsDown(DOWN_ARROW)) moveY += 1;

  // keyboard backup for the new particle controls
  if (keyIsDown(32)) extraPixels = 40; // spacebar
  if (keyIsDown(86)) extraSpread = 300; // V

  if (controller) {

    // Controller left joystick
    if (Math.abs(controller.axes[0]) > 0.15) {
      moveX += controller.axes[0];
    }

    if (Math.abs(controller.axes[1]) > 0.15) {
      moveY += controller.axes[1];
    }

    // A or cross button
    // adds a bunch of extra pixels while holding it down
    if (controller.buttons[0].pressed) {
      extraPixels = 40;
    }

    // B or circle button
    // clears all the pixels from the array
    if (controller.buttons[1].pressed) {
      trail = [];
      clearTrail = true;
    }

    // X or square button
    // makes the pixels spread further away from the bird
    if (controller.buttons[2].pressed) {
      extraSpread = 300;
    }

    // Y or triangle button
    // pauses or resumes the background music
    if (controller.buttons[3].pressed && !musicPressed) {

      if (music.isPlaying()) {
        music.pause();
      } else {
        music.loop();
      }
    }

    // remembers if the button is being held down
    // so the music doesnt keep turning on and off every frame
    musicPressed = controller.buttons[3].pressed;

  } else {
    musicPressed = false;
  }

  // Move the swift
  birdX += moveX * 5;
  birdY += moveY * 5;

  // constrain to keep swift in the canvas
  // https://p5js.org/reference/p5/constrain/
  birdX = constrain(birdX, 0, width);
  birdY = constrain(birdY, 0, height);

  // TRAIL GENERATION inspired by nyan catt
  // I used an array to store little particles that appear around the swift.
  // I used random numbers to spread them out, and draw each one as a small square.
  // The colors cycle through different hues, and the amount of particles
  // changes depending on the sound level and mouse movement.
  // I also snapped their positions to a 6-pixel grid to give the trail
  // a pixel lookk that contrasts from the more neutral colors in the back

  let movement = dist(mouseX, mouseY, pmouseX, pmouseY);

  // added extraPixels so i can control the amount with the controller too
  let amount = 1 + floor(loudness * 40)
    + floor(constrain(movement / 10, 0, 4))
    + extraPixels;

  // dont make new pixels while the clear button is being held
  if (!clearTrail) {

    for (let i = 0; i < amount; i++) {

      // extraSpread lets me control how far the pixels travel
      let spread = 20 + loudness * 350 + extraSpread;

      trail.push({
        x: birdX + random(-spread, spread),
        y: birdY + random(-spread, spread),
        hue: hueVal
      });

      hueVal = (hueVal + 4) % 360;
    }
  }

  // keep array from getting too huge cus my computer was struggling
  // changed the limit so more pixels can stay on screen
  if (trail.length > 1500) {
    trail.splice(0, trail.length - 1500);
  }

  // draw the trail
  // used https://editor.p5js.org/_annalena/sketches/hnf8OGD_J as reference

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

// keyboard controls
function keyPressed () {

  // press C to clear the canvas trail if it gets too messy
  if (key === "c" || key === "C") {
    trail = [];
  }

  // press M to pause or resume music
  if (key === "m" || key === "M") {
    userStartAudio();

    if (music.isPlaying()) {
      music.pause();
    } else {
      music.loop();
    }
  }
}

function windowResized () {
  resizeCanvas(windowWidth, windowHeight);
}