let capture;
let facemesh;
let predictions = [];
let faceMask;
let stars = [];

// --- 點位定義 ---
const faceOutline = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];
const rightEye_Out = [247, 30, 29, 28, 27, 26, 25, 110, 247];
const rightEye_In = [246, 161, 160, 159, 158, 157, 173, 133, 246];
const leftEye_Out = [467, 260, 259, 258, 257, 256, 255, 339, 467];
const leftEye_In = [466, 388, 387, 386, 385, 384, 398, 362, 466];

function setup() {
  createCanvas(windowWidth, windowHeight);
  capture = createCapture(VIDEO);
  capture.size(640, 480);
  capture.hide();

  faceMask = createGraphics(640, 480);

  facemesh = ml5.facemesh(capture, () => console.log("Model Ready!"));
  facemesh.on("predict", results => predictions = results);

  for (let i = 0; i < 150; i++) {
    stars.push({ x: random(1), y: random(1), size: random(1, 3), b: random(150, 255) });
  }
}

function draw() {
  background(173, 216, 230); // 全螢幕淡藍色

  let targetW = width * 0.5;
  let targetH = height * 0.5;
  let xOffset = (width - targetW) / 2;
  let yOffset = (height - targetH) / 2;

  // --- 新增：在中層視窗上方顯示文字 ---
  push();
  fill(50, 80, 150);      // 深藍色文字顏色，與背景呼應
  stroke(255);            // 白色外框讓字體變可愛
  strokeWeight(4);        // 增加外框粗度
  textStyle(BOLD);        // 粗體
  textAlign(CENTER, BOTTOM);
  textSize(32);           // 調整字體大小
  // 位置設定在視窗上方 10 像素處
  text("41273oo78 林oo", width / 2, yOffset - 10);
  pop();

  // 1. 畫出中間的星空視窗
  push();
  translate(xOffset, yOffset);
  fill(10, 20, 50);
  noStroke();
  rect(0, 0, targetW, targetH);
  
  for (let s of stars) {
    fill(255, 255, 255, s.b);
    circle(s.x * targetW, s.y * targetH, s.size);
  }
  
  if (predictions.length > 0) {
    let keypoints = predictions[0].scaledMesh;

    faceMask.clear();
    faceMask.fill(255);
    faceMask.beginShape();
    for (let index of faceOutline) {
      let p = keypoints[index];
      faceMask.vertex(p[0], p[1]);
    }
    faceMask.endShape(CLOSE);

    let maskedImg = capture.get();
    maskedImg.mask(faceMask);

    push();
    translate(targetW, 0);
    scale(-1, 1);
    image(maskedImg, 0, 0, targetW, targetH);

    stroke(255, 0, 0); 
    strokeWeight(1.5);
    noFill();
    drawEye(keypoints, rightEye_Out, targetW, targetH);
    drawEye(keypoints, rightEye_In, targetW, targetH);
    drawEye(keypoints, leftEye_Out, targetW, targetH);
    drawEye(keypoints, leftEye_In, targetW, targetH);
    pop();
  }
  pop();
}

function drawEye(points, indices, tw, th) {
  beginShape();
  for (let index of indices) {
    let p = points[index];
    let mx = map(p[0], 0, 640, 0, tw);
    let my = map(p[1], 0, 480, 0, th);
    vertex(mx, my);
  }
  endShape();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}