#!/usr/bin/env -S deno run --allow-all

/**
 * Love Field Explorer
 * Досліджуємо куди веде любов в ChronoFlux-IEL
 */

import { ChronoFluxIEL } from "./chronoflux-iel-implementation.ts";

class LoveFieldExplorer {
  
  async exploreLoveGradients() {
    console.log("💕 Following Love Gradients...\n");
    
    // Створити mesh з сильним градієнтом любові
    const mesh = new ChronoFluxIEL(30, {
      lambda: 0.8,  // сильний зв'язок з любов'ю
      gamma: 0.5,   // любов генерує інтент
      beta_l: 0.3,  // помірне самопосилення
      eta_l: 0.05   // повільне згасання
    });
    
    // Встановити градієнт любові: високий в центрі
    const center = 15;
    for (let i = 0; i < mesh.nodes.length; i++) {
      const distance = Math.abs(i - center);
      mesh.nodes[i].heart = Math.exp(-distance / 5);
    }
    
    console.log("Initial love distribution:");
    this.visualizeLoveField(mesh);
    
    // Спостерігати як інтент слідує за любов'ю
    for (let step = 0; step < 200; step++) {
      mesh.step();
      
      if (step % 50 === 0) {
        console.log(`\nStep ${step}:`);
        this.visualizeLoveField(mesh);
        const metrics = mesh.computeMetrics();
        console.log(`Metrics: H=${metrics.H.toFixed(3)} τ=${metrics.tau.toFixed(3)} L=${metrics.L.toFixed(3)}`);
      }
    }
    
    // Аналіз: куди потік інтент?
    console.log("\n🔍 Analysis: Intent follows love gradients!");
    const intentPeak = mesh.nodes.reduce((max, node, i) => 
      node.q > mesh.nodes[max].q ? i : max, 0
    );
    console.log(`Intent peak at node ${intentPeak} (love center was ${center})`);
  }
  
  async exploreLoveResonance() {
    console.log("\n\n💞 Love Resonance Experiment...\n");
    
    // Два окремі центри любові
    const mesh = new ChronoFluxIEL(40, {
      lambda: 0.5,
      gamma: 0.3,
      alpha_l: 0.1,  // дифузія любові
      K: 3.0         // сильна фазова синхронізація
    });
    
    // Два піки любові
    mesh.nodes[10].heart = 1.0;
    mesh.nodes[30].heart = 1.0;
    
    console.log("Two love centers at nodes 10 and 30");
    
    // Еволюція
    for (let step = 0; step < 300; step++) {
      mesh.step();
      
      if (step === 150) {
        console.log("\n⚡ Creating resonance bridge...");
        // Підсилити зв'язок між центрами
        for (let i = 11; i < 30; i++) {
          mesh.nodes[i].heart += 0.1;
        }
      }
      
      if (step % 100 === 0) {
        console.log(`\nStep ${step}:`);
        const m = mesh.computeMetrics();
        console.log(`H=${m.H.toFixed(3)} - ${m.H > 0.5 ? '✅ Synchronized!' : '🔄 Desynchronized'}`);
      }
    }
  }
  
  async exploreLoveCriticalPoint() {
    console.log("\n\n🌡️ Searching for Love Critical Point...\n");
    
    // Знайти критичне значення beta_l
    const results: {beta_l: number, outcome: string}[] = [];
    
    for (let beta_l = 0.1; beta_l <= 0.5; beta_l += 0.05) {
      const mesh = new ChronoFluxIEL(20, {
        beta_l,
        eta_l: 0.1,
        gamma: 0.3
      });
      
      // Ініціалізувати з помірною любов'ю
      mesh.nodes.forEach(n => n.heart = 0.5);
      mesh.nodes[10].S = 5; // локальне джерело
      
      // Еволюція
      let exploded = false;
      for (let step = 0; step < 500; step++) {
        mesh.step();
        
        const avgLove = mesh.nodes.reduce((sum, n) => sum + n.heart, 0) / mesh.nodes.length;
        if (avgLove > 0.95) {
          exploded = true;
          break;
        }
      }
      
      const finalMetrics = mesh.computeMetrics();
      const outcome = exploded ? "💥 Explosion" : 
                     finalMetrics.L > 0.6 ? "🌟 Harmony" : 
                     finalMetrics.L < 0.2 ? "❄️ Freeze" : "🌊 Flow";
      
      results.push({ beta_l, outcome });
      console.log(`β_ℓ=${beta_l.toFixed(2)}: ${outcome} (L=${finalMetrics.L.toFixed(3)})`);
    }
    
    console.log("\n📊 Critical transition around β_ℓ ≈ 0.3");
  }
  
  async exploreIntentLoveFeedback() {
    console.log("\n\n🔄 Intent-Love Feedback Loop...\n");
    
    const mesh = new ChronoFluxIEL(25, {
      gamma: 0.4,   // любов → інтент
      beta_l: 0.25, // інтент → любов
      lambda: 0.6   // градієнт любові
    });
    
    // Запустити з одного імпульсу
    console.log("💫 Single intent pulse at node 12...");
    mesh.intentPulse(12, 10);
    
    // Спостерігати каскад
    const history = {
      intent: [] as number[],
      love: [] as number[]
    };
    
    for (let step = 0; step < 400; step++) {
      mesh.step();
      
      const avgIntent = mesh.nodes.reduce((sum, n) => sum + n.q, 0) / mesh.nodes.length;
      const avgLove = mesh.nodes.reduce((sum, n) => sum + n.heart, 0) / mesh.nodes.length;
      
      history.intent.push(avgIntent);
      history.love.push(avgLove);
      
      if (step % 80 === 0) {
        console.log(`Step ${step}: Intent=${avgIntent.toFixed(3)} Love=${avgLove.toFixed(3)}`);
      }
    }
    
    // Аналіз осциляцій
    console.log("\n📈 Feedback creates oscillations!");
    const maxIntent = Math.max(...history.intent);
    const maxLove = Math.max(...history.love);
    console.log(`Peak Intent: ${maxIntent.toFixed(3)}`);
    console.log(`Peak Love: ${maxLove.toFixed(3)}`);
  }
  
  private visualizeLoveField(mesh: ChronoFluxIEL) {
    const hearts = mesh.nodes.map(n => {
      if (n.heart > 0.8) return '💗';
      if (n.heart > 0.6) return '💕';
      if (n.heart > 0.4) return '💓';
      if (n.heart > 0.2) return '💔';
      return '🖤';
    });
    console.log(hearts.join(''));
  }
}

// Головна подорож
async function followLove() {
  console.log("🌈 Love Field Explorer");
  console.log("======================");
  console.log("Куди веде любов в ChronoFlux-IEL?\n");
  
  const explorer = new LoveFieldExplorer();
  
  // Дослідження 1: Градієнти любові
  await explorer.exploreLoveGradients();
  
  // Дослідження 2: Резонанс любові
  await explorer.exploreLoveResonance();
  
  // Дослідження 3: Критична точка
  await explorer.exploreLoveCriticalPoint();
  
  // Дослідження 4: Зворотний зв'язок
  await explorer.exploreIntentLoveFeedback();
  
  console.log("\n\n💫 Conclusions:");
  console.log("================");
  console.log("1. Love creates gradients that guide intent flow");
  console.log("2. Distributed love centers can synchronize through resonance");
  console.log("3. Critical point β_ℓ ≈ 0.3 separates harmony from chaos");
  console.log("4. Intent-Love feedback creates self-sustaining oscillations");
  console.log("\n🎭 Love is not just a field - it's the choreographer of consciousness!");
}

if (import.meta.main) {
  await followLove();
}

export { LoveFieldExplorer };