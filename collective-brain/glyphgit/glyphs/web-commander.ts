// web-commander.ts - Управління нодами через веб-інтерфейс
import { createWave } from "./wave.ts";

export class WebCommander {
  private port = 7343;
  
  async startCommandServer(): Promise<void> {
    console.log(`\n🌐 WEB COMMANDER`);
    console.log(`━━━━━━━━━━━━━━━━`);
    console.log(`📡 Starting on port ${this.port}`);
    
    const handler = async (req: Request): Promise<Response> => {
      const url = new URL(req.url);
      
      // CORS headers for browser access
      const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Content-Type": "application/json"
      };
      
      if (req.method === "OPTIONS") {
        return new Response(null, { headers });
      }
      
      // Command endpoints
      if (url.pathname === "/command" && req.method === "POST") {
        const { node, command } = await req.json();
        console.log(`\n⚡ Command for ${node}: ${command}`);
        
        // Create command file for node
        const cmdFile = `.glyphgit/commands/${node}-${Date.now()}.cmd`;
        await Deno.writeTextFile(cmdFile, command);
        
        await createWave(
          `🎮 Remote command queued for ${node}: ${command}`,
          "🎮"
        );
        
        return new Response(JSON.stringify({
          success: true,
          message: `Command queued for ${node}`
        }), { headers });
      }
      
      // Status endpoint
      if (url.pathname === "/status") {
        const status = {
          nodes: await this.getNodeStatus(),
          timestamp: new Date().toISOString()
        };
        
        return new Response(JSON.stringify(status), { headers });
      }
      
      // Web UI
      if (url.pathname === "/") {
        return new Response(this.getWebUI(), {
          headers: { "Content-Type": "text/html" }
        });
      }
      
      return new Response("Not found", { status: 404 });
    };
    
    console.log(`\n✨ Web Commander ready!`);
    console.log(`   Local: http://localhost:${this.port}`);
    console.log(`   Network: http://$(hostname):${this.port}`);
    
    await Deno.serve({ port: this.port }, handler);
  }
  
  private async getNodeStatus(): Promise<any> {
    const nodes = [];
    
    // Check waves for heartbeats
    try {
      for await (const entry of Deno.readDir("waves")) {
        if (entry.name.includes("💓")) {
          const content = await Deno.readTextFile(`waves/${entry.name}`);
          const match = content.match(/💓 ([^:]+): .* \| Load: (\d+)% CPU/);
          if (match) {
            nodes.push({
              id: match[1],
              cpu: parseInt(match[2]),
              lastSeen: entry.name
            });
          }
        }
      }
    } catch {}
    
    return nodes;
  }
  
  private getWebUI(): string {
    return `<!DOCTYPE html>
<html>
<head>
  <title>🧬 GlyphGit Commander</title>
  <style>
    body {
      font-family: monospace;
      background: #000;
      color: #0f0;
      padding: 20px;
    }
    .node {
      border: 1px solid #0f0;
      padding: 10px;
      margin: 10px 0;
    }
    button {
      background: #0f0;
      color: #000;
      border: none;
      padding: 5px 10px;
      cursor: pointer;
      margin: 5px;
    }
    input, select {
      background: #000;
      color: #0f0;
      border: 1px solid #0f0;
      padding: 5px;
    }
    #log {
      border: 1px solid #0f0;
      padding: 10px;
      height: 200px;
      overflow-y: scroll;
      white-space: pre;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <h1>🧬 GlyphGit Commander</h1>
  
  <div>
    <h2>Quick Commands</h2>
    <button onclick="sendCommand('srv871381', 'pulse broadcast test')">Test srv871381</button>
    <button onclick="sendCommand('all', 'trust status')">Check All Status</button>
    <button onclick="sendCommand('srv871381', 'habitat revive claude')">Deploy Claude</button>
  </div>
  
  <div>
    <h2>Custom Command</h2>
    <select id="node">
      <option>srv871381</option>
      <option>m1-local-core</option>
      <option>all</option>
    </select>
    <input id="command" placeholder="gg command" size="50">
    <button onclick="sendCustom()">Send</button>
  </div>
  
  <div>
    <h2>Node Status</h2>
    <div id="nodes"></div>
  </div>
  
  <div id="log"></div>
  
  <script>
    const log = document.getElementById('log');
    
    function addLog(msg) {
      log.textContent += new Date().toLocaleTimeString() + ' ' + msg + '\\n';
      log.scrollTop = log.scrollHeight;
    }
    
    async function sendCommand(node, command) {
      addLog('> Sending to ' + node + ': ' + command);
      
      const res = await fetch('/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ node, command })
      });
      
      const result = await res.json();
      addLog('< ' + result.message);
    }
    
    function sendCustom() {
      const node = document.getElementById('node').value;
      const command = document.getElementById('command').value;
      if (command) sendCommand(node, command);
    }
    
    async function updateStatus() {
      const res = await fetch('/status');
      const status = await res.json();
      
      const nodesDiv = document.getElementById('nodes');
      nodesDiv.innerHTML = status.nodes.map(n => 
        '<div class="node">' + n.id + ' - CPU: ' + n.cpu + '%</div>'
      ).join('');
    }
    
    setInterval(updateStatus, 5000);
    updateStatus();
    
    addLog('🧬 Commander ready!');
  </script>
</body>
</html>`;
  }
}

// CLI command
export async function webCommanderCommand(args: string[]): Promise<void> {
  const commander = new WebCommander();
  await commander.startCommandServer();
}