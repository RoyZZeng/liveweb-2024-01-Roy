var socket = io.connect();

socket.on('connect', function() {
  console.log("Connected");
});

socket.on('mouse', function(mouseData){
  x = mouseData.x;
  y = mouseData.y;
});

let x = 0;
let y = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  // let resetBtn = createButton('Reset');
  // resetBtn.mousePressed(resetSketch);

  // Use the button defined in HTML and bind the resetSketch function to it
  let resetBtn = select('#resetBtn'); // select the HTML button using the select function of p5.js
  resetBtn.mousePressed(resetSketch); // Bind the mousePressed event to the button
}

function draw() {
   // Heart
  noStroke();
  fill(255);
  //background(0);
  rect(windowWidth/2,windowHeight/2-60,60,30)
  rect(windowWidth/2+90,windowHeight/2-60,60,30)
  rect(windowWidth/2-30,windowHeight/2-30,210,30)
  rect(windowWidth/2,windowHeight/2,150,30)
  rect(windowWidth/2+30,windowHeight/2+30,90,30)
  rect(windowWidth/2+60,windowHeight/2+60,30,30)
  // rect(245,300,30,15)
  // rect(290,300,30,15)
  // rect(230,315,105,15)
  // rect(245,330,75,15)
  // rect(260,345,45,15)
  // rect(275,360,15,15)

  fill("deepPink");
  rect(x, y, 6, 3);
  rect(x + 9, y, 6, 3);
  rect(x - 3, y + 3, 21, 3);
  rect(x, y + 6, 15, 3);
  rect(x + 3, y + 9, 9, 3);
  rect(x + 6, y + 12, 3, 3);
}

function mouseDragged(){
  x = mouseX;
  y = mouseY;
  let dataToSend = {x: x, y: y};
  socket.emit('mouse', dataToSend);
}

function resetSketch() {
  background(255);
}
