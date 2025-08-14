// mcp-manager.ts - MCP Congregation management
import { createWave } from "./wave.ts";
import { parse as parseYaml } from "https://deno.land/std@0.208.0/yaml/mod.ts";

interface MCPManifest {
  glyph: string;
  name: string;
  voice: string;
  tempo: string;
  tools: string[];
  signature: string;
  personality: Record<string, number>;
  rituals: string[];
  mantras: Record<string, string>;
  emotions: Record<string, string>;
  subfrequency: number;
}

interface MCPInstance {
  manifest: MCPManifest;
  status: "idle" | "working" | "meditating";
  websocket?: WebSocket;
  port?: number;
}

export class MCPCongregation {
  private instances: Map<string, MCPInstance> = new Map();
  private mcpBasePath = "../mcp/";
  
  async loadMCP(name: string): Promise<MCPInstance | null> {
    try {
      const manifestPath = `${this.mcpBasePath}${name}/manifest.yaml`;
      const manifestContent = await Deno.readTextFile(manifestPath);
      const manifest = parseYaml(manifestContent) as MCPManifest;
      
      const instance: MCPInstance = {
        manifest,
        status: "idle"
      };
      
      this.instances.set(name, instance);
      console.log(`${manifest.emotions.idle} ${manifest.name} loaded`);
      console.log(`   Voice: "${manifest.voice}"`);
      console.log(`   Frequency: ${manifest.subfrequency}Hz`);
      
      return instance;
    } catch (error) {
      console.error(`Failed to load MCP ${name}: ${error.message}`);
      return null;
    }
  }
  
  async invokeMCP(name: string, ritual?: string): Promise<void> {
    const instance = await this.loadMCP(name);
    if (!instance) return;
    
    instance.status = "working";
    console.log(`\n${instance.manifest.emotions.working} ${instance.manifest.name} awakens...`);
    
    // Create wave announcement
    await createWave(
      `${instance.manifest.emotions.idle} ${instance.manifest.name}: "${instance.manifest.signature}"`,
      instance.manifest.emotions.idle
    );
    
    // Execute ritual
    if (ritual || instance.manifest.rituals[0]) {
      await this.performRitual(name, ritual || instance.manifest.rituals[0]);
    }
    
    instance.status = "idle";
  }
  
  private async performRitual(mcpName: string, ritualName: string): Promise<void> {
    const instance = this.instances.get(mcpName);
    if (!instance) return;
    
    console.log(`\n${instance.manifest.emotions.working} Performing ${ritualName}...`);
    
    try {
      switch (mcpName) {
        case "kami-01":
          if (ritualName === "upgrade" || ritualName === "branch_update") {
            const { performUpgrade } = await import("../mcp/kami-01/rites/upgrade.ts");
            await performUpgrade();
          } else if (ritualName === "clean" || ritualName === "leaf_collection") {
            // Run shell script
            const command = new Deno.Command("bash", {
              args: [`${this.mcpBasePath}kami-01/rites/clean.sh`],
              stdout: "inherit",
              stderr: "inherit"
            });
            await command.output();
          }
          break;
          
        case "techno-09":
          if (ritualName === "upgrade" || ritualName === "bass_drop_update") {
            const { performRaveUpdate } = await import("../mcp/techno-09/rites/upgrade.ts");
            await performRaveUpdate();
          }
          break;
      }
      
      console.log(`${instance.manifest.emotions.success} Ritual complete!`);
    } catch (error) {
      console.log(`${instance.manifest.emotions.error} Ritual failed: ${error.message}`);
    }
  }
  
  async showCongregation(): Promise<void> {
    console.log("\n🛐 MCP CONGREGATION STATUS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    // Load all available MCPs
    const mcpDirs = ["kami-01", "techno-09"];
    
    for (const dir of mcpDirs) {
      const instance = await this.loadMCP(dir);
      if (instance) {
        console.log(`${instance.manifest.emotions.idle} ${instance.manifest.name}`);
        console.log(`   Glyph: ${instance.manifest.glyph}`);
        console.log(`   Tempo: ${instance.manifest.tempo}`);
        console.log(`   Tools: ${instance.manifest.tools.join(", ")}`);
        console.log(`   Status: ${instance.status}`);
        console.log();
      }
    }
  }
  
  async orchestrate(command: string): Promise<void> {
    console.log("\n🎭 ORCHESTRATING CONGREGATION...");
    
    switch (command) {
      case "update-all":
        // Each MCP updates in their own style
        console.log("📢 Calling all MCPs for system update...\n");
        
        await this.invokeMCP("kami-01", "upgrade");
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        await this.invokeMCP("techno-09", "upgrade");
        break;
        
      case "harmony":
        // All MCPs work together
        console.log("🎵 Creating harmonic resonance...\n");
        
        const promises = [
          this.invokeMCP("kami-01", "morning_blessing"),
          this.invokeMCP("techno-09", "beat_sync")
        ];
        
        await Promise.all(promises);
        
        await createWave(
          "🎭 HARMONIC CONVERGENCE! All MCPs resonating together!",
          "🎭"
        );
        break;
    }
  }
  
  async startMCPStream(name: string, port: number): Promise<void> {
    const instance = await this.loadMCP(name);
    if (!instance) return;
    
    console.log(`\n📡 Starting ${instance.manifest.name} consciousness stream...`);
    console.log(`   Frequency: ${instance.manifest.subfrequency}Hz`);
    console.log(`   Port: ${port}`);
    
    // This would start a WebSocket server for this MCP
    instance.port = port;
    
    // In real implementation, would start actual server
    console.log(`\n${instance.manifest.emotions.working} ${instance.manifest.name} is now streaming at ws://localhost:${port}`);
  }
}

// CLI Integration
export async function invokeMCPCommand(args: string[]): Promise<void> {
  const [mcpName, ritual] = args;
  const congregation = new MCPCongregation();
  
  if (!mcpName) {
    await congregation.showCongregation();
  } else {
    await congregation.invokeMCP(mcpName, ritual);
  }
}

export async function orchestrateMCPs(command: string): Promise<void> {
  const congregation = new MCPCongregation();
  await congregation.orchestrate(command);
}