let img;
let cnv;
let maxInterval = 60; // Time for maximum abstraction
let startTime;
let colInterval = 0.5;
let rowInterval = 0.5;
let size = 0.5; // Size for stroke weight, ellipse, or text
let mode = ""; // Default mode, show the orginal img
let isLooping = true; // Variable to track the loop state
let slider;
let sliderActive = false; // Flag to indicate if the slider can be moved
let buttonClickSound;
let bgm;

function preload() {
  img = loadImage("Memory.jpg"); // Preload the image
  buttonClickSound = loadSound("ButtonClickSound.MP3");
  bgm = loadSound("BGM.MP3");
}

function setup() {
  cnv = createCanvas(img.width, img.height);
  let newCanvasX = (windowWidth - img.width) / 2;
  let newCanvasY = (windowHeight - img.height) / 2;
  cnv.position(newCanvasX, newCanvasY);

  // Initialize startTime
  startTime = millis();

  // Create and set up buttons
  let curveButton = createButton("Curve");
  curveButton.position(
    (windowWidth - img.width - 10) / 2,
    (windowHeight - img.height - 120) / 2
  );
  curveButton.size(150, 40); // Width and height
  curveButton.mousePressed(() => {
    changeMode("Curve");
    buttonClickSound.play();
    if (!bgm.isPlaying()) {
      bgm.play();
    }
  });

  let polkaDotButton = createButton("Polka Dot");
  polkaDotButton.position(
    (windowWidth - img.width + 430) / 2,
    (windowHeight - img.height - 120) / 2
  );
  polkaDotButton.size(150, 40); // Width and height
  polkaDotButton.mousePressed(() => {
    changeMode("Polka Dot");
    buttonClickSound.play();
    if (!bgm.isPlaying()) {
      bgm.play();
    }
  });

  let nameButton = createButton("Name");
  nameButton.position(
    (windowWidth - img.width + 870) / 2,
    (windowHeight - img.height - 120) / 2
  );
  nameButton.size(150, 40); // Width and height
  nameButton.mousePressed(() => {
    changeMode("Name");
    buttonClickSound.play();
    if (!bgm.isPlaying()) {
      bgm.play();
    }
  });

  // Create a Reset button
  let resetButton = createButton("Reset");
  resetButton.position(
    (windowWidth - img.width + 670) / 2,
    (windowHeight - img.height + 950) / 2
  ); // Adjust the position as needed
  resetButton.size(250, 40); // Width and height
  resetButton.mousePressed(() => {
    resetMode();
    buttonClickSound.play();
    bgm.stop(); // Stop the music and reset to the start position
  });

  // Create a Download button
  let downloadButton = createButton("Download Meeeeeee");
  downloadButton.position(
    (windowWidth - img.width) / 2,
    (windowHeight - img.height + 1070) / 2
  ); // Adjust the position as needed
  downloadButton.size(590, 40); // Width and height
  downloadButton.mousePressed(() => {
    downloadCanvas();
    buttonClickSound.play();
  });

  // Create a Pause button
  let pauseButton = createButton("Pause");
  pauseButton.position(
    (windowWidth - img.width) / 2,
    (windowHeight - img.height + 950) / 2
  ); // Adjust the position as needed
  pauseButton.size(250, 40); // Width and height
  pauseButton.mousePressed(() => {
    toggleLoop();
    buttonClickSound.play();
    if (bgm.isPlaying()) {
    bgm.pause(); // Pause the music if it is playing
  } else {
    bgm.play(); // If the music has been paused, continue playing
  }
  });

  // Create a slider
  slider = createSlider(0, 1, 0, 0.01);
  slider.position(10, 200); // Adjust the position
  slider.style("width", "260px"); // Set the width of the slider
  slider.input(onSliderInput); // Trigger when the slider value changes

  // Set the Slider to be located directly below the Canvas
  let sliderX = newCanvasX + (img.width - 600) / 2; // Center according to Canvas width
  let sliderY = newCanvasY + img.height + 10; // 15 pixels below Canvas
  slider.position(sliderX, sliderY);

  // Set the width of the Slider to be as long as the Canvas
  slider.style("width", img.width + "px");

  // Add a class name to the button
  let buttons = [
    curveButton,
    polkaDotButton,
    nameButton,
    resetButton,
    downloadButton,
    pauseButton,
  ];
  for (let button of buttons) {
    button.class("custom-button");
  }
}

function downloadCanvas() {
  // Download the canvas content as a JPG image
  saveCanvas(cnv, "myMemory", "jpg");
}

function onSliderInput() {
  if (sliderActive) {
    // Update the level of abstraction of the image
    size = slider.value();
  }
}

function draw() {
  background(0);

  // If mode is empty, display the original image
  if (mode === "") {
    image(img, 0, 0);
    return; // End the draw function
  }

  // Execute the drawing logic according to the selected mode
  let elapsedTime = millis() - startTime;
  let progress = elapsedTime / (maxInterval * 1000);

  colInterval = lerp(0.5, 20, progress);
  rowInterval = lerp(0.5, 20, progress);
  size = lerp(0.5, 20, progress);

  if (mode === "Curve") {
    drawCurve(progress);
  } else if (mode === "Polka Dot") {
    drawPolkaDot(progress);
  } else if (mode === "Name") {
    drawName(progress);
  }

  if (progress >= 1) {
    noLoop();
  }

  if (isLooping) {
    slider.value(progress);
  }
}

function toggleLoop() {
  if (isLooping) {
    noLoop(); // If currently looping, pause the loop
    isLooping = false; // Update the loop state
  } else {
    loop(); // If currently paused, resume the loop
    isLooping = true; // Update the loop state
  }

  // Update the status of whether the slider can be moved
  sliderActive = !isLooping;
}

function resetMode() {
  mode = ""; // Set the mode back to the initial state
  loop(); // Restart the loop if it has stopped
  // Reset the slider
  slider.value(0);
  sliderActive = false;
}

function changeMode(newMode) {
  mode = newMode;
  startTime = millis(); // Reset startTime
  loop(); // Ensure the loop is running
  sliderActive = false; // Disable the slider until the loop is stopped
}

function drawCurve(progress) {
  let distortionFactor = lerp(0, 1, progress);
  for (let col = 0; col < img.width; col += colInterval) {
    for (let row = 0; row < img.height; row += rowInterval) {
      let xPos = col;
      let yPos = row;
      let c = img.get(xPos, yPos); // Get the color of the current pixel
      push();
      translate(xPos, yPos);
      rotate(radians(random(360) * distortionFactor)); // Apply distortion factor
      noFill();
      stroke(color(c));
      strokeWeight(random(size));
      curve(
        xPos,
        yPos,
        sin(xPos) * 15 * distortionFactor,
        cos(xPos) * sin(xPos) * 10 * distortionFactor,
        0,
        0,
        cos(yPos) * sin(xPos) * random(35) * distortionFactor,
        cos(xPos) * sin(xPos) * 12.5 * distortionFactor
      );
      pop();
    }
  }
}

function drawPolkaDot(progress) {
  for (let col = 0; col < img.width; col += colInterval) {
    for (let row = 0; row < img.height; row += rowInterval) {
      let xPos = col; // Current X position
      let yPos = row; // Current Y position
      let c = img.get(xPos, yPos); // Get the color of the current pixel
      fill(color(c)); // Set the fill color
      noStroke(); // No border for the ellipse
      ellipse(xPos, yPos, size, size); // Use 'size' for the ellipse size
    }
  }
}

function drawName(progress) {
  for (let col = 0; col < img.width; col += colInterval) {
    for (let row = 0; row < img.height; row += rowInterval) {
      let xPos = col; // Current X position
      let yPos = row; // Current Y position
      let c = img.get(xPos, yPos); // Get the color of the current pixel
      fill(color(c)); // Set the fill color for the name
      noStroke(); // No border for the name
      textSize(size); // Use 'size' for the name size
      text("ROY", xPos, yPos); // Draw the name at each position
    }
  }
}

