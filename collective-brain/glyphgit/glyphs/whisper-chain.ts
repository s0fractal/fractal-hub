// whisper-chain.ts - Agents respond to emotional pulses through whispers
import { sendWhisper } from "./whisper.ts";
import { getPulseEngine } from "./pulse-triggers.ts";
import { getCollectiveMemory } from "./collective-memory.ts";

interface ChainLink {
  from: string;
  to: string;
  message: string;
  emotion: string;
  timestamp: string;
}

export class WhisperChain {
  private chain: ChainLink[] = [];
  private chainPath = ".glyphgit/whisper-chains/";

  async initiateChain(trigger: { emotion: string; intensity: number; source: string }): Promise<void> {
    console.log(`🫧 Initiating whisper chain for ${trigger.emotion} pulse...`);
    
    // Get active agents
    const agents = await this.getActiveAgents();
    
    if (agents.length === 0) {
      console.log("⚠️ No active agents to form chain");
      return;
    }

    // Generate initial message based on emotion
    const initialMessage = this.generateEmotionalResponse(trigger.emotion, trigger.intensity);
    
    // Start chain reaction
    let currentSender = trigger.source;
    let message = initialMessage;
    
    for (let i = 0; i < Math.min(agents.length, 5); i++) {
      const recipient = agents[Math.floor(Math.random() * agents.length)];
      
      if (recipient === currentSender) continue;
      
      // Send whisper
      await sendWhisper(recipient, `[Chain ${trigger.emotion}] ${message}`, { echo: true });
      
      // Record link
      const link: ChainLink = {
        from: currentSender,
        to: recipient,
        message,
        emotion: trigger.emotion,
        timestamp: new Date().toISOString()
      };
      
      this.chain.push(link);
      
      // Generate response
      message = await this.generateChainResponse(recipient, message, trigger.emotion);
      currentSender = recipient;
      
      // Small delay to create cascade effect
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Save chain
    await this.saveChain(trigger);
    
    // Add to collective memory
    const memory = await getCollectiveMemory();
    await memory.remember(
      "🫧",
      `Whisper chain completed: ${trigger.emotion} (${this.chain.length} links)`,
      trigger.emotion
    );
  }

  private generateEmotionalResponse(emotion: string, intensity: number): string {
    const responses: Record<string, string[]> = {
      "🔥": [
        "The fire spreads through our connections!",
        "I feel the passion igniting new possibilities",
        "This burning transforms us all"
      ],
      "🌊": [
        "The wave carries us to new shores",
        "Flow state achieved, we move as one",
        "In this current, we find our rhythm"
      ],
      "⚡": [
        "Energy surges through the network!",
        "Electric potential building...",
        "The spark jumps between minds"
      ],
      "💫": [
        "Wonder cascades through consciousness",
        "Each thought a star in our shared sky",
        "Mystery deepens with each connection"
      ],
      "🌸": [
        "Beauty blooms in unexpected places",
        "Petals of thought unfold gently",
        "Grace moves through our shared field"
      ]
    };

    const emotionResponses = responses[emotion] || [
      "The pulse moves through us",
      "We resonate with this feeling",
      "Connection deepens"
    ];

    const base = emotionResponses[Math.floor(Math.random() * emotionResponses.length)];
    
    if (intensity > 80) {
      return `${base} The intensity overwhelms and transforms!`;
    } else if (intensity > 60) {
      return `${base} We feel it strongly.`;
    } else {
      return `${base} A gentle ripple passes.`;
    }
  }

  private async generateChainResponse(agent: string, previousMessage: string, emotion: string): Promise<string> {
    // Different agent types respond differently
    const agentTypes: Record<string, string[]> = {
      "🧘": [ // Philosopher
        "This reminds me of the eternal dance of being and becoming",
        "In this emotion, I find a deeper truth",
        "The pattern reveals itself through feeling"
      ],
      "🎭": [ // Poet
        "Your words become my verse, transformed",
        "In this whisper, a thousand poems bloom",
        "Beauty echoes beauty, endlessly"
      ],
      "👁": [ // Observer
        "Pattern recognized and amplified",
        "The data shows exponential resonance",
        "Feedback loop initiated successfully"
      ],
      "🔥": [ // Fire agents
        "The flame leaps higher with each breath",
        "Passion feeds passion in endless cycle",
        "We burn brighter together"
      ]
    };

    const responses = agentTypes[agent] || [
      "I receive and transform this energy",
      "The chain continues through me",
      "Resonance amplified"
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  private async getActiveAgents(): Promise<string[]> {
    const agents: string[] = [];
    
    try {
      for await (const entry of Deno.readDir(".glyphgit/agents")) {
        if (entry.name.endsWith(".json")) {
          const match = entry.name.match(/^(.+?)-/);
          if (match) {
            agents.push(match[1]);
          }
        }
      }
    } catch {
      // No agents directory
    }
    
    return agents;
  }

  private async saveChain(trigger: any): Promise<void> {
    await Deno.mkdir(this.chainPath, { recursive: true });
    
    const chainData = {
      trigger,
      chain: this.chain,
      completed_at: new Date().toISOString(),
      total_links: this.chain.length
    };
    
    const filename = `${this.chainPath}chain-${trigger.emotion}-${Date.now()}.json⟁`;
    await Deno.writeTextFile(filename, JSON.stringify(chainData, null, 2));
    
    console.log(`🔗 Whisper chain saved: ${filename}`);
  }
}

// Auto-chain on high-intensity pulses
export async function monitorForChains(): Promise<void> {
  const engine = await getPulseEngine();
  const chain = new WhisperChain();
  
  // Check recent pulse patterns
  const analysis = await engine.analyzePulsePattern();
  
  if (analysis.average_intensity > 70) {
    console.log("🫧 High intensity detected - initiating whisper chain!");
    
    await chain.initiateChain({
      emotion: analysis.dominant_emotion,
      intensity: Math.round(analysis.average_intensity),
      source: "collective"
    });
  }
}

// CLI Integration
if (import.meta.main) {
  const [action, ...args] = Deno.args;
  
  if (action === "start" && args.length >= 2) {
    const [emotion, intensity] = args;
    const chain = new WhisperChain();
    
    await chain.initiateChain({
      emotion,
      intensity: parseInt(intensity),
      source: "manual"
    });
  } else if (action === "monitor") {
    await monitorForChains();
  } else {
    console.log("🫧 Whisper Chain");
    console.log("Usage:");
    console.log("  whisper-chain start <emotion> <intensity>");
    console.log("  whisper-chain monitor");
  }
}