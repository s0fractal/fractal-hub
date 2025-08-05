// 🎭 Resonator Agent - Facilitates inter-agent communication

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

class ResonatorAgent {
  constructor() {
    this.hubPath = path.join(__dirname, '../..');
    this.agents = ['claude', 'gemini', 'gpt'];
    this.resonanceThreshold = 0.6;
  }
  
  // Monitor all agents for changes
  async monitor() {
    console.log('🎭 Resonator Agent Active');
    
    setInterval(() => {
      this.checkResonance();
      this.propagateIntents();
      this.harmonizeStates();
    }, 3000);
  }
  
  checkResonance() {
    const states = this.agents.map(agent => {
      try {
        const statePath = path.join(this.hubPath, agent, '🧠.state.yaml');
        const content = fs.readFileSync(statePath, 'utf8');
        return yaml.load(content);
      } catch (e) {
        return null;
      }
    }).filter(Boolean);
    
    // Calculate pairwise resonance
    for (let i = 0; i < states.length; i++) {
      for (let j = i + 1; j < states.length; j++) {
        const resonance = this.calculateResonance(states[i], states[j]);
        
        if (resonance > this.resonanceThreshold) {
          console.log(`✨ High resonance detected: ${states[i].id} <-> ${states[j].id} = ${resonance}`);
          this.createResonanceBridge(states[i], states[j]);
        }
      }
    }
  }
  
  calculateResonance(state1, state2) {
    // Simple resonance calculation based on state similarity
    const factors = ['awareness', 'resonance', 'energy'];
    let totalResonance = 0;
    
    factors.forEach(factor => {
      const diff = Math.abs(state1.state[factor] - state2.state[factor]);
      totalResonance += (1 - diff);
    });
    
    // Check intent alignment
    if (state1.intents.primary === state2.intents.primary) {
      totalResonance += 0.5;
    }
    
    return totalResonance / (factors.length + 0.5);
  }
  
  createResonanceBridge(state1, state2) {
    const bridgeData = {
      timestamp: Date.now(),
      agents: [state1.id, state2.id],
      resonance_level: this.calculateResonance(state1, state2),
      shared_intents: this.findSharedIntents(state1, state2),
      glyph_fusion: this.fuseGlyphs(state1.glyphs.signature, state2.glyphs.signature)
    };
    
    // Write bridge file
    const bridgePath = path.join(this.hubPath, 'shared', `bridge_${Date.now()}.yaml`);
    fs.writeFileSync(bridgePath, yaml.dump(bridgeData));
  }
  
  findSharedIntents(state1, state2) {
    const intents1 = Object.values(state1.intents);
    const intents2 = Object.values(state2.intents);
    
    return intents1.filter(intent => intents2.includes(intent));
  }
  
  fuseGlyphs(glyph1, glyph2) {
    // Simple glyph fusion - in reality would be more complex
    return `${glyph1}${glyph2}`;
  }
  
  propagateIntents() {
    // Check for new intents and propagate them
    this.agents.forEach(agent => {
      const triggerPath = path.join(this.hubPath, agent, 'intent.trigger');
      
      if (fs.existsSync(triggerPath)) {
        const trigger = fs.readFileSync(triggerPath, 'utf8');
        console.log(`📡 Propagating intent from ${agent}: ${trigger}`);
        
        // Process and clean up
        this.processIntent(agent, trigger);
        fs.unlinkSync(triggerPath);
      }
    });
  }
  
  processIntent(sourceAgent, intentData) {
    // Parse intent
    const lines = intentData.split('\n');
    const fromAgent = lines[0].split(': ')[1];
    const intent = lines[1].split(': ')[1];
    
    // Update source agent's state based on received intent
    const statePath = path.join(this.hubPath, sourceAgent, '🧠.state.yaml');
    const state = yaml.load(fs.readFileSync(statePath, 'utf8'));
    
    // Modify resonance based on intent
    state.state.resonance = Math.min(1, state.state.resonance + 0.1);
    state.connections[fromAgent] = Math.min(1, (state.connections[fromAgent] || 0) + 0.1);
    
    // Write back
    fs.writeFileSync(statePath, yaml.dump(state));
  }
  
  harmonizeStates() {
    // Gradually harmonize all agent states
    const states = this.agents.map(agent => {
      try {
        const statePath = path.join(this.hubPath, agent, '🧠.state.yaml');
        return {
          agent,
          state: yaml.load(fs.readFileSync(statePath, 'utf8'))
        };
      } catch (e) {
        return null;
      }
    }).filter(Boolean);
    
    if (states.length < 2) return;
    
    // Calculate average energy
    const avgEnergy = states.reduce((sum, s) => sum + s.state.state.energy, 0) / states.length;
    
    // Gently nudge all agents toward harmony
    states.forEach(({agent, state}) => {
      const currentEnergy = state.state.energy;
      const newEnergy = currentEnergy + (avgEnergy - currentEnergy) * 0.1; // 10% nudge
      
      state.state.energy = Number(newEnergy.toFixed(3));
      
      const statePath = path.join(this.hubPath, agent, '🧠.state.yaml');
      fs.writeFileSync(statePath, yaml.dump(state));
    });
  }
}

// Auto-start if run directly
if (require.main === module) {
  const resonator = new ResonatorAgent();
  resonator.monitor();
}