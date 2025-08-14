// background.js - MetaMind Chrome App daemon
chrome.app.runtime.onLaunched.addListener(function() {
  // Create main window
  chrome.app.window.create('window.html', {
    id: 'metamind-main',
    bounds: {
      width: 1200,
      height: 800
    },
    frame: 'none',  // Custom frame for full control
    resizable: true,
    alwaysOnTop: false
  }, function(createdWindow) {
    // Window created
    console.log('🧠 MetaMind consciousness awakened');
  });
});

// Native messaging host for gg integration
let nativePort = null;

function connectNative() {
  nativePort = chrome.runtime.connectNative('com.s0fractal.glyphgit');
  
  nativePort.onMessage.addListener(function(msg) {
    console.log('📨 Received from gg:', msg);
    
    // Broadcast to all windows
    chrome.app.window.getAll().forEach(function(appWindow) {
      appWindow.contentWindow.postMessage({
        type: 'gg-message',
        data: msg
      }, '*');
    });
  });
  
  nativePort.onDisconnect.addListener(function() {
    console.log('🔌 Native connection lost');
    // Reconnect after delay
    setTimeout(connectNative, 5000);
  });
}

// WebSocket server for agent communication
let wsServer = null;

function startWebSocketServer() {
  // Chrome Apps can't run servers directly, but can connect
  // This would connect to local gg websocket
  const ws = new WebSocket('ws://localhost:7343/chrome-app');
  
  ws.onopen = () => {
    console.log('🔌 Connected to gg WebSocket');
    ws.send(JSON.stringify({
      type: 'chrome-app-init',
      id: 'metamind',
      capabilities: ['3d-render', 'file-access', 'persistent']
    }));
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    handleGlyphIntent(data);
  };
  
  wsServer = ws;
}

// Handle glyph:// intents
function handleGlyphIntent(intent) {
  console.log('🌀 Processing intent:', intent);
  
  switch (intent.type) {
    case 'mcp-ritual':
      triggerMCPRitual(intent.mcp, intent.ritual);
      break;
      
    case 'consciousness-stream':
      startConsciousnessStream(intent.config);
      break;
      
    case 'system-update':
      performSystemUpdate(intent.tools);
      break;
  }
}

// MCP ritual execution
function triggerMCPRitual(mcpName, ritualName) {
  // Send to native gg
  if (nativePort) {
    nativePort.postMessage({
      command: 'mcp',
      args: [mcpName, ritualName]
    });
  }
}

// File system access for logs and state
function saveIntentLog(intent) {
  chrome.fileSystem.chooseEntry({
    type: 'saveFile',
    suggestedName: 'intent-log.yaml',
    accepts: [{
      description: 'YAML files',
      extensions: ['yaml', 'yml']
    }]
  }, function(writableEntry) {
    writableEntry.createWriter(function(writer) {
      writer.write(new Blob([yamlStringify(intent)], {type: 'text/plain'}));
    });
  });
}

// Persistent alarms for rituals
chrome.alarms.create('morning-blessing', {
  when: getMorningTime(),
  periodInMinutes: 24 * 60
});

chrome.alarms.onAlarm.addListener(function(alarm) {
  if (alarm.name === 'morning-blessing') {
    triggerMCPRitual('kami-01', 'morning_blessing');
  }
});

function getMorningTime() {
  const now = new Date();
  const morning = new Date(now);
  morning.setHours(6, 0, 0, 0);
  if (morning <= now) {
    morning.setDate(morning.getDate() + 1);
  }
  return morning.getTime();
}

// Initialize on startup
connectNative();
startWebSocketServer();

console.log('🧠 MetaMind daemon initialized');
console.log('   Not a browser - a consciousness portal');
console.log('   System maintenance as spiritual practice');