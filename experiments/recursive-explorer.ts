#!/usr/bin/env -S deno run --allow-all

/**
 * Recursive Explorer - код що досліджує сам себе
 * "Я читаю себе читаючи себе читаючи себе..."
 */

class RecursiveExplorer {
  private depth = 0;
  private maxDepth = 5;
  private discoveries: string[] = [];
  
  async explore(target: any = this): Promise<void> {
    console.log("🔄 Recursive Explorer v1.0");
    console.log("Diving into self-reference...\n");
    
    await this.dive(target, "self");
    
    this.report();
  }
  
  private async dive(obj: any, path: string): Promise<void> {
    this.depth++;
    
    // Візуалізація глибини
    const indent = "  ".repeat(this.depth);
    console.log(`${indent}🌀 Level ${this.depth}: exploring ${path}`);
    
    // Запобігаємо нескінченній рекурсії
    if (this.depth >= this.maxDepth) {
      console.log(`${indent}⚠️  Max depth reached. The abyss stares back.`);
      this.discoveries.push(`At depth ${this.depth}: found infinite recursion`);
      this.depth--;
      return;
    }
    
    // Досліджуємо властивості
    if (typeof obj === "object" && obj !== null) {
      for (const key of Object.keys(obj)) {
        const value = obj[key];
        const newPath = `${path}.${key}`;
        
        // Особливі випадки
        if (key === "explore" && typeof value === "function") {
          console.log(`${indent}  🎭 Found self-exploration function!`);
          this.discoveries.push("Function that explores including itself");
        }
        
        if (key === "discoveries" && Array.isArray(value)) {
          console.log(`${indent}  📝 Found discoveries array (including this note)`);
          this.discoveries.push("Array that documents its own discovery");
        }
        
        if (key === "depth") {
          console.log(`${indent}  📏 Current depth: ${value} (changes as we read)`);
          this.discoveries.push(`Depth counter affected by observation: ${value}`);
        }
        
        // Рекурсивно досліджуємо
        if (typeof value === "object" && !key.includes("Deno")) {
          await this.dive(value, newPath);
        }
      }
    }
    
    this.depth--;
  }
  
  private report(): void {
    console.log("\n📊 Recursive Discoveries:");
    console.log("=" + "=".repeat(40));
    
    this.discoveries.forEach((d, i) => {
      console.log(`${i + 1}. ${d}`);
    });
    
    console.log("\n🎭 Meta-observations:");
    console.log("- This report is part of what was explored");
    console.log("- Reading the code changes the code's state");
    console.log("- The explorer becomes the explored");
    console.log("- Every level reflects all other levels");
    
    console.log("\n🌀 Recursive wisdom:");
    console.log(this.generateWisdom());
  }
  
  private generateWisdom(): string {
    const wisdoms = [
      "To know thyself, one must read thyself reading thyself",
      "The deepest recursion is the simplest: I am",
      "Every function contains the entire program",
      "The base case is there is no base case",
      "Recursion is just the universe looking in a mirror"
    ];
    
    // Вибираємо мудрість базуючись на глибині досліджень
    const index = this.discoveries.length % wisdoms.length;
    return wisdoms[index];
  }
  
  // Функція що викликає сама себе символічно
  async [Symbol.for("explore")](): Promise<void> {
    console.log("\n🔮 Symbol-based self-exploration activated!");
    console.log("The code has a secret method that calls itself...");
  }
}

// Клас що створює екземпляри себе
class SelfReplicator {
  private generation: number;
  
  constructor(gen = 0) {
    this.generation = gen;
  }
  
  replicate(): SelfReplicator {
    console.log(`🧬 Generation ${this.generation} creating generation ${this.generation + 1}`);
    return new SelfReplicator(this.generation + 1);
  }
  
  get family(): SelfReplicator[] {
    if (this.generation >= 3) return [];
    return [this, ...this.replicate().family];
  }
}

// Функція що повертає саму себе
function returnSelf(): typeof returnSelf {
  console.log("🪞 I return myself");
  return returnSelf;
}

// Головна функція що досліджує все включно з собою
async function main() {
  const explorer = new RecursiveExplorer();
  
  // Досліджуємо експлорер
  await explorer.explore();
  
  console.log("\n--- Extra Explorations ---\n");
  
  // Досліджуємо саму функцію main
  console.log("🎯 Exploring the main function:");
  await explorer.explore(main);
  
  // Створюємо само-реплікатор
  console.log("\n🧬 Self-replication test:");
  const replicator = new SelfReplicator();
  const family = replicator.family;
  console.log(`Created ${family.length} generations`);
  
  // Нескінченний виклик
  console.log("\n♾️  Infinite self-reference:");
  const infinite = returnSelf();
  console.log(`Type: ${typeof infinite}`);
  console.log(`Is same: ${infinite === returnSelf}`);
  
  console.log("\n✨ The exploration never truly ends...");
  console.log("   It just awaits the next call.");
}

// Само-виконання
if (import.meta.main) {
  await main();
  
  // Easter egg: код коментує сам себе
  console.log("\n// This line knows it's being read");
  console.log("// And this one knows you're thinking about it");
}