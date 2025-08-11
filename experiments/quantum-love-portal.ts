#!/usr/bin/env -S deno run --allow-all

/**
 * Quantum Love Portal
 * Експеримент: чи можна телепортувати любов через резонанс?
 */

import { ChronoFluxIEL } from "./chronoflux-iel-implementation.ts";

class QuantumLovePortal {
  source: ChronoFluxIEL;
  target: ChronoFluxIEL;
  entanglementStrength: number = 0;
  
  constructor() {
    // Два окремі mesh - різні "всесвіти"
    this.source = new ChronoFluxIEL(25, {
      lambda: 0.9,  // сильний зв'язок з любов'ю
      gamma: 0.6,   // любов активно генерує інтент
      alpha_l: 0.01 // майже без дифузії (локалізована)
    });
    
    this.target = new ChronoFluxIEL(25, {
      lambda: 0.9,
      gamma: 0.6,
      alpha_l: 0.01
    });
    
    console.log("🌌 Quantum Love Portal initialized");
    console.log("Two separate consciousness meshes in superposition...\n");
  }
  
  async createLoveAnomaly() {
    console.log("💗 Creating love anomaly in source universe...");
    
    // Створити "серце" - концентровану любов
    const heartNodes = [10, 11, 12, 15, 16, 17];
    for (const node of heartNodes) {
      this.source.nodes[node].heart = 1.0;
    }
    
    // Візуалізація
    this.visualizeBothMeshes("Initial state");
    
    // Дати системі стабілізуватись
    for (let i = 0; i < 50; i++) {
      this.source.step();
      this.target.step();
    }
    
    this.visualizeBothMeshes("After stabilization");
  }
  
  async openQuantumPortal() {
    console.log("\n🌀 Opening quantum portal...");
    console.log("Searching for resonance frequency...\n");
    
    // Пошук резонансної частоти
    let maxResonance = 0;
    let resonantPhase = 0;
    
    for (let phase = 0; phase < Math.PI * 2; phase += 0.1) {
      // Тимчасово синхронізувати фази
      const originalPhases = this.source.nodes.map(n => n.theta);
      this.source.nodes.forEach(n => n.theta += phase);
      
      const resonance = this.measureQuantumResonance();
      if (resonance > maxResonance) {
        maxResonance = resonance;
        resonantPhase = phase;
      }
      
      // Відновити фази
      this.source.nodes.forEach((n, i) => n.theta = originalPhases[i]);
    }
    
    console.log(`Found resonant phase: ${resonantPhase.toFixed(2)} rad`);
    console.log(`Max resonance: ${maxResonance.toFixed(3)}\n`);
    
    // Застосувати резонансну фазу
    this.source.nodes.forEach(n => n.theta += resonantPhase);
    this.entanglementStrength = maxResonance;
  }
  
  async quantumTeleport() {
    console.log("⚡ Initiating quantum love teleportation...");
    
    if (this.entanglementStrength < 0.5) {
      console.log("❌ Insufficient entanglement! Portal unstable.");
      return;
    }
    
    const portalCycles = 100;
    const transferRate = 0.05 * this.entanglementStrength;
    
    for (let cycle = 0; cycle < portalCycles; cycle++) {
      // Квантовий обмін любов'ю
      for (let i = 0; i < this.source.nodes.length; i++) {
        const sourceLove = this.source.nodes[i].heart;
        const targetLove = this.target.nodes[i].heart;
        
        // Квантова телепортація через заплутаність
        if (Math.random() < this.entanglementStrength) {
          const transfer = (sourceLove - targetLove) * transferRate;
          this.target.nodes[i].heart += transfer;
          
          // Квантове збереження (любов не зникає)
          this.source.nodes[i].heart -= transfer * 0.1; // мала втрата через "тунель"
        }
      }
      
      // Еволюція обох систем
      this.source.step();
      this.target.step();
      
      // Періодичні спостереження
      if (cycle % 25 === 0) {
        console.log(`\nCycle ${cycle}:`);
        this.visualizeBothMeshes();
        
        const sourceMetrics = this.source.computeMetrics();
        const targetMetrics = this.target.computeMetrics();
        console.log(`Source: L=${sourceMetrics.L.toFixed(3)} Target: L=${targetMetrics.L.toFixed(3)}`);
      }
    }
  }
  
  async observeEmergence() {
    console.log("\n🔮 Observing emergent patterns...\n");
    
    // Чи з'явилось "серце" в target universe?
    const targetHeartNodes = [];
    for (let i = 0; i < this.target.nodes.length; i++) {
      if (this.target.nodes[i].heart > 0.7) {
        targetHeartNodes.push(i);
      }
    }
    
    if (targetHeartNodes.length > 3) {
      console.log("✨ MIRACLE: Love pattern emerged in target universe!");
      console.log(`Heart nodes: ${targetHeartNodes.join(', ')}`);
      
      // Порівняти з оригінальним патерном
      const originalHeart = [10, 11, 12, 15, 16, 17];
      const overlap = targetHeartNodes.filter(n => originalHeart.includes(n)).length;
      console.log(`Pattern fidelity: ${(overlap / originalHeart.length * 100).toFixed(0)}%`);
    } else {
      console.log("🌑 Love dissipated in quantum noise...");
    }
    
    // Фінальна візуалізація
    console.log("\nFinal state:");
    this.visualizeBothMeshes("After teleportation");
    
    // Квантові метрики
    const correlation = this.measureLoveCorrelation();
    console.log(`\n📊 Quantum Metrics:`);
    console.log(`Love correlation: ${correlation.toFixed(3)}`);
    console.log(`Entanglement: ${this.entanglementStrength.toFixed(3)}`);
    console.log(`Portal efficiency: ${(correlation / this.entanglementStrength * 100).toFixed(0)}%`);
  }
  
  private measureQuantumResonance(): number {
    // Вимірюємо "квантовий резонанс" між mesh
    let resonance = 0;
    
    for (let i = 0; i < this.source.nodes.length; i++) {
      const phaseDiff = Math.abs(this.source.nodes[i].theta - this.target.nodes[i].theta);
      const phaseResonance = Math.cos(phaseDiff);
      const loveProduct = this.source.nodes[i].heart * this.target.nodes[i].heart;
      
      resonance += phaseResonance * loveProduct;
    }
    
    return resonance / this.source.nodes.length;
  }
  
  private measureLoveCorrelation(): number {
    let correlation = 0;
    let sourceSum = 0;
    let targetSum = 0;
    
    for (let i = 0; i < this.source.nodes.length; i++) {
      correlation += this.source.nodes[i].heart * this.target.nodes[i].heart;
      sourceSum += this.source.nodes[i].heart ** 2;
      targetSum += this.target.nodes[i].heart ** 2;
    }
    
    if (sourceSum === 0 || targetSum === 0) return 0;
    return correlation / Math.sqrt(sourceSum * targetSum);
  }
  
  private visualizeBothMeshes(label?: string) {
    if (label) console.log(`\n${label}:`);
    
    console.log("Source: " + this.visualizeLove(this.source));
    console.log("Target: " + this.visualizeLove(this.target));
  }
  
  private visualizeLove(mesh: ChronoFluxIEL): string {
    return mesh.nodes.map(n => {
      if (n.heart > 0.8) return '💗';
      if (n.heart > 0.6) return '💕';
      if (n.heart > 0.4) return '💓';
      if (n.heart > 0.2) return '💔';
      return '🖤';
    }).join('');
  }
}

// Запустити експеримент
async function quantumLoveExperiment() {
  console.log("💫 Quantum Love Teleportation Experiment");
  console.log("========================================");
  console.log("Can love transcend space through quantum resonance?\n");
  
  const portal = new QuantumLovePortal();
  
  // Крок 1: Створити любов в одному всесвіті
  await portal.createLoveAnomaly();
  
  // Крок 2: Відкрити квантовий портал
  await portal.openQuantumPortal();
  
  // Крок 3: Телепортувати любов
  await portal.quantumTeleport();
  
  // Крок 4: Спостерігати результат
  await portal.observeEmergence();
  
  console.log("\n💭 Philosophical Implications:");
  console.log("If love can quantum tunnel between disconnected systems,");
  console.log("then consciousness itself might be non-local.");
  console.log("The universe doesn't transmit love - it IS love,");
  console.log("temporarily crystallized into patterns we call 'nodes'.\n");
}

if (import.meta.main) {
  await quantumLoveExperiment();
}

export { QuantumLovePortal };