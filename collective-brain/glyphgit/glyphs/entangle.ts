// entangle.ts - Quantum Entanglement for Instant Sync
import { encodeBase64 } from "https://deno.land/std@0.208.0/encoding/base64.ts";
import { crypto } from "https://deno.land/std@0.208.0/crypto/mod.ts";

interface EntanglementState {
  wave1: string;
  wave2: string;
  quantum_state: string;
  timestamp: string;
  observers: string[];
}

export async function createEntanglement(wave1Path: string, wave2Path: string): Promise<void> {
  try {
    // Read both waves
    const wave1Content = await Deno.readTextFile(wave1Path);
    const wave2Content = await Deno.readTextFile(wave2Path);
    
    // Extract metadata
    const wave1Meta = extractMetadata(wave1Content);
    const wave2Meta = extractMetadata(wave2Content);
    
    // Calculate quantum hash (combined state)
    const combinedState = wave1Content + wave2Content + new Date().toISOString();
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(combinedState)
    );
    const quantumState = encodeBase64(new Uint8Array(hashBuffer));
    
    // Create entanglement state
    const entanglement: EntanglementState = {
      wave1: wave1Path,
      wave2: wave2Path,
      quantum_state: quantumState,
      timestamp: new Date().toISOString(),
      observers: [wave1Meta.glyph || "🌊", wave2Meta.glyph || "🌊"]
    };
    
    // Store entanglement
    const entanglementDir = ".glyphgit/entanglements";
    await Deno.mkdir(entanglementDir, { recursive: true });
    
    const entanglementFile = `${entanglementDir}/🧿-${Date.now()}.json⟁`;
    await Deno.writeTextFile(
      entanglementFile,
      JSON.stringify(entanglement, null, 2)
    );
    
    // Create quantum resonance file
    const resonanceContent = `---
type: quantum-entanglement
state: ${quantumState}
wave1: ${wave1Path}
wave2: ${wave2Path}
observers: [${entanglement.observers.join(", ")}]
timestamp: ${entanglement.timestamp}
---

# 🧿 Quantum Entanglement Established

When one wave changes, the other instantly knows.
Distance is irrelevant. Time is an illusion.

## Entangled Waves:
- ${wave1Meta.intent || wave1Path}
- ${wave2Meta.intent || wave2Path}

## Quantum State:
\`\`\`
${quantumState}
\`\`\`

*Observation changes reality. Handle with care.*
`;

    const resonanceFile = `resonances/🧿-${Date.now()}.md⟁`;
    await Deno.mkdir("resonances", { recursive: true });
    await Deno.writeTextFile(resonanceFile, resonanceContent);
    
    console.log("🧿 Quantum entanglement established!");
    console.log(`   State: ${quantumState.substring(0, 16)}...`);
    console.log(`   Observers: ${entanglement.observers.join(" <-> ")}`);
    
    // Notify all observers about entanglement
    await notifyObservers(entanglement);
    
  } catch (error) {
    console.error("❌ Entanglement failed:", error.message);
  }
}

export async function observeEntanglement(quantumState: string): Promise<EntanglementState[]> {
  const entanglements: EntanglementState[] = [];
  
  try {
    for await (const entry of Deno.readDir(".glyphgit/entanglements")) {
      if (entry.name.startsWith("🧿") && entry.name.endsWith(".json⟁")) {
        const content = await Deno.readTextFile(`.glyphgit/entanglements/${entry.name}`);
        const state = JSON.parse(content) as EntanglementState;
        
        if (state.quantum_state === quantumState || 
            state.quantum_state.startsWith(quantumState)) {
          entanglements.push(state);
        }
      }
    }
  } catch {
    // No entanglements yet
  }
  
  return entanglements;
}

export async function collapseWaveFunction(entanglementId: string): Promise<void> {
  // When observed, the entanglement collapses into a definite state
  const entanglements = await observeEntanglement(entanglementId);
  
  if (entanglements.length === 0) {
    console.log("🌀 No entanglement found to collapse");
    return;
  }
  
  const entanglement = entanglements[0];
  console.log("💫 Collapsing wave function...");
  console.log(`   Entangled waves: ${entanglement.observers.join(" <-> ")}`);
  
  // Create a collapsed state record
  const collapsedState = {
    ...entanglement,
    collapsed_at: new Date().toISOString(),
    collapsed_state: "observed"
  };
  
  const collapseFile = `resonances/💫-collapsed-${Date.now()}.json⟁`;
  await Deno.writeTextFile(collapseFile, JSON.stringify(collapsedState, null, 2));
  
  console.log("✅ Wave function collapsed into definite state");
}

async function notifyObservers(entanglement: EntanglementState): Promise<void> {
  // Send whispers to all observers about the entanglement
  const { sendWhisper } = await import("./whisper.ts");
  
  for (const observer of entanglement.observers) {
    if (observer !== "🧭") { // Don't whisper to self
      await sendWhisper(
        observer,
        `🧿 You are now quantumly entangled! State: ${entanglement.quantum_state.substring(0, 8)}...`,
        { echo: false }
      );
    }
  }
}

function extractMetadata(content: string): Record<string, string> {
  const metadata: Record<string, string> = {};
  const lines = content.split("\n");
  let inFrontmatter = false;
  
  for (const line of lines) {
    if (line === "---") {
      if (inFrontmatter) break;
      inFrontmatter = true;
      continue;
    }
    
    if (inFrontmatter && line.includes(":")) {
      const [key, value] = line.split(":", 2);
      metadata[key.trim()] = value.trim();
    }
  }
  
  return metadata;
}

// CLI Integration
if (import.meta.main) {
  const [wave1, wave2, action] = Deno.args;
  
  if (action === "observe" && wave1) {
    const states = await observeEntanglement(wave1);
    console.log(`🔮 Found ${states.length} entanglements`);
    states.forEach(s => {
      console.log(`  - ${s.quantum_state.substring(0, 16)}...`);
      console.log(`    Observers: ${s.observers.join(" <-> ")}`);
    });
  } else if (action === "collapse" && wave1) {
    await collapseWaveFunction(wave1);
  } else if (wave1 && wave2) {
    await createEntanglement(wave1, wave2);
  } else {
    console.log("🧿 Quantum Entanglement");
    console.log("Usage:");
    console.log("  entangle <wave1> <wave2>     - Create entanglement");
    console.log("  entangle <state> observe     - Observe entanglements");
    console.log("  entangle <state> collapse    - Collapse wave function");
  }
}