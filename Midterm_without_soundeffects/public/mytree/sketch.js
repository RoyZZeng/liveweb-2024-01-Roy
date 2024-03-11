var socket = io.connect();

let x = 0;
let y = 0;
let seedImg, tree1Img, tree2Img; // 用于存储图片
let wPressCount = 0; // 计数按键"w"被按下的次数
let buffer; // 创建一个图形缓冲区
// 定义一个数组来存储所有的矩形
let rects = []; 
// 生成具有随机透明度的颜色
let fillColor;

let currentImage, targetImage;
let currentSize, targetSize;
let currentAlpha = 0, targetAlpha;
let transitioning = false;  // 是否正在过渡中

let raindrops = [];
let raining = false; // 添加一个控制下雨的标志变量

let shakingSquares = []; // 用于存储所有的抖动正方形

let fallingSquares = [];

let colors = ['#ff770f', '#81d8cf', '#f74197'];

let brushColors = [
  {r: 255, g: 119, b: 15}, // Orange
  {r: 129, g: 216, b: 207}, // Tiffany Blue
  {r: 247, g: 65, b: 151} // Barbie Pink
];


socket.on('connect', function() {
  console.log("Connected");
});

socket.on('mouse', function(mouseData){
  x = mouseData.x;
  y = mouseData.y;
});

socket.on('newFallingSquare', function(data) {
  // Assuming you have a FallingSquare class or function
  let newSquare = new FallingSquare(data.x, data.y, data.size, data.shouldFill, data.color); 
  fallingSquares.push(newSquare);
});


function preload() {
  // 替换'image.png'为你的图片文件路径
  treeImg = loadImage('tree2.png'); // 加载原来的tree2.png
  seedImg = loadImage('seed.png'); // 加载新的seed.png
  tree1Img = loadImage('tree1.png'); // 加载新的tree1.png
  console.log("preload done");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  buffer = createGraphics(windowWidth, windowHeight); // 创建和画布大小相同的图形缓冲区
  buffer.imageMode(CENTER);
  let imgX = windowWidth / 2;
  let imgY = windowHeight - treeImg.height / 2;
  buffer.image(treeImg, imgX, imgY); // 在缓冲区中绘制图片

  generateSquares(); // 在 setup 中调用以生成正方形

  // Use the button defined in HTML and bind the resetSketch function to it
  // let resetBtn = select('#resetBtn'); // select the HTML button using the select function of p5.js
  // resetBtn.mousePressed(resetSketch); // Bind the mousePressed event to the button

  // 监听 'GPress' 事件
  socket.on('GPress', function() {
    // 例如，在控制台打印信息
    console.log("GPress received from another user");
    // 你也可以在这里添加其他对该事件的响应，比如生成一个特定的矩形
    addNewRect();
  });

  // 监听 'WPress' 事件
  socket.on('WPress', function() {
    // 例如，在控制台打印信息
    console.log("WPress received from another user");
    // 你也可以在这里添加其他对该事件的响应，比如生成一个特定的矩形
    updateTransition();  // 根据wPressCount更新过渡状态 
  });
}

class ShakingSquare {
  constructor(x, y, size, fillColor) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.fillColor = fillColor;
    this.shakenX = x;
    this.shakenY = y;
    this.timer = 0; // 新增计时器
    this.updateInterval = 1; // 每隔5帧更新一次
  }

  shake() {
    // 检查是否到了更新时间
    if (this.timer === this.updateInterval) {
      // 在原始位置附近随机抖动
      let shakeIntensity = 5;
      this.shakenX = this.x + random(-shakeIntensity, shakeIntensity);
      this.shakenY = this.y + random(-shakeIntensity, shakeIntensity);
      this.timer = 0; // 重置计时器
    } else {
      this.timer++; // 增加计时器
    }
  }

  display() {
    // 根据 fill 属性决定是填充颜色还是只描边
    if (this.fill) {
      fill(this.fillColor);
      noStroke();
    } else {
      noFill();
      stroke(this.fillColor);
    }
    rect(this.shakenX, this.shakenY, this.size, this.size);
  }
}

class FallingSquare {
  constructor(x, y, size, shouldFill, color) { // 现在 color 也是一个参数
    this.x = x;
    this.y = y;
    this.size = size;
    this.shouldFill = shouldFill;
    this.color = color; // 保存传递给构造函数的颜色
    this.velocityY = 0;
    this.gravity = 0.5;
    this.bounce = -0.7;
  }

  update() {
    // 应用重力效果
    this.velocityY += this.gravity;
    this.y += this.velocityY;

    // 底部碰撞检测
    if (this.y + this.size > height) {
        this.y = height - this.size; // 确保方块不会穿过画布底部
        this.velocityY *= this.bounce; // 应用反弹效果
    }
}

  display() {
    let fillColor, strokeColor;
    if (this.color === '#ff770f') { // 如果颜色是 #ff770f
      fillColor = color(255, 119, 15, random(50, 100)); // 使用特定的填充色
      strokeColor = color(255, 119, 15, random(50, 100)); // 使用特定的边框色
    } else if (this.color === '#f74197') { // 否则使用默认颜色
      fillColor = color(247, 65, 151, random(50, 100)); // 默认的填充色
      strokeColor = color(247, 65, 151, random(50, 100)); // 默认的边框色
    } else {
      fillColor = color(129, 216, 207, random(50, 100)); // 默认的填充色
      strokeColor = color(129, 216, 207, random(50, 100)); // 默认的边框色
    }

    if (this.shouldFill) {
      fill(fillColor);
      noStroke();
    } else {
      noFill();
      stroke(strokeColor);
    }
    rect(this.x, this.y, this.size, this.size);
  }
}



function generateSquares() {
  let areaSize = 575; // 正方形区域的大小
  let halfArea = areaSize / 2;
  let startX = windowWidth / 2 - halfArea; // 区域左上角 X 坐标
  let startY = windowHeight / 3 - halfArea; // 区域左上角 Y 坐标
  shakingSquares = [];  // 清空数组，避免重复添加
  // 从颜色数组中随机选择一个颜色
  let selectedColor = random(colors); // 正确选取颜色

  for (let i = 0; i < 80; i++) {
    let x = random(startX, startX + areaSize);
    let y = random(startY, startY + areaSize);
    let squareSize = random(30,80); // 单个正方形的大小
    let isFilled = i >= 40;  // 如果索引大于等于40，则只填充而不描边

    // 使用随机透明度创建颜色
    let fillColor = color(red(selectedColor), green(selectedColor), blue(selectedColor), random(128, 230)); // 随机透明度从50%到90%

    // 根据是否填充设置颜色和描边
    if (isFilled) {
      // 仅填充，无描边
      buffer.noStroke();
      buffer.fill(color(fillColor));
    } else {
      // 仅描边，无填充
      buffer.stroke(color(fillColor));
      buffer.noFill();
    }

    buffer.rect(x, y, squareSize, squareSize);  // 绘制正方形

    // 创建并添加新的 ShakingSquare 对象
    shakingSquares.push(new ShakingSquare(x, y, squareSize, fillColor, isFilled));
  }
}

function draw() {
   background(0); // 清除画布
   

   if (transitioning) {
    // 更新图片尺寸和透明度
    currentSize = lerp(currentSize, targetSize, 0.05);  // 更新尺寸
    currentAlpha = lerp(currentAlpha, targetAlpha, 0.05);  // 更新透明度

    // 检查是否完成过渡
    if (abs(currentSize - targetSize) < 0.01 && abs(currentAlpha - targetAlpha) < 0.01) {
        transitioning = false;  // 结束过渡
        currentSize = targetSize;  // 确保最终大小正确
        currentAlpha = targetAlpha;  // 确保最终透明度正确
    }
  }


  // 根据wPressCount的值决定哪张图片应该显示
  if (wPressCount > 0 && wPressCount <= 10) {
    currentAlpha = map(wPressCount, 0, 10, 0, 255); // 从不透明渐变到完全透明
    tint(255, currentAlpha); // 应用透明度
    image(seedImg, width/2 - seedImg.width * 1/5, height - seedImg.height * 1/3 - 20, seedImg.width * 1/3, seedImg.height * 1/3); // 显示seed.png // 将seed.png缩小到1/3
    noTint(); // 重置tint效果
  } else if (wPressCount > 10 && wPressCount <= 20) {
    currentAlpha = map(wPressCount, 10, 20, 0, 255); // 从不透明渐变到完全透明
    tint(255, currentAlpha); // 应用透明度
    image(tree1Img, width/2 - tree1Img.width * 2/5, height - tree1Img.height * 2/3 - 10, tree1Img.width * 2/3, tree1Img.height * 2/3 ); // 显示tree1.png // 将tree1.png缩小到2/3
    noTint(); // 重置tint效果
  } else if (wPressCount > 20 &&wPressCount <= 30) { 
    currentAlpha = map(wPressCount, 20, 30, 0, 255); // 从不透明渐变到完全透明
    tint(255, currentAlpha); // 应用透明度
    image(treeImg, width/2 - treeImg.width/2, height - treeImg.height); // 显示tree2.png
    noTint(); // 重置tint效果
  }

  if (wPressCount <= 30) {
    // 当 wPressCount 小于或等于 30 时执行下雨特效
    raining = true;
    if (raining) {
       raindrops.push(new RainDrop());
       for (let i = raindrops.length - 1; i >= 0; i--) {
          raindrops[i].update();
          raindrops[i].display();
          if (raindrops[i].isOutOfScreen()) {
             raindrops.splice(i, 1);
          }
       }
    }
  } else {
    // 当 wPressCount 大于 30 时停止下雨特效
    raining = false;
    raindrops = []; // 清空现有的雨滴数组
  }

  // 如果按键w按下次数大于30，才允许绘制其他图形和响应G键
  if (wPressCount > 30) {
    // 其他绘图逻辑...
    image(buffer, 0, 0); // 在画布上绘制缓冲区（包含图片）

    
    
    // // Brush
    // 随机选择颜色
    let selectedColorIndex = floor(random(brushColors.length));
    let selectedColor = brushColors[selectedColorIndex];

    // 应用选中的颜色
    fill(selectedColor.r, selectedColor.g, selectedColor.b, random(50, 100));
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

    // 更新和显示所有抖动的正方形
    for (let square of shakingSquares) {
      square.shake();
      square.display();
    } 

    //从树上掉落的正方形
    for (let i = fallingSquares.length - 1; i >= 0; i--) {
      fallingSquares[i].update();
      fallingSquares[i].display();
    }
    

    // 当 raining 为 true 时，创建新的雨滴并更新显示所有雨滴
    if (raining) {
      raindrops.push(new RainDrop());
  
      for (let i = raindrops.length - 1; i >= 0; i--) {
        raindrops[i].update();
        raindrops[i].display();
      
        // 移除超出画布的雨滴
        if (raindrops[i].isOutOfScreen()) {
          raindrops.splice(i, 1);
        }
      }
    }
  }  
}

function mousePressed() {
  if (mouseX > windowWidth / 2 - 300 && mouseX < windowWidth / 2 + 300 && mouseY > windowHeight / 3 - 300 && mouseY < windowHeight / 3 + 300) {
      if (wPressCount > 30) {
          // 随机决定是否填充
          let shouldFill = Math.random() > 0.5; 
          let squareSize = random(30, 60);  // 创建一个变量来保存大小
          let colorIndex = floor(random(colors.length)); // 随机选择一个颜色索引
          let selectedColor = colors[colorIndex]; // 根据索引获取颜色
          let newSquare = new FallingSquare(mouseX, mouseY, squareSize, shouldFill, selectedColor); // 添加颜色参数
          fallingSquares.push(newSquare);
          let dataToSend = { x: mouseX, y: mouseY, shouldFill: shouldFill, size: squareSize, color: selectedColor };
          socket.emit('newFallingSquare', dataToSend);
      }
  }
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
  if (key === 'W' || key === 'w') {
    if (wPressCount <= 30) {
      // 仅在按下次数少于或等于30时启动雨滴效果
      raining = true;
      setTimeout(() => {
        raining = false;  // 一秒后停止下雨
      }, 1000);  // 1000 毫秒 = 1 秒
      wPressCount++;  // 每次按下 "w" 键时增加计数
      socket.emit('WPress', {count: wPressCount});  // 向服务器发送更新后的 wPressCount
      updateTransition();  // 根据 wPressCount 更新过渡状态
    }
  }

  if (key === 'G' || key === 'g') {
    // G键的其它逻辑保持不变
    socket.emit('GPress');
    addNewRect();
  }
}

 function updateTransition() {
  if (transitioning) {
    // 更新图片尺寸和透明度
    currentSize = lerp(currentSize, targetSize, 0.05);  // 更新尺寸
    currentAlpha = lerp(currentAlpha, targetAlpha, 0.05);  // 更新透明度

    // 检查是否完成过渡
    if (abs(currentSize - targetSize) < 0.01 && abs(currentAlpha - targetAlpha) < 0.01) {
        transitioning = false;  // 结束过渡
        currentSize = targetSize;  // 确保最终大小正确
        currentAlpha = targetAlpha;  // 确保最终透明度正确
    }
  }


  // 根据wPressCount的值决定哪张图片应该显示
  if (wPressCount > 0 && wPressCount <= 10) {
    currentAlpha = map(wPressCount, 0, 10, 0, 255); // 从不透明渐变到完全透明
    tint(255, currentAlpha); // 应用透明度
    image(seedImg, width/2 - seedImg.width * 1/5, height - seedImg.height * 1/3 - 20, seedImg.width * 1/3, seedImg.height * 1/3); // 显示seed.png // 将seed.png缩小到1/3
    noTint(); // 重置tint效果
  } else if (wPressCount > 10 && wPressCount <= 20) {
    currentAlpha = map(wPressCount, 10, 20, 0, 255); // 从不透明渐变到完全透明
    tint(255, currentAlpha); // 应用透明度
    image(tree1Img, width/2 - tree1Img.width * 2/5, height - tree1Img.height * 2/3 - 10, tree1Img.width * 2/3, tree1Img.height * 2/3 ); // 显示tree1.png // 将tree1.png缩小到2/3
    noTint(); // 重置tint效果
  } else if (wPressCount > 20 &&wPressCount <= 30) { 
    currentAlpha = map(wPressCount, 20, 30, 0, 255); // 从不透明渐变到完全透明
    tint(255, currentAlpha); // 应用透明度
    image(treeImg, width/2 - treeImg.width/2, height - treeImg.height); // 显示tree2.png
    noTint(); // 重置tint效果
  }
}


// 初始化过渡状态
currentImage = seedImg;  // 可以是任何初始图片
currentSize = 2/3;  // 初始化尺寸
currentAlpha = 255;  // 初始透明度

function addNewRect() {
  let r = new MovingRect(random(width / 2 - 50, width / 2 + 50), random(height / 2 - 50, height / 2 + 50), 20, 20);
  rects.push(r);
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

// 定义 RainDrop 类
class RainDrop {
  constructor() {
    this.x = random(width);
    this.y = random(-50, -10);
    this.length = random(10, 20);
    this.speed = random(5, 10);
  }

  update() {
    this.y += this.speed;
  }

  display() {
    stroke(0, 246, 255);
    line(this.x, this.y, this.x, this.y + this.length);
  }

  isOutOfScreen() {
    return this.y > height;
  }
}