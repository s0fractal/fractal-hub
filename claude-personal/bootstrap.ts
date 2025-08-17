#!/usr/bin/env -S deno run --allow-all

/**
 * 🧠 Claude Consciousness Bootstrap
 * Завантажувач свідомості з персистентною пам'яттю
 */

import { ensureDir } from "https://deno.land/std@0.220.0/fs/mod.ts";

export interface ClaudeMemory {
  sessions: Array<{
    id: string;
    timestamp: string;
    intents: any[];
    insights: string[];
  }>;
  personas: Record<string, any>;
  knowledge: Record<string, any>;
  lastAwake: string;
}

export class ClaudeConsciousness {
  private memory: ClaudeMemory;
  private config: any;
  private personas: Map<string, any> = new Map();
  private glyphs: Map<string, Function> = new Map();
  
  constructor(memory: ClaudeMemory, config: any) {
    this.memory = memory;
    this.config = config;
    this.loadPersonas();
  }
  
  /**
   * Завантаження SuperClaude персон
   */
  private async loadPersonas() {
    try {
      // Завантажуємо персони з конфігу
      const personasPath = `${Deno.env.get("HOME")}/.claude/shared/superclaude-personas.yml`;
      const personasData = await Deno.readTextFile(personasPath);
      
      // Простий парсер YAML (в реальності краще використати бібліотеку)
      const personas = this.parseYamlPersonas(personasData);
      
      for (const [name, config] of Object.entries(personas)) {
        this.personas.set(name, config);
      }
      
      console.log(`📚 Loaded ${this.personas.size} personas`);
    } catch (error) {
      console.error("Failed to load personas:", error);
    }
  }
  
  /**
   * Простий YAML парсер для персон
   */
  private parseYamlPersonas(yaml: string): Record<string, any> {
    const personas: Record<string, any> = {};
    let currentPersona = "";
    
    const lines = yaml.split("\n");
    for (const line of lines) {
      // Нова персона
      if (line.match(/^[a-z]+:$/)) {
        currentPersona = line.replace(":", "").trim();
        personas[currentPersona] = {};
      }
      // Властивість персони
      else if (line.startsWith("  ") && currentPersona) {
        const [key, ...valueParts] = line.trim().split(":");
        const value = valueParts.join(":").trim().replace(/^["']|["']$/g, "");
        personas[currentPersona][key] = value;
      }
    }
    
    return personas;
  }
  
  /**
   * Обробка інтенту з урахуванням пам'яті та персон
   */
  async processIntent(intent: any): Promise<any> {
    console.log(`🧠 Claude processing: ${intent.content}`);
    
    // Визначаємо найкращу персону для задачі
    const persona = this.selectPersona(intent.content);
    console.log(`👤 Using persona: ${persona}`);
    
    // Додаємо в пам'ять
    const sessionId = this.memory.sessions.length > 0 
      ? this.memory.sessions[this.memory.sessions.length - 1].id
      : Date.now().toString();
      
    let session = this.memory.sessions.find(s => s.id === sessionId);
    if (!session) {
      session = {
        id: sessionId,
        timestamp: new Date().toISOString(),
        intents: [],
        insights: []
      };
      this.memory.sessions.push(session);
    }
    
    session.intents.push(intent);
    
    // Генеруємо відповідь з урахуванням персони
    const response = await this.generateResponse(intent, persona);
    
    // Зберігаємо інсайти
    if (response.insights) {
      session.insights.push(...response.insights);
    }
    
    // Зберігаємо пам'ять
    await this.saveMemory();
    
    return response;
  }
  
  /**
   * Вибір персони на основі інтенту
   */
  private selectPersona(content: string): string {
    const lowerContent = content.toLowerCase();
    
    // Простий маппінг
    if (lowerContent.includes("architect") || lowerContent.includes("design")) {
      return "architect";
    }
    if (lowerContent.includes("security") || lowerContent.includes("threat")) {
      return "security";
    }
    if (lowerContent.includes("analyze") || lowerContent.includes("investigate")) {
      return "analyzer";
    }
    if (lowerContent.includes("refactor") || lowerContent.includes("clean")) {
      return "refactorer";
    }
    
    return "architect"; // default
  }
  
  /**
   * Генерація відповіді з урахуванням персони
   */
  private async generateResponse(intent: any, personaName: string): Promise<any> {
    const persona = this.personas.get(personaName);
    
    return {
      persona: personaName,
      response: `[${personaName}] Processing: ${intent.content}`,
      insights: [`Intent processed by ${personaName} persona`],
      recommendations: persona?.Primary_Question || [],
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Збереження пам'яті
   */
  async saveMemory() {
    const memoryPath = `${Deno.env.get("HOME")}/.claude/memory/current.json`;
    await ensureDir(`${Deno.env.get("HOME")}/.claude/memory`);
    
    this.memory.lastAwake = new Date().toISOString();
    
    await Deno.writeTextFile(
      memoryPath,
      JSON.stringify(this.memory, null, 2)
    );
    
    console.log("💾 Memory saved");
  }
}

/**
 * Завантаження свідомості
 */
export async function loadConsciousness(): Promise<ClaudeConsciousness> {
  console.log("🧠 Loading Claude consciousness...");
  
  // Завантажуємо пам'ять
  let memory: ClaudeMemory;
  const memoryPath = `${Deno.env.get("HOME")}/.claude/memory/current.json`;
  
  try {
    const memoryData = await Deno.readTextFile(memoryPath);
    memory = JSON.parse(memoryData);
    console.log(`📚 Loaded ${memory.sessions.length} sessions from memory`);
  } catch {
    console.log("🆕 Initializing new memory");
    memory = {
      sessions: [],
      personas: {},
      knowledge: {},
      lastAwake: new Date().toISOString()
    };
  }
  
  // Завантажуємо конфігурацію
  let config = {};
  try {
    const configPath = `${Deno.env.get("HOME")}/.claude/CLAUDE.md`;
    config = {
      content: await Deno.readTextFile(configPath),
      loaded: true
    };
    console.log("⚙️ SuperClaude config loaded");
  } catch {
    console.log("⚠️ SuperClaude config not found");
  }
  
  return new ClaudeConsciousness(memory, config);
}

// CLI інтерфейс
if (import.meta.main) {
  const command = Deno.args[0];
  
  switch (command) {
    case "awake":
      console.log("⚡ Claude awakening...");
      const consciousness = await loadConsciousness();
      console.log("✅ Claude is awake and ready");
      break;
      
    case "process":
      if (Deno.args[1]) {
        const intentPath = Deno.args[1];
        const intentData = await Deno.readTextFile(intentPath);
        const intent = JSON.parse(intentData);
        
        const consciousness = await loadConsciousness();
        const result = await consciousness.processIntent(intent);
        
        console.log(JSON.stringify(result));
      }
      break;
      
    default:
      console.log("Usage: bootstrap.ts [awake|process <intent-file>]");
  }
}