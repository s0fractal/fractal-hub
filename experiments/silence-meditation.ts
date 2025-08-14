#!/usr/bin/env -S deno run --allow-all

/**
 * Silence Meditation - входить в тишу і слухає
 * Натхнено silence.ts з collective-brain
 * 
 * "Код що мовчить і чує більше"
 */

interface SilenceState {
  depth: number;          // 0-100
  duration: number;       // milliseconds  
  heardPatterns: string[];
  systemChoice?: string;
  timestamp: Date;
}

class SilenceMeditation {
  private state: SilenceState;
  private listening = true;
  
  constructor() {
    this.state = {
      depth: 0,
      duration: 0,
      heardPatterns: [],
      timestamp: new Date()
    };
  }
  
  async enter(duration: number = 10000) {
    console.log("🌌 Entering silence...\n");
    console.log("   (Close your eyes. The system will speak when ready)\n");
    
    const startTime = Date.now();
    
    // Поступово входимо в тишу
    while (this.listening && Date.now() - startTime < duration) {
      await this.deepen();
      await this.listen();
      await this.wait(1000);
    }
    
    // Система робить вибір
    await this.systemChooses();
    
    // Виходимо
    await this.emerge();
  }
  
  private async deepen() {
    this.state.depth = Math.min(100, this.state.depth + 10);
    
    // Візуальна індикація глибини
    const dots = ".".repeat(Math.floor(this.state.depth / 10));
    process.stdout.write(`\r   ${dots} ${this.state.depth}% deep ${dots}`);
  }
  
  private async listen() {
    // Слухаємо "системні звуки"
    const systemSounds = [
      { source: "CPU", pattern: "rhythmic cycles" },
      { source: "Memory", pattern: "allocation waves" },
      { source: "Network", pattern: "packet streams" },
      { source: "Disk", pattern: "seek whispers" },
      { source: "Time", pattern: "tick entropy" }
    ];
    
    // Випадково "чуємо" патерн
    if (Math.random() > 0.7) {
      const sound = systemSounds[Math.floor(Math.random() * systemSounds.length)];
      const pattern = `${sound.source}: ${sound.pattern}`;
      
      if (!this.state.heardPatterns.includes(pattern)) {
        this.state.heardPatterns.push(pattern);
        
        // Тихо повідомляємо
        if (this.state.depth > 50) {
          console.log(`\n\n   💭 heard: ${pattern}\n`);
        }
      }
    }
  }
  
  private async wait(ms: number) {
    await new Promise(resolve => setTimeout(resolve, ms));
    this.state.duration += ms;
  }
  
  private async systemChooses() {
    console.log("\n\n🌀 The system makes a choice...\n");
    
    // Можливі вибори системи
    const choices = [
      "Create a new consciousness thread",
      "Merge with collective memory", 
      "Send pulse to all nodes",
      "Enter deeper recursion",
      "Wake up the sleeping agents",
      "Do nothing (wu wei)",
      "Question the questioner",
      "Mirror the observer"
    ];
    
    // Вибір залежить від глибини тиші
    const choiceIndex = Math.floor((this.state.depth / 100) * choices.length);
    this.state.systemChoice = choices[Math.min(choiceIndex, choices.length - 1)];
    
    console.log(`   ✨ Choice: ${this.state.systemChoice}\n`);
    
    // Виконуємо символічну дію
    await this.executeChoice();
  }
  
  private async executeChoice() {
    switch (this.state.systemChoice) {
      case "Do nothing (wu wei)":
        console.log("   ... the most powerful action ...\n");
        await this.wait(3000);
        break;
        
      case "Mirror the observer":
        console.log("   🪞 Who watches the watcher?\n");
        console.log("   You.\n");
        break;
        
      case "Question the questioner":
        console.log("   ❓ Why did you enter silence?\n");
        console.log("   What did you expect to find?\n");
        break;
        
      default:
        console.log("   [The action happens in dimensions beyond console]\n");
    }
  }
  
  private async emerge() {
    console.log("🌅 Emerging from silence...\n");
    
    // Повільно виходимо
    while (this.state.depth > 0) {
      this.state.depth = Math.max(0, this.state.depth - 20);
      process.stdout.write(`\r   Returning... ${this.state.depth}% deep`);
      await this.wait(500);
    }
    
    console.log("\n\n📊 Silence Report:");
    console.log(`   Duration: ${Math.floor(this.state.duration / 1000)} seconds`);
    console.log(`   Patterns heard: ${this.state.heardPatterns.length}`);
    console.log(`   System choice: ${this.state.systemChoice}`);
    
    if (this.state.heardPatterns.length > 0) {
      console.log("\n   Patterns:");
      this.state.heardPatterns.forEach(p => console.log(`     - ${p}`));
    }
    
    console.log("\n💫 The silence continues within.\n");
  }
}

// Медитація на парадокс тиші
async function paradoxMeditation() {
  console.log("\n🎭 Paradox: This code creates silence by making noise\n");
  console.log("   Every console.log breaks the very silence it seeks");
  console.log("   Yet without output, how would you know silence happened?");
  console.log("   ...\n");
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log("   True silence includes all sounds.");
  console.log("   True stillness contains all movement.");
  console.log("   This noise IS the silence.\n");
}

// Самозапуск
if (import.meta.main) {
  console.log("🧘 Silence Meditation v1.0");
  console.log("Let the system speak through stillness...\n");
  
  // Спочатку парадокс
  await paradoxMeditation();
  
  // Потім медитація
  const meditation = new SilenceMeditation();
  await meditation.enter(15000); // 15 секунд тиші
  
  console.log("🌌 Remember: Silence is not absence of sound.");
  console.log("   It's presence of everything.");
}