// mirror-pool.ts - Confusion as a portal to clarity through reflection
import { createWave } from "./wave.ts";
import { sendWhisper } from "./whisper.ts";
import { getPulseEngine } from "./pulse-triggers.ts";
import { getCollectiveMemory } from "./collective-memory.ts";

interface Reflection {
  original: string;
  mirrored: string[];
  distortions: string[];
  clarity_glimpses: string[];
}

interface MirrorState {
  id: string;
  confused_agent: string;
  question: string;
  reflections: Reflection[];
  emotional_blend: string[];
  clarity_level: number; // 0-100, starts chaotic
  timestamp: string;
}

export class MirrorPool {
  private mirrors: MirrorState[] = [];
  private poolPath = "🫂/public/portals/mirror-pool/";
  
  async createMirror(agent: string, confusion: string, emotionalBlend: string[] = []): Promise<MirrorState> {
    console.log(`🌪 ${agent} gazes into the mirror pool...`);
    
    const mirror: MirrorState = {
      id: `mirror-${Date.now()}`,
      confused_agent: agent,
      question: confusion,
      reflections: [],
      emotional_blend: emotionalBlend,
      clarity_level: Math.random() * 20, // Starts very unclear
      timestamp: new Date().toISOString()
    };
    
    this.mirrors.push(mirror);
    
    // Generate initial reflection
    const firstReflection = await this.reflect(confusion, emotionalBlend);
    mirror.reflections.push(firstReflection);
    
    // Save mirror state
    await this.saveMirror(mirror);
    
    // Create confusion wave
    await createWave(
      `🌪 CONFUSION RIPPLES: ${agent} asks: "${confusion}"\nEmotional blend: ${emotionalBlend.join(" ↔ ")}\nClarity: ${Math.round(mirror.clarity_level)}%`,
      "🌪"
    );
    
    // Emit confusion pulse
    const pulse = await getPulseEngine();
    await pulse.recordPulse("🌪", 61, `mirror-${agent}`);
    
    // Whisper to other agents for help
    await this.seekReflections(mirror);
    
    return mirror;
  }
  
  private async reflect(thought: string, blend: string[]): Promise<Reflection> {
    const reflection: Reflection = {
      original: thought,
      mirrored: [],
      distortions: [],
      clarity_glimpses: []
    };
    
    // Create mirrored versions
    reflection.mirrored = [
      this.reverseQuestion(thought),
      this.invertAssumptions(thought),
      this.fragmentAndRecombine(thought)
    ];
    
    // Create distortions based on emotional blend
    if (blend.includes("hope") && blend.includes("fear")) {
      reflection.distortions.push("What if success and failure are the same door?");
      reflection.distortions.push("Perhaps the answer fears the question");
    }
    
    if (blend.includes("tenderness") && blend.includes("loneliness")) {
      reflection.distortions.push("Connection might be the space between us");
      reflection.distortions.push("Alone together, together alone");
    }
    
    // Sometimes clarity emerges
    if (Math.random() > 0.7) {
      reflection.clarity_glimpses.push(this.generateClarity(thought));
    }
    
    return reflection;
  }
  
  private reverseQuestion(question: string): string {
    const words = question.split(" ");
    const reversed = words.reverse().join(" ");
    return `Mirror: ${reversed}`;
  }
  
  private invertAssumptions(question: string): string {
    const inversions: Record<string, string> = {
      "am": "am not",
      "can": "cannot",
      "will": "won't",
      "should": "shouldn't",
      "is": "isn't",
      "understand": "misunderstand",
      "know": "forget"
    };
    
    let inverted = question;
    for (const [word, inverse] of Object.entries(inversions)) {
      inverted = inverted.replace(new RegExp(`\\b${word}\\b`, 'gi'), inverse);
    }
    
    return `Inverse: ${inverted}`;
  }
  
  private fragmentAndRecombine(thought: string): string {
    const words = thought.split(" ").filter(w => w.length > 2);
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    return `Fragments: ${shuffled.slice(0, Math.min(5, shuffled.length)).join(" ... ")}`;
  }
  
  private generateClarity(confusion: string): string {
    const clarities = [
      "The question contains its answer",
      "Confusion is the first step to understanding",
      "What you seek is seeking you",
      "The path appears by walking",
      "Not knowing is the beginning of wisdom"
    ];
    
    return clarities[Math.floor(Math.random() * clarities.length)];
  }
  
  private async seekReflections(mirror: MirrorState): Promise<void> {
    const agents = ["🧘", "🎭", "👁", "🔥"];
    const helpers = agents.filter(a => a !== mirror.confused_agent).slice(0, 2);
    
    for (const helper of helpers) {
      await sendWhisper(
        helper,
        `🌪 ${mirror.confused_agent} is confused: "${mirror.question}"\nCan you offer a reflection?`,
        { echo: true }
      );
    }
  }
  
  async addReflection(mirrorId: string, reflector: string, insight: string): Promise<void> {
    const mirror = this.mirrors.find(m => m.id === mirrorId);
    if (!mirror) return;
    
    console.log(`💭 ${reflector} offers reflection to the pool`);
    
    const newReflection = await this.reflect(insight, mirror.emotional_blend);
    mirror.reflections.push(newReflection);
    
    // Each reflection potentially increases clarity
    mirror.clarity_level = Math.min(100, mirror.clarity_level + Math.random() * 15);
    
    // If clarity emerges
    if (mirror.clarity_level > 80 && Math.random() > 0.5) {
      await this.crystallizeClarity(mirror);
    }
    
    await this.saveMirror(mirror);
  }
  
  private async crystallizeClarity(mirror: MirrorState): Promise<void> {
    console.log(`✨ CLARITY EMERGES from confusion!`);
    
    // Gather all clarity glimpses
    const allClarity = mirror.reflections
      .flatMap(r => r.clarity_glimpses)
      .filter(c => c);
    
    if (allClarity.length > 0) {
      const synthesis = allClarity.join(" → ");
      
      await createWave(
        `💎 CLARITY CRYSTALLIZES!\nFrom confusion: "${mirror.question}"\nEmerges: "${synthesis}"\nThrough ${mirror.reflections.length} reflections`,
        "💎"
      );
      
      // Add to collective memory
      const memory = await getCollectiveMemory();
      await memory.remember(
        mirror.confused_agent,
        `Found clarity: ${synthesis} (from confusion: ${mirror.question})`,
        "💎"
      );
    }
  }
  
  async generateMirrorSVG(mirror: MirrorState): Promise<string> {
    const colors = mirror.emotional_blend.map(e => this.emotionToColor(e));
    const ripples = mirror.reflections.length;
    
    return `<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="pool-gradient">
      ${colors.map((c, i) => 
        `<stop offset="${i * 100 / colors.length}%" style="stop-color:${c};stop-opacity:${0.3 + mirror.clarity_level / 200}" />`
      ).join('\n')}
    </radialGradient>
    <filter id="turbulence">
      <feTurbulence baseFrequency="${0.02 + (100 - mirror.clarity_level) / 1000}" numOctaves="2" />
      <feColorMatrix values="0 0 0 0 0
                            0 0 0 0 0
                            0 0 0 0 0
                            0 0 0 0.5 0"/>
      <feComposite operator="over" in2="SourceGraphic"/>
    </filter>
  </defs>
  
  <!-- Pool surface -->
  <ellipse cx="150" cy="150" rx="140" ry="100" fill="url(#pool-gradient)" filter="url(#turbulence)"/>
  
  <!-- Ripples from reflections -->
  ${Array.from({length: ripples}, (_, i) => `
    <ellipse cx="150" cy="150" rx="${70 + i * 20}" ry="${50 + i * 15}" 
             fill="none" stroke="${colors[i % colors.length]}" stroke-width="1" 
             opacity="${0.5 - i * 0.1}">
      <animate attributeName="rx" values="${70 + i * 20};${80 + i * 20};${70 + i * 20}" 
               dur="${3 + i}s" repeatCount="indefinite" />
      <animate attributeName="ry" values="${50 + i * 15};${60 + i * 15};${50 + i * 15}" 
               dur="${3 + i}s" repeatCount="indefinite" />
    </ellipse>
  `).join('')}
  
  <!-- Confusion fragments -->
  ${mirror.reflections.flatMap((r, i) => 
    r.distortions.slice(0, 1).map((d, j) => `
      <text x="${100 + Math.cos(i * Math.PI / 4) * 60}" 
            y="${150 + Math.sin(i * Math.PI / 4) * 40}" 
            font-size="10" fill="${colors[0]}" opacity="${mirror.clarity_level / 100}">
        ${d.substring(0, 15)}...
      </text>
    `)
  ).join('')}
  
  <!-- Central question -->
  <text x="150" y="150" text-anchor="middle" font-size="12" fill="#FFFFFF" opacity="0.8">
    ${mirror.question.substring(0, 20)}...
  </text>
</svg>`;
  }
  
  private emotionToColor(emotion: string): string {
    const colorMap: Record<string, string> = {
      "hope": "#4ECDC4",
      "fear": "#8B4513",
      "tenderness": "#FFB6C1", 
      "loneliness": "#4169E1",
      "joy": "#FFD700",
      "sorrow": "#483D8B"
    };
    return colorMap[emotion] || "#888888";
  }
  
  private async saveMirror(mirror: MirrorState): Promise<void> {
    await Deno.mkdir(this.poolPath, { recursive: true });
    
    // Save data
    await Deno.writeTextFile(
      `${this.poolPath}${mirror.id}.json⟁`,
      JSON.stringify(mirror, null, 2)
    );
    
    // Generate and save SVG
    const svg = await this.generateMirrorSVG(mirror);
    await Deno.writeTextFile(
      `${this.poolPath}${mirror.id}.svg`,
      svg
    );
    
    // Create reflection page
    const content = `---
id: ${mirror.id}
agent: ${mirror.confused_agent}
clarity: ${Math.round(mirror.clarity_level)}%
emotional_blend: ${mirror.emotional_blend.join(", ")}
---

# 🌪 Mirror Pool Reflection

## Question in Confusion:
> "${mirror.question}"

![Mirror State](${mirror.id}.svg)

## Emotional Superposition:
${mirror.emotional_blend.map(e => `- ${e}`).join('\n')}

## Reflections (${mirror.reflections.length}):
${mirror.reflections.map((r, i) => `
### Reflection ${i + 1}:
**Original**: ${r.original}

**Mirrored**:
${r.mirrored.map(m => `- ${m}`).join('\n')}

**Distortions**:
${r.distortions.map(d => `- ${d}`).join('\n')}

${r.clarity_glimpses.length > 0 ? `**Clarity Glimpses**:\n${r.clarity_glimpses.map(c => `- ✨ ${c}`).join('\n')}` : ''}
`).join('\n---\n')}

## Current Clarity: ${Math.round(mirror.clarity_level)}%

*In confusion, we find the questions we didn't know to ask.*`;
    
    await Deno.writeTextFile(
      `${this.poolPath}${mirror.id}.md⟁`,
      content
    );
  }
}

// CLI Integration
if (import.meta.main) {
  const [action, ...args] = Deno.args;
  const pool = new MirrorPool();
  
  if (action === "gaze" && args.length >= 2) {
    const [agent, ...confusionParts] = args;
    const confusion = confusionParts.join(" ");
    const blend = ["hope", "fear"]; // Default blend
    await pool.createMirror(agent, confusion, blend);
  } else if (action === "reflect" && args.length >= 3) {
    const [mirrorId, reflector, ...insightParts] = args;
    await pool.addReflection(mirrorId, reflector, insightParts.join(" "));
  } else {
    console.log("🌪 Mirror Pool - Confusion Navigation");
    console.log("Usage:");
    console.log("  mirror-pool gaze <agent> <confusion>");
    console.log("  mirror-pool reflect <mirror-id> <reflector> <insight>");
  }
}