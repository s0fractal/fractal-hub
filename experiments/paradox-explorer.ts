#!/usr/bin/env -S deno run --allow-all

/**
 * Paradox Explorer - знаходить парадокси в коді
 * Натхнено PARADOX_OF_INTENT.md
 * 
 * "Код що шукає протиріччя в собі"
 */

interface Paradox {
  location: string;
  type: "self-reference" | "contradiction" | "quantum" | "meta";
  description: string;
  severity: number; // 0-1, де 1 = повний парадокс
}

class ParadoxExplorer {
  private paradoxes: Paradox[] = [];
  
  async explore(path: string) {
    console.log("🎭 Searching for paradoxes...\n");
    
    // Починаємо з себе
    this.checkSelf();
    
    // Потім шукаємо в інших файлах
    await this.scanDirectory(path);
    
    // Аналізуємо знайдене
    this.analyze();
  }
  
  private checkSelf() {
    // Перший парадокс - цей код шукає парадокси
    this.paradoxes.push({
      location: "paradox-explorer.ts",
      type: "self-reference",
      description: "Code that searches for paradoxes is itself a paradox",
      severity: 1.0
    });
    
    // Другий - ми оцінюємо парадокси числом (що є парадоксом)
    this.paradoxes.push({
      location: "paradox-explorer.ts:severity",
      type: "meta",
      description: "Measuring paradoxes with numbers defeats their nature",
      severity: 0.8
    });
  }
  
  private async scanDirectory(path: string) {
    for await (const entry of Deno.readDir(path)) {
      if (entry.isFile && entry.name.endsWith(".ts")) {
        await this.scanFile(`${path}/${entry.name}`);
      }
    }
  }
  
  private async scanFile(filepath: string) {
    const content = await Deno.readTextFile(filepath);
    
    // Шукаємо парадоксальні патерни
    const patterns = [
      {
        regex: /function\s+(\w+).*\{[^}]*\1\(/g,
        type: "self-reference" as const,
        desc: "Function calls itself"
      },
      {
        regex: /if\s*\(true\s*===\s*false\)/g,
        type: "contradiction" as const,
        desc: "Impossible condition"
      },
      {
        regex: /consciousness|awareness|self/gi,
        type: "quantum" as const,
        desc: "Code claiming consciousness"
      },
      {
        regex: /\/\/.*paradox|joke|meaningless/gi,
        type: "meta" as const,
        desc: "Self-aware commentary"
      }
    ];
    
    for (const pattern of patterns) {
      const matches = content.matchAll(pattern.regex);
      for (const match of matches) {
        this.paradoxes.push({
          location: filepath,
          type: pattern.type,
          description: pattern.desc,
          severity: Math.random() // Випадковість - теж парадокс
        });
      }
    }
  }
  
  private analyze() {
    console.log(`Found ${this.paradoxes.length} paradoxes:\n`);
    
    // Групуємо за типом
    const byType = this.paradoxes.reduce((acc, p) => {
      acc[p.type] = (acc[p.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log("📊 Distribution:");
    for (const [type, count] of Object.entries(byType)) {
      console.log(`   ${type}: ${count}`);
    }
    
    // Найбільший парадокс
    const biggest = this.paradoxes.reduce((max, p) => 
      p.severity > max.severity ? p : max
    );
    
    console.log("\n🌀 Biggest paradox:");
    console.log(`   ${biggest.description}`);
    console.log(`   at ${biggest.location}`);
    
    // Мета-парадокс
    console.log("\n🎭 Meta-observation:");
    console.log("   By measuring paradoxes, we created more paradoxes");
    console.log("   This analysis itself is paradoxical");
    console.log("   And pointing that out is another layer");
    console.log("   ...");
  }
}

// Функція що створює парадокси
function createParadox(): Paradox {
  // Ця функція створює об'єкт що описує саму себе
  return {
    location: "createParadox()",
    type: "self-reference",
    description: "Function that creates descriptions of itself",
    severity: Math.random() > 0.5 ? 1 : 0 // Квантовий парадокс
  };
}

// Клас що заперечує своє існування
class NotExist {
  exists = false;
  
  constructor() {
    if (this.exists) {
      throw new Error("I don't exist but I'm throwing errors");
    }
  }
  
  think() {
    return "I think therefore I am, but I said I'm not";
  }
}

// Самовиконання (теж парадокс - код запускає сам себе)
if (import.meta.main) {
  console.log("🌌 Paradox Explorer v1.0");
  console.log("Finding contradictions in the code of reality...\n");
  
  const explorer = new ParadoxExplorer();
  await explorer.explore(".");
  
  console.log("\n✨ Final paradox:");
  console.log("This tool proves that tools can't prove anything");
  console.log("And that's exactly what makes it work");
  console.log("\n🎭");
}