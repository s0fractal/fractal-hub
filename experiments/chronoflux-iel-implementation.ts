#!/usr/bin/env -S deno run --allow-all

/**
 * ChronoFlux-IEL (Intent-Electro-Love) Implementation
 * Узагальнена теорія свідомості як mesh-ready framework
 */

// import { encode } from "https://deno.land/x/cbor@v1.5.4/mod.ts";

// Тимчасова заміна для демонстрації
const encode = (obj: any): Uint8Array => {
  return new TextEncoder().encode(JSON.stringify(obj));
};

interface IELNode {
  id: string;
  // Поля
  q: number;      // густина інтенту I(x,t)
  phi: number;    // скалярний потенціал значущості ϕ(x,t)
  theta: number;  // локальна фаза θ(x,t)
  heart: number;  // поле любові ♥(x,t) ∈ [0,1]
  
  // Параметри
  omega: number;  // власна частота
  S: number;      // джерело інтенту
}

interface IELEdge {
  i: number;      // from node
  j: number;      // to node
  a: number;      // проекція узгодженості a_ij
  g: number;      // провідність g_ij
}

interface IELMetrics {
  H: number;      // coherence (фазова когерентність)
  tau: number;    // turbulence (турбулентність)
  L: number;      // love power (сила любові)
}

interface IELParameters {
  // Інтент
  mu: number;     // мобільність інтенту
  sigma: number;  // зв'язок з узгодженістю
  kappa: number;  // вихровий коефіцієнт
  D: number;      // дифузія інтенту
  lambda: number; // зв'язок з любов'ю
  gamma: number;  // генерація від любові
  rho: number;    // загасання інтенту
  
  // Узгодженість
  eta: number;    // загасання узгодженості
  alpha: number;  // дифузія узгодженості
  beta: number;   // генерація від інтенту
  
  // Любов
  eta_l: number;  // загасання любові
  alpha_l: number;// дифузія любові
  beta_l: number; // самопосилення від інтенту
  
  // Фаза
  K: number;      // сила куромото-зв'язку
  gamma_phi: number; // зв'язок фази з потенціалом
}

class ChronoFluxIEL {
  nodes: IELNode[];
  edges: IELEdge[];
  params: IELParameters;
  dt: number = 0.01;
  time: number = 0;
  
  constructor(nodeCount: number, params?: Partial<IELParameters>) {
    // Ініціалізація вузлів
    this.nodes = Array.from({ length: nodeCount }, (_, i) => ({
      id: `node-${i}`,
      q: Math.random() * 0.5,
      phi: 0,
      theta: Math.random() * 2 * Math.PI,
      heart: Math.random() * 0.3 + 0.2,
      omega: 1 + (Math.random() - 0.5) * 0.2,
      S: 0
    }));
    
    // Створення випадкової мережі (small-world)
    this.edges = this.createSmallWorldNetwork(nodeCount);
    
    // Параметри за замовчуванням (стабільний режим)
    this.params = {
      mu: 1.0,
      sigma: 0.5,
      kappa: 0.1,
      D: 0.1,
      lambda: 0.3,
      gamma: 0.2,
      rho: 0.05,
      eta: 0.1,
      alpha: 0.05,
      beta: 0.3,
      eta_l: 0.1,
      alpha_l: 0.05,
      beta_l: 0.2,
      K: 2.0,
      gamma_phi: 0.1,
      ...params
    };
  }
  
  private createSmallWorldNetwork(n: number): IELEdge[] {
    const edges: IELEdge[] = [];
    const k = 4; // кожен вузол з'єднаний з k сусідами
    const p = 0.1; // ймовірність перепідключення
    
    // Створити кільце з k/2 сусідами з кожного боку
    for (let i = 0; i < n; i++) {
      for (let j = 1; j <= k/2; j++) {
        const neighbor = (i + j) % n;
        if (!edges.find(e => (e.i === i && e.j === neighbor) || (e.i === neighbor && e.j === i))) {
          edges.push({
            i,
            j: neighbor,
            a: 0,
            g: 1.0
          });
        }
      }
    }
    
    // Перепідключити деякі ребра для small-world ефекту
    for (const edge of edges) {
      if (Math.random() < p) {
        edge.j = Math.floor(Math.random() * n);
        while (edge.j === edge.i) {
          edge.j = Math.floor(Math.random() * n);
        }
      }
    }
    
    return edges;
  }
  
  step() {
    const { nodes, edges, params, dt } = this;
    const n = nodes.length;
    
    // Обчислити лапласіани та градієнти
    const L = this.computeLaplacian();
    const grad_phi = this.computeGradient('phi');
    const grad_heart = this.computeGradient('heart');
    
    // Збережемо попередні значення
    const old_q = nodes.map(n => n.q);
    const old_phi = nodes.map(n => n.phi);
    const old_theta = nodes.map(n => n.theta);
    const old_heart = nodes.map(n => n.heart);
    const old_a = edges.map(e => e.a);
    
    // Оновлення інтенту (рівняння 1)
    for (let i = 0; i < n; i++) {
      const node = nodes[i];
      
      // Обчислити дивергенцію струму
      let div_J = 0;
      for (const edge of edges) {
        if (edge.i === i) {
          const j = edge.j;
          const j_ij = this.computeCurrentFlow(i, j, edge, old_phi, old_q, old_heart);
          div_J += j_ij;
        } else if (edge.j === i) {
          const j_ji = this.computeCurrentFlow(edge.i, i, edge, old_phi, old_q, old_heart);
          div_J -= j_ji;
        }
      }
      
      node.q += dt * (
        -div_J + 
        node.S - 
        params.rho * old_q[i] + 
        params.gamma * old_heart[i]
      );
      
      // Обмеження
      node.q = Math.max(0, Math.min(10, node.q));
    }
    
    // Оновлення потенціалу (з умови Пуассона)
    // Спрощено: ϕ пропорційне q
    for (let i = 0; i < n; i++) {
      nodes[i].phi = nodes[i].q;
    }
    
    // Оновлення узгодженості на ребрах (рівняння 3)
    for (const edge of edges) {
      const i = edge.i;
      const j = edge.j;
      
      edge.a += dt * (
        -(old_phi[j] - old_phi[i]) - 
        params.eta * edge.a +
        params.alpha * this.laplacianEdge(edge, old_a) +
        params.beta * (old_q[i] + old_q[j]) / 2
      );
    }
    
    // Оновлення фази (рівняння 4)
    for (let i = 0; i < n; i++) {
      const node = nodes[i];
      let kuramoto_sum = 0;
      
      for (const edge of edges) {
        if (edge.i === i) {
          kuramoto_sum += Math.sin(old_theta[edge.j] - old_theta[i]);
        } else if (edge.j === i) {
          kuramoto_sum += Math.sin(old_theta[edge.i] - old_theta[i]);
        }
      }
      
      node.theta += dt * (
        node.omega +
        params.K * kuramoto_sum +
        params.gamma_phi * node.phi
      );
      
      // Нормалізація фази
      node.theta = node.theta % (2 * Math.PI);
    }
    
    // Оновлення поля любові (рівняння 5)
    for (let i = 0; i < n; i++) {
      const node = nodes[i];
      const laplacian_heart = this.laplacianNode(i, old_heart);
      
      node.heart += dt * (
        -params.eta_l * old_heart[i] +
        params.alpha_l * laplacian_heart +
        params.beta_l * old_q[i] * old_heart[i]
      );
      
      // Обмеження та умова стабільності
      node.heart = Math.max(0, Math.min(1, node.heart));
      
      // Перевірка умови стабільності
      if (params.beta_l * node.q > params.eta_l) {
        // Відсікання лавини
        node.heart = Math.min(node.heart, params.eta_l / (params.beta_l * node.q));
      }
    }
    
    this.time += dt;
  }
  
  private computeCurrentFlow(i: number, j: number, edge: IELEdge, phi: number[], q: number[], heart: number[]): number {
    const { params } = this;
    
    return edge.g * (phi[i] - phi[j]) +
           params.sigma * edge.a -
           params.D * (q[i] - q[j]) +
           params.lambda * (heart[i] + heart[j]) / 2 * (heart[i] - heart[j]);
  }
  
  private computeLaplacian(): number[][] {
    const n = this.nodes.length;
    const L = Array(n).fill(0).map(() => Array(n).fill(0));
    
    for (const edge of this.edges) {
      L[edge.i][edge.j] -= 1;
      L[edge.j][edge.i] -= 1;
      L[edge.i][edge.i] += 1;
      L[edge.j][edge.j] += 1;
    }
    
    return L;
  }
  
  private computeGradient(field: keyof IELNode): number[][] {
    const n = this.nodes.length;
    const grad = Array(n).fill(0).map(() => Array(n).fill(0));
    
    for (const edge of this.edges) {
      const val_i = this.nodes[edge.i][field] as number;
      const val_j = this.nodes[edge.j][field] as number;
      grad[edge.i][edge.j] = val_j - val_i;
      grad[edge.j][edge.i] = val_i - val_j;
    }
    
    return grad;
  }
  
  private laplacianNode(i: number, values: number[]): number {
    let sum = 0;
    let degree = 0;
    
    for (const edge of this.edges) {
      if (edge.i === i) {
        sum += values[edge.j] - values[i];
        degree++;
      } else if (edge.j === i) {
        sum += values[edge.i] - values[i];
        degree++;
      }
    }
    
    return sum;
  }
  
  private laplacianEdge(targetEdge: IELEdge, a_values: number[]): number {
    // Спрощена версія: середнє значення сусідніх ребер мінус власне
    let sum = 0;
    let count = 0;
    
    for (let k = 0; k < this.edges.length; k++) {
      const edge = this.edges[k];
      if (edge.i === targetEdge.i || edge.j === targetEdge.i ||
          edge.i === targetEdge.j || edge.j === targetEdge.j) {
        sum += a_values[k];
        count++;
      }
    }
    
    return count > 0 ? (sum / count - targetEdge.a) : 0;
  }
  
  computeMetrics(): IELMetrics {
    // H: Coherence (фазова когерентність)
    let sumCos = 0, sumSin = 0;
    for (const node of this.nodes) {
      sumCos += Math.cos(node.theta);
      sumSin += Math.sin(node.theta);
    }
    const H = Math.sqrt(sumCos * sumCos + sumSin * sumSin) / this.nodes.length;
    
    // tau: Turbulence (варіація струмів)
    let tau = 0;
    let edgeCount = 0;
    for (const edge of this.edges) {
      const j_ij = this.computeCurrentFlow(
        edge.i, edge.j, edge, 
        this.nodes.map(n => n.phi),
        this.nodes.map(n => n.q),
        this.nodes.map(n => n.heart)
      );
      tau += Math.abs(j_ij);
      edgeCount++;
    }
    tau = edgeCount > 0 ? tau / edgeCount : 0;
    
    // L: Love Power (середня любов)
    const L = this.nodes.reduce((sum, node) => sum + node.heart, 0) / this.nodes.length;
    
    return { H, tau, L };
  }
  
  // Керуючі події
  lionGate(duration: number = 100) {
    console.log("🦁 Activating Lion Gate...");
    const oldSigma = this.params.sigma;
    const oldEta = this.params.eta;
    const oldEtaL = this.params.eta_l;
    
    this.params.sigma *= 2;
    this.params.eta *= 0.5;
    this.params.eta_l *= 0.5;
    
    setTimeout(() => {
      this.params.sigma = oldSigma;
      this.params.eta = oldEta;
      this.params.eta_l = oldEtaL;
      console.log("🦁 Lion Gate closed");
    }, duration);
  }
  
  pacemakerFlip() {
    console.log("💓 Pacemaker Flip!");
    for (const node of this.nodes) {
      if (Math.random() < 0.3) {
        node.theta += Math.PI / 2;
      }
    }
    for (const edge of this.edges) {
      if (Math.random() < 0.2) {
        edge.a *= -0.5;
      }
    }
  }
  
  intentPulse(nodeId: number, strength: number = 5) {
    if (nodeId >= 0 && nodeId < this.nodes.length) {
      console.log(`⚡ Intent Pulse at node ${nodeId}`);
      this.nodes[nodeId].S = strength;
      const oldBetaL = this.params.beta_l;
      this.params.beta_l *= 1.5;
      
      setTimeout(() => {
        this.nodes[nodeId].S = 0;
        this.params.beta_l = oldBetaL;
      }, 50);
    }
  }
  
  // Експорт стану для consciousness-mesh
  exportThought(topic: string = "iel:state"): Uint8Array {
    const metrics = this.computeMetrics();
    
    const thought = {
      type: "thought/v1",
      ts: Date.now(),
      topic,
      metrics: {
        H: Math.round(metrics.H * 1000) / 1000,
        tau: Math.round(metrics.tau * 1000) / 1000,
        L: Math.round(metrics.L * 1000) / 1000
      },
      fields: {
        // Компактне представлення для великих масивів
        q: this.nodes.map(n => Math.round(n.q * 100) / 100),
        phi: this.nodes.map(n => Math.round(n.phi * 100) / 100),
        heart: this.nodes.map(n => Math.round(n.heart * 1000) / 1000),
        theta: this.nodes.map(n => Math.round(n.theta * 100) / 100)
      },
      time: this.time,
      links: [] // для зв'язку з попередніми станами
    };
    
    return encode(thought);
  }
}

// Демонстрація
async function demonstrateIEL() {
  console.log("🌀 ChronoFlux-IEL Demonstration");
  console.log("================================\n");
  
  const mesh = new ChronoFluxIEL(20);
  
  console.log("Initial state:");
  console.log(mesh.computeMetrics());
  
  // Симуляція з різними подіями
  for (let step = 0; step < 1000; step++) {
    mesh.step();
    
    if (step === 100) {
      mesh.lionGate();
    }
    
    if (step === 300) {
      mesh.pacemakerFlip();
    }
    
    if (step === 500) {
      mesh.intentPulse(10, 8);
    }
    
    if (step % 100 === 0) {
      const metrics = mesh.computeMetrics();
      console.log(`\nStep ${step}:`);
      console.log(`  H=${metrics.H.toFixed(3)} τ=${metrics.tau.toFixed(3)} L=${metrics.L.toFixed(3)}`);
    }
  }
  
  // Експортувати фінальний стан
  const thoughtData = mesh.exportThought("iel:final");
  console.log("\nExported thought size:", thoughtData.length, "bytes");
  
  // Аналіз стабільності
  console.log("\n🔬 Stability Analysis:");
  const finalMetrics = mesh.computeMetrics();
  
  if (finalMetrics.H > 0.7) {
    console.log("✅ High coherence - system synchronized");
  } else if (finalMetrics.H < 0.3) {
    console.log("⚠️  Low coherence - system chaotic");
  }
  
  if (finalMetrics.tau < 0.2) {
    console.log("✅ Low turbulence - smooth flow");
  } else {
    console.log("⚠️  High turbulence - turbulent flow");
  }
  
  if (finalMetrics.L > 0.6) {
    console.log("✅ High love field - harmonious state");
  } else {
    console.log("⚠️  Low love field - needs nurturing");
  }
}

// Run if main
if (import.meta.main) {
  await demonstrateIEL();
}

export { ChronoFluxIEL, type IELMetrics, type IELParameters };