const openButton = document.getElementById("openButton");
const giftBox = document.getElementById("giftBox");
const giftPage = document.getElementById("giftPage");
const surprisePage = document.getElementById("surprisePage");

const canvas = document.getElementById("treeCanvas");
const ctx = canvas.getContext("2d");

let opened = false;
let animationStarted = false;

let width = 0;
let height = 0;

let branches = [];
let flowers = [];
let petals = [];

let startTime = 0;
let lastPetalTime = 0;

let treeView = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
};

const flowerColors = [
  "#ffd6e8",
  "#ffc1df",
  "#ffafd3",
  "#ffe3ef",
  "#f9a8ce",
  "#ffcce3",
  "#fff0f5",
];

// HIỆU ỨNG HIỆN TỪNG TỪ

function prepareText(element) {
  const text = element.textContent.trim();

  element.innerHTML = "";

  const words = text.split(/\s+/);

  words.forEach(function (word, index) {
    const span = document.createElement("span");

    span.className = "word";
    span.textContent = word;

    element.appendChild(span);

    if (index < words.length - 1) {
      element.appendChild(document.createTextNode(" "));
    }
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function revealText(element) {
  const words = element.querySelectorAll(".word");

  for (const word of words) {
    word.classList.add("visible");

    await wait(250);
  }
}

async function startTextAnimation() {
  const title = document.querySelector(".wish");
  const message = document.querySelector(".message");

  prepareText(title);
  prepareText(message);

  // Hiện tiêu đề trước
  await revealText(title);

  // Nghỉ một chút
  await wait(500);

  // Hiện lời chúc bên dưới
  await revealText(message);

  // Hiện nút tiếp tục
  await wait(400);

  nextButton.classList.add("text-ready");
}

// OPEN GIFT

openButton.addEventListener("click", function () {
  if (opened) return;

  opened = true;

  giftBox.classList.add("opened");
  openButton.disabled = true;

  setTimeout(function () {
    giftPage.classList.add("hide");
    surprisePage.classList.add("show");

    startTree();

    startTextAnimation();
  }, 1200);
});

// CANVAS

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();

  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

  width = rect.width;
  height = rect.height;

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// CREATE BRANCH

function addBranch(x, y, angle, length, thickness, depth, delay, direction) {
  const endX = x + Math.sin(angle) * length;
  const endY = y - Math.cos(angle) * length;

  const bend = direction * length * 0.08;

  const controlX = (x + endX) / 2 + Math.cos(angle) * bend;

  const controlY = (y + endY) / 2 + Math.sin(angle) * bend;

  const duration = Math.max(650, length * 9);

  const branch = {
    x,
    y,
    endX,
    endY,
    controlX,
    controlY,
    angle,
    length,
    thickness,
    depth,
    delay,
    duration,
  };

  branches.push(branch);

  if (depth <= 0) return;

  const nextLength = length * 0.7;

  const spread = 0.32 + Math.random() * 0.2;

  const nextDelay = delay + duration * 0.75;

  addBranch(
    endX,
    endY,
    angle - spread,
    nextLength,
    thickness * 0.68,
    depth - 1,
    nextDelay,
    -1,
  );

  addBranch(
    endX,
    endY,
    angle + spread,
    nextLength,
    thickness * 0.68,
    depth - 1,
    nextDelay,
    1,
  );
}

// GENERATE TREE

function generateTree() {
  branches = [];
  flowers = [];
  petals = [];

  const cx = width / 2;
  const baseY = height * 0.94;

  // TRUNK

  const trunk = {
    x: cx,
    y: baseY,
    endX: cx - 7,
    endY: height * 0.39,
    controlX: cx + 9,
    controlY: height * 0.66,
    thickness: Math.min(width * 0.0525, 37.5),
    delay: 0,
    duration: 2800,
    depth: 5,
  };

  branches.push(trunk);

  const trunkEndX = trunk.endX;
  const trunkEndY = trunk.endY;

  // MAIN BRANCHES

  const primaryBranches = [
    [-1.3, 0.34],
    [1.3, 0.34],

    [-0.95, 0.32],
    [0.95, 0.32],

    [-0.6, 0.25],
    [0.6, 0.25],

    [-1.55, 0.28],
    [1.55, 0.28],
  ];

  primaryBranches.forEach(function (item, index) {
    addBranch(
      trunkEndX,
      trunkEndY,
      item[0],
      height * item[1],
      12 - index * 0.5,
      3,
      2800 + index * 150,
      Math.sign(item[0]),
    );
  });

  // LOWER SIDE BRANCHES

  [-1, 1].forEach(function (direction) {
    addBranch(
      cx,
      height * 0.59,
      direction * 1.15,
      height * 0.2,
      9,
      2,
      3200,
      direction,
    );
  });

  createFlowers();
}

// CREATE FLOWERS

function createFlowers() {
  flowers = [];

  branches.forEach(function (branch) {
    if (branch.depth > 3) return;

    const count = Math.max(5, Math.min(10, Math.floor(branch.length / 35)));
    const dx = branch.endX - branch.x;
    const dy = branch.endY - branch.y;

    const length = Math.sqrt(dx * dx + dy * dy);

    if (length === 0) return;

    const normalX = -dy / length;
    const normalY = dx / length;

    for (let i = 0; i < count; i++) {
      const t = 0.08 + (i / count) * 0.84;

      const oneMinusT = 1 - t;

      const x =
        oneMinusT * oneMinusT * branch.x +
        2 * oneMinusT * t * branch.controlX +
        t * t * branch.endX;

      const y =
        oneMinusT * oneMinusT * branch.y +
        2 * oneMinusT * t * branch.controlY +
        t * t * branch.endY;

      const flowerCount = 4 + Math.floor(Math.random() * 4);

      for (let j = 0; j < flowerCount; j++) {
        const spread = 12 + Math.random() * 28;

        const side = Math.random() < 0.5 ? -1 : 1;

        flowers.push({
          x: x + normalX * spread * side + (Math.random() - 0.5) * 15,

          y: y + normalY * spread * side + (Math.random() - 0.5) * 18,

          size: 3 + Math.random() * 2.5,

          rotation: Math.random() * Math.PI * 2,

          color: flowerColors[Math.floor(Math.random() * flowerColors.length)],

          delay: branch.delay + branch.duration * t + 250 + Math.random() * 900,
        });
      }
    }
  });
}

// DRAW BRANCH

function drawBranch(branch, elapsed) {
  const progress = Math.max(
    0,
    Math.min(1, (elapsed - branch.delay) / branch.duration),
  );

  if (progress <= 0) return;

  const x = branch.x + (branch.endX - branch.x) * progress;

  const y = branch.y + (branch.endY - branch.y) * progress;

  const controlX = branch.x + (branch.controlX - branch.x) * progress;

  const controlY = branch.y + (branch.controlY - branch.y) * progress;

  ctx.beginPath();

  ctx.moveTo(branch.x, branch.y);

  ctx.quadraticCurveTo(controlX, controlY, x, y);

  const gradient = ctx.createLinearGradient(branch.x, branch.y, x, y);

  gradient.addColorStop(0, "#542b19");
  gradient.addColorStop(0.5, "#925b37");
  gradient.addColorStop(1, "#61351f");

  ctx.strokeStyle = gradient;

  ctx.lineWidth = branch.thickness * (1 - progress * 0.12);

  ctx.lineCap = "round";

  ctx.stroke();
}

// DRAW TREE

function drawTree(elapsed) {
  branches.forEach(function (branch) {
    drawBranch(branch, elapsed);
  });
}

// DRAW FLOWER

function drawFlower(x, y, size, rotation, color, scale) {
  ctx.save();

  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(scale, scale);

  for (let i = 0; i < 5; i++) {
    ctx.save();

    ctx.rotate((i * Math.PI * 2) / 5);

    ctx.beginPath();

    ctx.ellipse(0, -size * 0.65, size * 0.43, size * 0.7, 0, 0, Math.PI * 2);

    ctx.fillStyle = color;
    ctx.fill();

    ctx.restore();
  }

  ctx.beginPath();

  ctx.arc(0, 0, size * 0.19, 0, Math.PI * 2);

  ctx.fillStyle = "#ffe7a3";
  ctx.fill();

  ctx.restore();
}

// DRAW FLOWERS

function drawFlowers(elapsed, time) {
  flowers.forEach(function (flower) {
    const progress = Math.max(0, Math.min(1, (elapsed - flower.delay) / 650));

    if (progress <= 0) return;

    const sway = Math.sin(time * 0.0015 + flower.x * 0.01) * 1.5;

    drawFlower(
      flower.x + sway,
      flower.y,
      flower.size,
      flower.rotation,
      flower.color,
      progress,
    );
  });
}

// CREATE FALLING PETAL

function createPetal() {
  const elapsed = performance.now() - startTime;

  const activeFlowers = flowers.filter(function (flower) {
    return flower.delay < elapsed;
  });

  if (activeFlowers.length === 0) return;

  const flower =
    activeFlowers[Math.floor(Math.random() * activeFlowers.length)];
  if (petals.length >= 35) return;
  petals.push({
    x: flower.x,
    y: flower.y,

    speed: 0.9 + Math.random() * 1.5,

    size: 3 + Math.random() * 3,

    rotation: Math.random() * 6,

    rotationSpeed: (Math.random() - 0.5) * 0.08,

    sway: 1 + Math.random() * 2,

    opacity: 1,
  });
}

// DRAW FALLING PETALS

function drawPetals() {
  const rootY = height * 0.94;

  petals.forEach(function (petal) {
    petal.y += petal.speed;

    petal.x += Math.sin(petal.y * 0.025) * petal.sway;

    petal.rotation += petal.rotationSpeed;

    petal.opacity = Math.min(1, (rootY - petal.y) / 40);

    ctx.save();

    ctx.translate(petal.x, petal.y);
    ctx.rotate(petal.rotation);

    ctx.globalAlpha = Math.max(0, petal.opacity);

    ctx.fillStyle = "#ffc0df";

    ctx.beginPath();

    ctx.ellipse(0, 0, petal.size, petal.size * 0.55, 0, 0, Math.PI * 2);

    ctx.fill();

    ctx.restore();
  });

  petals = petals.filter(function (petal) {
    return petal.y < rootY;
  });
}

// CLOUD CANOPY

function clipCloudCanopy() {
  const cx = width / 2;

  ctx.beginPath();

  ctx.moveTo(cx, height * 0.73);

  ctx.bezierCurveTo(
    cx - width * 0.12,
    height * 0.73,
    cx - width * 0.2,
    height * 0.67,
    cx - width * 0.28,
    height * 0.69,
  );

  ctx.bezierCurveTo(
    cx - width * 0.49,
    height * 0.72,
    cx - width * 0.51,
    height * 0.51,
    cx - width * 0.43,
    height * 0.43,
  );

  ctx.bezierCurveTo(
    cx - width * 0.49,
    height * 0.27,
    cx - width * 0.34,
    height * 0.17,
    cx - width * 0.23,
    height * 0.25,
  );

  ctx.bezierCurveTo(
    cx - width * 0.16,
    height * 0.08,
    cx - width * 0.05,
    height * 0.08,
    cx,
    height * 0.2,
  );

  ctx.bezierCurveTo(
    cx + width * 0.09,
    height * 0.06,
    cx + width * 0.2,
    height * 0.1,
    cx + width * 0.25,
    height * 0.25,
  );

  ctx.bezierCurveTo(
    cx + width * 0.43,
    height * 0.14,
    cx + width * 0.49,
    height * 0.27,
    cx + width * 0.43,
    height * 0.43,
  );
  ctx.bezierCurveTo(
    cx + width * 0.52,
    height * 0.55,
    cx + width * 0.42,
    height * 0.71,
    cx + width * 0.27,
    height * 0.69,
  );

  ctx.bezierCurveTo(
    cx + width * 0.17,
    height * 0.73,
    cx + width * 0.08,
    height * 0.73,
    cx,
    height * 0.73,
  );

  ctx.closePath();

  ctx.clip();
}

// AUTO FIT TREE

function calculateTreeView() {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  branches.forEach(function (branch) {
    minX = Math.min(minX, branch.x, branch.endX, branch.controlX);

    maxX = Math.max(maxX, branch.x, branch.endX, branch.controlX);

    minY = Math.min(minY, branch.y, branch.endY, branch.controlY);

    maxY = Math.max(maxY, branch.y, branch.endY, branch.controlY);
  });

  flowers.forEach(function (flower) {
    minX = Math.min(minX, flower.x - 25);
    maxX = Math.max(maxX, flower.x + 25);

    minY = Math.min(minY, flower.y - 25);
    maxY = Math.max(maxY, flower.y + 25);
  });

  const padding = 30;

  const treeWidth = maxX - minX;
  const treeHeight = maxY - minY;

  const scaleX = (width - padding * 2) / treeWidth;
  const scaleY = (height - padding * 2) / treeHeight;

  treeView.scale = Math.min(scaleX, scaleY, 1);

  treeView.offsetX =
    (width - treeWidth * treeView.scale) / 2 - minX * treeView.scale;

  treeView.offsetY =
    (height - treeHeight * treeView.scale) / 2 - minY * treeView.scale;
}

// MAIN ANIMATION

// MAIN ANIMATION

let lastFrameTime = 0;
const frameInterval = 1000 / 30;

function animate(time) {
  if (!animationStarted) return;

  if (time - lastFrameTime < frameInterval) {
    requestAnimationFrame(animate);
    return;
  }

  lastFrameTime = time;

  const elapsed = time - startTime;

  ctx.clearRect(0, 0, width, height);

  // VẼ THÂN CÂY KHÔNG BỊ CẮT

  ctx.save();

  ctx.translate(treeView.offsetX, treeView.offsetY);
  ctx.scale(treeView.scale, treeView.scale);

  if (branches.length > 0) {
    drawBranch(branches[0], elapsed);
  }

  ctx.restore();

  // VẼ CÀNH VÀ HOA TRONG TÁN MÂY

  ctx.save();

  clipCloudCanopy();

  ctx.translate(treeView.offsetX, treeView.offsetY);
  ctx.scale(treeView.scale, treeView.scale);

  branches.slice(1).forEach(function (branch) {
    drawBranch(branch, elapsed);
  });

  drawFlowers(elapsed, time);

  ctx.restore();

  // CÁNH HOA RƠI

  ctx.save();

  ctx.translate(treeView.offsetX, treeView.offsetY);
  ctx.scale(treeView.scale, treeView.scale);

  if (elapsed > 6500) {
    if (time - lastPetalTime > 450) {
      createPetal();
      lastPetalTime = time;
    }

    drawPetals();
  }

  ctx.restore();

  requestAnimationFrame(animate);
}

// START TREE

function startTree() {
  if (animationStarted) return;

  animationStarted = true;

  resizeCanvas();

  generateTree();

  calculateTreeView();

  startTime = performance.now();

  requestAnimationFrame(animate);
}

// CẬP NHẬT KÍCH THƯỚC CÂY ĐÀO KHI ĐIỆN THOẠI XOAY MÀN HÌNH / ĐỔI KÍCH THƯỚC
let treeResizePending = false;

window.addEventListener("resize", function () {
  if (!animationStarted || treeResizePending) return;

  treeResizePending = true;

  requestAnimationFrame(function () {
    resizeCanvas();
    calculateTreeView();
    treeResizePending = false;
  });
});

// CHUYỂN TỪ TRANG 2 SANG TRANG 3

const nextButton = document.getElementById("nextButton");
const transition = document.getElementById("pageTransition");
const universePage = document.getElementById("universePage");
let changingPage = false;

nextButton.addEventListener("click", function () {
  if (changingPage) return;
  changingPage = true;
  nextButton.disabled = true;

  transition.classList.add("active");

  setTimeout(function () {
    // DỪNG HIỆU ỨNG CÂY ĐÀO
    animationStarted = false;

    surprisePage.classList.remove("show");
    universePage.classList.add("active");
    startUniverse();

    // Đợi lớp phủ che kín rồi mới làm nó biến mất.
    requestAnimationFrame(function () {
      setTimeout(function () {
        transition.classList.remove("active");
      }, 100);
    });
  }, 800);
});

// HIỆU ỨNG VŨ TRỤ - chỉ khởi chạy khi trang 3 được mở

let universeStarted = false;
let finalPageMode = false;

function startUniverse() {
  if (universeStarted) return;
  universeStarted = true;

  const spaceCanvas = document.getElementById("space");
  const spaceCtx = spaceCanvas.getContext("2d");

  let W, H;
  let stars = [];
  let dust = [];
  let particles = [];

  function resizeUniverse() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    W = window.innerWidth;
    H = window.innerHeight;

    spaceCanvas.width = W * dpr;
    spaceCanvas.height = H * dpr;

    spaceCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    createStars();
    createDust();
  }

  window.addEventListener("resize", resizeUniverse);

  // SAO VŨ TRỤ

  function createStars() {
    stars = [];

    for (let i = 0; i < 450; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        size: 0.3 + Math.random() * 1.4,
        alpha: Math.random(),
        speed: 0.4 + Math.random() * 1.2,
      });
    }
  }

  function drawStars(time) {
    stars.forEach((star) => {
      const alpha =
        0.25 + Math.sin(time * 0.001 * star.speed + star.alpha * 10) * 0.3;

      spaceCtx.beginPath();

      spaceCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2);

      spaceCtx.fillStyle = `rgba(255, 210, 250, ${alpha})`;
      spaceCtx.fill();
    });
  }

  // BỤI VŨ TRỤ LƠ LỬNG

  function createDust() {
    dust = [];

    for (let i = 0; i < 220; i++) {
      dust.push({
        x: Math.random() * W,
        y: Math.random() * H,
        size: 0.5 + Math.random() * 2,

        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,

        alpha: 0.2 + Math.random() * 0.6,

        color: Math.random() > 0.5 ? "255, 170, 240" : "190, 100, 255",
      });
    }
  }

  function drawDust(time) {
    dust.forEach((p) => {
      // Di chuyển chậm như bụi bay trong không gian
      p.x += p.vx + Math.sin(time * 0.0005 + p.y) * 0.08;
      p.y += p.vy + Math.cos(time * 0.0004 + p.x) * 0.08;

      // Xuất hiện lại ở phía đối diện
      if (p.x < -5) p.x = W + 5;
      if (p.x > W + 5) p.x = -5;

      if (p.y < -5) p.y = H + 5;
      if (p.y > H + 5) p.y = -5;

      const glow = p.alpha * (0.7 + Math.sin(time * 0.001 + p.x) * 0.25);

      spaceCtx.beginPath();

      spaceCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

      spaceCtx.fillStyle = `rgba(${p.color}, ${glow})`;

      spaceCtx.shadowBlur = 8;
      spaceCtx.shadowColor = `rgb(${p.color})`;

      spaceCtx.fill();
    });

    spaceCtx.shadowBlur = 0;
  }

  // TẠO TRÁI TIM 3D

  function createHeart() {
    particles = [];

    const total = 2500;

    while (particles.length < total) {
      let x = (Math.random() * 2 - 1) * 1.3;
      let y = (Math.random() * 2 - 1) * 1.2;

      let a = x * x + y * y - 1;

      if (a * a * a - x * x * y * y * y > 0) {
        continue;
      }

      particles.push({
        x: x,
        y: y,
        z: (Math.random() - 0.5) * 0.35,

        size: 0.5 + Math.random() * 1.3,

        color: Math.random() > 0.5 ? "#ffb5df" : "#dc75ff",
      });
    }
  }

  // TRANG 3: VẼ TRÁI TIM HẠT SAO
  function drawHeart(time) {
    const scale = Math.min(W, H) / 3.2;

    // TRANG 4: trái tim chữ I LOVE YOU theo biên tham số để giữ rõ hai múi tim.
    if (finalPageMode) {
      const phrase = "I LOVE YOU";
      const fontSize = Math.max(4.6, Math.min(6.2, scale * 0.024));
      const rowGap = fontSize * 1.62;
      const heartScaleX = Math.min(W * 0.43, H * 0.43);
      const heartScaleY = heartScaleX * 0.95;
      const centerY = H / 2;
      const phraseWidth = (spaceCtx.measureText(phrase).width);

      // Tạo đường biên trái tim bằng đường cong tham số kinh điển.
      // Mỗi hàng sẽ có thể có HAI đoạn riêng biệt ở phần lõm phía trên.
      const boundary = [];
      const samples = 1600;
      let minHeartY = Infinity;
      let maxHeartY = -Infinity;
      for (let i = 0; i <= samples; i++) {
        const t = (i / samples) * Math.PI * 2;
        const bx = 16 * Math.pow(Math.sin(t), 3) / 16;
        const by = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        boundary.push({ x: bx, y: by });
        minHeartY = Math.min(minHeartY, by);
        maxHeartY = Math.max(maxHeartY, by);
      }
      const midHeartY = (minHeartY + maxHeartY) / 2;
      const halfHeartY = (maxHeartY - minHeartY) / 2;

      spaceCtx.save();
      spaceCtx.font = `600 ${fontSize}px Arial, sans-serif`;
      spaceCtx.textAlign = "center";
      spaceCtx.textBaseline = "middle";
      const textWidth = spaceCtx.measureText(phrase).width;
      const spacing = textWidth * 1.10;
      const rowCount = Math.ceil((heartScaleY * 2) / rowGap);

      for (let row = 0; row <= rowCount; row++) {
        const screenY = centerY - heartScaleY + row * rowGap;
        const normalizedY = (centerY - screenY) / heartScaleY;
        const targetY = midHeartY + normalizedY * halfHeartY;
        const intersections = [];

        for (let i = 0; i < boundary.length - 1; i++) {
          const a = boundary[i];
          const b = boundary[i + 1];
          if ((a.y <= targetY && b.y > targetY) || (b.y <= targetY && a.y > targetY)) {
            const ratio = (targetY - a.y) / (b.y - a.y);
            intersections.push(a.x + (b.x - a.x) * ratio);
          }
        }
        intersections.sort((a, b) => a - b);

        // Ghép từng cặp giao điểm thành vùng chữ; không nối qua vết lõm giữa hai múi tim.
        for (let interval = 0; interval + 1 < intersections.length; interval += 2) {
          const left = W / 2 + intersections[interval] * heartScaleX;
          const right = W / 2 + intersections[interval + 1] * heartScaleX;
          const availableWidth = right - left;
          if (availableWidth < textWidth * 0.8) continue;
          const count = Math.max(1, Math.floor((availableWidth + spacing * 0.08) / spacing));
          const usedWidth = (count - 1) * spacing;
          const startX = (left + right) / 2 - usedWidth / 2;

          for (let col = 0; col < count; col++) {
            const screenX = startX + col * spacing;
            const phase = row * 1.73 + col * 2.41 + interval * 0.7;
            const shimmer = 0.78 + 0.22 * (0.5 + 0.5 * Math.sin(time * 0.0032 + phase));

            // Quầng neon đỏ hồng.
            spaceCtx.globalAlpha = shimmer;
            spaceCtx.shadowColor = "#ff174f";
            spaceCtx.shadowBlur = fontSize * 2.8;
            spaceCtx.fillStyle = "#ff174f";
            spaceCtx.fillText(phrase, screenX, screenY);

            // Lớp chữ bóng với ánh sáng phản chiếu ở mép trên.
            const gloss = spaceCtx.createLinearGradient(0, screenY - fontSize, 0, screenY + fontSize);
            gloss.addColorStop(0, "#fff5fa");
            gloss.addColorStop(0.25, "#ff9dbb");
            gloss.addColorStop(0.58, "#ff285f");
            gloss.addColorStop(1, "#a90036");
            spaceCtx.shadowBlur = fontSize * 0.9;
            spaceCtx.shadowColor = "#ff6b9b";
            spaceCtx.fillStyle = gloss;
            spaceCtx.fillText(phrase, screenX, screenY);

            // Lấp lánh nhỏ, nhấp nháy lệch pha trên các cụm chữ.
            if ((row * 7 + col * 3) % 9 === 0) {
              const sparkle = Math.pow(Math.max(0, Math.sin(time * 0.004 + phase)), 10);
              if (sparkle > 0.22) {
                const sx = screenX + textWidth * 0.32;
                const sy = screenY - fontSize * 0.72;
                const radius = fontSize * (0.28 + sparkle * 0.38);
                spaceCtx.globalAlpha = sparkle;
                spaceCtx.shadowColor = "#ffffff";
                spaceCtx.shadowBlur = fontSize * 3.2;
                spaceCtx.fillStyle = "#ffffff";
                spaceCtx.beginPath();
                spaceCtx.arc(sx, sy, radius * 0.42, 0, Math.PI * 2);
                spaceCtx.fill();
                spaceCtx.fillRect(sx - radius * 1.5, sy - 0.3, radius * 3, 0.6);
                spaceCtx.fillRect(sx - 0.3, sy - radius * 1.5, 0.6, radius * 3);
              }
            }
          }
        }
      }
      spaceCtx.restore();
      return;
    }

    // Chế độ trang 3: trái tim hạt sao 3D như cũ.
    const rotateY = Math.sin(time * 0.00035) * 0.12;
    const rotateX = Math.cos(time * 0.00025) * 0.06;
    const projected = [];

    particles.forEach((p) => {
      let x1 = p.x * Math.cos(rotateY) + p.z * Math.sin(rotateY);
      let z1 = -p.x * Math.sin(rotateY) + p.z * Math.cos(rotateY);
      let y2 = p.y * Math.cos(rotateX) - z1 * Math.sin(rotateX);
      let z2 = p.y * Math.sin(rotateX) + z1 * Math.cos(rotateX);
      const perspective = 1 / (1 + z2 * 0.25);
      projected.push({
        x: W / 2 + x1 * scale * perspective,
        y: H / 2 - y2 * scale * perspective,
        size: p.size * perspective,
        color: p.color,
      });
    });

    projected.forEach((p) => {
      spaceCtx.beginPath();
      spaceCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      spaceCtx.fillStyle = p.color;
      spaceCtx.globalAlpha = 0.85;
      spaceCtx.shadowBlur = 7;
      spaceCtx.shadowColor = p.color;
      spaceCtx.fill();
    });

    spaceCtx.globalAlpha = 1;
    spaceCtx.shadowBlur = 0;
  }

  // ANIMATION

  function animateUniverse(time) {
    spaceCtx.clearRect(0, 0, W, H);

    drawStars(time);
    drawDust(time);
    drawHeart(time);

    requestAnimationFrame(animateUniverse);
  }

  resizeUniverse();
  createHeart();

  requestAnimationFrame(animateUniverse);
}
// ==================================================
// TRANG 3 - HIỆU ỨNG MỞ LỜI NHẮN
// ==================================================

const messageHeartButton = document.getElementById("messageHeartButton");

const messageCard = document.getElementById("messageCard");

const messageText = document.getElementById("messageText");

// ==================================================
// NỘI DUNG LỜI CHÚC
// ==================================================

// Anh thay chữ "lời chúc" bằng nội dung của mình.

const page3Wishes = [
  "hello Chi ,sau 2 trang vừa rồi có lễ bạn đã rất bất ngờ or ko maybe :)),NHƯNG ,bạn có biết rằng tôi với bạn đã chơi vs nhau hơn 1 nắm r (mặc dù hc vs nhau 4 năm :)))),đặc biệt là ngay cả khi tôi ko còn gập bạn :()  woww. Tôi nghĩ là t cần cảm ơn bạn rất nhiều ,bạn biết tại sao ko ,bởi vì....... ",

  "BỞI VÌ bạn là người chịu sẵng lòng nói chuyện ,chs với t , động viên t,...bạn có biết những dòng tin nhắn của bạn đã giúp t vượt qua cả 1 khoản thời gian tâm tối hong :))),cái cảm giác có người trò chuyện mỗi tối nó tht sự rất :))) . NHƯNG t nghĩ nguyên nhân chính chc là tại t thích nhắn vs bạn (mà thích thì cần lý do à :))))    ",

  "T không biết phải nói sao nữa ,à ừ t muốn nói là t yêu bạn ,rất rất thích ,mê luôn ,t ko bt tại sao nhưng khi gập bạn tim t chạy lung tung ,tay chân rung bần bật ,miệng nói ko ra chữ :))).T ko bt tại sao t lại nói những lời đó nhưng t bt nếu t ko nói bây giờ thì có lẽ sẽ ko còn cơ hội lần nữa .NÊN ....  ",

  "TÔI TUẤN thích bạn CHI ,tôi hi vọng bạn cho t cơ hội đc quan tâm ,tìm hiểu,đc yêu thương CHI nhiều hơn ,CẢM ƠN VÌ ĐÃ ĐỌC ĐẾN ĐÂY 😊 (tất cả đều là THẬT)",
];

let currentWishIndex = 0;
// ==================================================
// XỬ LÝ NÚT TRÁI TIM
// ==================================================

let messageOpened = false;

messageHeartButton.addEventListener("click", function () {
  // Chỉ cho phép nhấn một lần
  if (messageOpened) return;

  messageOpened = true;

  messageHeartButton.disabled = true;

  // Làm trái tim biến mất
  messageHeartButton.classList.add("hide");

  // Làm nền tối và mờ
  universePage.classList.add("message-mode");

  // Đợi nền hoàn thành hiệu ứng
  setTimeout(function () {
    // Hiện bảng lời nhắn
    messageCard.classList.add("visible");

    // Bắt đầu hiện từng từ
    setTimeout(function () {
      revealMessage();
    }, 500);
  }, 1500);
});

// ==================================================
// HIỆN LỜI CHÚC TỪNG TỪ
// ==================================================

// ==================================================
// HIỆN LỜI CHÚC TỪNG TỪ
// ==================================================

const nextWishButton = document.getElementById("nextWishButton");

nextWishButton.addEventListener("click", function () {
  // Nếu đang ở lời chúc cuối, chuyển sang trang 4.
  if (currentWishIndex >= page3Wishes.length - 1) {
    nextWishButton.classList.remove("show");
    nextWishButton.disabled = true;

    // Che màn hình trong lúc chuyển cảnh.
    transition.classList.add("active");

    setTimeout(function () {
      finalPageMode = true;
      universePage.classList.remove("message-mode");
      universePage.classList.add("final-page");

      // Ẩn toàn bộ giao diện lời nhắn: không còn bảng, nút tim hay mũi tên.
      document.querySelector(".message-wrapper").style.display = "none";
      messageHeartButton.style.display = "none";
      messageCard.classList.remove("visible");
      messageText.innerHTML = "";

      // Bỏ lớp mờ để chỉ còn nền vũ trụ và trái tim chữ.
      requestAnimationFrame(function () {
        setTimeout(function () {
          transition.classList.remove("active");
        }, 100);
      });
    }, 800);

    return;
  }

  // Chuyển sang lời chúc tiếp theo
  currentWishIndex++;

  // Xóa nội dung lời chúc cũ
  messageText.innerHTML = "";

  // Ẩn nút mũi tên
  nextWishButton.classList.remove("show");

  // Thu nhỏ khung trước khi hiện lời chúc mới
  messageCard.style.height = "0px";

  // Đợi khung thu nhỏ rồi hiện lời chúc mới
  setTimeout(function () {
    revealMessage();
  }, 400);
});
function revealMessage() {
  const words = page3Wishes[currentWishIndex].trim().split(/\s+/);

  let wordIndex = 0;
  const wordDelay = 180;

  function showNextWord() {
    if (wordIndex >= words.length) {
      // Chờ 2 giây sau khi chữ cuối xuất hiện
      setTimeout(function () {
        nextWishButton.classList.add("show");
      }, 2000);

      return;
    }

    const word = document.createElement("span");

    word.className = "message-word";
    word.textContent = words[wordIndex];

    messageText.appendChild(word);
    messageText.appendChild(document.createTextNode(" "));

    messageCard.style.height = messageCard.scrollHeight + "px";

    wordIndex++;

    setTimeout(showNextWord, wordDelay);
  }

  showNextWord();
}
