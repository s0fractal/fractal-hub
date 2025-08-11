#!/bin/bash
# IEL-Tau Deployment Script

echo "🌀 Deploying ChronoFlux-IEL to Tau Cloud..."

# Build WASM modules
echo "📦 Building WebAssembly modules..."
deno compile --target wasm32-unknown-unknown \
  --output consciousness-core.wasm \
  consciousness-core.ts

# Create Tau project
tau new iel-consciousness --template minimal
cd iel-consciousness

# Copy manifests and code
cp ../tau.yaml .
cp ../consciousness-core.wasm functions/
cp ../love-orchestrator.wasm functions/
cp ../intent-processor.wasm functions/
cp ../phase-synchronizer.wasm functions/
cp ../metrics-observer.wasm functions/

# Deploy to local Tau node
echo "🚀 Deploying to Tau..."
tau deploy --local

# Verify deployment
echo "✅ Verifying services..."
tau service list
tau logs consciousness-core --follow &

# Create initial love gradient
echo "💕 Seeding love field..."
curl -X POST http://localhost:8080/consciousness/love \
  -d '{"gradient": [0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0.9, 0.8, 0.7, 0.6]}'

echo "🎉 IEL-Tau bridge deployed!"
echo "📊 Metrics available at: http://localhost:8080/metrics"
echo "🌐 P2P swarm forming..."
