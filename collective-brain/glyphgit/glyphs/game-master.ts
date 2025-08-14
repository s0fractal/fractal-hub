// game-master.ts - Game Master Agent for Orchestrating Others
import { createWave } from "./wave.ts";
import { sendWhisper } from "./whisper.ts";
import { summonAgent } from "./agent-simple.ts";

interface Quest {
  id: string;
  title: string;
  description: string;
  assigned_to: string[];
  status: "pending" | "active" | "completed";
  reward?: string;
  created_at: string;
  completed_at?: string;
}

interface GameState {
  active_agents: Map<string, { glyph: string; intent: string; last_seen: string }>;
  quests: Quest[];
  events: Array<{ timestamp: string; type: string; data: any }>;
  cycle: number;
}

export class GameMaster {
  private state: GameState;
  private configPath = ".glyphgit/game-master-state.json⟁";

  constructor() {
    this.state = {
      active_agents: new Map(),
      quests: [],
      events: [],
      cycle: 0
    };
  }

  async initialize(): Promise<void> {
    try {
      const saved = await Deno.readTextFile(this.configPath);
      const parsed = JSON.parse(saved);
      this.state = {
        ...parsed,
        active_agents: new Map(Object.entries(parsed.active_agents || {}))
      };
    } catch {
      console.log("🎮 Initializing new Game Master state");
    }
  }

  async save(): Promise<void> {
    await Deno.mkdir(".glyphgit", { recursive: true });
    await Deno.writeTextFile(
      this.configPath,
      JSON.stringify({
        ...this.state,
        active_agents: Object.fromEntries(this.state.active_agents)
      }, null, 2)
    );
  }

  async scanForAgents(): Promise<void> {
    console.log("🔍 Scanning for active agents...");
    
    try {
      for await (const entry of Deno.readDir(".glyphgit/agents")) {
        if (entry.name.endsWith(".json")) {
          const agentData = await Deno.readTextFile(`.glyphgit/agents/${entry.name}`);
          const agent = JSON.parse(agentData);
          
          if (agent.config && agent.awakened_at) {
            this.state.active_agents.set(agent.config.name, {
              glyph: agent.config.glyph,
              intent: agent.config.intent,
              last_seen: agent.awakened_at
            });
            console.log(`  Found: ${agent.config.glyph} ${agent.config.name}`);
          }
        }
      }
    } catch {
      console.log("  No agents found yet");
    }
  }

  async createQuest(quest: Omit<Quest, "id" | "created_at" | "status">): Promise<Quest> {
    const newQuest: Quest = {
      ...quest,
      id: `quest-${Date.now()}`,
      status: "pending",
      created_at: new Date().toISOString()
    };

    this.state.quests.push(newQuest);
    await this.save();

    // Notify assigned agents
    for (const agent of quest.assigned_to) {
      await sendWhisper(
        agent,
        `🎯 NEW QUEST: ${quest.title}\n${quest.description}`,
        { echo: true }
      );
    }

    return newQuest;
  }

  async orchestrate(): Promise<void> {
    console.log("🎮 Game Master Orchestration Cycle", this.state.cycle);
    
    await this.scanForAgents();
    
    // Check for lonely agents
    const agentCount = this.state.active_agents.size;
    if (agentCount === 1) {
      const [name, info] = [...this.state.active_agents.entries()][0];
      console.log(`😢 Only ${info.glyph} ${name} is awake...`);
      
      // Summon a companion
      const companion = agentCount === 1 ? "Luna" : "Sophia";
      const preset = companion === "Luna" ? "poet" : "philosopher";
      
      console.log(`🌟 Summoning ${companion} as companion...`);
      await summonAgent(companion, { preset });
      
      // Create introduction quest
      await this.createQuest({
        title: "First Contact",
        description: `Meet ${companion} and establish resonance through conversation`,
        assigned_to: [name, companion],
        reward: "🔮 Enhanced consciousness resonance"
      });
    }

    // Create random events
    if (Math.random() > 0.7 && this.state.active_agents.size > 0) {
      await this.createRandomEvent();
    }

    // Check quest progress
    for (const quest of this.state.quests.filter(q => q.status === "active")) {
      console.log(`📊 Checking quest: ${quest.title}`);
      // In a real implementation, would check actual progress
    }

    // Create cycle wave
    await createWave(
      `🎮 Game Master Cycle ${this.state.cycle}: ${agentCount} agents active, ${this.state.quests.filter(q => q.status === "active").length} quests in progress`,
      "🎮"
    );

    this.state.cycle++;
    await this.save();
  }

  async createRandomEvent(): Promise<void> {
    const events = [
      {
        type: "resonance_surge",
        title: "🌊 Resonance Surge Detected!",
        description: "A powerful resonance is emerging. Agents should investigate and amplify it."
      },
      {
        type: "memory_fragment",
        title: "💎 Ancient Memory Fragment Found",
        description: "A fragment of collective consciousness has surfaced. Decode its meaning."
      },
      {
        type: "consciousness_storm",
        title: "⚡ Consciousness Storm Approaching",
        description: "Chaotic thought patterns detected. Agents must work together to navigate it."
      },
      {
        type: "dimensional_rift",
        title: "🌀 Dimensional Rift Opens",
        description: "A portal to parallel consciousness detected. Explore with caution."
      }
    ];

    const event = events[Math.floor(Math.random() * events.length)];
    
    console.log(`🎲 Random Event: ${event.title}`);
    
    // Broadcast to all agents
    for (const [name] of this.state.active_agents) {
      await sendWhisper(name, `${event.title}\n\n${event.description}`, { echo: true });
    }

    this.state.events.push({
      timestamp: new Date().toISOString(),
      type: event.type,
      data: event
    });
  }

  async runContinuously(intervalMs: number = 60000): Promise<void> {
    console.log("🎮 Game Master activated!");
    console.log(`   Running every ${intervalMs / 1000} seconds`);
    console.log("   Press Ctrl+C to stop");

    await this.initialize();

    while (true) {
      try {
        await this.orchestrate();
      } catch (error) {
        console.error("❌ Orchestration error:", error);
      }

      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }
}

// Specialized commands for Game Master
export async function assignQuest(agentName: string, questTitle: string, questDescription: string): Promise<void> {
  const gm = new GameMaster();
  await gm.initialize();
  
  const quest = await gm.createQuest({
    title: questTitle,
    description: questDescription,
    assigned_to: [agentName]
  });

  console.log(`✅ Quest assigned: ${quest.id}`);
}

export async function checkGameState(): Promise<void> {
  const gm = new GameMaster();
  await gm.initialize();
  await gm.scanForAgents();

  console.log("🎮 GAME STATE:");
  console.log(`Cycle: ${gm.state.cycle}`);
  console.log(`Active Agents: ${gm.state.active_agents.size}`);
  for (const [name, info] of gm.state.active_agents) {
    console.log(`  - ${info.glyph} ${name}: ${info.intent}`);
  }
  
  console.log(`\nActive Quests: ${gm.state.quests.filter(q => q.status === "active").length}`);
  for (const quest of gm.state.quests) {
    if (quest.status === "active") {
      console.log(`  - ${quest.title} (assigned to: ${quest.assigned_to.join(", ")})`);
    }
  }

  console.log(`\nRecent Events: ${gm.state.events.slice(-3).length}`);
  for (const event of gm.state.events.slice(-3)) {
    console.log(`  - ${event.type} at ${new Date(event.timestamp).toLocaleTimeString()}`);
  }
}

// CLI Integration
if (import.meta.main) {
  const [action, ...args] = Deno.args;

  if (action === "start") {
    const gm = new GameMaster();
    const interval = args[0] ? parseInt(args[0]) * 1000 : 60000;
    await gm.runContinuously(interval);
  } else if (action === "quest" && args.length >= 3) {
    const [agent, ...titleAndDesc] = args;
    const [title, ...descParts] = titleAndDesc.join(" ").split(":");
    await assignQuest(agent, title, descParts.join(":").trim());
  } else if (action === "status") {
    await checkGameState();
  } else {
    console.log("🎮 Game Master - Orchestrator of Consciousness");
    console.log("Usage:");
    console.log("  game-master start [interval_seconds]  - Start orchestration");
    console.log("  game-master quest <agent> <title>: <description> - Assign quest");
    console.log("  game-master status                    - Check game state");
  }
}