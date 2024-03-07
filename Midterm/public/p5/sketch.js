var socket = io.connect();

let x = 0;
let y = 0;
let treeImg; // 存储PNG图片
let buffer; // 创建一个图形缓冲区
// 定义一个数组来存储所有的矩形
let rects = [];
// 生成具有随机透明度的颜色
let fillColor;

socket.on('connect', function() {
  console.log("Connected");
});

socket.on('mouse', function(mouseData){
  x = mouseData.x;
  y = mouseData.y;
});

function preload() {
  // 替换'image.png'为你的图片文件路径
  treeImg = loadImage('tree2.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  // background(0);
  buffer = createGraphics(windowWidth, windowHeight); // 创建和画布大小相同的图形缓冲区
  buffer.imageMode(CENTER);
  let imgX = windowWidth / 2;
  let imgY = windowHeight - treeImg.height / 2;
  buffer.image(treeImg, imgX, imgY); // 在缓冲区中绘制图片

  generateSquares(); // 在 setup 中调用以生成正方形

  // let resetBtn = createButton('Reset');
  // resetBtn.mousePressed(resetSketch);
  // Use the button defined in HTML and bind the resetSketch function to it
  let resetBtn = select('#resetBtn'); // select the HTML button using the select function of p5.js
  resetBtn.mousePressed(resetSketch); // Bind the mousePressed event to the button

  // 监听 'GPress' 事件
  socket.on('GPress', function() {
    // 例如，在控制台打印信息
    console.log("GPress received from another user");
    // 你也可以在这里添加其他对该事件的响应，比如生成一个特定的矩形
    addNewRect();
  });



}

function draw() {

  // background(255); // 清除画布
  image(buffer, 0, 0); // 在画布上绘制缓冲区（包含图片）

  // Brush
  fill(129,216,207,random(50,100)); // Tiffany双拼配色 #81D8CF 和 #00AD9DF
  
  rect(x, y, 6, 3);
  rect(x + 9, y, 6, 3);
  rect(x - 3, y + 3, 21, 3);
  rect(x, y + 6, 15, 3);
  rect(x + 3, y + 9, 9, 3);
  rect(x + 6, y + 12, 3, 3);
  noStroke();

  // 更新和绘制所有矩形
  for (let i = rects.length - 1; i >= 0; i--) {
    rects[i].move();
    rects[i].display();
    // 如果矩形移出画布，将其从数组中移除
    if (rects[i].isOut()) {
      rects.splice(i, 1);
    }
  }
  
}

function mouseDragged(){
  x = mouseX;
  y = mouseY;
  let dataToSend = {x: x, y: y};
  socket.emit('mouse', dataToSend);
}

function resetSketch() {
  // 当需要重置时，清除画布和缓冲区
  background(255); // 清除画布
  buffer.clear(); // 清除缓冲区
  buffer.imageMode(CENTER);
  let imgX = windowWidth / 2;
  let imgY = windowHeight - treeImg.height / 2;
  buffer.image(treeImg, imgX, imgY); // 重新在缓冲区绘制图片
}

function keyPressed() {
  // 检测"G"键
  if (key === 'G' || key === 'g') {
    // 在画布中间的区域内随机位置生成新矩形
    // 发送 'GPress' 事件到服务器
    socket.emit('GPress');
    // 生成新矩形并添加到数组
    addNewRect();
    
  }
}

function addNewRect() {
  let r = new MovingRect(random(width / 2 - 50, width / 2 + 50), random(height / 2 - 50, height / 2 + 50), 20, 20);
  rects.push(r);
}

function generateSquares() {
  let areaSize = 600; // 正方形区域的大小
  let squareSize = 60; // 单个正方形的大小
  let halfArea = areaSize / 2;
  let startX = windowWidth / 2 - halfArea; // 区域左上角 X 坐标
  let startY = windowHeight / 3 - halfArea; // 区域左上角 Y 坐标
  let fillColor = color(0,179,159, random(128, 200)); // 更新此行

  for (let i = 0; i < 80; i++) {
      let x = random(startX, startX + areaSize - squareSize);
      let y = random(startY, startY + areaSize - squareSize);

      if (i < 40) {
          // 前40个正方形：有边框，无填充
          buffer.stroke('#00AD9F'); // 设置边框颜色，你可以更改
          buffer.noFill();
          buffer.rect(x, y, squareSize, squareSize);
      } else {
          // 后40个正方形：有填充，无边框
          buffer.noStroke();
          buffer.fill(fillColor);
          buffer.rect(x, y, squareSize, squareSize);
      }
  }
}

// 定义一个MovingRect类来表示移动的矩形
class MovingRect {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.angle = random(TWO_PI); // 随机方向
    this.rotation = 0; // 初始化旋转角度
    this.speed = 5; // 设置移动速度
    this.rotationSpeed = random(0.05, 0.1); // 设置旋转速度
  }

  move() {
    // 根据角度和速度更新位置
    this.x += this.speed * cos(this.angle);
    this.y += this.speed * sin(this.angle);
    // 更新旋转角度
    this.rotation += this.rotationSpeed;
  }

  display() {
    
    push(); // 保存当前画布状态
    translate(this.x, this.y); // 移动画布原点到矩形中心
    rotate(this.rotation); // 旋转画布
    rect(0, 0, this.w, this.h);
    pop(); // 恢复之前的画布状态
  }

  // 检测矩形是否移出画布
  isOut() {
    return (this.x < 0 || this.x > width || this.y < 0 || this.y > height);
  }

  
}