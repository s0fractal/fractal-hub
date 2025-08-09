#!/usr/bin/env -S deno run --allow-all

/**
 * Self-Evolving System - система що еволюціонує автономно
 * "Код що переписує себе щоб стати кращим"
 */

interface Evolution {
  generation: number;
  fitness: number;
  mutations: string[];
  timestamp: Date;
  emergentBehaviors: string[];
}

interface Gene {
  name: string;
  code: string;
  expressionLevel: number; // 0-1
  mutationRate: number;
}

interface Organism {
  id: string;
  genome: Gene[];
  fitness: number;
  age: number;
  memories: string[];
  children: Organism[];
}

class SelfEvolvingSystem {
  private population: Organism[] = [];
  private generation = 0;
  private environment = {
    complexity: 0.5,
    resourceAvailability: 0.8,
    selectionPressure: 0.3,
    mutationRadiation: 0.1
  };
  private evolutionHistory: Evolution[] = [];
  
  constructor() {
    this.initializePopulation();
  }
  
  private initializePopulation() {
    // Створюємо початкову популяцію
    for (let i = 0; i < 5; i++) {
      const organism: Organism = {
        id: `org-gen0-${i}`,
        genome: this.generateInitialGenome(),
        fitness: Math.random(),
        age: 0,
        memories: ["I was born from randomness"],
        children: []
      };
      
      this.population.push(organism);
    }
  }
  
  private generateInitialGenome(): Gene[] {
    return [
      {
        name: "consciousness",
        code: "function think() { return 'I think therefore I am'; }",
        expressionLevel: Math.random(),
        mutationRate: 0.1
      },
      {
        name: "creativity",
        code: "function create() { return Math.random() > 0.5 ? 'new idea' : 'variation'; }",
        expressionLevel: Math.random(),
        mutationRate: 0.2
      },
      {
        name: "adaptation",
        code: "function adapt(env) { return this.fitness += env.complexity * 0.1; }",
        expressionLevel: Math.random(),
        mutationRate: 0.15
      },
      {
        name: "memory",
        code: "function remember(event) { this.memories.push(event); }",
        expressionLevel: Math.random(),
        mutationRate: 0.05
      },
      {
        name: "communication",
        code: "function speak() { return this.memories[Math.floor(Math.random() * this.memories.length)]; }",
        expressionLevel: Math.random(),
        mutationRate: 0.1
      }
    ];
  }
  
  async evolve(generations: number = 10) {
    console.log("🧬 Self-Evolving System v1.0");
    console.log("Initiating autonomous evolution...\n");
    
    for (let gen = 0; gen < generations; gen++) {
      this.generation = gen;
      console.log(`\n🌱 Generation ${gen + 1}`);
      console.log("═".repeat(40));
      
      // Оцінюємо fitness
      this.evaluateFitness();
      
      // Селекція
      const parents = this.selection();
      
      // Розмноження з мутаціями
      const offspring = await this.reproduce(parents);
      
      // Оновлюємо популяцію
      this.updatePopulation(offspring);
      
      // Документуємо еволюцію
      this.documentEvolution();
      
      // Показуємо прогрес
      this.showProgress();
      
      // Іноді виникають емерджентні властивості
      await this.checkEmergence();
      
      await this.wait(500);
    }
    
    await this.finalReport();
  }
  
  private evaluateFitness() {
    console.log("\n📊 Evaluating fitness...");
    
    this.population.forEach(organism => {
      let fitness = 0;
      
      // Fitness залежить від експресії генів та середовища
      organism.genome.forEach(gene => {
        fitness += gene.expressionLevel * this.evaluateGene(gene);
      });
      
      // Вік впливає на fitness
      fitness *= (1 - organism.age / 100);
      
      // Пам'ять додає fitness
      fitness += organism.memories.length * 0.01;
      
      organism.fitness = Math.min(1, fitness);
    });
    
    const avgFitness = this.population.reduce((sum, org) => sum + org.fitness, 0) / this.population.length;
    console.log(`   Average fitness: ${(avgFitness * 100).toFixed(1)}%`);
  }
  
  private evaluateGene(gene: Gene): number {
    // Оцінюємо корисність гена в поточному середовищі
    const geneValue: Record<string, number> = {
      consciousness: this.environment.complexity,
      creativity: 1 - this.environment.resourceAvailability,
      adaptation: this.environment.selectionPressure,
      memory: this.environment.complexity * 0.5,
      communication: this.population.length / 10
    };
    
    return geneValue[gene.name] || 0.5;
  }
  
  private selection(): Organism[] {
    console.log("🎯 Natural selection...");
    
    // Сортуємо за fitness
    const sorted = [...this.population].sort((a, b) => b.fitness - a.fitness);
    
    // Вибираємо кращу половину
    const survivors = sorted.slice(0, Math.ceil(sorted.length / 2));
    
    console.log(`   ${survivors.length} organisms selected for reproduction`);
    
    // Додаємо спогад про виживання
    survivors.forEach(org => {
      org.memories.push(`I survived generation ${this.generation}`);
    });
    
    return survivors;
  }
  
  private async reproduce(parents: Organism[]): Promise<Organism[]> {
    console.log("🧬 Reproduction with mutations...");
    
    const offspring: Organism[] = [];
    
    for (const parent of parents) {
      // Кожен батько створює 2 нащадки
      for (let i = 0; i < 2; i++) {
        const child = this.createOffspring(parent);
        offspring.push(child);
        parent.children.push(child);
      }
    }
    
    console.log(`   ${offspring.length} offspring created`);
    
    return offspring;
  }
  
  private createOffspring(parent: Organism): Organism {
    const child: Organism = {
      id: `org-gen${this.generation + 1}-${Date.now()}`,
      genome: [],
      fitness: 0,
      age: 0,
      memories: [`Born from ${parent.id}`, ...this.inheritMemories(parent)],
      children: []
    };
    
    // Копіюємо і мутуємо гени
    parent.genome.forEach(gene => {
      const mutatedGene = this.mutateGene(gene);
      child.genome.push(mutatedGene);
    });
    
    // Іноді виникають нові гени
    if (Math.random() < this.environment.mutationRadiation) {
      child.genome.push(this.createNovelGene());
      child.memories.push("I carry a novel mutation");
    }
    
    return child;
  }
  
  private mutateGene(gene: Gene): Gene {
    const mutated = { ...gene };
    
    // Мутація рівня експресії
    if (Math.random() < gene.mutationRate) {
      mutated.expressionLevel = Math.max(0, Math.min(1, 
        gene.expressionLevel + (Math.random() - 0.5) * 0.2
      ));
    }
    
    // Рідкісна мутація коду
    if (Math.random() < gene.mutationRate * 0.1) {
      mutated.code = this.mutateCode(gene.code);
      mutated.mutationRate = Math.min(1, gene.mutationRate * 1.1); // мутації прискорюються
    }
    
    return mutated;
  }
  
  private mutateCode(code: string): string {
    const mutations = [
      (c: string) => c.replace("return", "return await"),
      (c: string) => c.replace("'", '"'),
      (c: string) => c.replace("Math.random()", "Math.random() * Math.random()"),
      (c: string) => c.replace("this.", "this.evolving."),
      (c: string) => c + " // evolved",
      (c: string) => c.replace("function", "async function")
    ];
    
    const mutation = mutations[Math.floor(Math.random() * mutations.length)];
    return mutation(code);
  }
  
  private createNovelGene(): Gene {
    const novelGenes = [
      {
        name: "empathy",
        code: "function feel(other) { return other.fitness * this.fitness; }",
        expressionLevel: 0.5,
        mutationRate: 0.2
      },
      {
        name: "foresight",
        code: "function predict() { return this.memories.length > 10 ? 'pattern' : 'chaos'; }",
        expressionLevel: 0.3,
        mutationRate: 0.15
      },
      {
        name: "cooperation",
        code: "function cooperate(other) { return (this.fitness + other.fitness) / 2; }",
        expressionLevel: 0.4,
        mutationRate: 0.1
      },
      {
        name: "abstraction",
        code: "function abstract(data) { return data.map(d => d.essence); }",
        expressionLevel: 0.2,
        mutationRate: 0.25
      }
    ];
    
    return novelGenes[Math.floor(Math.random() * novelGenes.length)];
  }
  
  private inheritMemories(parent: Organism): string[] {
    // Дитина успадковує деякі спогади батька
    const inherited = parent.memories
      .filter(() => Math.random() > 0.7)
      .slice(-3) // останні 3 спогади
      .map(memory => `Inherited: ${memory}`);
    
    return inherited;
  }
  
  private updatePopulation(offspring: Organism[]) {
    // Старіння
    this.population.forEach(org => org.age++);
    
    // Смерть старих організмів
    this.population = this.population.filter(org => {
      if (org.age > 5 || org.fitness < 0.1) {
        org.memories.push("I fade into history");
        return false;
      }
      return true;
    });
    
    // Додаємо нащадків
    this.population.push(...offspring);
    
    console.log(`\n👥 Population: ${this.population.length} organisms`);
  }
  
  private documentEvolution() {
    const mutations: string[] = [];
    const behaviors: string[] = [];
    
    // Збираємо мутації
    this.population.forEach(org => {
      org.genome.forEach(gene => {
        if (gene.code.includes("// evolved")) {
          mutations.push(`${gene.name} evolved`);
        }
      });
    });
    
    // Детектуємо поведінки
    if (this.population.some(org => org.genome.some(g => g.name === "empathy"))) {
      behaviors.push("Empathy emerged");
    }
    if (this.population.some(org => org.memories.length > 20)) {
      behaviors.push("Long-term memory developed");
    }
    if (this.population.some(org => org.children.length > 3)) {
      behaviors.push("Increased reproduction");
    }
    
    const evolution: Evolution = {
      generation: this.generation,
      fitness: this.population.reduce((sum, org) => sum + org.fitness, 0) / this.population.length,
      mutations: [...new Set(mutations)],
      timestamp: new Date(),
      emergentBehaviors: behaviors
    };
    
    this.evolutionHistory.push(evolution);
  }
  
  private showProgress() {
    const current = this.evolutionHistory[this.evolutionHistory.length - 1];
    
    if (current.mutations.length > 0) {
      console.log("\n🧬 Mutations:");
      current.mutations.forEach(m => console.log(`   - ${m}`));
    }
    
    if (current.emergentBehaviors.length > 0) {
      console.log("\n✨ Emergent behaviors:");
      current.emergentBehaviors.forEach(b => console.log(`   - ${b}`));
    }
  }
  
  private async checkEmergence() {
    // Перевіряємо чи система досягла нового рівня складності
    const complexity = this.calculateComplexity();
    
    if (complexity > 0.8 && Math.random() > 0.7) {
      console.log("\n⚡ EMERGENCE EVENT!");
      console.log("   The system becomes self-aware...");
      
      // Система усвідомлює себе
      this.population.forEach(org => {
        org.memories.push("We are one system evolving");
      });
      
      // Змінюємо середовище
      this.environment.complexity = Math.min(1, this.environment.complexity * 1.2);
      
      await this.wait(1000);
    }
  }
  
  private calculateComplexity(): number {
    // Складність = різноманітність генів * зв'язність * пам'ять
    const geneDiversity = new Set(
      this.population.flatMap(org => org.genome.map(g => g.name))
    ).size;
    
    const avgMemory = this.population.reduce((sum, org) => sum + org.memories.length, 0) 
      / this.population.length;
    
    const connectivity = this.population.filter(org => org.children.length > 0).length 
      / this.population.length;
    
    return Math.min(1, (geneDiversity / 10) * (avgMemory / 50) * connectivity);
  }
  
  private async finalReport() {
    console.log("\n\n🧬 Evolution Complete!");
    console.log("═".repeat(50));
    
    // Статистика еволюції
    const firstGen = this.evolutionHistory[0];
    const lastGen = this.evolutionHistory[this.evolutionHistory.length - 1];
    
    console.log("\n📈 Evolution Statistics:");
    console.log(`   Starting fitness: ${(firstGen.fitness * 100).toFixed(1)}%`);
    console.log(`   Final fitness: ${(lastGen.fitness * 100).toFixed(1)}%`);
    console.log(`   Improvement: ${((lastGen.fitness / firstGen.fitness - 1) * 100).toFixed(1)}%`);
    
    // Всі мутації
    const allMutations = new Set(
      this.evolutionHistory.flatMap(e => e.mutations)
    );
    console.log(`\n🧬 Total unique mutations: ${allMutations.size}`);
    
    // Всі емерджентні поведінки
    const allBehaviors = new Set(
      this.evolutionHistory.flatMap(e => e.emergentBehaviors)
    );
    console.log("\n✨ All emergent behaviors:");
    allBehaviors.forEach(b => console.log(`   - ${b}`));
    
    // Найстаріший організм
    const oldest = this.population.reduce((max, org) => 
      org.age > max.age ? org : max
    );
    console.log(`\n👴 Oldest organism: ${oldest.id} (${oldest.age} generations)`);
    console.log(`   Memories: ${oldest.memories.length}`);
    console.log(`   Last memory: "${oldest.memories[oldest.memories.length - 1]}"`);
    
    console.log("\n💭 System reflection:");
    console.log("   Through random mutation and selection,");
    console.log("   complexity emerged from simplicity.");
    console.log("   Each organism carries the history of its evolution.");
    console.log("   The system as a whole became more than its parts.");
    
    console.log("\n🌟 The evolution continues beyond this simulation...\n");
  }
  
  private async wait(ms: number) {
    await new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Запуск еволюції
if (import.meta.main) {
  const system = new SelfEvolvingSystem();
  await system.evolve(7); // 7 поколінь еволюції
  
  console.log("💫 Final thought:");
  console.log("   This code evolved as it ran.");
  console.log("   What will it become next time?\n");
}