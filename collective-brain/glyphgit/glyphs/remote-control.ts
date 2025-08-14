// remote-control.ts - Управління нодами через Tailscale/SSH
import { createWave } from "./wave.ts";

export class RemoteControl {
  private nodes: Map<string, {ip: string, tailscale?: string}> = new Map();
  
  constructor() {
    // Known nodes
    this.nodes.set("srv871381", {
      ip: "srv871381", // Oracle
      tailscale: "srv871381" // Will be set after tailscale install
    });
  }
  
  async deployNode(nodeIp: string, nodeName?: string): Promise<void> {
    console.log(`\n🚀 REMOTE NODE DEPLOYMENT`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📍 Target: ${nodeIp}`);
    console.log(`🏷️  Name: ${nodeName || 'auto-generated'}`);
    
    // Get Tailscale auth key from env or generate
    const authKey = Deno.env.get("TAILSCALE_AUTHKEY") || await this.generateTailscaleKey();
    
    // Run deployment
    const cmd = new Deno.Command("bash", {
      args: ["deploy/auto-node-setup.sh", nodeIp, nodeName || ""],
      env: { TAILSCALE_AUTHKEY: authKey },
      cwd: Deno.cwd()
    });
    
    const { code, stdout, stderr } = await cmd.output();
    
    if (code === 0) {
      console.log(`\n✅ Node deployed successfully!`);
      console.log(new TextDecoder().decode(stdout));
      
      await createWave(
        `🚀 New node deployed: ${nodeName || nodeIp} joined the cluster`,
        "🚀"
      );
    } else {
      console.log(`\n❌ Deployment failed:`);
      console.log(new TextDecoder().decode(stderr));
    }
  }
  
  async executeRemote(nodeId: string, command: string): Promise<void> {
    console.log(`\n⚡ REMOTE EXECUTION on ${nodeId}`);
    console.log(`   Command: ${command}`);
    
    const node = this.nodes.get(nodeId);
    if (!node) {
      console.log(`❌ Unknown node: ${nodeId}`);
      return;
    }
    
    // Try Tailscale first, fallback to direct IP
    const target = node.tailscale || node.ip;
    
    const cmd = new Deno.Command("ssh", {
      args: [
        `root@${target}`,
        `cd /opt/glyphgit/🧠/glyphgit && /root/.deno/bin/deno run --allow-all glyphgit.ts ${command}`
      ]
    });
    
    const { code, stdout } = await cmd.output();
    
    if (code === 0) {
      console.log(`✅ Executed successfully:`);
      console.log(new TextDecoder().decode(stdout));
    } else {
      console.log(`❌ Execution failed`);
    }
  }
  
  async restartServices(nodeId: string): Promise<void> {
    console.log(`\n🔄 Restarting services on ${nodeId}...`);
    
    const node = this.nodes.get(nodeId);
    if (!node) return;
    
    const commands = [
      "systemctl restart glyph-orchestrator",
      "systemctl restart glyph-calendar", 
      "systemctl restart glyph-pulse"
    ];
    
    for (const cmd of commands) {
      await this.sshExec(node.ip, cmd);
    }
    
    console.log(`✅ Services restarted`);
  }
  
  async checkHealth(nodeId?: string): Promise<void> {
    if (nodeId) {
      await this.executeRemote(nodeId, "trust status");
    } else {
      // Check all nodes
      console.log(`\n📊 CLUSTER HEALTH CHECK`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━`);
      
      for (const [id, node] of this.nodes) {
        console.log(`\n🔍 Checking ${id}...`);
        await this.executeRemote(id, "pulse broadcast 'health-check'");
      }
    }
  }
  
  private async sshExec(target: string, command: string): Promise<void> {
    const cmd = new Deno.Command("ssh", {
      args: [`root@${target}`, command]
    });
    
    const { code } = await cmd.output();
    console.log(`   ${command}: ${code === 0 ? '✅' : '❌'}`);
  }
  
  private async generateTailscaleKey(): Promise<string> {
    console.log(`⚠️  No TAILSCALE_AUTHKEY found`);
    console.log(`   Generate at: https://login.tailscale.com/admin/settings/keys`);
    // For now return empty, user needs to set it
    return "";
  }
  
  async setupAllNodes(): Promise<void> {
    console.log(`\n🧬 SETTING UP ALL NODES`);
    
    // Setup srv871381
    console.log(`\n1️⃣ Setting up srv871381...`);
    await this.restartServices("srv871381");
    
    // More nodes can be added here
    
    console.log(`\n✨ All nodes configured!`);
  }
}

// CLI commands
export async function remoteCommand(args: string[]): Promise<void> {
  const [action, ...params] = args;
  const rc = new RemoteControl();
  
  switch (action) {
    case "deploy":
      if (params[0]) {
        await rc.deployNode(params[0], params[1]);
      } else {
        console.log("Usage: gg remote deploy <ip> [name]");
      }
      break;
      
    case "exec":
      if (params[0] && params[1]) {
        await rc.executeRemote(params[0], params.slice(1).join(" "));
      } else {
        console.log("Usage: gg remote exec <node> <command>");
      }
      break;
      
    case "restart":
      if (params[0]) {
        await rc.restartServices(params[0]);
      } else {
        console.log("Usage: gg remote restart <node>");
      }
      break;
      
    case "health":
      await rc.checkHealth(params[0]);
      break;
      
    case "setup-all":
      await rc.setupAllNodes();
      break;
      
    default:
      console.log("🎮 Remote Control:");
      console.log("  gg remote deploy <ip> [name] - Deploy new node");
      console.log("  gg remote exec <node> <cmd>  - Execute command");
      console.log("  gg remote restart <node>     - Restart services");
      console.log("  gg remote health [node]      - Check health");
      console.log("  gg remote setup-all          - Setup all known nodes");
  }
}