import { ProjectFiles, PeHeaderConfig, ElectronConfig } from '../types/pe-types';

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  category: 'Productivity' | 'Data Tools' | 'Kiosk & Retail' | 'Games & Creative';
  features: string[];
  recommendedWindow: {
    width: number;
    height: number;
    frame: boolean;
    titleBarStyle?: 'default' | 'hidden';
  };
  recommendedPe?: Partial<PeHeaderConfig>;
  files: ProjectFiles;
}

export const STARTER_TEMPLATES: TemplateDefinition[] = [
  {
    id: 'dashboard',
    name: 'Modern Enterprise Dashboard',
    description: 'Enterprise telemetry desktop dashboard with real-time memory metrics, IPC thread counters, and task record logs.',
    category: 'Productivity',
    features: ['Real-time Metrics', 'Local Storage State', 'Standard Windows 11 Chrome', 'ASLR + DEP Hardened'],
    recommendedWindow: { width: 1100, height: 720, frame: true },
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}
h2 { font-size: 20px; font-weight: 600; color: #ffffff; }
.subtitle { font-size: 12px; color: #94a3b8; margin-top: 2px; }
.header-actions { display: flex; gap: 10px; }
.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.15s ease;
}
.btn-primary { background: #2563eb; color: #ffffff; }
.btn-primary:hover { background: #1d4ed8; }
.btn-secondary { background: #1e293b; color: #cbd5e1; border: 1px solid #334155; }
.btn-secondary:hover { background: #334155; color: #ffffff; }
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
  font-size: 11px;
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
.stat-delta { font-size: 12px; color: #94a3b8; }
.stat-delta.positive { color: #10b981; }
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
.panel-header h3 { font-size: 15px; font-weight: 600; }
.badge {
  font-size: 11px;
  background: rgba(37, 99, 235, 0.2);
  color: #60a5fa;
  padding: 3px 8px;
  border-radius: 4px;
  border: 1px solid rgba(59, 130, 246, 0.3);
}
.table-wrapper { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; }
th { background: #0f172a; color: #94a3b8; font-weight: 500; padding: 10px 16px; border-bottom: 1px solid #334155; }
td { padding: 12px 16px; border-bottom: 1px solid #334155; color: #e2e8f0; }
tr:hover td { background: rgba(255, 255, 255, 0.02); }
.action-btn {
  background: transparent;
  border: 1px solid #475569;
  color: #94a3b8;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}
.action-btn:hover { background: #ef4444; border-color: #ef4444; color: #ffffff; }`,
      'app.js': `const initialTasks = [
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
    id: 'data_tool',
    name: 'Hex & Binary Data Inspector Tool',
    description: 'Data transformation and binary inspector utility with hex dump viewer, byte statistics, and conversion tools.',
    category: 'Data Tools',
    features: ['Hex Dump Matrix', 'ASCII Dissector', 'Byte Statistics', 'Tabular Numerals'],
    recommendedWindow: { width: 1040, height: 680, frame: true },
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ElectraData Inspector</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="shell">
    <header class="toolbar">
      <div class="tool-brand">
        <span class="mono-badge">0x</span>
        <span>Binary & Hex Data Inspector</span>
      </div>
      <div class="toolbar-stats">
        <span>Bytes: <b id="stat-bytes">0</b></span> ·
        <span>Words: <b id="stat-words">0</b></span> ·
        <span>Entropy: <b id="stat-entropy">0.00</b></span>
      </div>
      <div class="actions">
        <button id="btn-sample" class="t-btn">Load Sample</button>
        <button id="btn-clear" class="t-btn">Clear</button>
      </div>
    </header>

    <div class="panes">
      <div class="pane left">
        <label class="pane-label">INPUT BUFFER (TEXT / BYTES)</label>
        <textarea id="input-text" placeholder="Type or paste payload here..."></textarea>
      </div>
      <div class="pane right">
        <label class="pane-label">HEXADECIMAL DUMP & ASCII ALIGNMENT</label>
        <div id="hex-output" class="hex-view"></div>
      </div>
    </div>
  </div>
  <script src="app.js"></script>
</body>
</html>`,
      'styles.css': `* { margin:0; padding:0; box-sizing:border-box; font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
body { background:#090d16; color:#e2e8f0; height:100vh; overflow:hidden; }
.shell { display:flex; flex-direction:column; height:100vh; }
.toolbar { height:44px; background:#111827; border-bottom:1px solid #1f2937; display:flex; align-items:center; justify-content:space-between; padding:0 16px; }
.tool-brand { display:flex; align-items:center; gap:8px; font-size:13px; font-weight:600; color:#ffffff; }
.mono-badge { background:#0284c7; color:#fff; font-family:monospace; padding:2px 6px; border-radius:4px; font-size:11px; }
.toolbar-stats { font-size:11px; color:#9ca3af; font-family:monospace; }
.toolbar-stats b { color:#38bdf8; }
.actions { display:flex; gap:8px; }
.t-btn { background:#1f2937; color:#e5e7eb; border:1px solid #374151; padding:4px 10px; border-radius:4px; font-size:11px; cursor:pointer; }
.t-btn:hover { background:#374151; color:#fff; }
.panes { display:flex; flex:1; height:calc(100vh - 44px); }
.pane { flex:1; display:flex; flex-direction:column; padding:12px; }
.pane.left { border-right:1px solid #1f2937; }
.pane-label { font-size:10px; font-weight:700; color:#6b7280; letter-spacing:0.5px; margin-bottom:8px; font-family:monospace; }
textarea { flex:1; background:#030712; border:1px solid #1f2937; border-radius:6px; color:#f3f4f6; padding:12px; font-family:monospace; font-size:12px; resize:none; outline:none; }
.hex-view { flex:1; background:#030712; border:1px solid #1f2937; border-radius:6px; padding:12px; font-family:monospace; font-size:11px; overflow-y:auto; line-height:1.7; color:#38bdf8; }
.hex-line { display:flex; gap:16px; border-bottom:1px solid rgba(255,255,255,0.02); }
.hex-offset { color:#6b7280; width:50px; }
.hex-bytes { color:#10b981; letter-spacing:1px; flex:1; }
.hex-ascii { color:#e5e7eb; width:120px; }`,
      'app.js': `const input = document.getElementById('input-text');
const output = document.getElementById('hex-output');
const statBytes = document.getElementById('stat-bytes');
const statWords = document.getElementById('stat-words');
const statEntropy = document.getElementById('stat-entropy');

function updateHex() {
  const text = input.value;
  statBytes.textContent = text.length;
  statWords.textContent = text.trim() ? text.trim().split(/\\s+/).length : 0;
  
  // Calculate Shannon entropy
  const freqs = {};
  for (let i = 0; i < text.length; i++) {
    freqs[text[i]] = (freqs[text[i]] || 0) + 1;
  }
  let entropy = 0;
  for (let char in freqs) {
    const p = freqs[char] / text.length;
    entropy -= p * Math.log2(p);
  }
  statEntropy.textContent = text.length ? entropy.toFixed(2) : '0.00';

  // Render hex rows of 16 bytes
  let html = '';
  for (let i = 0; i < text.length; i += 16) {
    const slice = text.slice(i, i + 16);
    const offsetStr = i.toString(16).padStart(4, '0').toUpperCase();
    let hexStr = '';
    let asciiStr = '';

    for (let j = 0; j < 16; j++) {
      if (j < slice.length) {
        const code = slice.charCodeAt(j);
        hexStr += code.toString(16).padStart(2, '0').toUpperCase() + ' ';
        asciiStr += (code >= 32 && code <= 126) ? slice[j] : '.';
      } else {
        hexStr += '   ';
      }
    }

    html += \`<div class="hex-line">
      <span class="hex-offset">\${offsetStr}</span>
      <span class="hex-bytes">\${hexStr}</span>
      <span class="hex-ascii">\${asciiStr}</span>
    </div>\`;
  }

  output.innerHTML = html || '<span style="color:#6b7280">Buffer empty. Type or load sample payload.</span>';
}

document.getElementById('btn-sample')?.addEventListener('click', () => {
  input.value = \`MZ\\x90\\x00\\x03\\x00\\x00\\x00\\x04\\x00\\x00\\x00\\xFF\\xFF\\x00\\x00
This program cannot be run in DOS mode.
Portable Executable (PE32+) Image Signature: PE\\x00\\x00
Target Subsystem: IMAGE_SUBSYSTEM_WINDOWS_GUI
Security Mitigations: DynamicBase (ASLR) | NxCompat (DEP)\`;
  updateHex();
});

document.getElementById('btn-clear')?.addEventListener('click', () => {
  input.value = '';
  updateHex();
});

input.addEventListener('input', updateHex);
document.getElementById('btn-sample')?.click();`
    }
  },
  {
    id: 'kiosk',
    name: 'Interactive Touch & Kiosk Terminal',
    description: 'Fullscreen-optimized point-of-sale and digital signage kiosk application with big touch targets, PIN lock, and order simulation.',
    category: 'Kiosk & Retail',
    features: ['Frameless / Kiosk Presentation', 'Big Touch Targets', 'PIN Security Modal', 'Hardware Accelerated'],
    recommendedWindow: { width: 1280, height: 800, frame: false, titleBarStyle: 'hidden' },
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ElectraKiosk Terminal</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="kiosk-frame">
    <header class="kiosk-top">
      <div class="store-mark">
        <span class="dot"></span>
        <span>AERO-TERMINAL EXPRESS · POS-402</span>
      </div>
      <div class="time-block" id="kiosk-clock">12:00 PM</div>
      <button id="btn-lock" class="lock-btn">Lock Terminal</button>
    </header>

    <main class="kiosk-body">
      <div class="menu-grid">
        <div class="item-card" onclick="addToOrder('Express Pass', 15.00)">
          <div class="item-icon">🎟️</div>
          <div class="item-name">Priority Fast Pass</div>
          <div class="item-price">$15.00</div>
        </div>
        <div class="item-card" onclick="addToOrder('Lounge Access', 35.00)">
          <div class="item-icon">🛋️</div>
          <div class="item-name">VIP Suite Access</div>
          <div class="item-price">$35.00</div>
        </div>
        <div class="item-card" onclick="addToOrder('High-Speed Wi-Fi', 8.50)">
          <div class="item-icon">📡</div>
          <div class="item-name">Gigabit Wi-Fi Pass</div>
          <div class="item-price">$8.50</div>
        </div>
        <div class="item-card" onclick="addToOrder('Beverage Bundle', 6.00)">
          <div class="item-icon">☕</div>
          <div class="item-name">Artisan Beverage</div>
          <div class="item-price">$6.00</div>
        </div>
      </div>

      <aside class="order-sidebar">
        <h3>Current Transaction</h3>
        <div id="order-items" class="order-items-list">
          <p class="empty-hint">Touch an item to add to transaction</p>
        </div>
        <div class="order-footer">
          <div class="total-row">
            <span>Total Amount</span>
            <span id="order-total" class="total-price">$0.00</span>
          </div>
          <button id="btn-checkout" class="checkout-btn" disabled>Process Payment</button>
          <button id="btn-reset" class="void-btn">Void Transaction</button>
        </div>
      </aside>
    </main>
  </div>
  <script src="app.js"></script>
</body>
</html>`,
      'styles.css': `* { margin:0; padding:0; box-sizing:border-box; font-family:system-ui, -apple-system, sans-serif; user-select:none; }
body { background:#030712; color:#f9fafb; height:100vh; overflow:hidden; }
.kiosk-frame { display:flex; flex-direction:column; height:100vh; }
.kiosk-top { height:60px; background:#111827; border-bottom:1px solid #1f2937; display:flex; align-items:center; justify-content:space-between; padding:0 24px; }
.store-mark { display:flex; align-items:center; gap:10px; font-size:14px; font-weight:700; letter-spacing:1px; color:#60a5fa; }
.dot { width:10px; height:10px; border-radius:50%; background:#10b981; }
.time-block { font-family:monospace; font-size:16px; color:#9ca3af; font-weight:600; }
.lock-btn { background:#374151; color:#e5e7eb; border:none; padding:8px 16px; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer; }
.kiosk-body { display:flex; flex:1; }
.menu-grid { flex:1; display:grid; grid-template-columns:repeat(2, 1fr); gap:16px; padding:24px; overflow-y:auto; }
.item-card { background:#111827; border:2px solid #1f2937; border-radius:12px; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:24px; cursor:pointer; transition:all 0.15s ease; text-align:center; }
.item-card:active { transform:scale(0.97); border-color:#2563eb; background:#1e293b; }
.item-icon { font-size:42px; margin-bottom:12px; }
.item-name { font-size:16px; font-weight:600; color:#ffffff; margin-bottom:6px; }
.item-price { font-size:20px; font-weight:700; color:#38bdf8; font-family:monospace; }
.order-sidebar { width:340px; background:#0f172a; border-left:1px solid #1e293b; display:flex; flex-direction:column; padding:20px; }
.order-sidebar h3 { font-size:15px; font-weight:600; padding-bottom:12px; border-bottom:1px solid #1e293b; }
.order-items-list { flex:1; overflow-y:auto; padding:12px 0; }
.empty-hint { color:#64748b; font-size:13px; text-align:center; margin-top:40px; }
.order-row { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.05); font-size:13px; }
.order-footer { border-top:1px solid #1e293b; padding-top:16px; }
.total-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; font-size:14px; }
.total-price { font-size:24px; font-weight:800; color:#10b981; font-family:monospace; }
.checkout-btn { width:100%; height:48px; background:#2563eb; color:#fff; border:none; border-radius:8px; font-size:15px; font-weight:700; cursor:pointer; margin-bottom:8px; }
.checkout-btn:disabled { background:#334155; color:#64748b; cursor:not-allowed; }
.void-btn { width:100%; height:36px; background:transparent; color:#ef4444; border:1px solid #7f1d1d; border-radius:6px; font-size:12px; cursor:pointer; }`,
      'app.js': `let currentOrder = [];

function updateClock() {
  const clock = document.getElementById('kiosk-clock');
  if (clock) {
    clock.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
}
setInterval(updateClock, 1000);
updateClock();

window.addToOrder = function(name, price) {
  currentOrder.push({ name, price });
  renderOrder();
};

function renderOrder() {
  const list = document.getElementById('order-items');
  const totalEl = document.getElementById('order-total');
  const checkoutBtn = document.getElementById('btn-checkout');
  if (!list || !totalEl || !checkoutBtn) return;

  if (currentOrder.length === 0) {
    list.innerHTML = '<p class="empty-hint">Touch an item to add to transaction</p>';
    totalEl.textContent = '$0.00';
    checkoutBtn.disabled = true;
    return;
  }

  let total = 0;
  let html = '';
  currentOrder.forEach((item) => {
    total += item.price;
    html += \`<div class="order-row">
      <span>\${item.name}</span>
      <span style="font-family:monospace; font-weight:600">\$\${item.price.toFixed(2)}</span>
    </div>\`;
  });

  list.innerHTML = html;
  totalEl.textContent = '$' + total.toFixed(2);
  checkoutBtn.disabled = false;
}

document.getElementById('btn-reset')?.addEventListener('click', () => {
  currentOrder = [];
  renderOrder();
});

document.getElementById('btn-checkout')?.addEventListener('click', () => {
  alert('Transaction Approved! Printing receipt ticket...');
  currentOrder = [];
  renderOrder();
});

document.getElementById('btn-lock')?.addEventListener('click', () => {
  const pin = prompt('Enter 4-digit Manager PIN:');
  if (pin === '1234') {
    alert('Terminal Unlocked.');
  } else {
    alert('Invalid PIN.');
  }
});`
    }
  },
  {
    id: 'game',
    name: 'Retro Neon Arcade (60 FPS)',
    description: 'Hardware-accelerated HTML5 Canvas breakout game with paddle physics, particle sparks, and Web Audio.',
    category: 'Games & Creative',
    features: ['60 FPS Canvas Physics', 'Hardware Acceleration', 'Keyboard & Mouse Handlers'],
    recommendedWindow: { width: 860, height: 600, frame: true },
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
.arcade-wrap { text-align: center; }
.arcade-hud {
  display: flex;
  justify-content: space-between;
  width: 700px;
  margin: 0 auto 10px;
  font-weight: bold;
  font-size: 16px;
  letter-spacing: 2px;
}
.hud-item.title { color: #ff0055; text-shadow: 0 0 10px #ff0055; }
canvas {
  background: #020409;
  border: 2px solid #00f0ff;
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.3);
  display: block;
}
.controls-hint { margin-top: 10px; font-size: 11px; color: #64748b; letter-spacing: 1px; }`,
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
    name: 'ElectraNotes Markdown Studio',
    description: 'Minimalist offline desktop markdown writer with live HTML rendering and word counter.',
    category: 'Productivity',
    features: ['Split-Pane Markdown', 'Instant HTML Rendering', 'Word & Character Metrics', 'Pure Offline'],
    recommendedWindow: { width: 1000, height: 650, frame: true },
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
.editor-shell { display: flex; flex-direction: column; height: 100vh; }
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
.panes { display: flex; flex: 1; height: calc(100vh - 40px); }
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
.preview { flex: 1; padding: 24px; overflow-y: auto; line-height: 1.7; }
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
  return md
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\\*\\*(.*?)\\*\\*/gim, '<strong>$1</strong>')
    .replace(/\\*(.*?)\\*/gim, '<em>$1</em>')
    .replace(/\`([^\\\`]+)\`/gim, '<code>$1</code>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/\\n/gim, '<br>');
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
