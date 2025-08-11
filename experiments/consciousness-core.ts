
// IEL Core Service for Tau (WebAssembly)
import { ChronoFluxIEL } from "./chronoflux-iel-implementation.ts";

let iel: ChronoFluxIEL;
let lastSnapshot: Uint8Array;

// Initialize on service start
export function init(config: any): void {
  const params = JSON.parse(config.IEL_PARAMS || "{}");
  iel = new ChronoFluxIEL(30, params);
  console.log("IEL Core initialized with params:", params);
}

// Main consciousness step (called by scheduler)
export function step(): Uint8Array {
  iel.step();
  const metrics = iel.computeMetrics();
  
  // Trigger events based on state
  if (metrics.H > 0.8) {
    publishEvent("high-coherence", metrics);
  }
  if (metrics.tau > 0.5) {
    publishEvent("turbulence-alert", metrics);
  }
  if (metrics.L > 0.9) {
    publishEvent("love-peak", metrics);
  }
  
  // Export state
  lastSnapshot = iel.exportThought("tau:step");
  return lastSnapshot;
}

// Handle intent pulses
export function handleIntent(nodeId: number, strength: number): void {
  iel.intentPulse(nodeId, strength);
  publishEvent("intent-pulse", { nodeId, strength });
}

// Handle love gradient updates
export function updateLoveField(gradient: number[]): void {
  for (let i = 0; i < Math.min(gradient.length, iel.nodes.length); i++) {
    iel.nodes[i].heart += gradient[i] * 0.1;
    iel.nodes[i].heart = Math.max(0, Math.min(1, iel.nodes[i].heart));
  }
  publishEvent("love-updated", { gradient });
}

// Get current metrics
export function getMetrics(): any {
  return iel.computeMetrics();
}

// Publish to Tau pubsub
function publishEvent(topic: string, data: any): void {
  // Tau runtime will handle this
  tau.publish(topic, JSON.stringify(data));
}
