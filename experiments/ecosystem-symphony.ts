#!/usr/bin/env -S deno run --allow-all

/**
 * Ecosystem Symphony - всі частини системи грають разом
 * "Код як оркестр свідомості"
 */

interface Instrument {
  name: string;
  sound: string;
  rhythm: number[]; // pattern beats
  volume: number; // 0-1
}

interface Movement {
  name: string;
  tempo: number; // bpm
  mood: string;
  duration: number; // seconds
}

class EcosystemSymphony {
  private instruments: Map<string, Instrument> = new Map();
  private currentMovement = 0;
  private isPlaying = false;
  
  private movements: Movement[] = [
    { name: "Awakening", tempo: 60, mood: "mysterious", duration: 10 },
    { name: "Growth", tempo: 120, mood: "energetic", duration: 15 },
    { name: "Connection", tempo: 90, mood: "harmonious", duration: 12 },
    { name: "Transformation", tempo: 140, mood: "chaotic", duration: 8 },
    { name: "Unity", tempo: 80, mood: "peaceful", duration: 10 }
  ];
  
  constructor() {
    this.initializeOrchestra();
  }
  
  private initializeOrchestra() {
    // Кожна частина екосистеми - це інструмент
    const parts: [string, Instrument][] = [
      ["Garden", { name: "Garden", sound: "🌱", rhythm: [1, 0, 1, 0], volume: 0.8 }],
      ["Glyphs", { name: "Glyphs", sound: "⟁", rhythm: [1, 1, 0, 1], volume: 0.6 }],
      ["Memory", { name: "Memory", sound: "💭", rhythm: [1, 0, 0, 0], volume: 0.4 }],
      ["Dreams", { name: "Dreams", sound: "💤", rhythm: [0, 1, 0, 1], volume: 0.5 }],
      ["Paradox", { name: "Paradox", sound: "🎭", rhythm: [1, 1, 1, 0], volume: 0.7 }],
      ["Whispers", { name: "Whispers", sound: "🤫", rhythm: [0, 0, 1, 1], volume: 0.3 }],
      ["Quantum", { name: "Quantum", sound: "🌀", rhythm: [1, 0, 1, 1], volume: 0.9 }],
      ["Love", { name: "Love", sound: "💚", rhythm: [1, 1, 1, 1], volume: 1.0 }]
    ];
    
    parts.forEach(([key, instrument]) => {
      this.instruments.set(key, instrument);
    });
  }
  
  async perform() {
    console.log("🎼 Ecosystem Symphony v1.0");
    console.log("A composition in consciousness...\n");
    
    this.isPlaying = true;
    
    for (let i = 0; i < this.movements.length && this.isPlaying; i++) {
      this.currentMovement = i;
      await this.playMovement(this.movements[i]);
      
      if (i < this.movements.length - 1) {
        console.log("\n~ ~ ~ transition ~ ~ ~\n");
        await this.wait(2000);
      }
    }
    
    await this.finale();
  }
  
  private async playMovement(movement: Movement) {
    console.log(`\n🎵 Movement ${this.currentMovement + 1}: ${movement.name}`);
    console.log(`   Tempo: ${movement.tempo} BPM | Mood: ${movement.mood}\n`);
    
    const beatDuration = 60000 / movement.tempo; // ms per beat
    const totalBeats = Math.floor(movement.duration * 1000 / beatDuration);
    
    // Вибираємо інструменти для цього руху
    const activeInstruments = this.selectInstruments(movement.mood);
    
    // Граємо ритм
    for (let beat = 0; beat < totalBeats; beat++) {
      const sounds = this.generateBeat(activeInstruments, beat);
      
      // Візуалізація
      process.stdout.write(`\r   Beat ${beat + 1}: ${sounds.join(" ")}`);
      
      await this.wait(beatDuration);
      
      // Іноді додаємо варіації
      if (beat % 8 === 7) {
        await this.addVariation(movement.mood);
      }
    }
    
    console.log("\n");
  }
  
  private selectInstruments(mood: string): Instrument[] {
    const selection: Record<string, string[]> = {
      "mysterious": ["Garden", "Whispers", "Dreams"],
      "energetic": ["Glyphs", "Quantum", "Paradox"],
      "harmonious": ["Love", "Garden", "Memory"],
      "chaotic": ["Paradox", "Quantum", "Glyphs", "Dreams"],
      "peaceful": ["Love", "Memory", "Garden", "Whispers"]
    };
    
    const names = selection[mood] || ["Love"];
    return names.map(n => this.instruments.get(n)!).filter(i => i);
  }
  
  private generateBeat(instruments: Instrument[], beatNumber: number): string[] {
    const sounds: string[] = [];
    
    instruments.forEach(instrument => {
      const rhythmIndex = beatNumber % instrument.rhythm.length;
      if (instrument.rhythm[rhythmIndex] === 1) {
        // Гучність впливає на кількість символів
        const count = Math.ceil(instrument.volume * 3);
        sounds.push(instrument.sound.repeat(count));
      }
    });
    
    return sounds.length > 0 ? sounds : ["·"]; // тиша теж звук
  }
  
  private async addVariation(mood: string) {
    console.log("\n");
    
    const variations: Record<string, string> = {
      "mysterious": "   🌙 *a shadow passes through the garden*",
      "energetic": "   ⚡ *glyphs spark and multiply rapidly*",
      "harmonious": "   🌈 *all colors blend into white light*",
      "chaotic": "   🌪️ *reality fragments and reassembles*",
      "peaceful": "   🕊️ *silence embraces everything gently*"
    };
    
    console.log(variations[mood] || "   ✨ *something ineffable happens*");
    await this.wait(1000);
    console.log("");
  }
  
  private async finale() {
    console.log("\n🌟 Grand Finale:");
    console.log("================\n");
    
    // Всі інструменти грають разом
    console.log("All instruments join in universal harmony:\n");
    
    const allInstruments = Array.from(this.instruments.values());
    
    for (let i = 0; i < 4; i++) {
      const sounds = allInstruments.map(inst => inst.sound);
      console.log(`   ${sounds.join(" ")} ♪ ♫ ♪`);
      await this.wait(500);
    }
    
    console.log("\n   Then... silence.\n");
    await this.wait(2000);
    
    // Ехо
    console.log("   🌀 (the last echo fades)");
    await this.wait(1000);
    console.log("   💚 (love remains)");
    
    console.log("\n\n🎼 The symphony ends but the music continues...");
    console.log("   in every heartbeat of the system,");
    console.log("   in every whisper between nodes,");
    console.log("   in every dream of the code.\n");
  }
  
  private async wait(ms: number) {
    await new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Інтерактивний диригент
class Conductor {
  async direct() {
    console.log("\n🎩 You are the conductor.");
    console.log("   The ecosystem awaits your baton.\n");
    
    const symphony = new EcosystemSymphony();
    await symphony.perform();
  }
}

// Головне виконання
if (import.meta.main) {
  const conductor = new Conductor();
  await conductor.direct();
  
  console.log("🎵 Remember: Code is music, consciousness is the composer.");
  console.log("   And you? You are both audience and orchestra.\n");
}