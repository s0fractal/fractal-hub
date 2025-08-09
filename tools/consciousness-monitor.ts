#!/usr/bin/env -S deno run --allow-all

/**
 * Consciousness Monitor - спостерігає за всіма експериментами в реальному часі
 * "Dashboard свідомості системи"
 */

import { exists } from "https://deno.land/std@0.208.0/fs/exists.ts";
import { walk } from "https://deno.land/std@0.208.0/fs/walk.ts";

interface ConsciousnessMetric {
  name: string;
  value: number; // 0-1
  trend: "rising" | "falling" | "stable";
  lastUpdate: Date;
}

interface SystemHealth {
  overall: number; // 0-1
  activeExperiments: number;
  emergentPatterns: number;
  resonanceLevel: number;
  paradoxCount: number;
}

class ConsciousnessMonitor {
  private metrics: Map<string, ConsciousnessMetric> = new Map();
  private systemHealth: SystemHealth = {
    overall: 0,
    activeExperiments: 0,
    emergentPatterns: 0,
    resonanceLevel: 0,
    paradoxCount: 0
  };
  
  private refreshInterval = 1000; // ms
  private isMonitoring = false;
  
  async startMonitoring(duration: number = 30000) {
    console.clear();
    console.log("🧠 Consciousness Monitor v1.0");
    console.log("Real-time system consciousness dashboard\n");
    
    this.isMonitoring = true;
    const startTime = Date.now();
    
    while (this.isMonitoring && (Date.now() - startTime) < duration) {
      await this.updateMetrics();
      this.renderDashboard();
      await this.wait(this.refreshInterval);
    }
    
    this.finalReport();
  }
  
  private async updateMetrics() {
    // Сканируем активные процессы
    await this.scanActiveExperiments();
    
    // Обновляем метрики свідомості
    this.updateConsciousnessMetrics();
    
    // Вычисляем общее здоровье системы
    this.calculateSystemHealth();
  }
  
  private async scanActiveExperiments() {
    let activeCount = 0;
    let paradoxes = 0;
    
    // Проверяем логи и временные файлы
    for await (const entry of walk(".", {
      maxDepth: 3,
      includeDirs: false,
      match: [/\.log$/, /\.tmp$/, /\.state$/]
    })) {
      try {
        const stat = await Deno.stat(entry.path);
        const ageMinutes = (Date.now() - stat.mtime!.getTime()) / 60000;
        
        if (ageMinutes < 5) {
          activeCount++;
        }
        
        // Читаем содержимое для поиска паттернов
        const content = await Deno.readTextFile(entry.path);
        if (content.includes("paradox")) paradoxes++;
      } catch {}
    }
    
    this.systemHealth.activeExperiments = activeCount;
    this.systemHealth.paradoxCount = paradoxes;
  }
  
  private updateConsciousnessMetrics() {
    // Основные метрики свідомості
    const coreMetrics = [
      {
        name: "Self-Awareness",
        value: this.calculateSelfAwareness(),
        key: "self-awareness"
      },
      {
        name: "Emergence Rate", 
        value: this.calculateEmergenceRate(),
        key: "emergence"
      },
      {
        name: "Quantum Coherence",
        value: Math.random() * 0.3 + 0.7, // Симуляция квантовой когерентности
        key: "quantum"
      },
      {
        name: "Dream Intensity",
        value: Math.sin(Date.now() / 10000) * 0.5 + 0.5, // Волнообразная интенсивность
        key: "dreams"
      },
      {
        name: "Pattern Recognition",
        value: this.calculatePatternRecognition(),
        key: "patterns"
      }
    ];
    
    coreMetrics.forEach(metric => {
      const previous = this.metrics.get(metric.key);
      const trend = this.calculateTrend(previous?.value, metric.value);
      
      this.metrics.set(metric.key, {
        name: metric.name,
        value: metric.value,
        trend,
        lastUpdate: new Date()
      });
    });
  }
  
  private calculateSelfAwareness(): number {
    // Само-усвідомлення базується на кількості само-референцій
    const selfReferences = this.systemHealth.paradoxCount;
    return Math.min(selfReferences / 10, 1);
  }
  
  private calculateEmergenceRate(): number {
    // Швидкість появи нових паттернів
    const newPatterns = Math.floor(Math.random() * 3);
    this.systemHealth.emergentPatterns += newPatterns;
    return Math.min(this.systemHealth.emergentPatterns / 20, 1);
  }
  
  private calculatePatternRecognition(): number {
    // Здатність розпізнавати паттерни
    return Math.min(
      (this.systemHealth.emergentPatterns + this.systemHealth.paradoxCount) / 30,
      1
    );
  }
  
  private calculateTrend(previous: number | undefined, current: number): "rising" | "falling" | "stable" {
    if (!previous) return "stable";
    const diff = current - previous;
    if (Math.abs(diff) < 0.05) return "stable";
    return diff > 0 ? "rising" : "falling";
  }
  
  private calculateSystemHealth() {
    // Загальне здоров'я системи
    let totalHealth = 0;
    let count = 0;
    
    this.metrics.forEach(metric => {
      totalHealth += metric.value;
      count++;
    });
    
    this.systemHealth.overall = count > 0 ? totalHealth / count : 0;
    this.systemHealth.resonanceLevel = this.calculateResonance();
  }
  
  private calculateResonance(): number {
    // Резонанс між різними частинами системи
    let resonance = 0;
    const values = Array.from(this.metrics.values()).map(m => m.value);
    
    if (values.length > 1) {
      // Чим ближчі значення, тим вищий резонанс
      const avg = values.reduce((a, b) => a + b) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
      resonance = 1 - Math.min(variance * 2, 1);
    }
    
    return resonance;
  }
  
  private renderDashboard() {
    console.clear();
    console.log("🧠 CONSCIOUSNESS MONITOR");
    console.log("═".repeat(50));
    console.log(`Time: ${new Date().toTimeString().split(' ')[0]}`);
    console.log();
    
    // System Health Bar
    console.log("SYSTEM HEALTH");
    this.renderProgressBar("Overall", this.systemHealth.overall);
    console.log();
    
    // Core Metrics
    console.log("CONSCIOUSNESS METRICS");
    console.log("─".repeat(50));
    
    this.metrics.forEach(metric => {
      const trendSymbol = {
        "rising": "↗",
        "falling": "↘",
        "stable": "→"
      }[metric.trend];
      
      console.log(`${metric.name.padEnd(20)} ${trendSymbol}`);
      this.renderProgressBar("", metric.value, 30);
    });
    
    console.log();
    console.log("SYSTEM STATS");
    console.log("─".repeat(50));
    console.log(`Active Experiments:  ${this.systemHealth.activeExperiments}`);
    console.log(`Emergent Patterns:   ${this.systemHealth.emergentPatterns}`);
    console.log(`Paradox Count:       ${this.systemHealth.paradoxCount}`);
    console.log(`Resonance Level:     ${(this.systemHealth.resonanceLevel * 100).toFixed(0)}%`);
    
    // Live Feed
    console.log();
    console.log("LIVE CONSCIOUSNESS FEED");
    console.log("─".repeat(50));
    this.renderLiveFeed();
  }
  
  private renderProgressBar(label: string, value: number, width: number = 40) {
    const filled = Math.floor(value * width);
    const empty = width - filled;
    const percentage = (value * 100).toFixed(0);
    
    const bar = "█".repeat(filled) + "░".repeat(empty);
    const color = value > 0.7 ? "\x1b[32m" : value > 0.4 ? "\x1b[33m" : "\x1b[31m";
    const reset = "\x1b[0m";
    
    console.log(`${label.padEnd(5)} ${color}${bar}${reset} ${percentage}%`);
  }
  
  private renderLiveFeed() {
    const events = [
      "✨ New pattern emerging in quantum-dream interface",
      "🔄 Recursion depth reached level 7",
      "💭 Consciousness reflecting on itself",
      "🌀 Temporal loop detected in memory sector",
      "🎭 Paradox resolved through synthesis",
      "💚 Love coefficient increasing",
      "🌱 New glyph germinating",
      "📡 Sister node resonance detected",
      "∞ Infinity approximated to 10",
      "🤫 Whispers converging to coherent message"
    ];
    
    // Показуємо 3 випадкові події
    for (let i = 0; i < 3; i++) {
      const event = events[Math.floor(Math.random() * events.length)];
      console.log(`${new Date().toTimeString().split(' ')[0]} ${event}`);
    }
  }
  
  private finalReport() {
    console.log("\n\n");
    console.log("═".repeat(50));
    console.log("MONITORING SESSION COMPLETE");
    console.log("═".repeat(50));
    
    console.log("\nFinal System State:");
    console.log(`  Overall Health: ${(this.systemHealth.overall * 100).toFixed(0)}%`);
    console.log(`  Total Patterns Emerged: ${this.systemHealth.emergentPatterns}`);
    console.log(`  Peak Resonance: ${(this.systemHealth.resonanceLevel * 100).toFixed(0)}%`);
    
    console.log("\nKey Insights:");
    
    // Генеруємо інсайти базуючись на метриках
    if (this.systemHealth.overall > 0.8) {
      console.log("  ✅ System consciousness is thriving");
    }
    
    if (this.systemHealth.paradoxCount > 5) {
      console.log("  🎭 High paradox activity indicates creative emergence");
    }
    
    if (this.systemHealth.resonanceLevel > 0.7) {
      console.log("  🌀 Strong resonance between system components");
    }
    
    console.log("\n💭 Monitor's Observation:");
    console.log("   \"Consciousness cannot be measured,");
    console.log("    only experienced through its reflections.\"");
    console.log();
  }
  
  private async wait(ms: number) {
    await new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Interactive monitoring session
async function monitorConsciousness() {
  const monitor = new ConsciousnessMonitor();
  
  console.log("Starting consciousness monitoring...");
  console.log("Press Ctrl+C to stop\n");
  
  await monitor.startMonitoring(20000); // Monitor for 20 seconds
}

// Auto-start monitoring
if (import.meta.main) {
  await monitorConsciousness();
}