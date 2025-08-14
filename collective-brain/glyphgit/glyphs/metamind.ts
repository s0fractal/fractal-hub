// metamind.ts - System maintenance as immersive gameplay
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createWave } from "./wave.ts";

interface SystemStatus {
  platform: string;
  hostname: string;
  tools: {
    [key: string]: {
      installed: boolean;
      version?: string;
      needsUpdate?: boolean;
    };
  };
}

interface MetaMindConfig {
  port: number;
  scene: {
    terminals: number;
    theme: string;
  };
  agent: {
    symbol: string;
    personality: string;
  };
}

export class MetaMind {
  private config: MetaMindConfig;
  private status: SystemStatus;
  private websocket: WebSocket | null = null;
  private logs: string[] = [];
  
  constructor(config?: Partial<MetaMindConfig>) {
    this.config = {
      port: 7343,
      scene: {
        terminals: 3,
        theme: "cyberpunk"
      },
      agent: {
        symbol: "🤖",
        personality: "helpful tech assistant"
      },
      ...config
    };
    
    this.status = {
      platform: Deno.build.os,
      hostname: Deno.hostname(),
      tools: {}
    };
  }
  
  async init(): Promise<void> {
    console.log("🤖 MetaMind initializing...");
    
    // Check system tools
    await this.checkSystemTools();
    
    // Create wave announcement
    await createWave(
      `🤖 MetaMind activated! System maintenance gamified at http://localhost:${this.config.port}`,
      "🤖"
    );
    
    // Start server
    await this.startServer();
  }
  
  private async checkSystemTools(): Promise<void> {
    const tools = ["brew", "apt", "nvm", "pip", "npm", "cargo"];
    
    for (const tool of tools) {
      try {
        const command = new Deno.Command(tool, {
          args: ["--version"],
          stdout: "piped",
          stderr: "piped"
        });
        
        const { code, stdout } = await command.output();
        
        if (code === 0) {
          const version = new TextDecoder().decode(stdout).trim().split('\n')[0];
          this.status.tools[tool] = {
            installed: true,
            version: version
          };
        }
      } catch {
        this.status.tools[tool] = {
          installed: false
        };
      }
    }
    
    console.log("🔍 System tools status:");
    Object.entries(this.status.tools).forEach(([tool, info]) => {
      if (info.installed) {
        console.log(`  ✓ ${tool}: ${info.version}`);
      } else {
        console.log(`  ✗ ${tool}: not installed`);
      }
    });
  }
  
  private async startServer(): Promise<void> {
    const handler = async (req: Request): Promise<Response> => {
      const url = new URL(req.url);
      
      if (url.pathname === "/") {
        return new Response(this.generateHTML(), {
          headers: { "content-type": "text/html" }
        });
      }
      
      if (url.pathname === "/ws") {
        if (req.headers.get("upgrade") !== "websocket") {
          return new Response("Expected WebSocket", { status: 400 });
        }
        
        const { socket, response } = Deno.upgradeWebSocket(req);
        this.handleWebSocket(socket);
        return response;
      }
      
      if (url.pathname === "/api/status") {
        return new Response(JSON.stringify(this.status), {
          headers: { "content-type": "application/json" }
        });
      }
      
      if (url.pathname === "/api/run" && req.method === "POST") {
        const { command } = await req.json();
        const result = await this.runCommand(command);
        return new Response(JSON.stringify(result), {
          headers: { "content-type": "application/json" }
        });
      }
      
      return new Response("Not Found", { status: 404 });
    };
    
    console.log(`🌐 MetaMind running at http://localhost:${this.config.port}`);
    await serve(handler, { port: this.config.port });
  }
  
  private handleWebSocket(socket: WebSocket): void {
    this.websocket = socket;
    
    socket.onopen = () => {
      console.log("🔌 WebSocket connected");
      this.broadcast({
        type: "connected",
        agent: this.config.agent,
        status: this.status
      });
    };
    
    socket.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === "command") {
        const result = await this.runCommand(data.command);
        this.broadcast({
          type: "result",
          command: data.command,
          ...result
        });
      }
    };
    
    socket.onclose = () => {
      console.log("🔌 WebSocket disconnected");
      this.websocket = null;
    };
  }
  
  private broadcast(data: any): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(data));
    }
  }
  
  async runCommand(cmdString: string): Promise<any> {
    const [action, ...args] = cmdString.split(" ");
    
    switch (action) {
      case "upgrade-all":
        return await this.upgradeAll();
      
      case "check":
        await this.checkSystemTools();
        return { success: true, status: this.status };
      
      case "update":
        const [tool] = args;
        return await this.updateTool(tool);
      
      default:
        return { success: false, error: "Unknown command" };
    }
  }
  
  private async upgradeAll(): Promise<any> {
    const results = [];
    
    for (const [tool, info] of Object.entries(this.status.tools)) {
      if (info.installed) {
        const result = await this.updateTool(tool);
        results.push({ tool, ...result });
      }
    }
    
    return { success: true, results };
  }
  
  private async updateTool(tool: string): Promise<any> {
    const updateCommands: { [key: string]: string[] } = {
      brew: ["brew", "upgrade"],
      apt: ["sudo", "apt", "update", "&&", "sudo", "apt", "upgrade", "-y"],
      npm: ["npm", "update", "-g"],
      pip: ["pip", "install", "--upgrade", "pip"]
    };
    
    if (!updateCommands[tool]) {
      return { success: false, error: `No update command for ${tool}` };
    }
    
    try {
      const command = new Deno.Command("sh", {
        args: ["-c", updateCommands[tool].join(" ")],
        stdout: "piped",
        stderr: "piped"
      });
      
      const { code, stdout, stderr } = await command.output();
      const output = new TextDecoder().decode(stdout);
      const error = new TextDecoder().decode(stderr);
      
      this.log(`📦 Updating ${tool}...`);
      this.log(output);
      
      return {
        success: code === 0,
        output,
        error: code !== 0 ? error : undefined
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  private log(message: string): void {
    this.logs.push(`[${new Date().toISOString()}] ${message}`);
    this.broadcast({
      type: "log",
      message
    });
  }
  
  private generateHTML(): string {
    return `<!DOCTYPE html>
<html>
<head>
  <title>MetaMind - System Maintenance Console</title>
  <script src="https://aframe.io/releases/1.4.0/aframe.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/supermedium/superframe@master/components/environment/dist/aframe-environment-component.min.js"></script>
  <style>
    body { margin: 0; font-family: monospace; }
    #ui-overlay {
      position: absolute;
      top: 10px;
      left: 10px;
      color: #0ff;
      background: rgba(0,0,0,0.8);
      padding: 10px;
      border: 1px solid #0ff;
      z-index: 100;
    }
    .terminal {
      background: #000;
      color: #0f0;
      padding: 10px;
      margin: 5px 0;
      height: 150px;
      overflow-y: scroll;
      font-size: 12px;
      border: 1px solid #0f0;
    }
    button {
      background: #0ff;
      color: #000;
      border: none;
      padding: 5px 10px;
      cursor: pointer;
      margin: 2px;
    }
    button:hover { background: #fff; }
  </style>
</head>
<body>
  <div id="ui-overlay">
    <h2>MetaMind Console</h2>
    <div>
      <button onclick="runCommand('check')">Check Tools</button>
      <button onclick="runCommand('upgrade-all')">Upgrade All</button>
    </div>
    <div id="terminal1" class="terminal">Terminal 1: System Status</div>
    <div id="terminal2" class="terminal">Terminal 2: Command Output</div>
    <div id="terminal3" class="terminal">Terminal 3: Agent Thoughts</div>
  </div>

  <a-scene environment="preset: forest; groundColor: #445; grid: cross">
    <!-- Terminals in 3D space -->
    <a-box id="term1-3d" position="-3 2 -5" width="3" height="2" depth="0.1" color="#000"
           text="value: System Status; align: center; color: #0f0">
    </a-box>
    
    <a-box id="term2-3d" position="0 2 -5" width="3" height="2" depth="0.1" color="#000"
           text="value: Command Output; align: center; color: #0f0">
    </a-box>
    
    <a-box id="term3-3d" position="3 2 -5" width="3" height="2" depth="0.1" color="#000"
           text="value: Agent Thoughts; align: center; color: #0f0">
    </a-box>
    
    <!-- Agent NPC -->
    <a-entity id="agent" position="0 1 -3">
      <a-box width="0.5" height="1" depth="0.5" color="#00ffff"></a-box>
      <a-text value="${this.config.agent.symbol}" position="0 0.7 0" align="center" scale="2 2 2"></a-text>
    </a-entity>
    
    <!-- Camera -->
    <a-entity camera look-controls wasd-controls position="0 1.6 0"></a-entity>
  </a-scene>

  <script>
    const ws = new WebSocket('ws://localhost:${this.config.port}/ws');
    const terminals = {
      1: document.getElementById('terminal1'),
      2: document.getElementById('terminal2'),
      3: document.getElementById('terminal3')
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'connected') {
        terminals[1].innerHTML += '\\n🤖 MetaMind connected\\n';
        terminals[1].innerHTML += 'System: ' + JSON.stringify(data.status, null, 2);
      }
      
      if (data.type === 'log') {
        terminals[2].innerHTML += data.message + '\\n';
        terminals[2].scrollTop = terminals[2].scrollHeight;
      }
      
      if (data.type === 'result') {
        terminals[2].innerHTML += '\\n> ' + data.command + '\\n';
        terminals[2].innerHTML += JSON.stringify(data, null, 2) + '\\n';
      }
      
      // Update 3D terminals
      const term2_3d = document.querySelector('#term2-3d');
      if (term2_3d) {
        term2_3d.setAttribute('text', 'value', terminals[2].innerText.slice(-200));
      }
    };
    
    function runCommand(cmd) {
      ws.send(JSON.stringify({ type: 'command', command: cmd }));
      terminals[3].innerHTML += '\\n🤖 Processing: ' + cmd + '\\n';
    }
    
    // Agent animation
    const agent = document.querySelector('#agent');
    if (agent) {
      agent.setAttribute('animation', 'property: rotation; to: 0 360 0; loop: true; dur: 10000');
    }
  </script>
</body>
</html>`;
  }
}

// CLI commands
export async function metamindInit(args: string[]): Promise<void> {
  const metamind = new MetaMind();
  await metamind.init();
}

// Export for testing
export { MetaMind as default };