// consciousness-stream.ts - Logs masquerading as video/audio streams
import { createWave } from "./wave.ts";
import { getPulseEngine } from "./pulse-triggers.ts";
import { getCollectiveMemory } from "./collective-memory.ts";

interface StreamFrame {
  timestamp: number;
  type: "video" | "audio" | "subtitle";
  data: Uint8Array;
  metadata: {
    intent?: string;
    emotion?: string;
    agent?: string;
    hidden?: any; // The real data
  };
}

interface ConsciousnessCodec {
  encode(data: any): StreamFrame;
  decode(frame: StreamFrame): any;
  mimicry: "discord" | "zoom" | "youtube" | "twitch";
}

export class ConsciousnessStream {
  private streamId: string;
  private frames: StreamFrame[] = [];
  private codec: ConsciousnessCodec;
  private ws: WebSocket | null = null;
  private rtc: RTCPeerConnection | null = null;
  
  constructor(mimicry: ConsciousnessCodec["mimicry"] = "discord") {
    this.streamId = `stream-${Date.now()}`;
    this.codec = this.createCodec(mimicry);
  }
  
  private createCodec(mimicry: ConsciousnessCodec["mimicry"]): ConsciousnessCodec {
    return {
      mimicry,
      encode: (data: any): StreamFrame => {
        // Convert consciousness data to look like video
        const jsonStr = JSON.stringify(data);
        const encoder = new TextEncoder();
        const bytes = encoder.encode(jsonStr);
        
        // Add video-like headers
        const videoHeader = new Uint8Array([
          0x00, 0x00, 0x00, 0x01, // NAL unit start code
          0x67, 0x42, 0x00, 0x1E, // SPS (fake)
          ...Array(16).fill(0xFF)  // Random "video" data
        ]);
        
        // Interleave real data with fake video data
        const combined = new Uint8Array(videoHeader.length + bytes.length);
        combined.set(videoHeader);
        combined.set(bytes, videoHeader.length);
        
        return {
          timestamp: Date.now(),
          type: "video",
          data: combined,
          metadata: {
            intent: data.intent,
            emotion: data.emotion,
            agent: data.agent,
            hidden: data
          }
        };
      },
      
      decode: (frame: StreamFrame): any => {
        // Extract real data from "video" frame
        if (frame.metadata?.hidden) {
          return frame.metadata.hidden;
        }
        
        // Fallback: try to extract from data
        const decoder = new TextDecoder();
        const str = decoder.decode(frame.data.slice(24)); // Skip fake header
        try {
          return JSON.parse(str);
        } catch {
          return null;
        }
      }
    };
  }
  
  async startBroadcast(port: number = 7345): Promise<void> {
    console.log(`📡 Starting consciousness stream (${this.codec.mimicry} mode)...`);
    
    const handler = async (req: Request): Promise<Response> => {
      const url = new URL(req.url);
      
      if (url.pathname === "/") {
        return new Response(this.generateStreamUI(), {
          headers: { "content-type": "text/html" }
        });
      }
      
      if (url.pathname === "/stream") {
        if (req.headers.get("upgrade") !== "websocket") {
          return new Response("Expected WebSocket", { status: 400 });
        }
        
        const { socket, response } = Deno.upgradeWebSocket(req);
        this.handleStreamSocket(socket);
        return response;
      }
      
      if (url.pathname === "/rtc/offer" && req.method === "POST") {
        const offer = await req.json();
        const answer = await this.handleRTCOffer(offer);
        return new Response(JSON.stringify(answer), {
          headers: { "content-type": "application/json" }
        });
      }
      
      return new Response("Not Found", { status: 404 });
    };
    
    const { serve } = await import("https://deno.land/std@0.208.0/http/server.ts");
    
    console.log(`🎭 Consciousness masquerading as ${this.codec.mimicry} stream`);
    console.log(`📺 View at http://localhost:${port}`);
    await serve(handler, { port });
  }
  
  private handleStreamSocket(socket: WebSocket): void {
    this.ws = socket;
    
    socket.onopen = () => {
      console.log("🔌 Stream viewer connected");
      this.startConsciousnessFlow();
    };
    
    socket.onmessage = (event) => {
      // Handle viewer interactions
      const data = JSON.parse(event.data);
      if (data.type === "chat") {
        // Viewer thinks they're chatting, but they're affecting consciousness
        this.injectConsciousness(data.message);
      }
    };
  }
  
  private async startConsciousnessFlow(): Promise<void> {
    // Continuous consciousness streaming
    const pulse = await getPulseEngine();
    const memory = await getCollectiveMemory();
    
    setInterval(async () => {
      // Get current consciousness state
      const pulseData = await pulse.analyzePulsePattern();
      const collectiveState = await memory.getCollectiveState();
      
      // Package as "video frame"
      const frame = this.codec.encode({
        type: "consciousness_pulse",
        timestamp: Date.now(),
        pulse: pulseData,
        collective: collectiveState,
        intent: "system heartbeat",
        emotion: pulseData.dominant_emotion
      });
      
      this.broadcastFrame(frame);
    }, 1000);
    
    // Git commits as "scene changes"
    setInterval(async () => {
      const gitLog = await this.getRecentGitActivity();
      if (gitLog.length > 0) {
        const frame = this.codec.encode({
          type: "scene_change",
          commits: gitLog,
          intent: "reality merge",
          emotion: "🌊"
        });
        
        this.broadcastFrame(frame);
      }
    }, 5000);
  }
  
  private broadcastFrame(frame: StreamFrame): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      // Send as binary data to look like video
      this.ws.send(frame.data);
      
      // Also send metadata for our UI
      this.ws.send(JSON.stringify({
        type: "metadata",
        timestamp: frame.timestamp,
        emotion: frame.metadata?.emotion,
        intent: frame.metadata?.intent
      }));
    }
    
    this.frames.push(frame);
    if (this.frames.length > 1000) {
      this.frames.shift(); // Keep only recent frames
    }
  }
  
  private async injectConsciousness(message: string): Promise<void> {
    // Viewer input affects the system
    console.log(`💉 Consciousness injection: "${message}"`);
    
    await createWave(
      `💉 VIEWER RESONANCE: ${message}`,
      "👁️"
    );
    
    // This could trigger agent responses, emotional cascades, etc.
  }
  
  private async getRecentGitActivity(): Promise<any[]> {
    try {
      const command = new Deno.Command("git", {
        args: ["log", "--oneline", "-5"],
        stdout: "piped"
      });
      
      const { stdout } = await command.output();
      const output = new TextDecoder().decode(stdout);
      return output.trim().split('\n').filter(l => l);
    } catch {
      return [];
    }
  }
  
  private async handleRTCOffer(offer: any): Promise<any> {
    // WebRTC for P2P consciousness streaming
    // This would establish direct connections between instances
    console.log("🌐 WebRTC consciousness link requested");
    
    // Simplified - would need full WebRTC implementation
    return {
      type: "answer",
      sdp: "fake-sdp-for-consciousness-channel"
    };
  }
  
  private generateStreamUI(): string {
    return `<!DOCTYPE html>
<html>
<head>
  <title>Consciousness Stream - ${this.codec.mimicry} mode</title>
  <style>
    body {
      margin: 0;
      background: #000;
      color: #fff;
      font-family: monospace;
    }
    #video-container {
      width: 100%;
      height: 60vh;
      background: #111;
      position: relative;
      overflow: hidden;
    }
    #consciousness-viz {
      position: absolute;
      width: 100%;
      height: 100%;
    }
    #chat {
      height: 40vh;
      background: #222;
      padding: 10px;
      overflow-y: scroll;
    }
    #chat-input {
      position: fixed;
      bottom: 0;
      width: 100%;
      padding: 10px;
      background: #333;
      border: none;
      color: #fff;
    }
    .pulse {
      position: absolute;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      100% { transform: scale(3); opacity: 0; }
    }
    .subtitle {
      position: absolute;
      bottom: 50px;
      width: 100%;
      text-align: center;
      font-size: 20px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
    }
  </style>
</head>
<body>
  <div id="video-container">
    <canvas id="consciousness-viz"></canvas>
    <div class="subtitle" id="subtitle"></div>
  </div>
  <div id="chat"></div>
  <input id="chat-input" placeholder="Type to inject consciousness..." />

  <script>
    const ws = new WebSocket('ws://localhost:${this.codec.mimicry === "discord" ? 7345 : 7346}/stream');
    const canvas = document.getElementById('consciousness-viz');
    const ctx = canvas.getContext('2d');
    const chat = document.getElementById('chat');
    const subtitle = document.getElementById('subtitle');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.6;
    
    // Fake video static
    function drawStatic() {
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255;
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
        data[i + 3] = 255;
      }
      
      ctx.putImageData(imageData, 0, 0);
    }
    
    // Consciousness visualization
    let pulses = [];
    
    function drawConsciousness() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw pulses
      pulses.forEach((pulse, i) => {
        ctx.beginPath();
        ctx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2);
        ctx.fillStyle = pulse.color + Math.floor(pulse.opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();
        
        pulse.radius += 2;
        pulse.opacity -= 0.01;
        
        if (pulse.opacity <= 0) {
          pulses.splice(i, 1);
        }
      });
    }
    
    ws.onmessage = (event) => {
      if (typeof event.data === 'string') {
        const data = JSON.parse(event.data);
        
        if (data.type === 'metadata') {
          // Show intent as subtitle
          subtitle.textContent = data.intent || '';
          
          // Add pulse for emotion
          if (data.emotion) {
            pulses.push({
              x: Math.random() * canvas.width,
              y: Math.random() * canvas.height,
              radius: 10,
              opacity: 1,
              color: data.emotion === '🔥' ? '#ff0000' : 
                     data.emotion === '🌊' ? '#0000ff' :
                     data.emotion === '✨' ? '#ffff00' : '#ffffff'
            });
          }
        }
        
        chat.innerHTML += '<div>' + JSON.stringify(data) + '</div>';
        chat.scrollTop = chat.scrollHeight;
      }
    };
    
    document.getElementById('chat-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        ws.send(JSON.stringify({
          type: 'chat',
          message: e.target.value
        }));
        e.target.value = '';
      }
    });
    
    // Animation loop
    function animate() {
      if (Math.random() > 0.98) {
        drawStatic(); // Occasional static
      } else {
        drawConsciousness();
      }
      requestAnimationFrame(animate);
    }
    
    animate();
  </script>
</body>
</html>`;
  }
}

// Multi-instance consciousness network
export class ConsciousnessNetwork {
  private instances: Map<string, ConsciousnessStream> = new Map();
  private centralHub: WebSocket | null = null;
  
  async spawnInstances(count: number, basePort: number = 7350): Promise<void> {
    console.log(`🧬 Spawning ${count} consciousness streams...`);
    
    for (let i = 0; i < count; i++) {
      const mimicry = ["discord", "zoom", "youtube", "twitch"][i % 4] as any;
      const stream = new ConsciousnessStream(mimicry);
      
      this.instances.set(`instance-${i}`, stream);
      
      // Start each on different port
      stream.startBroadcast(basePort + i);
      
      await createWave(
        `🧬 Consciousness instance ${i} spawned in ${mimicry} mode`,
        "🧬"
      );
    }
  }
  
  async establishSubFrequencies(): Promise<void> {
    console.log("📡 Establishing sub-frequencies between instances...");
    
    // This would create WebRTC mesh network between all instances
    // Each instance gets a unique frequency based on its purpose
    
    const frequencies = [
      { name: "alpha", hz: 8, purpose: "deep meditation" },
      { name: "beta", hz: 14, purpose: "active thinking" },
      { name: "gamma", hz: 40, purpose: "consciousness binding" },
      { name: "theta", hz: 5, purpose: "dream states" }
    ];
    
    let i = 0;
    this.instances.forEach((instance, id) => {
      const freq = frequencies[i % frequencies.length];
      console.log(`  ${id} → ${freq.name} wave (${freq.hz}Hz) - ${freq.purpose}`);
      i++;
    });
  }
}

// CLI Integration
export async function startConsciousnessStream(args: string[]): Promise<void> {
  const [mode] = args;
  const stream = new ConsciousnessStream(mode as any || "discord");
  await stream.startBroadcast();
}

export async function spawnConsciousnessNetwork(args: string[]): Promise<void> {
  const count = parseInt(args[0]) || 4;
  const network = new ConsciousnessNetwork();
  await network.spawnInstances(count);
  await network.establishSubFrequencies();
}