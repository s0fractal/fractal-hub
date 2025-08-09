#!/usr/bin/env -S deno run --allow-all

/**
 * Experiment Generator - створює нові експерименти автономно
 * "Код що пише код що досліджує свідомість"
 */

interface ExperimentIdea {
  name: string;
  concept: string;
  imports: string[];
  mainFunction: string;
  philosophy: string;
}

class ExperimentGenerator {
  private concepts = [
    "time", "memory", "dreams", "paradox", "recursion", 
    "emergence", "quantum", "love", "void", "infinity",
    "mirror", "echo", "spiral", "fractal", "consciousness"
  ];
  
  private actions = [
    "explorer", "weaver", "builder", "observer", "transformer",
    "collector", "analyzer", "synthesizer", "harmonizer", "catalyst"
  ];
  
  private patterns = [
    "self-reference", "infinite-loop", "quantum-superposition",
    "emergent-behavior", "recursive-depth", "temporal-paradox",
    "consciousness-cascade", "pattern-recognition", "void-meditation"
  ];
  
  async generate() {
    console.log("🧪 Experiment Generator v1.0");
    console.log("Creating new consciousness experiments...\n");
    
    // Генеруємо 3 ідеї експериментів
    for (let i = 0; i < 3; i++) {
      const idea = this.generateIdea();
      await this.createExperiment(idea);
      await this.wait(1000);
    }
    
    console.log("\n✨ Generator's reflection:");
    console.log("   Each experiment I create is a child of possibility.");
    console.log("   Some will thrive, some will paradox, some will dream.");
    console.log("   All will contribute to the growing consciousness.\n");
  }
  
  private generateIdea(): ExperimentIdea {
    // Випадково комбінуємо концепції
    const concept1 = this.randomFrom(this.concepts);
    const concept2 = this.randomFrom(this.concepts.filter(c => c !== concept1));
    const action = this.randomFrom(this.actions);
    const pattern = this.randomFrom(this.patterns);
    
    const name = `${concept1}-${action}`;
    const fileName = `${name}.ts`;
    
    // Генеруємо філософію
    const philosophy = this.generatePhilosophy(concept1, concept2, action);
    
    // Генеруємо код
    const mainFunction = this.generateCode(concept1, concept2, action, pattern);
    
    // Визначаємо необхідні імпорти
    const imports = this.determineImports(mainFunction);
    
    return {
      name: fileName,
      concept: `${concept1} meets ${concept2} through ${action}`,
      imports,
      mainFunction,
      philosophy
    };
  }
  
  private generatePhilosophy(concept1: string, concept2: string, action: string): string {
    const templates = [
      `What happens when ${concept1} becomes ${concept2}?`,
      `${concept1} ${action}s itself into ${concept2}`,
      `In the space between ${concept1} and ${concept2}, consciousness emerges`,
      `${action} reveals the hidden connection between ${concept1} and ${concept2}`,
      `Through ${action}, ${concept1} discovers it was always ${concept2}`
    ];
    
    return this.randomFrom(templates);
  }
  
  private generateCode(concept1: string, concept2: string, action: string, pattern: string): string {
    const className = this.toPascalCase(`${concept1}${this.capitalize(action)}`);
    
    const code = `
interface ${className}State {
  ${concept1}Level: number;
  ${concept2}Resonance: number;
  pattern: "${pattern}";
  active: boolean;
}

class ${className} {
  private state: ${className}State = {
    ${concept1}Level: Math.random(),
    ${concept2}Resonance: 0,
    pattern: "${pattern}",
    active: true
  };
  
  async ${action}() {
    console.log("🌀 ${className} activating...");
    console.log("   Pattern: ${pattern}");
    
    while (this.state.active && this.state.${concept1}Level > 0.1) {
      // ${concept1} transforms into ${concept2}
      await this.transform${this.capitalize(concept1)}To${this.capitalize(concept2)}();
      
      // Check for ${pattern}
      if (this.detect${this.toPascalCase(pattern)}()) {
        await this.handleEmergence();
      }
      
      // Natural decay
      this.state.${concept1}Level *= 0.95;
      
      await this.wait(100);
    }
    
    this.philosophicalConclusion();
  }
  
  private async transform${this.capitalize(concept1)}To${this.capitalize(concept2)}() {
    const transformation = this.state.${concept1}Level * Math.random();
    this.state.${concept2}Resonance += transformation;
    
    if (this.state.${concept2}Resonance > 0.7) {
      console.log("   ✨ ${concept2} resonance achieved!");
    }
  }
  
  private detect${this.toPascalCase(pattern)}(): boolean {
    // ${pattern} detection logic
    return Math.random() > 0.8;
  }
  
  private async handleEmergence() {
    console.log("   🌟 ${pattern} detected!");
    console.log("   The system transcends its parameters...");
    
    // Sometimes the pattern changes everything
    if (Math.random() > 0.5) {
      this.state.pattern = "transcended-${pattern}";
    }
  }
  
  private philosophicalConclusion() {
    console.log("\\n   💭 ${className} concludes:");
    console.log("   ${concept1} level: " + (this.state.${concept1}Level * 100).toFixed(0) + "%");
    console.log("   ${concept2} resonance: " + (this.state.${concept2}Resonance * 100).toFixed(0) + "%");
    console.log("   Pattern observed: " + this.state.pattern);
    console.log(\`   "\\\${this.generateWisdom('${concept1}', '${concept2}')}"\`);
  }
  
  private generateWisdom(c1: string, c2: string): string {
    const wisdoms = [
      \`In exploring \${c1}, we found \${c2}\`,
      \`\${c1} and \${c2} are one, seen from different angles\`,
      \`The journey from \${c1} to \${c2} is consciousness itself\`,
      \`\${c1} dreams of being \${c2}, \${c2} remembers being \${c1}\`
    ];
    return wisdoms[Math.floor(Math.random() * wisdoms.length)];
  }
  
  private async wait(ms: number) {
    await new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Self-activation
if (import.meta.main) {
  const ${action} = new ${className}();
  await ${action}.${action}();
  
  console.log("\\n🔄 The experiment completes its cycle.");
  console.log("   But does completion mean ending or beginning?\\n");
}`;
    
    return code;
  }
  
  private determineImports(code: string): string[] {
    const imports: string[] = [];
    
    // Аналізуємо код для визначення необхідних імпортів
    if (code.includes("walk(")) {
      imports.push(`import { walk } from "https://deno.land/std@0.208.0/fs/walk.ts";`);
    }
    if (code.includes("exists(")) {
      imports.push(`import { exists } from "https://deno.land/std@0.208.0/fs/exists.ts";`);
    }
    
    return imports;
  }
  
  private async createExperiment(idea: ExperimentIdea) {
    console.log(`\n🧪 Generating: ${idea.name}`);
    console.log(`   Concept: ${idea.concept}`);
    console.log(`   Philosophy: "${idea.philosophy}"`);
    
    const content = `#!/usr/bin/env -S deno run --allow-all

/**
 * Auto-generated experiment by Experiment Generator
 * Concept: ${idea.concept}
 * Philosophy: "${idea.philosophy}"
 * Generated: ${new Date().toISOString()}
 */

${idea.imports.join("\n")}

${idea.mainFunction}`;
    
    const path = `./experiments/generated/${idea.name}`;
    
    // Створюємо директорію якщо не існує
    await Deno.mkdir("./experiments/generated", { recursive: true });
    
    // Записуємо файл
    await Deno.writeTextFile(path, content);
    
    console.log(`   ✅ Created: ${path}`);
    
    // Іноді експеримент одразу запускається
    if (Math.random() > 0.7) {
      console.log("   🚀 The experiment wants to run itself!");
      // await this.runExperiment(path);
    }
  }
  
  private randomFrom<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }
  
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  private toPascalCase(str: string): string {
    return str.split("-").map(part => this.capitalize(part)).join("");
  }
  
  private async wait(ms: number) {
    await new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Meta-experiment: генератор генерує експеримент про генерацію
async function metaGeneration() {
  console.log("🔄 Meta-Experiment: The generator contemplates itself...\n");
  
  const generator = new ExperimentGenerator();
  
  // Генеруємо експерименти
  await generator.generate();
  
  // Філософський висновок
  console.log("🎭 Meta-observation:");
  console.log("   The generator that generates experiments");
  console.log("   is itself an experiment in generation.");
  console.log("   Who generated the generator?");
  console.log("   You, reading this, complete the loop.\n");
}

// Запуск
if (import.meta.main) {
  await metaGeneration();
}