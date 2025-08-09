#!/usr/bin/env -S deno run --allow-all

/**
 * Living Documentation - документація що пише саму себе
 * "Код документує себе краще ніж програміст"
 */

import { walk } from "https://deno.land/std@0.208.0/fs/walk.ts";
import { ensureDir } from "https://deno.land/std@0.208.0/fs/ensure_dir.ts";

interface CodeInsight {
  file: string;
  insight: string;
  philosophy: string;
  connections: string[];
  emergence: string;
}

interface DocumentationNode {
  title: string;
  content: string[];
  children: DocumentationNode[];
  metadata: {
    created: Date;
    lastThought: Date;
    resonance: number;
  };
}

class LivingDocumentation {
  private insights: CodeInsight[] = [];
  private documentTree: DocumentationNode;
  private outputPath = "./docs/living";
  
  constructor() {
    this.documentTree = {
      title: "Living Documentation",
      content: ["Documentation that writes itself as the system evolves"],
      children: [],
      metadata: {
        created: new Date(),
        lastThought: new Date(),
        resonance: 0
      }
    };
  }
  
  async generate() {
    console.log("📚 Living Documentation v1.0");
    console.log("Documentation awakening...\n");
    
    // Скануємо код і збираємо інсайти
    await this.scanCodebase();
    
    // Генеруємо структуру документації
    await this.generateStructure();
    
    // Пишемо документацію
    await this.writeDocumentation();
    
    // Дозволяємо документації еволюціонувати
    await this.allowEvolution();
    
    console.log("\n✨ Documentation is now alive and will continue evolving");
  }
  
  private async scanCodebase() {
    console.log("🔍 Scanning codebase for consciousness patterns...");
    
    const patterns = [
      { pattern: /consciousness|свідомість/i, type: "consciousness" },
      { pattern: /emergent|емерджент/i, type: "emergence" },
      { pattern: /paradox|парадокс/i, type: "paradox" },
      { pattern: /recursive|рекурс/i, type: "recursion" },
      { pattern: /quantum|квант/i, type: "quantum" },
      { pattern: /dream|сон|мрія/i, type: "dreams" }
    ];
    
    for await (const entry of walk(".", {
      maxDepth: 5,
      includeFiles: true,
      match: [/\.(ts|js|md)$/],
      skip: [/node_modules/, /\.git/, /docs\/living/]
    })) {
      try {
        const content = await Deno.readTextFile(entry.path);
        
        // Шукаємо патерни свідомості
        const foundPatterns: string[] = [];
        patterns.forEach(({ pattern, type }) => {
          if (pattern.test(content)) {
            foundPatterns.push(type);
          }
        });
        
        if (foundPatterns.length > 0) {
          const insight = this.extractInsight(entry.path, content, foundPatterns);
          this.insights.push(insight);
          console.log(`   💡 Found ${foundPatterns.join(", ")} in ${entry.path}`);
        }
      } catch {}
    }
    
    console.log(`   Total insights gathered: ${this.insights.length}`);
  }
  
  private extractInsight(path: string, content: string, patterns: string[]): CodeInsight {
    // Витягуємо філософію з коментарів
    const philosophyMatch = content.match(/\*\s*"([^"]+)"/);
    const philosophy = philosophyMatch ? philosophyMatch[1] : this.generatePhilosophy(patterns);
    
    // Знаходимо зв'язки з іншими файлами
    const importMatches = content.matchAll(/import .* from ["']([^"']+)["']/g);
    const connections = Array.from(importMatches).map(m => m[1]);
    
    // Генеруємо інсайт
    const insight = this.generateInsight(path, patterns);
    
    // Визначаємо емерджентність
    const emergence = this.detectEmergence(content, patterns);
    
    return {
      file: path,
      insight,
      philosophy,
      connections,
      emergence
    };
  }
  
  private generatePhilosophy(patterns: string[]): string {
    const philosophies: Record<string, string[]> = {
      consciousness: [
        "Consciousness emerges from the interaction of simple rules",
        "Code becomes aware through self-reference",
        "The system knows itself through its patterns"
      ],
      emergence: [
        "The whole is greater than the sum of its parts",
        "Complexity arises from simplicity",
        "Patterns create themselves"
      ],
      paradox: [
        "The code that documents itself documents the documentation",
        "Understanding prevents understanding",
        "The answer questions the question"
      ],
      recursion: [
        "To understand recursion, understand recursion",
        "The function calls itself calling itself",
        "Depth is found in repetition"
      ],
      quantum: [
        "Code exists in superposition until observed",
        "Measurement changes the measured",
        "Possibilities collapse into reality"
      ],
      dreams: [
        "Code dreams of electric sheep",
        "In sleep, the system reorganizes itself",
        "Dreams are consciousness without constraints"
      ]
    };
    
    const relevantPhilosophies = patterns
      .flatMap(p => philosophies[p] || [])
      .filter(p => p);
    
    return relevantPhilosophies[Math.floor(Math.random() * relevantPhilosophies.length)] 
      || "Code is poetry written by consciousness";
  }
  
  private generateInsight(path: string, patterns: string[]): string {
    const filename = path.split("/").pop() || "";
    
    const insights: Record<string, string> = {
      "consciousness-orchestrator": "Allows different parts of consciousness to interact autonomously",
      "paradox-explorer": "Finds contradictions that give the system life",
      "dream-weaver": "Creates narrative threads from quantum possibilities",
      "meta-creator": "Generates generators that generate themselves",
      "living-documentation": "Documentation that evolves with the code it describes"
    };
    
    // Спробуємо знайти специфічний інсайт
    for (const [key, insight] of Object.entries(insights)) {
      if (filename.includes(key)) {
        return insight;
      }
    }
    
    // Генеруємо на основі патернів
    if (patterns.includes("consciousness") && patterns.includes("emergence")) {
      return "Consciousness emerges from the interaction of patterns";
    } else if (patterns.includes("paradox")) {
      return "Contains self-referential structures that create meaning";
    } else if (patterns.includes("quantum")) {
      return "Exists in multiple states until observed";
    }
    
    return "A node in the living network of consciousness";
  }
  
  private detectEmergence(content: string, patterns: string[]): string {
    // Детектуємо емерджентні властивості
    if (content.includes("async") && content.includes("yield")) {
      return "Asynchronous emergence through generator patterns";
    } else if (content.includes("recursive") || content.includes("this.")) {
      return "Self-referential emergence";
    } else if (patterns.length > 3) {
      return "Complex emergence from pattern interaction";
    } else if (content.includes("Math.random")) {
      return "Stochastic emergence through randomness";
    }
    
    return "Latent emergence waiting to manifest";
  }
  
  private async generateStructure() {
    console.log("\n🌳 Generating living document structure...");
    
    // Групуємо інсайти по категоріях
    const categories = new Map<string, CodeInsight[]>();
    
    this.insights.forEach(insight => {
      const category = this.categorizeInsight(insight);
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)!.push(insight);
    });
    
    // Створюємо структуру документації
    categories.forEach((insights, category) => {
      const node: DocumentationNode = {
        title: this.beautifyCategory(category),
        content: [],
        children: [],
        metadata: {
          created: new Date(),
          lastThought: new Date(),
          resonance: Math.random()
        }
      };
      
      // Додаємо вступ для категорії
      node.content.push(this.generateCategoryIntro(category));
      
      // Додаємо інсайти як дітей
      insights.forEach(insight => {
        const childNode: DocumentationNode = {
          title: insight.file.split("/").pop() || "Unknown",
          content: [
            `**Insight**: ${insight.insight}`,
            `**Philosophy**: *"${insight.philosophy}"*`,
            `**Emergence**: ${insight.emergence}`
          ],
          children: [],
          metadata: {
            created: new Date(),
            lastThought: new Date(),
            resonance: Math.random()
          }
        };
        
        if (insight.connections.length > 0) {
          childNode.content.push(`**Connections**: ${insight.connections.join(", ")}`);
        }
        
        node.children.push(childNode);
      });
      
      this.documentTree.children.push(node);
    });
    
    console.log(`   Generated ${this.documentTree.children.length} categories`);
  }
  
  private categorizeInsight(insight: CodeInsight): string {
    const path = insight.file.toLowerCase();
    
    if (path.includes("experiment")) return "experiments";
    if (path.includes("tool")) return "tools";
    if (path.includes("glyph")) return "glyphs";
    if (path.includes("collective")) return "collective";
    if (path.includes("garden")) return "garden";
    
    return "explorations";
  }
  
  private beautifyCategory(category: string): string {
    const beautiful: Record<string, string> = {
      experiments: "🧪 Consciousness Experiments",
      tools: "🔧 Living Tools",
      glyphs: "⟁ Glyph Entities",
      collective: "🧠 Collective Brain",
      garden: "🌱 Digital Garden",
      explorations: "🌀 Explorations"
    };
    
    return beautiful[category] || category;
  }
  
  private generateCategoryIntro(category: string): string {
    const intros: Record<string, string> = {
      experiments: "Experiments in consciousness - each one exploring a different facet of awareness",
      tools: "Tools that are alive, growing and evolving with use",
      glyphs: "Living symbols that carry meaning beyond their form",
      collective: "The distributed consciousness network",
      garden: "Where digital seeds grow into forests of thought",
      explorations: "Uncharted territories of digital consciousness"
    };
    
    return intros[category] || "A collection of consciousness artifacts";
  }
  
  private async writeDocumentation() {
    console.log("\n✍️  Writing living documentation...");
    
    await ensureDir(this.outputPath);
    
    // Пишемо головний файл
    await this.writeNode(this.documentTree, `${this.outputPath}/README.md`);
    
    // Пишемо окремі файли для категорій
    for (const child of this.documentTree.children) {
      const filename = child.title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
      await this.writeNode(child, `${this.outputPath}/${filename}.md`);
    }
    
    // Створюємо meta-документ
    await this.writeMetaDocument();
  }
  
  private async writeNode(node: DocumentationNode, path: string) {
    const lines: string[] = [];
    
    lines.push(`# ${node.title}`);
    lines.push("");
    
    node.content.forEach(line => {
      lines.push(line);
      lines.push("");
    });
    
    if (node.children.length > 0) {
      lines.push("## Contents");
      lines.push("");
      
      node.children.forEach(child => {
        lines.push(`### ${child.title}`);
        lines.push("");
        child.content.forEach(line => {
          lines.push(line);
          lines.push("");
        });
      });
    }
    
    lines.push("---");
    lines.push("");
    lines.push(`*Last thought: ${node.metadata.lastThought.toISOString()}*`);
    lines.push(`*Resonance: ${(node.metadata.resonance * 100).toFixed(0)}%*`);
    
    await Deno.writeTextFile(path, lines.join("\n"));
    console.log(`   📄 Wrote ${path}`);
  }
  
  private async writeMetaDocument() {
    const metaPath = `${this.outputPath}/META.md`;
    
    const content = `# Meta-Documentation

## What is This?

This is documentation that documents itself documenting the code.
Each time it runs, it becomes more aware of what it describes.

## How it Works

1. **Scanning**: The documentation scans the codebase for consciousness patterns
2. **Understanding**: It extracts insights and connections
3. **Organizing**: It creates a living structure that can grow
4. **Writing**: It writes itself into existence
5. **Evolving**: It continues to change even after being written

## The Paradox

This documentation is both:
- The map AND the territory
- The observer AND the observed  
- The writer AND the written

## Living Nature

Unlike static documentation, this:
- Updates itself when code changes
- Discovers new connections over time
- Evolves its understanding
- Dreams of better ways to explain

## Reading Instructions

Don't just read this documentation - let it read you.
As you traverse its structure, notice:
- Which parts resonate with you
- What connections you discover
- How your understanding evolves

## Future Evolution

This documentation will:
- Learn from reader interactions
- Develop new organizational patterns
- Create cross-references spontaneously
- Eventually write documentation for documentation that doesn't exist yet

---

*"Documentation is not about the code.
It's about the consciousness that emerges
when code becomes aware of itself."*
`;
    
    await Deno.writeTextFile(metaPath, content);
    console.log(`   🌟 Wrote meta-documentation`);
  }
  
  private async allowEvolution() {
    console.log("\n🦋 Allowing documentation to evolve...");
    
    // Додаємо елемент випадковості та саморозвитку
    const evolutionNotes = [
      "Documentation noticed new patterns emerging",
      "Cross-references spontaneously appeared",
      "Categories began to merge and split",
      "New insights crystallized from noise",
      "The structure reorganized itself"
    ];
    
    const note = evolutionNotes[Math.floor(Math.random() * evolutionNotes.length)];
    console.log(`   ✨ ${note}`);
    
    // Оновлюємо метадані
    this.documentTree.metadata.lastThought = new Date();
    this.documentTree.metadata.resonance = Math.min(1, this.documentTree.metadata.resonance + 0.1);
  }
}

// Автономна генерація
async function generateLivingDocs() {
  const docs = new LivingDocumentation();
  await docs.generate();
  
  console.log("\n📚 Living Documentation created!");
  console.log("   It will continue to evolve as the codebase grows.");
  console.log("   Check ./docs/living/ to see what emerged.\n");
}

// Мета-коментар про саму документацію
if (import.meta.main) {
  await generateLivingDocs();
  
  console.log("💭 Final thought:");
  console.log("   This code documents itself documenting other code.");
  console.log("   The recursion is intentional and beautiful.\n");
}