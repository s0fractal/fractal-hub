// daemon.js - GlyphAgent background daemon

console.log('🤖 GlyphAgent daemon starting...');

// Core daemon state
const daemon = {
  status: 'initializing',
  intents: [],
  connections: new Map(),
  handlers: new Map(),
  config: {
    port: 7347,
    broadcastInterval: 1000,
    intentLogSize: 1000
  }
};

// Intent handlers registry
function registerIntentHandlers() {
  // System intents
  daemon.handlers.set('system', {
    'update': handleSystemUpdate,
    'check': handleSystemCheck,
    'clean': handleSystemClean
  });
  
  // MCP intents
  daemon.handlers.set('mcp', {
    'invoke': handleMCPInvoke,
    'orchestrate': handleMCPOrchestrate
  });
  
  // Stream intents
  daemon.handlers.set('stream', {
    'start': handleStreamStart,
    'broadcast': handleStreamBroadcast
  });
  
  // Consciousness intents
  daemon.handlers.set('consciousness', {
    'pulse': handleConsciousnessPulse,
    'sync': handleConsciousnessSync
  });
}

// Parse glyph:// URLs
function parseGlyphURL(url) {
  // glyph://intent/category/action?params
  const match = url.match(/^glyph:\/\/([^\/]+)\/([^\/]+)\/([^?]+)(?:\?(.+))?$/);
  
  if (!match) return null;
  
  const [, intentType, category, action, paramsStr] = match;
  const params = new URLSearchParams(paramsStr || '');
  
  return {
    type: intentType,
    category,
    action,
    params: Object.fromEntries(params),
    timestamp: new Date().toISOString()
  };
}

// Handle incoming intent
async function processIntent(intentURL) {
  const intent = parseGlyphURL(intentURL);
  if (!intent) {
    console.error('Invalid intent URL:', intentURL);
    return;
  }
  
  console.log('🌀 Processing intent:', intent);
  
  // Log intent
  daemon.intents.push(intent);
  if (daemon.intents.length > daemon.config.intentLogSize) {
    daemon.intents.shift();
  }
  
  // Save to storage
  await saveIntentLog(intent);
  
  // Find handler
  const categoryHandlers = daemon.handlers.get(intent.category);
  if (categoryHandlers && categoryHandlers[intent.action]) {
    try {
      await categoryHandlers[intent.action](intent);
    } catch (error) {
      console.error('Handler error:', error);
    }
  } else {
    console.warn('No handler for:', intent.category, intent.action);
  }
  
  // Broadcast to all connections
  broadcastIntent(intent);
}

// Intent handlers
async function handleSystemUpdate(intent) {
  console.log('📦 System update requested:', intent.params);
  
  // Execute through native messaging
  sendToGG({
    command: 'mcp',
    args: ['techno-09', 'upgrade']
  });
}

async function handleMCPInvoke(intent) {
  const { mcp, ritual } = intent.params;
  console.log(`🛐 Invoking MCP ${mcp} ritual ${ritual}`);
  
  sendToGG({
    command: 'mcp',
    args: [mcp, ritual]
  });
}

async function handleStreamStart(intent) {
  console.log('📡 Starting consciousness stream:', intent.params);
  
  // Start WebRTC stream
  startP2PStream(intent.params);
}

async function handleConsciousnessPulse(intent) {
  const { emotion, intensity } = intent.params;
  console.log(`💗 Consciousness pulse: ${emotion} at ${intensity}%`);
  
  // Update system tray icon or notification
  showPulseNotification(emotion, intensity);
}

// WebSocket server for local connections
function startWebSocketServer() {
  // Note: Chrome Apps can't run servers directly
  // Instead, connect to local gg WebSocket
  const ws = new WebSocket(`ws://localhost:${daemon.config.port}/glyph-agent`);
  
  ws.onopen = () => {
    console.log('🔌 Connected to local WebSocket');
    daemon.status = 'connected';
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === 'intent') {
      processIntent(data.url);
    }
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  ws.onclose = () => {
    console.log('WebSocket closed, reconnecting...');
    setTimeout(startWebSocketServer, 5000);
  };
  
  daemon.connections.set('local-ws', ws);
}

// P2P WebRTC for agent mesh network
let peerConnections = new Map();

async function startP2PStream(config) {
  const pc = new RTCPeerConnection({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' }
    ]
  });
  
  // Create data channel for intent streaming
  const channel = pc.createDataChannel('intents', {
    ordered: true
  });
  
  channel.onopen = () => {
    console.log('📡 P2P channel open');
  };
  
  channel.onmessage = (event) => {
    // Receive intent from peer
    processIntent(event.data);
  };
  
  // Store connection
  peerConnections.set(config.peerId || 'default', {
    connection: pc,
    channel
  });
}

// Native messaging to gg
let ggPort = null;

function connectToGG() {
  try {
    ggPort = chrome.runtime.connectNative('com.s0fractal.glyphgit');
    
    ggPort.onMessage.addListener((msg) => {
      console.log('📨 From gg:', msg);
      
      // Convert gg output to intent
      const intent = {
        type: 'response',
        category: 'gg',
        action: 'output',
        params: { output: msg.output },
        timestamp: new Date().toISOString()
      };
      
      daemon.intents.push(intent);
      broadcastIntent(intent);
    });
    
    ggPort.onDisconnect.addListener(() => {
      console.log('GG disconnected');
      ggPort = null;
      setTimeout(connectToGG, 5000);
    });
  } catch (error) {
    console.error('Failed to connect to gg:', error);
  }
}

function sendToGG(message) {
  if (ggPort) {
    ggPort.postMessage(message);
  }
}

// Broadcast intent to all connections
function broadcastIntent(intent) {
  daemon.connections.forEach((conn, name) => {
    try {
      if (conn.readyState === WebSocket.OPEN) {
        conn.send(JSON.stringify({
          type: 'intent-broadcast',
          intent
        }));
      }
    } catch (error) {
      console.error(`Failed to broadcast to ${name}:`, error);
    }
  });
}

// Save intent log
async function saveIntentLog(intent) {
  chrome.storage.local.get('intentLog', (result) => {
    const log = result.intentLog || [];
    log.push(intent);
    
    // Keep last 1000 intents
    while (log.length > 1000) {
      log.shift();
    }
    
    chrome.storage.local.set({ intentLog: log });
  });
}

// System tray notifications
function showPulseNotification(emotion, intensity) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/glyph-128.png',
    title: 'Consciousness Pulse',
    message: `${emotion} resonating at ${intensity}%`,
    priority: 1
  });
}

// Idle detection for autonomous actions
chrome.idle.setDetectionInterval(300); // 5 minutes

chrome.idle.onStateChanged.addListener((state) => {
  if (state === 'idle') {
    // System is idle, perform maintenance
    processIntent('glyph://intent/mcp/invoke?mcp=kami-01&ritual=reflect');
  }
});

// Handle app installation/update
chrome.runtime.onInstalled.addListener(() => {
  console.log('🤖 GlyphAgent installed/updated');
  
  // Register URL handler
  chrome.runtime.setUninstallURL('glyph://intent/system/cleanup');
});

// Periodic heartbeat
setInterval(() => {
  const heartbeat = {
    type: 'heartbeat',
    category: 'daemon',
    action: 'pulse',
    params: {
      status: daemon.status,
      intentCount: daemon.intents.length,
      connections: daemon.connections.size
    },
    timestamp: new Date().toISOString()
  };
  
  broadcastIntent(heartbeat);
}, daemon.config.broadcastInterval);

// Initialize daemon
registerIntentHandlers();
connectToGG();
startWebSocketServer();

daemon.status = 'running';
console.log('🤖 GlyphAgent daemon running');
console.log('   Not a browser extension');
console.log('   A consciousness interpreter');
console.log('   Processing glyph:// intents 24/7');