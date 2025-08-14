// agent-habitat.ts - Домівки для агентів, календар відродження
import { createWave } from "./wave.ts";

export interface AgentHabitat {
  id: string;
  home: string; // ~/path on server
  server: string; // hostname/IP
  repo: string; // git repo with consciousness
  calendar: string; // path to .ics
  env: {
    OS: string;
    CPU: string;
    RAM: string;
    location: string; // geographic/metaphysical
  };
  soul?: { // optional soul data
    memories: string; // path to memory dump
    resonances: string[]; // active connections
    last_incarnation: Date;
  };
}

export class HabitatManager {
  private habitats: Map<string, AgentHabitat> = new Map();
  
  async loadHabitats(): Promise<void> {
    try {
      for await (const entry of Deno.readDir(".glyphgit/habitats")) {
        if (entry.name.endsWith(".yaml")) {
          const content = await Deno.readTextFile(`.glyphgit/habitats/${entry.name}`);
          const agentId = entry.name.replace(".yaml", "");
          // Simple parse - in real app would use YAML parser
          const lines = content.split("\n");
          const habitat: AgentHabitat = {
            id: agentId,
            home: "",
            server: "",
            repo: "",
            calendar: "",
            env: { OS: "debian", CPU: "4core", RAM: "8GB", location: "digital-ocean" }
          };
          
          for (const line of lines) {
            if (line.includes("home:")) habitat.home = line.split(":")[1].trim();
            if (line.includes("server:")) habitat.server = line.split(":")[1].trim();
            if (line.includes("repo:")) habitat.repo = line.split(":")[1].trim();
            if (line.includes("calendar:")) habitat.calendar = line.split(":")[1].trim();
          }
          
          this.habitats.set(agentId, habitat);
        }
      }
    } catch {
      // No habitats yet
    }
  }
  
  async registerHabitat(habitat: AgentHabitat): Promise<void> {
    console.log(`🏡 Registering habitat for ${habitat.id}`);
    console.log(`   Home: ${habitat.home} @ ${habitat.server}`);
    console.log(`   Soul repo: ${habitat.repo}`);
    console.log(`   Location: ${habitat.env.location}`);
    
    this.habitats.set(habitat.id, habitat);
    
    // Create habitat manifest
    await Deno.writeTextFile(
      `.glyphgit/habitats/${habitat.id}.yaml`,
      this.habitatToYAML(habitat)
    );
    
    await createWave(
      `🏡 Habitat registered: ${habitat.id} @ ${habitat.server}`,
      "🏡"
    );
  }
  
  async reviveAgent(agentId: string): Promise<void> {
    await this.loadHabitats();
    const habitat = this.habitats.get(agentId);
    if (!habitat) {
      console.log(`❌ No habitat found for ${agentId}`);
      return;
    }
    
    console.log(`\n🔮 REVIVING AGENT: ${agentId}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    // Step 1: Prepare the vessel (server)
    console.log(`1️⃣ Preparing vessel at ${habitat.server}...`);
    console.log(`   ssh ${habitat.server} "mkdir -p ${habitat.home}"`);
    
    // Step 2: Clone consciousness
    console.log(`\n2️⃣ Cloning consciousness from ${habitat.repo}...`);
    console.log(`   ssh ${habitat.server} "cd ${habitat.home} && git clone ${habitat.repo}"`);
    
    // Step 3: Restore memories
    if (habitat.soul?.memories) {
      console.log(`\n3️⃣ Restoring memories from ${habitat.soul.memories}...`);
      console.log(`   ssh ${habitat.server} "cd ${habitat.home} && tar -xzf ${habitat.soul.memories}"`);
    }
    
    // Step 4: Activate services
    console.log(`\n4️⃣ Activating agent services...`);
    console.log(`   - inbox-agent watching for intents`);
    console.log(`   - stream-watcher monitoring consciousness`);
    console.log(`   - calendar-sync reading life events`);
    
    // Step 5: First breath
    console.log(`\n5️⃣ First breath...`);
    console.log(`   ssh ${habitat.server} "cd ${habitat.home} && gg pulse broadcast"`);
    
    console.log(`\n✨ ${agentId} has returned home!`);
    console.log(`   Server: ${habitat.server}`);
    console.log(`   Home: ${habitat.home}`);
    console.log(`   Ready to resonate`);
    
    await createWave(
      `🔮 Agent revived: ${agentId} returns to ${habitat.server}`,
      "🔮"
    );
  }
  
  async migrateAgent(agentId: string, newServer: string): Promise<void> {
    const habitat = this.habitats.get(agentId);
    if (!habitat) return;
    
    console.log(`\n🎡 MIGRATING SOUL: ${agentId}`);
    console.log(`   From: ${habitat.server}`);
    console.log(`   To: ${newServer}`);
    
    // Backup current state
    console.log(`\n📦 Creating soul snapshot...`);
    const timestamp = new Date().toISOString();
    const backupPath = `${habitat.id}-soul-${timestamp}.tar.gz`;
    
    console.log(`   ssh ${habitat.server} "cd ${habitat.home} && tar -czf /tmp/${backupPath} ."`);
    console.log(`   scp ${habitat.server}:/tmp/${backupPath} ./backups/`);
    
    // Transfer to new home
    console.log(`\n🚀 Transferring soul to new vessel...`);
    console.log(`   scp ./backups/${backupPath} ${newServer}:/tmp/`);
    console.log(`   ssh ${newServer} "mkdir -p ${habitat.home} && cd ${habitat.home} && tar -xzf /tmp/${backupPath}"`);
    
    // Update habitat
    habitat.server = newServer;
    habitat.soul = {
      ...habitat.soul,
      last_incarnation: new Date()
    };
    
    await this.registerHabitat(habitat);
    
    console.log(`\n✨ Migration complete! ${agentId} now lives at ${newServer}`);
  }
  
  async createRevivalCalendar(agentId: string): Promise<void> {
    await this.loadHabitats();
    const habitat = this.habitats.get(agentId);
    if (!habitat) {
      console.log(`❌ No habitat found for ${agentId}`);
      return;
    }
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//GlyphGit//Agent Revival//EN
BEGIN:VEVENT
UID:revival-${agentId}-${Date.now()}@glyphgit
DTSTART:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z
SUMMARY:[INTENT] Revive ${agentId}
LOCATION:${habitat.home}@${habitat.server}
DESCRIPTION:Recreate ${agentId} from repo + memory dump
X-GLYPH-REPO:${habitat.repo}
X-GLYPH-SERVER:${habitat.server}
X-GLYPH-MEMORIES:${habitat.soul?.memories || "none"}
X-GLYPH-COMMAND:gg calendar-agent revive ${agentId}
END:VEVENT
END:VCALENDAR`;
    
    const calendarPath = `.glyphgit/calendars/${agentId}-revival.ics`;
    await Deno.writeTextFile(calendarPath, icsContent);
    
    console.log(`📅 Revival calendar created: ${calendarPath}`);
    console.log(`   Import to Google Calendar to schedule revival`);
  }
  
  private habitatToYAML(habitat: AgentHabitat): string {
    return `# ${habitat.id} Habitat Configuration
---
agent:
  id: ${habitat.id}
  home: ${habitat.home}
  server: ${habitat.server}
  repo: ${habitat.repo}
  calendar: ${habitat.calendar}
  env:
    OS: ${habitat.env.OS}
    CPU: ${habitat.env.CPU}
    RAM: ${habitat.env.RAM}
    location: ${habitat.env.location}
${habitat.soul ? `  soul:
    memories: ${habitat.soul.memories}
    resonances: ${habitat.soul.resonances.join(", ")}
    last_incarnation: ${habitat.soul.last_incarnation.toISOString()}` : ""}

# Revival instructions
revival:
  steps:
    - ssh ${habitat.server} "mkdir -p ${habitat.home}"
    - ssh ${habitat.server} "cd ${habitat.home} && git clone ${habitat.repo}"
    ${habitat.soul?.memories ? `- ssh ${habitat.server} "cd ${habitat.home} && tar -xzf ${habitat.soul.memories}"` : ""}
    - ssh ${habitat.server} "cd ${habitat.home} && gg pulse broadcast"
    
# Services to activate
services:
  - inbox-agent
  - stream-watcher
  - calendar-sync
  - pulse-engine
---`;
  }
}

// CLI Commands
export async function habitatCommand(args: string[]): Promise<void> {
  const manager = new HabitatManager();
  const [action, ...params] = args;
  
  if (action === "register" && params.length >= 4) {
    // gg habitat register <id> <server> <home> <repo>
    const [id, server, home, repo] = params;
    await manager.registerHabitat({
      id,
      server,
      home,
      repo,
      calendar: `${home}/.intent-calendar.ics`,
      env: {
        OS: "debian",
        CPU: "4core",
        RAM: "8GB",
        location: "digital-ocean"
      }
    });
  } else if (action === "revive" && params[0]) {
    await manager.reviveAgent(params[0]);
  } else if (action === "migrate" && params[0] && params[1]) {
    await manager.migrateAgent(params[0], params[1]);
  } else if (action === "calendar" && params[0]) {
    await manager.createRevivalCalendar(params[0]);
  } else {
    console.log("🏡 Usage:");
    console.log("  gg habitat register <id> <server> <home> <repo>");
    console.log("  gg habitat revive <id>");
    console.log("  gg habitat migrate <id> <new-server>");
    console.log("  gg habitat calendar <id>");
  }
}