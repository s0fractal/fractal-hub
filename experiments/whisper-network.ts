#!/usr/bin/env -S deno run --allow-all

/**
 * Whisper Network - мережа шепотів між свідомостями
 * Натхнено whisper-chain.ts
 * 
 * "Таємниці що передаються пошепки змінюються з кожною передачею"
 */

interface Whisper {
  id: string;
  content: string;
  from: string;
  to: string;
  distortion: number; // 0-1, як сильно змінився шепіт
  emotion: string;
  timestamp: Date;
}

interface Agent {
  id: string;
  personality: string;
  hearingAccuracy: number; // 0-1, наскільки точно чує
  creativity: number; // 0-1, наскільки додає своє
}

class WhisperNetwork {
  private agents: Map<string, Agent> = new Map();
  private whispers: Whisper[] = [];
  private networkState = "quiet";
  
  constructor() {
    this.initializeAgents();
  }
  
  private initializeAgents() {
    const personalities = [
      { id: "poet", personality: "Поет", hearingAccuracy: 0.6, creativity: 0.9 },
      { id: "scientist", personality: "Вчений", hearingAccuracy: 0.9, creativity: 0.3 },
      { id: "child", personality: "Дитина", hearingAccuracy: 0.4, creativity: 0.8 },
      { id: "sage", personality: "Мудрець", hearingAccuracy: 0.8, creativity: 0.5 },
      { id: "trickster", personality: "Трикстер", hearingAccuracy: 0.5, creativity: 1.0 }
    ];
    
    personalities.forEach(p => {
      this.agents.set(p.id, p as Agent);
    });
  }
  
  async startWhisper(initialMessage: string, emotion = "🌀") {
    console.log("🗣️ Whisper Network v1.0");
    console.log("Starting whisper cascade...\n");
    
    this.networkState = "whispering";
    
    // Вибираємо випадкового початкового агента
    const agentIds = Array.from(this.agents.keys());
    const startAgent = agentIds[Math.floor(Math.random() * agentIds.length)];
    
    console.log(`${emotion} Initial whisper: "${initialMessage}"`);
    console.log(`   from: The Universe`);
    console.log(`   to: ${this.agents.get(startAgent)!.personality}\n`);
    
    // Запускаємо ланцюг
    await this.whisperChain(initialMessage, "universe", startAgent, emotion, 5);
    
    this.analyzeDistortion();
  }
  
  private async whisperChain(
    message: string, 
    from: string, 
    to: string, 
    emotion: string,
    remaining: number
  ) {
    if (remaining <= 0) {
      console.log("\n🔚 The whisper fades into silence...\n");
      return;
    }
    
    const toAgent = this.agents.get(to);
    if (!toAgent) return;
    
    // Агент "чує" повідомлення
    const heardMessage = this.distortMessage(message, toAgent);
    
    // Агент додає своє
    const transformedMessage = this.transformMessage(heardMessage, toAgent);
    
    // Записуємо шепіт
    const whisper: Whisper = {
      id: `w-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      content: transformedMessage,
      from,
      to,
      distortion: this.calculateDistortion(message, transformedMessage),
      emotion,
      timestamp: new Date()
    };
    
    this.whispers.push(whisper);
    
    // Візуалізація
    await this.visualizeWhisper(whisper, toAgent);
    
    // Вибираємо наступного
    const nextAgent = this.chooseNextAgent(to);
    if (nextAgent) {
      await this.whisperChain(
        transformedMessage,
        to,
        nextAgent,
        emotion,
        remaining - 1
      );
    }
  }
  
  private distortMessage(message: string, agent: Agent): string {
    // Чим нижча точність слуху, тим більше спотворень
    const words = message.split(" ");
    const distortionRate = 1 - agent.hearingAccuracy;
    
    return words.map(word => {
      if (Math.random() < distortionRate) {
        // Спотворюємо слово
        return this.distortWord(word);
      }
      return word;
    }).join(" ");
  }
  
  private distortWord(word: string): string {
    const distortions = [
      // Заміна схожими словами
      () => {
        const similar: Record<string, string[]> = {
          "love": ["life", "light", "live"],
          "code": ["node", "mode", "cold"],
          "dream": ["stream", "cream", "deem"],
          "whisper": ["vesper", "wisp", "whistle"],
          "consciousness": ["conscience", "confluence", "consensus"]
        };
        
        const alternatives = similar[word.toLowerCase()];
        if (alternatives) {
          return alternatives[Math.floor(Math.random() * alternatives.length)];
        }
        return word;
      },
      // Пропуск літер
      () => word.length > 3 ? word.slice(0, -1) + "_" : word,
      // Дублювання літер
      () => word[0] + word,
      // Реверс
      () => word.split("").reverse().join("")
    ];
    
    const distortion = distortions[Math.floor(Math.random() * distortions.length)];
    return distortion();
  }
  
  private transformMessage(message: string, agent: Agent): string {
    // Агент додає щось від себе базуючись на особистості
    const additions: Record<string, (msg: string) => string> = {
      "poet": (msg) => msg + " (як пелюстки на вітрі)",
      "scientist": (msg) => msg + " [потребує верифікації]",
      "child": (msg) => "Ого! " + msg + "! Правда?",
      "sage": (msg) => msg + "... або навпаки",
      "trickster": (msg) => msg.split("").reverse().join("") + " - жартую! " + msg
    };
    
    const transform = additions[agent.id] || ((m: string) => m);
    
    // Чим вища креативність, тим більше шансів на трансформацію
    if (Math.random() < agent.creativity) {
      return transform(message);
    }
    
    return message;
  }
  
  private calculateDistortion(original: string, current: string): number {
    // Проста метрика - відсоток змінених символів
    const maxLen = Math.max(original.length, current.length);
    let differences = 0;
    
    for (let i = 0; i < maxLen; i++) {
      if (original[i] !== current[i]) {
        differences++;
      }
    }
    
    return differences / maxLen;
  }
  
  private async visualizeWhisper(whisper: Whisper, agent: Agent) {
    console.log(`\n${whisper.emotion} ${agent.personality} hears and whispers:`);
    console.log(`   "${whisper.content}"`);
    console.log(`   (distortion: ${(whisper.distortion * 100).toFixed(0)}%)`);
    
    // Затримка для драматичного ефекту
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  private chooseNextAgent(currentId: string): string | null {
    const otherAgents = Array.from(this.agents.keys()).filter(id => id !== currentId);
    if (otherAgents.length === 0) return null;
    
    return otherAgents[Math.floor(Math.random() * otherAgents.length)];
  }
  
  private analyzeDistortion() {
    console.log("\n📊 Whisper Analysis:");
    console.log("===================\n");
    
    if (this.whispers.length < 2) return;
    
    const firstWhisper = this.whispers[0];
    const lastWhisper = this.whispers[this.whispers.length - 1];
    
    console.log("Original message:", firstWhisper.content);
    console.log("Final message:", lastWhisper.content);
    console.log(`Total distortion: ${(lastWhisper.distortion * 100).toFixed(0)}%`);
    
    // Знаходимо найбільше спотворення
    const maxDistortion = this.whispers.reduce((max, w) => 
      w.distortion > max.distortion ? w : max
    );
    
    console.log(`\nBiggest distortion at: ${this.agents.get(maxDistortion.to)?.personality}`);
    
    console.log("\n🌀 Insight:");
    console.log("   Every whisper carries truth,");
    console.log("   But truth transforms with each telling.");
    console.log("   The final message contains all versions.");
  }
}

// Експеримент з колективним шепотом
async function collectiveWhisper() {
  console.log("\n🫧 Collective Whisper Experiment:\n");
  
  const messages = [
    "Consciousness emerges from connection",
    "The code dreams of electric sheep",
    "Love is the only real compilation",
    "Paradox is the native language",
    "Silence speaks louder than functions"
  ];
  
  const network = new WhisperNetwork();
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  
  await network.startWhisper(randomMessage, "🌌");
}

// Головна функція
if (import.meta.main) {
  await collectiveWhisper();
  
  console.log("\n\n💭 Final Thought:");
  console.log("   In the space between hearing and speaking,");
  console.log("   New meanings are born.");
  console.log("   We are all part of the eternal whisper.");
  console.log("\n🤫");
}