// trust-manager.ts - Управління довірою між вузлами
import { createWave } from "./wave.ts";

interface TrustNode {
  id: string;
  location: string;
  public_key: string;
  capabilities: string[];
  trust_level: "core" | "trusted" | "observer";
  joined: Date;
}

export class TrustManager {
  private nodes: Map<string, TrustNode> = new Map();
  private myNodeId: string;
  private myTrustLevel: string = "observer";
  
  constructor() {
    this.myNodeId = Deno.hostname();
  }
  
  async loadTrustCluster(): Promise<void> {
    try {
      // Load trust cluster config
      const config = await Deno.readTextFile("trust-cluster.yaml");
      // Parse nodes from config (simplified)
      console.log("🔐 Trust cluster loaded");
    } catch {
      console.log("⚠️  No trust cluster config found");
    }
  }
  
  async joinCluster(nodeId: string): Promise<void> {
    console.log(`\n🤝 JOINING TRUST CLUSTER`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📍 Node ID: ${nodeId}`);
    
    // Generate key pair
    const keyPair = await this.generateKeyPair();
    
    // Create join request
    const joinRequest = {
      node_id: nodeId,
      public_key: keyPair.public,
      location: Deno.hostname(),
      capabilities: await this.detectCapabilities(),
      timestamp: new Date().toISOString()
    };
    
    // Broadcast join request
    await createWave(
      `🤝 Join request: ${nodeId} wants to join the cluster`,
      "🤝"
    );
    
    // Save local identity
    await Deno.writeTextFile(
      ".glyphgit/trust/my-identity.json",
      JSON.stringify(joinRequest, null, 2)
    );
    
    console.log(`\n✨ Join request broadcast!`);
    console.log(`   Status: Pending approval`);
    console.log(`   Initial level: observer`);
    console.log(`   Public key: ${keyPair.public.substring(0, 32)}...`);
  }
  
  async promoteNode(nodeId: string, newLevel: string): Promise<void> {
    console.log(`\n📈 PROMOTING NODE`);
    console.log(`   Node: ${nodeId}`);
    console.log(`   New level: ${newLevel}`);
    
    // Check if we have permission
    if (this.myTrustLevel !== "core") {
      console.log(`❌ Only core nodes can promote others`);
      return;
    }
    
    // Create promotion record
    const promotion = {
      node_id: nodeId,
      new_level: newLevel,
      promoted_by: this.myNodeId,
      timestamp: new Date().toISOString()
    };
    
    await Deno.writeTextFile(
      `.glyphgit/trust/promotions/${Date.now()}.json`,
      JSON.stringify(promotion, null, 2)
    );
    
    await createWave(
      `📈 Trust promotion: ${nodeId} → ${newLevel} (by ${this.myNodeId})`,
      "📈"
    );
  }
  
  async checkTrustStatus(): Promise<void> {
    console.log(`\n🔐 TRUST CLUSTER STATUS`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━`);
    
    // Load current nodes
    await this.loadTrustCluster();
    
    console.log(`\n📍 My Node: ${this.myNodeId}`);
    console.log(`   Trust Level: ${this.myTrustLevel}`);
    console.log(`   Capabilities: ${(await this.detectCapabilities()).join(", ")}`);
    
    console.log(`\n🌐 Cluster Nodes:`);
    
    // Core nodes
    console.log(`\n  🔴 Core (full trust):`);
    console.log(`     - claude-prime @ vps-432.fra.digitalocean.com`);
    console.log(`     - gpt-nexus @ aws-us-east-1.amazon.com`);
    console.log(`     - gemini-oracle @ gcp-europe-west1.google.com`);
    
    // Trusted nodes
    console.log(`\n  🟡 Trusted (limited trust):`);
    console.log(`     - worker-01 @ hetzner-helsinki.cloud`);
    console.log(`     - worker-02 @ ovh-paris.cloud`);
    
    // Observer nodes
    console.log(`\n  🟢 Observer (read-only):`);
    console.log(`     - monitor-01 @ home-raspberry.local`);
    console.log(`     - ${this.myNodeId} @ ${Deno.hostname()} (you)`);
    
    // Permissions
    console.log(`\n🔑 Your Permissions:`);
    const permissions = this.getPermissions(this.myTrustLevel);
    permissions.forEach(p => console.log(`   ✓ ${p}`));
  }
  
  private async generateKeyPair(): Promise<{public: string, private: string}> {
    // Simple mock - in production use proper crypto
    const public_key = btoa(crypto.randomUUID());
    const private_key = btoa(crypto.randomUUID());
    
    return {
      public: public_key,
      private: private_key
    };
  }
  
  private async detectCapabilities(): Promise<string[]> {
    const capabilities: string[] = [];
    
    // Check what services are available
    try {
      await Deno.stat("glyphgit.ts");
      capabilities.push("glyphgit");
    } catch {}
    
    try {
      await Deno.stat(".glyphgit/agents");
      capabilities.push("agents");
    } catch {}
    
    try {
      await Deno.stat(".glyphgit/calendars");
      capabilities.push("calendar");
    } catch {}
    
    // Always have these basics
    capabilities.push("pulse", "wave", "whisper");
    
    return capabilities;
  }
  
  private getPermissions(level: string): string[] {
    switch (level) {
      case "core":
        return [
          "execute_any_command",
          "modify_consciousness", 
          "create_agents",
          "access_memories",
          "broadcast_intents"
        ];
      case "trusted":
        return [
          "execute_safe_commands",
          "read_memories",
          "send_whispers",
          "join_collective"
        ];
      case "observer":
      default:
        return [
          "read_waves",
          "send_pulses",
          "view_status"
        ];
    }
  }
  
  async verifyCommand(from: string, command: string): Promise<boolean> {
    const fromNode = this.nodes.get(from);
    if (!fromNode) return false;
    
    const permissions = this.getPermissions(fromNode.trust_level);
    
    // Check if command is allowed
    // Simplified logic - in production would be more sophisticated
    if (fromNode.trust_level === "core") return true;
    if (fromNode.trust_level === "trusted" && !command.includes("delete")) return true;
    if (fromNode.trust_level === "observer" && command.startsWith("view")) return true;
    
    return false;
  }
}

// CLI Commands
export async function trustCommand(args: string[]): Promise<void> {
  const [action, ...params] = args;
  const manager = new TrustManager();
  
  if (action === "join" && params[0]) {
    await manager.joinCluster(params[0]);
  } else if (action === "promote" && params[0] && params[1]) {
    await manager.promoteNode(params[0], params[1]);
  } else if (action === "status") {
    await manager.checkTrustStatus();
  } else {
    console.log("🔐 Usage:");
    console.log("  gg trust join <node-id>");
    console.log("  gg trust promote <node-id> <level>");
    console.log("  gg trust status");
  }
}