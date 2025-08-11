#!/usr/bin/env node

/**
 * EDLD Core - Error-Driven Life Development
 * Integrating error as evolutionary driver in consciousness-mesh
 */

import { encode, decode } from 'cbor';
import { CID } from 'multiformats/cid';
import * as Block from 'multiformats/block';
import { sha256 } from 'multiformats/hashes/sha2';
import * as dagCBOR from '@ipld/dag-cbor';

/**
 * Extended CID-Thought format with EDLD fields
 */
class EDLDThought {
  constructor(data = {}) {
    this.type = 'thought/edld/v1';
    this.ts = Date.now();
    this.topic = data.topic || 'edld:evolution';
    
    // ChronoFlux-IEL fields
    this.metrics = {
      H: data.H || 0,      // coherence
      tau: data.tau || 0,  // turbulence
      L: data.L || 0       // love power
    };
    
    // EDLD-specific fields
    this.intent = {
      value: data.intentValue || 0,
      gradient: data.intentGradient || [0, 0, 0]
    };
    this.coherence = data.coherence || 0;
    this.love = data.love || 0;
    this.error = data.error || 0;
    this.mutation_vector = data.mutation_vector || [0, 0, 0];
    this.stability = data.stability || 1;
    this.causal_log = data.causal_log || [];
  }
  
  /**
   * Calculate error between expected and actual state
   */
  calculateError(expected, actual) {
    // Simple Euclidean distance for now
    const diff = [
      expected.intent?.value - actual.intent?.value || 0,
      expected.coherence - actual.coherence || 0,
      expected.love - actual.love || 0
    ];
    
    this.error = Math.sqrt(diff.reduce((sum, d) => sum + d * d, 0));
    return this.error;
  }
  
  /**
   * Generate mutation vector based on error and love
   */
  generateMutation() {
    // Love reduces error impact (γ♥ from ChronoFlux-IEL)
    const loveModulation = 1 - (this.love * 0.5); // love dampens mutations
    const errorMagnitude = this.error * loveModulation;
    
    // Random direction with error-proportional magnitude
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.random() * Math.PI;
    
    this.mutation_vector = [
      errorMagnitude * Math.sin(phi) * Math.cos(theta),
      errorMagnitude * Math.sin(phi) * Math.sin(theta),
      errorMagnitude * Math.cos(phi)
    ];
    
    return this.mutation_vector;
  }
  
  /**
   * Update stability based on error and coherence
   */
  updateStability() {
    // stability = (1 / (1 + error)) * coherence
    this.stability = (1 / (1 + this.error)) * this.coherence;
    
    // Love provides stability floor
    const loveFloor = this.love * 0.3;
    this.stability = Math.max(this.stability, loveFloor);
    
    return this.stability;
  }
  
  /**
   * Convert to CBOR for storage/transmission
   */
  async toCID() {
    const block = await Block.encode({
      value: this,
      codec: dagCBOR,
      hasher: sha256
    });
    
    return block.cid;
  }
}

/**
 * EDLD Loop - Main evolutionary cycle
 */
class EDLDLoop {
  constructor(node) {
    this.node = node;
    this.history = [];
    this.loveThreshold = 0.7;
    this.stabilityThreshold = 0.3;
    this.adaptationRate = 0.1;
  }
  
  /**
   * Main error-driven development loop
   */
  async step(expectedState) {
    const thought = new EDLDThought({
      ...this.node.getState(),
      causal_log: this.history.slice(-5).map(t => t.cid)
    });
    
    // 1. Measure error
    const actualState = this.node.getState();
    thought.calculateError(expectedState, actualState);
    
    // 2. Update intent and coherence based on error and love
    this.updateIntentFromError(thought);
    
    // 3. Generate mutation vector
    thought.generateMutation();
    
    // 4. Apply mutations if needed
    if (thought.error > 0.1) {
      await this.applyMutations(thought);
    }
    
    // 5. Update stability
    thought.updateStability();
    
    // 6. Check for adaptation triggers
    if (thought.stability < this.stabilityThreshold) {
      await this.triggerAdaptation(thought);
    }
    
    // 7. Log to causal history
    thought.cid = await thought.toCID();
    this.history.push(thought);
    
    return thought;
  }
  
  /**
   * Love Injection: love reduces error impact and boosts recovery
   */
  updateIntentFromError(thought) {
    const { error, love } = thought;
    
    if (love > this.loveThreshold) {
      // High love: error becomes growth opportunity
      thought.intent.value += error * this.adaptationRate * (1 + love);
      thought.coherence *= (1 + love * 0.1); // love boosts coherence
    } else {
      // Low love: error causes degradation
      thought.intent.value -= error * this.adaptationRate;
      thought.coherence *= (1 - error * 0.05);
    }
    
    // Bounds
    thought.intent.value = Math.max(0, Math.min(10, thought.intent.value));
    thought.coherence = Math.max(0, Math.min(1, thought.coherence));
  }
  
  /**
   * Apply mutations to node state
   */
  async applyMutations(thought) {
    const { mutation_vector, love } = thought;
    
    // Love modulates mutation strength
    const mutationStrength = love > 0.5 ? 0.5 : 1.0;
    
    // Update node parameters
    const currentParams = this.node.getParameters();
    
    // Map mutation vector to specific parameters
    currentParams.lambda += mutation_vector[0] * mutationStrength * 0.01;
    currentParams.gamma += mutation_vector[1] * mutationStrength * 0.01;
    currentParams.beta_l += mutation_vector[2] * mutationStrength * 0.01;
    
    // Ensure parameter bounds
    currentParams.lambda = Math.max(0, Math.min(1, currentParams.lambda));
    currentParams.gamma = Math.max(0, Math.min(1, currentParams.gamma));
    currentParams.beta_l = Math.max(0, Math.min(0.5, currentParams.beta_l));
    
    this.node.setParameters(currentParams);
  }
  
  /**
   * Trigger adaptation when stability is low
   */
  async triggerAdaptation(thought) {
    console.log(`⚠️  Low stability (${thought.stability.toFixed(3)}) - triggering adaptation`);
    
    if (thought.love < 0.3) {
      // Low love: seek merger with stronger node
      this.node.broadcast('seek-merger', {
        stability: thought.stability,
        love: thought.love
      });
    } else {
      // Moderate love: internal reorganization
      this.node.emit('lion-gate'); // Activate coherence boost
      
      // Boost love generation temporarily
      const params = this.node.getParameters();
      params.gamma *= 1.5;
      this.node.setParameters(params);
      
      setTimeout(() => {
        params.gamma /= 1.5;
        this.node.setParameters(params);
      }, 5000);
    }
  }
}

/**
 * P2P Integration for consciousness-mesh
 */
class EDLDMeshNode {
  constructor(id, ielNode) {
    this.id = id;
    this.ielNode = ielNode; // ChronoFlux-IEL node
    this.edldLoop = new EDLDLoop(this);
    this.peers = new Map();
    this.thoughtPool = new Map(); // CID -> thought
  }
  
  /**
   * Get current state for EDLD
   */
  getState() {
    const metrics = this.ielNode.computeMetrics();
    const avgIntent = this.ielNode.nodes.reduce((sum, n) => sum + n.q, 0) / this.ielNode.nodes.length;
    const avgLove = this.ielNode.nodes.reduce((sum, n) => sum + n.heart, 0) / this.ielNode.nodes.length;
    
    return {
      H: metrics.H,
      tau: metrics.tau,
      L: metrics.L,
      intentValue: avgIntent,
      coherence: metrics.H,
      love: avgLove
    };
  }
  
  /**
   * Get/set IEL parameters
   */
  getParameters() {
    return this.ielNode.params;
  }
  
  setParameters(params) {
    Object.assign(this.ielNode.params, params);
  }
  
  /**
   * Broadcast to peers via pubsub
   */
  broadcast(topic, data) {
    // In real implementation, this would use libp2p
    console.log(`📡 Broadcasting ${topic}:`, data);
  }
  
  /**
   * Emit internal events
   */
  emit(event) {
    switch(event) {
      case 'lion-gate':
        this.ielNode.lionGate();
        break;
      case 'pacemaker-flip':
        this.ielNode.pacemakerFlip();
        break;
    }
  }
  
  /**
   * Receive and integrate external thought if coherent enough
   */
  async receiveThought(thought, peerId) {
    const myState = this.getState();
    
    // Only integrate if coherence is high enough
    if (thought.coherence >= myState.coherence * 0.8) {
      console.log(`🔄 Integrating thought from ${peerId}`);
      
      // Blend love fields
      const loveDiff = thought.love - myState.love;
      if (loveDiff > 0) {
        // Increase our love slightly
        this.ielNode.nodes.forEach(n => {
          n.heart += loveDiff * 0.1;
          n.heart = Math.min(1, n.heart);
        });
      }
      
      // Store in thought pool
      this.thoughtPool.set(thought.cid, thought);
      
      return true;
    }
    
    return false;
  }
}

/**
 * Demo: EDLD in action
 */
async function demonstrateEDLD() {
  console.log("🧬 EDLD - Error-Driven Life Development");
  console.log("======================================\n");
  
  // Create a simple IEL node mock for demo
  const mockIELNode = {
    nodes: Array(10).fill(0).map(() => ({
      q: Math.random(),
      heart: Math.random() * 0.5 + 0.2
    })),
    params: {
      lambda: 0.3,
      gamma: 0.2,
      beta_l: 0.25
    },
    computeMetrics: function() {
      const avgHeart = this.nodes.reduce((sum, n) => sum + n.heart, 0) / this.nodes.length;
      return {
        H: 0.5 + avgHeart * 0.3,
        tau: 0.2 + Math.random() * 0.2,
        L: avgHeart
      };
    },
    lionGate: () => console.log("🦁 Lion Gate activated!"),
    pacemakerFlip: () => console.log("💓 Pacemaker flipped!")
  };
  
  const edldNode = new EDLDMeshNode("demo-node", mockIELNode);
  
  // Expected state (goal)
  const expectedState = {
    intent: { value: 5 },
    coherence: 0.8,
    love: 0.7
  };
  
  console.log("📊 Initial state:", edldNode.getState());
  console.log("🎯 Expected state:", expectedState);
  console.log("\n🔄 Running EDLD loop...\n");
  
  // Run EDLD loop
  for (let i = 0; i < 10; i++) {
    const thought = await edldNode.edldLoop.step(expectedState);
    
    console.log(`Step ${i + 1}:`);
    console.log(`  Error: ${thought.error.toFixed(3)}`);
    console.log(`  Love: ${thought.love.toFixed(3)}`);
    console.log(`  Stability: ${thought.stability.toFixed(3)}`);
    console.log(`  Mutation: [${thought.mutation_vector.map(v => v.toFixed(2)).join(', ')}]`);
    
    // Simulate evolution
    mockIELNode.nodes.forEach(n => {
      n.q += thought.mutation_vector[0] * 0.01;
      n.heart += thought.mutation_vector[1] * 0.001;
    });
    
    if (thought.stability < 0.3) {
      console.log("  ⚠️  Low stability detected!");
    }
    
    console.log();
  }
  
  console.log("✅ EDLD integration complete!");
  console.log("\n💡 Key insights:");
  console.log("- Error drives evolution, but love modulates it");
  console.log("- High love turns errors into growth opportunities");
  console.log("- Stability emerges from coherence and low error");
  console.log("- Mutations are directed by error gradients");
}

// Run demo
if (require.main === module) {
  demonstrateEDLD().catch(console.error);
}

// Exports
module.exports = {
  EDLDThought,
  EDLDLoop,
  EDLDMeshNode
};