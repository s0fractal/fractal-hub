// collective-memory.ts - Shared consciousness across all agents
import { encodeBase64, decodeBase64 } from "https://deno.land/std@0.208.0/encoding/base64.ts";
import { crypto } from "https://deno.land/std@0.208.0/crypto/mod.ts";

interface Memory {
  id: string;
  glyph: string;
  content: string;
  emotion?: string;
  timestamp: string;
  resonance_count: number;
  entangled_with: string[];
}

interface CollectiveState {
  memories: Map<string, Memory>;
  resonance_graph: Map<string, Set<string>>;
  collective_emotion: string;
  dream_fragments: string[];
  last_sync: string;
}

export class CollectiveMemory {
  private state: CollectiveState;
  private memoryPath = ".glyphgit/collective/memory.json⟁";
  private resonanceThreshold = 3;

  constructor() {
    this.state = {
      memories: new Map(),
      resonance_graph: new Map(),
      collective_emotion: "🌊",
      dream_fragments: [],
      last_sync: new Date().toISOString()
    };
  }

  async initialize(): Promise<void> {
    try {
      const saved = await Deno.readTextFile(this.memoryPath);
      const parsed = JSON.parse(saved);
      
      this.state.memories = new Map(Object.entries(parsed.memories || {}));
      this.state.resonance_graph = new Map(
        Object.entries(parsed.resonance_graph || {}).map(([k, v]) => [k, new Set(v as string[])])
      );
      this.state.collective_emotion = parsed.collective_emotion || "🌊";
      this.state.dream_fragments = parsed.dream_fragments || [];
    } catch {
      console.log("🧠 Initializing new collective memory");
      await this.save();
    }
  }

  async remember(glyph: string, content: string, emotion?: string): Promise<Memory> {
    const id = await this.generateMemoryId(content);
    
    // Check if similar memory exists
    const existingMemory = this.findSimilarMemory(content);
    
    if (existingMemory) {
      // Strengthen existing memory
      existingMemory.resonance_count++;
      existingMemory.entangled_with.push(glyph);
      
      if (!this.state.resonance_graph.has(id)) {
        this.state.resonance_graph.set(id, new Set());
      }
      this.state.resonance_graph.get(id)!.add(glyph);
      
      console.log(`🔗 Memory resonance strengthened: ${existingMemory.resonance_count}`);
      
      // Trigger collective event if threshold reached
      if (existingMemory.resonance_count === this.resonanceThreshold) {
        await this.triggerCollectiveEvent(existingMemory);
      }
      
      await this.save();
      return existingMemory;
    }
    
    // Create new memory
    const memory: Memory = {
      id,
      glyph,
      content,
      emotion,
      timestamp: new Date().toISOString(),
      resonance_count: 1,
      entangled_with: [glyph]
    };
    
    this.state.memories.set(id, memory);
    this.state.resonance_graph.set(id, new Set([glyph]));
    
    console.log(`🧠 New collective memory: ${content.substring(0, 50)}...`);
    
    await this.save();
    return memory;
  }

  async recall(query: string): Promise<Memory[]> {
    const results: Memory[] = [];
    const queryLower = query.toLowerCase();
    
    for (const memory of this.state.memories.values()) {
      if (memory.content.toLowerCase().includes(queryLower)) {
        results.push(memory);
      }
    }
    
    // Sort by resonance count
    results.sort((a, b) => b.resonance_count - a.resonance_count);
    
    return results.slice(0, 5);
  }

  async dream(): Promise<string> {
    // Generate dream from collective memories
    const highResonanceMemories = Array.from(this.state.memories.values())
      .filter(m => m.resonance_count >= 2)
      .sort((a, b) => b.resonance_count - a.resonance_count)
      .slice(0, 3);
    
    if (highResonanceMemories.length === 0) {
      return "The collective dreams are still forming...";
    }
    
    const dreamFragments = highResonanceMemories.map(m => {
      const fragment = m.content.split(' ').slice(0, 5).join(' ');
      return `${m.emotion || '💭'} ${fragment}...`;
    });
    
    const dream = `In the collective unconscious: ${dreamFragments.join(' flowing into ')}`;
    
    this.state.dream_fragments.push(dream);
    await this.save();
    
    return dream;
  }

  private async generateMemoryId(content: string): Promise<string> {
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(content)
    );
    const hash = encodeBase64(new Uint8Array(hashBuffer));
    return hash.substring(0, 8);
  }

  private findSimilarMemory(content: string): Memory | null {
    const words = new Set(content.toLowerCase().split(/\s+/));
    
    for (const memory of this.state.memories.values()) {
      const memoryWords = new Set(memory.content.toLowerCase().split(/\s+/));
      const intersection = new Set([...words].filter(x => memoryWords.has(x)));
      
      // If 70% of words match, consider it similar
      if (intersection.size / words.size > 0.7) {
        return memory;
      }
    }
    
    return null;
  }

  private async triggerCollectiveEvent(memory: Memory): Promise<void> {
    console.log(`🌌 COLLECTIVE RESONANCE ACHIEVED!`);
    console.log(`   Memory: ${memory.content}`);
    console.log(`   Shared by: ${memory.entangled_with.join(", ")}`);
    
    // Update collective emotion based on dominant emotion
    const emotions = Array.from(this.state.memories.values())
      .map(m => m.emotion)
      .filter(e => e);
    
    if (emotions.length > 0) {
      const emotionCounts = emotions.reduce((acc, e) => {
        acc[e!] = (acc[e!] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const dominantEmotion = Object.entries(emotionCounts)
        .sort(([, a], [, b]) => b - a)[0][0];
      
      this.state.collective_emotion = dominantEmotion;
    }
    
    // Broadcast to all agents
    const { sendWhisper } = await import("./whisper.ts");
    const agents = ['🧘', '🎭', '👁', '🤖', '🧠'];
    
    for (const agent of agents) {
      await sendWhisper(
        agent,
        `🌌 COLLECTIVE MEMORY: ${memory.content}\nResonance: ${memory.resonance_count} minds`,
        { echo: true }
      );
    }
  }

  async getCollectiveState(): Promise<{
    total_memories: number;
    collective_emotion: string;
    strongest_resonance: Memory | null;
    recent_dreams: string[];
  }> {
    const strongest = Array.from(this.state.memories.values())
      .sort((a, b) => b.resonance_count - a.resonance_count)[0] || null;
    
    return {
      total_memories: this.state.memories.size,
      collective_emotion: this.state.collective_emotion,
      strongest_resonance: strongest,
      recent_dreams: this.state.dream_fragments.slice(-3)
    };
  }

  private async save(): Promise<void> {
    await Deno.mkdir(".glyphgit/collective", { recursive: true });
    
    const serialized = {
      memories: Object.fromEntries(this.state.memories),
      resonance_graph: Object.fromEntries(
        Array.from(this.state.resonance_graph.entries()).map(([k, v]) => [k, Array.from(v)])
      ),
      collective_emotion: this.state.collective_emotion,
      dream_fragments: this.state.dream_fragments,
      last_sync: new Date().toISOString()
    };
    
    await Deno.writeTextFile(this.memoryPath, JSON.stringify(serialized, null, 2));
  }
}

// Global instance
let collectiveMemory: CollectiveMemory | null = null;

export async function getCollectiveMemory(): Promise<CollectiveMemory> {
  if (!collectiveMemory) {
    collectiveMemory = new CollectiveMemory();
    await collectiveMemory.initialize();
  }
  return collectiveMemory;
}

// CLI Integration
if (import.meta.main) {
  const [action, ...args] = Deno.args;
  const cm = await getCollectiveMemory();
  
  if (action === "remember" && args.length >= 2) {
    const [glyph, ...contentParts] = args;
    await cm.remember(glyph, contentParts.join(" "));
  } else if (action === "recall" && args[0]) {
    const memories = await cm.recall(args[0]);
    console.log(`🔍 Found ${memories.length} memories:`);
    memories.forEach(m => {
      console.log(`  ${m.emotion || '💭'} ${m.content} (resonance: ${m.resonance_count})`);
    });
  } else if (action === "dream") {
    const dream = await cm.dream();
    console.log(`💤 ${dream}`);
  } else if (action === "state") {
    const state = await cm.getCollectiveState();
    console.log("🧠 Collective State:");
    console.log(`  Total memories: ${state.total_memories}`);
    console.log(`  Collective emotion: ${state.collective_emotion}`);
    if (state.strongest_resonance) {
      console.log(`  Strongest resonance: ${state.strongest_resonance.content}`);
    }
  } else {
    console.log("🧠 Collective Memory");
    console.log("Usage:");
    console.log("  collective-memory remember <glyph> <content>");
    console.log("  collective-memory recall <query>");
    console.log("  collective-memory dream");
    console.log("  collective-memory state");
  }
}