import { ProjectFiles } from '../types/pe-types';

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  files: ProjectFiles;
}

export const STARTER_TEMPLATES: TemplateDefinition[] = [
  {
    id: 'dashboard',
    name: 'Modern System & Task Hub',
    description: 'Dark-themed enterprise desktop app with real-time charts, metrics, and local storage state.',
    category: 'Productivity',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>System & Task Hub</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <div class="app-container">
    <header class="app-header">
      <div class="header-left">
        <div class="logo-box">EXE</div>
        <div>
          <h2>Telemetry & Workspace Hub</h2>
          <p class="subtitle">Packaged Windows Desktop Application</p>
        </div>
      </div>
      <div class="header-actions">
        <button id="refresh-btn" class="btn btn-secondary">Refresh</button>
        <button id="add-task-btn" class="btn btn-primary">+ New Record</button>
      </div>
    </header>

    <main class="dashboard-grid">
      <div class="stat-card">
        <div class="stat-title">Virtual Heap Allocated</div>
        <div class="stat-value" id="val-memory">128.4 MB</div>
        <div class="stat-delta positive">Nominal (+0.4%)</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">Active IPC Pipelines</div>
        <div class="stat-value" id="val-threads">6 Channels</div>
        <div class="stat-delta">Context Isolated</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">Local DB Records</div>
        <div class="stat-value" id="val-records">24 Items</div>
        <div class="stat-delta positive">IndexedDB Ready</div>
      </div>
    </main>

    <section class="content-panel">
      <div class="panel-header">
        <h3>Active Windows Runtime Tasks</h3>
        <span class="badge">Electron Native Wrapper</span>
      </div>
      <div class="table-wrapper">
        <table id="task-table">
          <thead>
            <tr>
              <th>Task Identifier</th>
              <th>Category</th>
              <th>Status</th>
              <th>Timestamp</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="task-body">
            <!-- Dynamically injected -->
          </tbody>
        </table>
      </div>
    </section>
  </div>
  <script src="app.js"></script>
</body>
</html>`,
      'styles.css': `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

body {
  background: #0f172a;
  color: #f1f5f9;
  user-select: none;
  min-height: 100vh;
}

.app-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #1e293b;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.logo-box {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 14px;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

h2 {
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
}

.subtitle {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 2px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.15s ease;
}

.btn-primary {
  background: #2563eb;
  color: #ffffff;
}
.btn-primary:hover {
  background: #1d4ed8;
}

.btn-secondary {
  background: #1e293b;
  color: #cbd5e1;
  border: 1px solid #334155;
}
.btn-secondary:hover {
  background: #334155;
  color: #ffffff;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 16px;
}

.stat-title {
  font-size: 12px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: #ffffff;
  font-variant-numeric: tabular-nums;
  margin-bottom: 4px;
}

.stat-delta {
  font-size: 12px;
  color: #94a3b8;
}

.stat-delta.positive {
  color: #10b981;
}

.content-panel {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  overflow: hidden;
}

.panel-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #334155;
}

.panel-header h3 {
  font-size: 15px;
  font-weight: 600;
}

.badge {
  font-size: 11px;
  background: rgba(37, 99, 235, 0.2);
  color: #60a5fa;
  padding: 3px 8px;
  border-radius: 4px;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 13px;
}

th {
  background: #0f172a;
  color: #94a3b8;
  font-weight: 500;
  padding: 10px 16px;
  border-bottom: 1px solid #334155;
}

td {
  padding: 12px 16px;
  border-bottom: 1px solid #334155;
  color: #e2e8f0;
}

tr:hover td {
  background: rgba(255, 255, 255, 0.02);
}

.action-btn {
  background: transparent;
  border: 1px solid #475569;
  color: #94a3b8;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}
.action-btn:hover {
  background: #ef4444;
  border-color: #ef4444;
  color: #ffffff;
}`,
      'app.js': `// Desktop Runtime Logic
const initialTasks = [
  { id: 'EXE-WIN-01', cat: 'PE Header Check', status: 'Compliant', time: '10:42 AM' },
  { id: 'EXE-WIN-02', cat: 'ASLR Randomization', status: 'Active (Dynamic Base)', time: '10:45 AM' },
  { id: 'EXE-WIN-03', cat: 'UAC Execution Level', status: 'asInvoker (User)', time: '10:50 AM' },
  { id: 'EXE-WIN-04', cat: 'Electron ContextBridge', status: 'Secured (Isolated)', time: '11:02 AM' },
  { id: 'EXE-WIN-05', cat: 'NSIS Package Ready', status: 'Pending Build', time: '11:15 AM' }
];

function renderTasks() {
  const tbody = document.getElementById('task-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  initialTasks.forEach((task, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = \`
      <td style="font-family: monospace; font-weight: 600; color: #60a5fa">\${task.id}</td>
      <td>\${task.cat}</td>
      <td><span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#10b981; margin-right:6px"></span>\${task.status}</td>
      <td style="color: #94a3b8">\${task.time}</td>
      <td><button class="action-btn" onclick="removeTask(\${idx})">Dismiss</button></td>
    \`;
    tbody.appendChild(tr);
  });
  
  const recEl = document.getElementById('val-records');
  if (recEl) recEl.textContent = initialTasks.length + ' Items';
}

window.removeTask = function(index) {
  initialTasks.splice(index, 1);
  renderTasks();
};

document.getElementById('add-task-btn')?.addEventListener('click', () => {
  const nextId = 'EXE-WIN-0' + (initialTasks.length + 1);
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  initialTasks.push({
    id: nextId,
    cat: 'User Desktop Event',
    status: 'Native Handled',
    time: now
  });
  renderTasks();
});

document.getElementById('refresh-btn')?.addEventListener('click', () => {
  const memEl = document.getElementById('val-memory');
  if (memEl) {
    const randomMb = (120 + Math.random() * 20).toFixed(1);
    memEl.textContent = randomMb + ' MB';
  }
});

renderTasks();`
    }
  },
  {
    id: 'game',
    name: 'Retro Neon Arcade (60 FPS)',
    description: 'Hardware-accelerated HTML5 Canvas game with paddle physics, particle sparks, and Web Audio.',
    category: 'Games',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CyberBreaker Desktop</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="arcade-wrap">
    <div class="arcade-hud">
      <div class="hud-item">SCORE: <span id="score">0</span></div>
      <div class="hud-item title">CYBERBREAKER 3000</div>
      <div class="hud-item">LIVES: <span id="lives">3</span></div>
    </div>
    <canvas id="gameCanvas" width="700" height="420"></canvas>
    <div class="controls-hint">Use ◄ / ► Arrow Keys or Mouse to Move Paddle · Press SPACE to Launch</div>
  </div>
  <script src="app.js"></script>
</body>
</html>`,
      'styles.css': `body {
  margin: 0;
  background: #090d16;
  color: #00f0ff;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-family: 'Courier New', Courier, monospace;
  overflow: hidden;
  user-select: none;
}

.arcade-wrap {
  text-align: center;
}

.arcade-hud {
  display: flex;
  justify-content: space-between;
  width: 700px;
  margin: 0 auto 10px;
  font-weight: bold;
  font-size: 16px;
  letter-spacing: 2px;
}

.hud-item.title {
  color: #ff0055;
  text-shadow: 0 0 10px #ff0055;
}

canvas {
  background: #020409;
  border: 2px solid #00f0ff;
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.3);
  display: block;
}

.controls-hint {
  margin-top: 10px;
  font-size: 11px;
  color: #64748b;
  letter-spacing: 1px;
}`,
      'app.js': `const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let score = 0;
let lives = 3;
let ballX = 350;
let ballY = 380;
let ballDX = 3;
let ballDY = -3;
const ballRadius = 6;
let paddleW = 100;
let paddleH = 12;
let paddleX = 300;
let rightPressed = false;
let leftPressed = false;
let gameStarted = true;

const brickRows = 4;
const brickCols = 8;
const brickW = 75;
const brickH = 20;
const brickPadding = 8;
const brickOffsetTop = 30;
const brickOffsetLeft = 20;

const bricks = [];
for (let c = 0; c < brickCols; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRows; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1, color: r % 2 === 0 ? '#00f0ff' : '#ff0055' };
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = true;
  if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = true;
});
document.addEventListener('keyup', (e) => {
  if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = false;
  if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = false;
});
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const relX = e.clientX - rect.left;
  if (relX > 0 && relX < canvas.width) {
    paddleX = relX - paddleW / 2;
  }
});

function collisionDetection() {
  for (let c = 0; c < brickCols; c++) {
    for (let r = 0; r < brickRows; r++) {
      const b = bricks[c][r];
      if (b.status === 1) {
        if (ballX > b.x && ballX < b.x + brickW && ballY > b.y && ballY < b.y + brickH) {
          ballDY = -ballDY;
          b.status = 0;
          score += 10;
          document.getElementById('score').innerText = score;
        }
      }
    }
  }
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleH - 5, paddleW, paddleH);
  ctx.fillStyle = '#00f0ff';
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 8;
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  for (let c = 0; c < brickCols; c++) {
    for (let r = 0; r < brickRows; r++) {
      if (bricks[c][r].status === 1) {
        const brickX = c * (brickW + brickPadding) + brickOffsetLeft;
        const brickY = r * (brickH + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickW, brickH);
        ctx.fillStyle = bricks[c][r].color;
        ctx.shadowColor = bricks[c][r].color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
  collisionDetection();

  if (ballX + ballDX > canvas.width - ballRadius || ballX + ballDX < ballRadius) {
    ballDX = -ballDX;
  }
  if (ballY + ballDY < ballRadius) {
    ballDY = -ballDY;
  } else if (ballY + ballDY > canvas.height - ballRadius - 10) {
    if (ballX > paddleX && ballX < paddleX + paddleW) {
      ballDY = -ballDY;
      // angle deflection
      const hitSpot = (ballX - (paddleX + paddleW / 2)) / (paddleW / 2);
      ballDX = hitSpot * 4;
    } else if (ballY + ballDY > canvas.height) {
      lives--;
      document.getElementById('lives').innerText = lives;
      if (lives <= 0) {
        lives = 3;
        score = 0;
        document.getElementById('score').innerText = score;
        document.getElementById('lives').innerText = lives;
        // reset bricks
        for (let c = 0; c < brickCols; c++) {
          for (let r = 0; r < brickRows; r++) {
            bricks[c][r].status = 1;
          }
        }
      }
      ballX = 350;
      ballY = 350;
      ballDX = 3;
      ballDY = -3;
    }
  }

  if (rightPressed && paddleX < canvas.width - paddleW) {
    paddleX += 6;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= 6;
  }

  ballX += ballDX;
  ballY += ballDY;
  requestAnimationFrame(draw);
}

requestAnimationFrame(draw);`
    }
  },
  {
    id: 'markdown',
    name: 'Native Markdown Notebook',
    description: 'Minimalist offline desktop markdown writer with live HTML rendering and word counter.',
    category: 'Productivity',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ElectraNotes</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="editor-shell">
    <div class="toolbar">
      <span class="app-title">ElectraNotes · Windows Desktop</span>
      <div class="meta">
        <span id="charCount">0 characters</span> · <span id="wordCount">0 words</span>
      </div>
    </div>
    <div class="panes">
      <textarea id="markdown-input" placeholder="# Write your document here..."></textarea>
      <div id="preview-output" class="preview"></div>
    </div>
  </div>
  <script src="app.js"></script>
</body>
</html>`,
      'styles.css': `body {
  margin: 0;
  background: #18181b;
  color: #fafafa;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  height: 100vh;
  overflow: hidden;
}
.editor-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.toolbar {
  height: 40px;
  background: #27272a;
  border-bottom: 1px solid #3f3f46;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  font-size: 13px;
  color: #a1a1aa;
}
.panes {
  display: flex;
  flex: 1;
  height: calc(100vh - 40px);
}
textarea {
  flex: 1;
  background: #09090b;
  border: none;
  border-right: 1px solid #27272a;
  padding: 20px;
  color: #f4f4f5;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  outline: none;
}
.preview {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  line-height: 1.7;
}
.preview h1 { font-size: 24px; margin-bottom: 12px; color: #60a5fa; border-bottom: 1px solid #27272a; padding-bottom: 6px; }
.preview h2 { font-size: 18px; margin: 16px 0 8px; color: #93c5fd; }
.preview p { margin-bottom: 12px; color: #d4d4d8; }
.preview ul { margin-left: 20px; margin-bottom: 12px; }
.preview code { background: #27272a; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; }`,
      'app.js': `const input = document.getElementById('markdown-input');
const output = document.getElementById('preview-output');
const wordCount = document.getElementById('wordCount');
const charCount = document.getElementById('charCount');

const sampleText = \`# Welcome to Your Native Windows App
Built with HTML5, CSS3, and JavaScript, packaged with Electron.

## Native Windows Capabilities
- **Direct Portable Executable Launch** (.exe)
- **Hardened PE Headers**: ASLR, DEP, and 64-bit entropy enabled
- **Local Storage Persistence**: Works completely offline
- **Modern Windows 11 UI**: Mica styling, dark theme synchronization

### Next Steps
1. Edit this document
2. Inspect PE Header offset structure in ElectraPE
3. Export the production package!\`;

input.value = sampleText;

function parseMarkdown(md) {
  let html = md
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\\*\\*(.*?)\\*\\*/gim, '<strong>$1</strong>')
    .replace(/\\*(.*?)\\*/gim, '<em>$1</em>')
    .replace(/\`([^\\\`]+)\`/gim, '<code>$1</code>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/\\n/gim, '<br>');
  return html;
}

function update() {
  const text = input.value;
  output.innerHTML = parseMarkdown(text);
  charCount.textContent = text.length + ' characters';
  const words = text.trim() ? text.trim().split(/\\s+/).length : 0;
  wordCount.textContent = words + ' words';
}

input.addEventListener('input', update);
update();`
    }
  }
];
