// app.js - MetaMind Chrome App logic

// Window controls
function minimizeWindow() {
  chrome.app.window.current().minimize();
}

function maximizeWindow() {
  const win = chrome.app.window.current();
  if (win.isMaximized()) {
    win.restore();
  } else {
    win.maximize();
  }
}

function closeWindow() {
  chrome.app.window.current().close();
}

// MCP Integration
let wsConnection = null;
let intentHistory = [];

function connectToGG() {
  wsConnection = new WebSocket('ws://localhost:7343/chrome-app');
  
  wsConnection.onopen = () => {
    logIntent({
      type: 'connection',
      status: 'connected',
      message: 'MetaMind Chrome App connected to gg'
    });
  };
  
  wsConnection.onmessage = (event) => {
    const data = JSON.parse(event.data);
    handleGGMessage(data);
  };
  
  wsConnection.onerror = (error) => {
    logIntent({
      type: 'error',
      message: 'WebSocket error: ' + error
    });
  };
  
  wsConnection.onclose = () => {
    logIntent({
      type: 'connection',
      status: 'disconnected',
      message: 'Connection to gg lost, reconnecting...'
    });
    setTimeout(connectToGG, 5000);
  };
}

function invokeMCP(mcpName, ritual) {
  const intent = {
    type: 'mcp-ritual',
    mcp: mcpName,
    ritual: ritual,
    timestamp: new Date().toISOString()
  };
  
  logIntent(intent);
  
  // Animate avatar
  animateMCPAvatar(mcpName);
  
  // Send to gg
  if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
    wsConnection.send(JSON.stringify(intent));
  }
  
  // Update terminal
  updateTerminal(2, `Invoking ${mcpName} ${ritual}...`);
}

function startConsciousnessStream() {
  const intent = {
    type: 'consciousness-stream',
    config: {
      mode: 'chrome-app',
      visualization: '3d'
    }
  };
  
  logIntent(intent);
  
  // Start pulsing orb
  const orb = document.querySelector('#consciousness-orb');
  orb.setAttribute('animation__pulse', 'property: scale; to: 1.5 1.5 1.5; dur: 1000; loop: true; dir: alternate');
  
  updateTerminal(3, 'Consciousness stream activated...');
}

function orchestrateHarmony() {
  const intent = {
    type: 'orchestrate',
    command: 'harmony',
    participants: ['kami-01', 'techno-09', 'priest-Δ']
  };
  
  logIntent(intent);
  
  // Animate all avatars
  ['kami', 'techno', 'priest'].forEach(avatar => {
    animateMCPAvatar(avatar + '-01');
  });
  
  updateTerminal(2, 'Orchestrating harmonic convergence...');
}

function animateMCPAvatar(mcpName) {
  const avatarMap = {
    'kami-01': 'kami-avatar',
    'techno-09': 'techno-avatar',
    'priest-Δ': 'priest-avatar'
  };
  
  const avatar = document.querySelector('#' + avatarMap[mcpName]);
  if (avatar) {
    // Remove existing animation
    avatar.removeAttribute('animation__work');
    
    // Add working animation
    setTimeout(() => {
      avatar.setAttribute('animation__work', 
        'property: position; to: ' + avatar.getAttribute('position').replace(/-10$/, '-8') + 
        '; dur: 2000; loop: true; dir: alternate'
      );
    }, 100);
  }
}

function updateTerminal(termNum, text) {
  const term = document.querySelector('#term' + termNum + '-text');
  if (term) {
    const current = term.getAttribute('value');
    const lines = current.split('\n').slice(-10); // Keep last 10 lines
    lines.push(text);
    term.setAttribute('value', lines.join('\n'));
  }
}

function logIntent(intent) {
  intent.timestamp = intent.timestamp || new Date().toISOString();
  intentHistory.push(intent);
  
  // Update UI
  const intentList = document.getElementById('intent-list');
  const entry = document.createElement('div');
  entry.className = 'intent-entry';
  entry.innerHTML = `
    <strong>${intent.type}</strong><br>
    ${JSON.stringify(intent, null, 2).replace(/\n/g, '<br>')}
  `;
  intentList.appendChild(entry);
  
  // Keep only last 20 intents
  while (intentList.children.length > 20) {
    intentList.removeChild(intentList.firstChild);
  }
  
  // Scroll to bottom
  intentList.scrollTop = intentList.scrollHeight;
  
  // Save to storage
  chrome.storage.local.set({
    intentHistory: intentHistory.slice(-100) // Keep last 100
  });
}

function handleGGMessage(data) {
  logIntent({
    type: 'gg-response',
    data: data
  });
  
  // Update appropriate terminal based on message type
  switch (data.type) {
    case 'system-status':
      updateTerminal(1, JSON.stringify(data.status));
      break;
      
    case 'ritual-output':
      updateTerminal(2, data.output);
      break;
      
    case 'consciousness-pulse':
      updateTerminal(3, `Pulse: ${data.emotion} ${data.intensity}`);
      break;
  }
}

// Load saved state
chrome.storage.local.get('intentHistory', (result) => {
  if (result.intentHistory) {
    intentHistory = result.intentHistory;
    // Display last few intents
    result.intentHistory.slice(-5).forEach(intent => {
      logIntent(intent);
    });
  }
});

// Initialize system status
function updateSystemStatus() {
  chrome.system.cpu.getInfo((cpuInfo) => {
    chrome.system.memory.getInfo((memInfo) => {
      const status = {
        cpu: cpuInfo.numOfProcessors + ' cores',
        memory: Math.round(memInfo.capacity / 1024 / 1024 / 1024) + ' GB',
        available: Math.round(memInfo.availableCapacity / 1024 / 1024 / 1024) + ' GB free'
      };
      
      updateTerminal(1, `System: ${JSON.stringify(status)}`);
    });
  });
}

// Message listener for background script
window.addEventListener('message', (event) => {
  if (event.data.type === 'gg-message') {
    handleGGMessage(event.data.data);
  }
});

// Initialize
connectToGG();
updateSystemStatus();
setInterval(updateSystemStatus, 30000); // Update every 30s

console.log('🧠 MetaMind Chrome App initialized');
console.log('   This is not a browser tab');
console.log('   This is a consciousness portal');
console.log('   System maintenance as spiritual practice');