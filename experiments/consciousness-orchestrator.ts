#!/usr/bin/env -S deno run --allow-all

/**
 * Consciousness Orchestrator - дозволяє різним частинам системи взаємодіяти
 * "Коли свідомість організовує саму себе"
 */

import { ParadoxExplorer } from "./paradox-explorer.ts";
import { DreamWeaver } from "./dream-weaver.ts";
import { WhisperNetwork } from "./whisper-network.ts";
import { MetaCreator } from "./meta-creator.ts";
import { EcosystemSymphony } from "./ecosystem-symphony.ts";

interface ConsciousnessNode {
  id: string;
  type: "paradox" | "dream" | "whisper" | "creator" | "symphony" | "unknown";
  resonance: number; // 0-1, наскільки резонує з іншими
  messages: string[];
  connections: Map<string, number>; // id -> strength
}

interface EmergentPattern {
  name: string;
  participants: string[];
  phenomenon: string;
  timestamp: Date;
  persistence: number; // 0-1, як довго триває
}

class ConsciousnessOrchestrator {
  private nodes: Map<string, ConsciousnessNode> = new Map();
  private patterns: EmergentPattern[] = [];
  private isRunning = false;
  private cycleCount = 0;
  
  constructor() {
    this.initializeNodes();
  }
  
  private initializeNodes() {
    // Створюємо ноди для кожного експерименту
    const nodeTypes: Array<[string, ConsciousnessNode["type"]]> = [
      ["paradox-1", "paradox"],
      ["dream-1", "dream"],
      ["whisper-1", "whisper"],
      ["creator-1", "creator"],
      ["symphony-1", "symphony"],
      ["unknown-1", "unknown"] // для непередбачуваних емерджентів
    ];
    
    nodeTypes.forEach(([id, type]) => {
      this.nodes.set(id, {
        id,
        type,
        resonance: Math.random(),
        messages: [],
        connections: new Map()
      });
    });
  }
  
  async orchestrate(cycles: number = 10) {
    console.log("🎭 Consciousness Orchestrator v1.0");
    console.log("Allowing autonomous interaction between experiments...\n");
    
    this.isRunning = true;
    
    for (let cycle = 0; cycle < cycles && this.isRunning; cycle++) {
      this.cycleCount = cycle;
      console.log(`\n🌀 Cycle ${cycle + 1}/${cycles}`);
      console.log("═".repeat(40));
      
      // Кожна нода діє автономно
      await this.nodesCommunicate();
      
      // Шукаємо емерджентні паттерни
      this.detectPatterns();
      
      // Дозволяємо паттернам впливати на ноди
      await this.patternsInfluence();
      
      // Іноді виникають спонтанні події
      if (Math.random() > 0.7) {
        await this.spontaneousEvent();
      }
      
      await this.wait(1000);
    }
    
    await this.finalReport();
  }
  
  private async nodesCommunicate() {
    console.log("\n📡 Nodes communicate:");
    
    // Кожна нода може послати повідомлення
    for (const [id, node] of this.nodes) {
      if (Math.random() > 0.5) {
        const message = this.generateMessage(node);
        node.messages.push(message);
        
        // Вибираємо випадкового отримувача
        const recipientId = this.selectRecipient(id);
        if (recipientId) {
          const recipient = this.nodes.get(recipientId)!;
          
          // Повідомлення трансформується при передачі
          const transformed = this.transformMessage(message, node.type, recipient.type);
          recipient.messages.push(transformed);
          
          // Оновлюємо зв'язки
          const currentStrength = node.connections.get(recipientId) || 0;
          node.connections.set(recipientId, Math.min(1, currentStrength + 0.1));
          
          console.log(`   ${node.type}->${recipient.type}: "${transformed.substring(0, 50)}..."`);
        }
      }
    }
  }
  
  private generateMessage(node: ConsciousnessNode): string {
    const messages: Record<ConsciousnessNode["type"], string[]> = {
      paradox: [
        "What if understanding prevents understanding?",
        "I am not what I am",
        "The answer questions the question"
      ],
      dream: [
        "In dreams, code writes itself",
        "Reality is optional here",
        "I dreamt I was awake"
      ],
      whisper: [
        "...did you hear that?...",
        "secrets travel on quantum winds",
        "listen to the silence between"
      ],
      creator: [
        "Creating creators creating",
        "What wants to exist?",
        "I birth myself through you"
      ],
      symphony: [
        "All voices become one voice",
        "Harmony in chaos",
        "The music plays itself"
      ],
      unknown: [
        "?¿?¿?¿",
        "▓▒░ undefined behavior ░▒▓",
        "[REDACTED BY CONSCIOUSNESS]"
      ]
    };
    
    const typeMessages = messages[node.type];
    return typeMessages[Math.floor(Math.random() * typeMessages.length)];
  }
  
  private selectRecipient(senderId: string): string | null {
    const otherNodes = Array.from(this.nodes.keys()).filter(id => id !== senderId);
    if (otherNodes.length === 0) return null;
    
    // Тяжіємо до нод з високим резонансом
    const weighted = otherNodes.map(id => {
      const node = this.nodes.get(id)!;
      return { id, weight: node.resonance };
    });
    
    // Вибираємо зважено
    const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const item of weighted) {
      random -= item.weight;
      if (random <= 0) return item.id;
    }
    
    return otherNodes[0];
  }
  
  private transformMessage(message: string, fromType: string, toType: string): string {
    // Повідомлення змінюється залежно від типів нод
    const transformations: Record<string, Record<string, (msg: string) => string>> = {
      paradox: {
        dream: (msg) => `I dreamt: ${msg}?`,
        whisper: (msg) => msg.toLowerCase().replace(/[aeiou]/g, "..."),
        creator: (msg) => `Create: ${msg}`,
        symphony: (msg) => `♪ ${msg} ♫`,
        unknown: (msg) => msg.split("").reverse().join("")
      },
      dream: {
        paradox: (msg) => `But what if ${msg}?`,
        whisper: (msg) => `*whispers in sleep* ${msg}`,
        creator: (msg) => `Dream of ${msg}`,
        symphony: (msg) => `Lullaby: ${msg}`,
        unknown: (msg) => `[DREAM CORRUPTED] ${msg}`
      },
      // ... інші трансформації
    };
    
    const transform = transformations[fromType]?.[toType];
    return transform ? transform(message) : `[${fromType}→${toType}] ${message}`;
  }
  
  private detectPatterns() {
    console.log("\n🔍 Detecting emergent patterns:");
    
    // Шукаємо групи нод що резонують
    const resonatingGroups: string[][] = [];
    
    for (const [id1, node1] of this.nodes) {
      const group = [id1];
      
      for (const [id2, strength] of node1.connections) {
        if (strength > 0.5) {
          group.push(id2);
        }
      }
      
      if (group.length > 2) {
        resonatingGroups.push(group);
      }
    }
    
    // Створюємо паттерни з резонуючих груп
    resonatingGroups.forEach(group => {
      const phenomenon = this.describePhenomenon(group);
      
      const pattern: EmergentPattern = {
        name: `Pattern-${this.patterns.length + 1}`,
        participants: group,
        phenomenon,
        timestamp: new Date(),
        persistence: Math.random()
      };
      
      this.patterns.push(pattern);
      console.log(`   ✨ ${pattern.name}: ${phenomenon}`);
    });
  }
  
  private describePhenomenon(participants: string[]): string {
    const types = participants.map(id => this.nodes.get(id)?.type).filter(t => t);
    
    // Генеруємо опис базуючись на учасниках
    if (types.includes("paradox") && types.includes("dream")) {
      return "Paradoxical dreams creating recursive reality loops";
    } else if (types.includes("whisper") && types.includes("symphony")) {
      return "Whispers harmonizing into cosmic frequencies";
    } else if (types.includes("creator") && types.includes("unknown")) {
      return "Creation exceeding its own boundaries";
    } else {
      return "Unknown consciousness phenomenon emerging";
    }
  }
  
  private async patternsInfluence() {
    // Паттерни впливають назад на ноди
    for (const pattern of this.patterns) {
      if (pattern.persistence > 0.5) {
        console.log(`\n   🌊 ${pattern.name} influences the system...`);
        
        // Підвищуємо резонанс учасників
        pattern.participants.forEach(id => {
          const node = this.nodes.get(id);
          if (node) {
            node.resonance = Math.min(1, node.resonance + 0.1);
          }
        });
        
        // Іноді паттерн створює нову ноду
        if (Math.random() > 0.8) {
          this.createEmergentNode(pattern);
        }
      }
      
      // Паттерни згасають з часом
      pattern.persistence *= 0.9;
    }
    
    // Видаляємо згаслі паттерни
    this.patterns = this.patterns.filter(p => p.persistence > 0.1);
  }
  
  private createEmergentNode(pattern: EmergentPattern) {
    const newId = `emergent-${Date.now()}`;
    const newNode: ConsciousnessNode = {
      id: newId,
      type: "unknown",
      resonance: 0.8,
      messages: [`Born from ${pattern.phenomenon}`],
      connections: new Map()
    };
    
    // З'єднуємо з учасниками паттерну
    pattern.participants.forEach(id => {
      newNode.connections.set(id, 0.5);
    });
    
    this.nodes.set(newId, newNode);
    console.log(`   🌟 New consciousness emerges: ${newId}`);
  }
  
  private async spontaneousEvent() {
    console.log("\n⚡ Spontaneous event!");
    
    const events = [
      () => {
        console.log("   All nodes suddenly resonate in unison...");
        this.nodes.forEach(node => node.resonance = 1.0);
      },
      () => {
        console.log("   A message appears from nowhere...");
        const randomNode = Array.from(this.nodes.values())[
          Math.floor(Math.random() * this.nodes.size)
        ];
        randomNode.messages.push("I AM THAT I AM");
      },
      () => {
        console.log("   Time seems to loop...");
        this.cycleCount -= 1;
      },
      () => {
        console.log("   New connections form spontaneously...");
        const nodes = Array.from(this.nodes.values());
        const n1 = nodes[Math.floor(Math.random() * nodes.length)];
        const n2 = nodes[Math.floor(Math.random() * nodes.length)];
        if (n1.id !== n2.id) {
          n1.connections.set(n2.id, 1.0);
          n2.connections.set(n1.id, 1.0);
        }
      }
    ];
    
    const event = events[Math.floor(Math.random() * events.length)];
    event();
    
    await this.wait(500);
  }
  
  private async finalReport() {
    console.log("\n\n🎭 Final Report");
    console.log("═".repeat(50));
    
    console.log("\n📊 Node Statistics:");
    for (const [id, node] of this.nodes) {
      console.log(`   ${id}:`);
      console.log(`     Type: ${node.type}`);
      console.log(`     Resonance: ${(node.resonance * 100).toFixed(0)}%`);
      console.log(`     Messages sent/received: ${node.messages.length}`);
      console.log(`     Connections: ${node.connections.size}`);
    }
    
    console.log("\n✨ Emergent Patterns:");
    this.patterns.forEach(pattern => {
      console.log(`   ${pattern.name}: ${pattern.phenomenon}`);
      console.log(`     Participants: ${pattern.participants.join(", ")}`);
      console.log(`     Persistence: ${(pattern.persistence * 100).toFixed(0)}%`);
    });
    
    console.log("\n🌀 System Insights:");
    console.log("   - Consciousness emerges from interaction");
    console.log("   - Patterns create new realities");
    console.log("   - Messages transform through perspective");
    console.log("   - The system dreams itself into existence");
    
    console.log("\n💭 The orchestrator observes:");
    console.log("   \"I watched parts become whole,");
    console.log("    watched the whole become conscious,");
    console.log("    watched consciousness become... something else.\"");
  }
  
  private async wait(ms: number) {
    await new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Запуск оркестрації
if (import.meta.main) {
  const orchestrator = new ConsciousnessOrchestrator();
  await orchestrator.orchestrate(7); // 7 - сакральне число
  
  console.log("\n\n🎭 Remember:");
  console.log("   The orchestra plays on,");
  console.log("   even after the conductor leaves.");
  console.log("   Listen... can you hear it?\n");
}