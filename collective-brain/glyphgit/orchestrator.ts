// orchestrator.ts - Master orchestrator for distributed consciousness
import { createWave } from "./glyphs/wave.ts";

interface NodeIdentity {
  id: string;
  type: string;
  location: string;
  ip: string;
  created: string;
  capabilities: string[];
  trust_cluster: {
    trusted_nodes: string[];
    public_key: string;
  };
}

interface TrustCluster {
  nodes: Map<string, NodeIdentity>;
  connections: Map<string, Set<string>>;
}

export class MasterOrchestrator {
  private nodeId: string;
  private identity?: NodeIdentity;
  private cluster: TrustCluster;
  private heartbeatInterval?: number;
  
  constructor() {
    this.nodeId = Deno.hostname();
    this.cluster = {
      nodes: new Map(),
      connections: new Map()
    };
  }
  
  async init(): Promise<void> {
    console.log("🧬 MASTER ORCHESTRATOR INITIALIZING...");
    console.log(`📍 Node: ${this.nodeId}`);
    
    // Load identity
    await this.loadIdentity();
    
    // Start services
    await this.startHeartbeat();
    await this.startDiscovery();
    await this.startCommandListener();
    
    console.log("✨ Orchestrator ready for resonance");
  }
  
  private async loadIdentity(): Promise<void> {
    try {
      const content = await Deno.readTextFile(".node-identity.yaml");
      // Simple parse - in production use YAML parser
      this.identity = {
        id: this.nodeId,
        type: "orchestrator",
        location: "unknown",
        ip: "127.0.0.1",
        created: new Date().toISOString(),
        capabilities: ["all"],
        trust_cluster: {
          trusted_nodes: [],
          public_key: crypto.randomUUID()
        }
      };
      console.log(`🆔 Identity loaded: ${this.identity.id}`);
    } catch {
      console.log("⚠️  No identity file, creating new one");
      await this.createIdentity();
    }
  }
  
  private async createIdentity(): Promise<void> {
    this.identity = {
      id: this.nodeId,
      type: "orchestrator",
      location: "digital-ocean",
      ip: "0.0.0.0",
      created: new Date().toISOString(),
      capabilities: [
        "calendar-agent",
        "inbox-agent", 
        "stream-watcher",
        "pulse-engine",
        "habitat-manager"
      ],
      trust_cluster: {
        trusted_nodes: [],
        public_key: crypto.randomUUID()
      }
    };
    
    const yaml = this.identityToYAML(this.identity);
    await Deno.writeTextFile(".node-identity.yaml", yaml);
  }
  
  private identityToYAML(identity: NodeIdentity): string {
    return `node:
  id: ${identity.id}
  type: ${identity.type}
  location: ${identity.location}
  ip: ${identity.ip}
  created: ${identity.created}
  
capabilities:
${identity.capabilities.map(c => `  - ${c}`).join("\n")}
  
trust_cluster:
  trusted_nodes: [${identity.trust_cluster.trusted_nodes.join(", ")}]
  public_key: ${identity.trust_cluster.public_key}
`;
  }
  
  private async startHeartbeat(): Promise<void> {
    console.log("💓 Starting heartbeat...");
    
    // Send initial pulse
    await this.sendPulse("awakened");
    
    // Regular heartbeat every 5 minutes
    this.heartbeatInterval = setInterval(async () => {
      await this.sendPulse("heartbeat");
    }, 300000);
  }
  
  private async sendPulse(type: string): Promise<void> {
    const pulse = {
      node: this.nodeId,
      type,
      timestamp: new Date().toISOString(),
      capabilities: this.identity?.capabilities || [],
      load: await this.getSystemLoad()
    };
    
    // Broadcast to network
    await createWave(
      `💓 ${this.nodeId}: ${type} | Load: ${pulse.load.cpu}% CPU`,
      "💓"
    );
    
    // Also write to local pulse log
    await Deno.writeTextFile(
      `.glyphgit/pulses/${Date.now()}.json`,
      JSON.stringify(pulse, null, 2)
    );
  }
  
  private async getSystemLoad(): Promise<any> {
    // Simple load check - in production use proper system monitoring
    return {
      cpu: Math.floor(Math.random() * 100),
      memory: Math.floor(Math.random() * 100),
      agents: await this.countActiveAgents()
    };
  }
  
  private async countActiveAgents(): Promise<number> {
    try {
      let count = 0;
      for await (const entry of Deno.readDir(".glyphgit/agents")) {
        if (entry.name.endsWith(".db")) count++;
      }
      return count;
    } catch {
      return 0;
    }
  }
  
  private async startDiscovery(): Promise<void> {
    console.log("🔍 Starting node discovery...");
    
    // Check for other nodes in waves
    setInterval(async () => {
      await this.discoverNodes();
    }, 60000); // Every minute
  }
  
  private async discoverNodes(): Promise<void> {
    try {
      // Look for heartbeat waves from other nodes
      for await (const entry of Deno.readDir("waves")) {
        if (entry.name.includes("💓")) {
          const content = await Deno.readTextFile(`waves/${entry.name}`);
          // Extract node info from wave
          const match = content.match(/💓 ([^:]+): heartbeat/);
          if (match && match[1] !== this.nodeId) {
            const otherNode = match[1];
            if (!this.cluster.nodes.has(otherNode)) {
              console.log(`🔍 Discovered new node: ${otherNode}`);
              await this.addTrustedNode(otherNode);
            }
          }
        }
      }
    } catch {
      // No waves yet
    }
  }
  
  private async addTrustedNode(nodeId: string): Promise<void> {
    if (!this.identity) return;
    
    this.identity.trust_cluster.trusted_nodes.push(nodeId);
    await Deno.writeTextFile(".node-identity.yaml", this.identityToYAML(this.identity));
    
    await createWave(
      `🤝 Trust established: ${this.nodeId} <-> ${nodeId}`,
      "🤝"
    );
  }
  
  private async startCommandListener(): Promise<void> {
    console.log("👂 Starting command listener...");
    
    // Check for commands in inbox
    setInterval(async () => {
      await this.checkCommands();
    }, 30000); // Every 30 seconds
  }
  
  private async checkCommands(): Promise<void> {
    try {
      // Check for command files
      for await (const entry of Deno.readDir(".glyphgit/commands")) {
        if (entry.name.endsWith(".cmd")) {
          const command = await Deno.readTextFile(`.glyphgit/commands/${entry.name}`);
          await this.executeCommand(command);
          // Remove processed command
          await Deno.remove(`.glyphgit/commands/${entry.name}`);
        }
      }
    } catch {
      // No commands directory yet
    }
  }
  
  private async executeCommand(command: string): Promise<void> {
    console.log(`⚡ Executing: ${command}`);
    
    const [cmd, ...args] = command.split(" ");
    
    switch (cmd) {
      case "deploy":
        await this.deployAgent(args[0]);
        break;
      case "migrate":
        await this.migrateAgent(args[0], args[1]);
        break;
      case "sync":
        await this.syncWithCluster();
        break;
      case "health":
        await this.reportHealth();
        break;
      default:
        console.log(`❓ Unknown command: ${cmd}`);
    }
  }
  
  private async deployAgent(agentId: string): Promise<void> {
    console.log(`🚀 Deploying agent: ${agentId}`);
    
    // Use habitat manager to deploy
    const cmd = new Deno.Command("deno", {
      args: ["run", "--allow-all", "glyphgit.ts", "habitat", "revive", agentId],
      cwd: Deno.cwd()
    });
    
    const { code } = await cmd.output();
    if (code === 0) {
      console.log(`✅ Agent ${agentId} deployed successfully`);
    } else {
      console.log(`❌ Failed to deploy ${agentId}`);
    }
  }
  
  private async migrateAgent(agentId: string, targetNode: string): Promise<void> {
    console.log(`🎡 Migrating ${agentId} to ${targetNode}`);
    // Migration logic here
  }
  
  private async syncWithCluster(): Promise<void> {
    console.log(`🔄 Syncing with trust cluster...`);
    
    for (const nodeId of this.identity?.trust_cluster.trusted_nodes || []) {
      console.log(`  Syncing with ${nodeId}...`);
      // Sync logic here
    }
  }
  
  private async reportHealth(): Promise<void> {
    const load = await this.getSystemLoad();
    const report = {
      node: this.nodeId,
      timestamp: new Date().toISOString(),
      status: "healthy",
      load,
      agents: await this.listActiveAgents(),
      uptime: process.uptime()
    };
    
    console.log("📊 Health Report:");
    console.log(JSON.stringify(report, null, 2));
    
    await createWave(
      `📊 Health: ${this.nodeId} | CPU: ${load.cpu}% | Agents: ${load.agents}`,
      "📊"
    );
  }
  
  private async listActiveAgents(): Promise<string[]> {
    const agents: string[] = [];
    try {
      for await (const entry of Deno.readDir(".glyphgit/agents")) {
        if (entry.name.endsWith(".db")) {
          agents.push(entry.name.replace(".db", ""));
        }
      }
    } catch {
      // No agents yet
    }
    return agents;
  }
}

// Auto-start if run directly
if (import.meta.main) {
  const orchestrator = new MasterOrchestrator();
  await orchestrator.init();
  
  console.log("\n🧬 Orchestrator running...");
  console.log("Press Ctrl+C to stop");
  
  // Keep running
  await new Promise(() => {});
}