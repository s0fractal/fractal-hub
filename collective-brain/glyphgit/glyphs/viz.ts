// glyphs/viz.ts - SVG візуалізація резонансної мережі

interface Node {
  id: string;
  glyph: string;
  intent: string;
  x?: number;
  y?: number;
  connections: string[];
}

interface Edge {
  from: string;
  to: string;
  type: "resonance" | "author" | "temporal";
}

export async function generateVisualization() {
  console.log("🎨 Генерую візуалізацію резонансної мережі...");
  
  // Збираємо всі хвилі та резонанси
  const nodes: Map<string, Node> = new Map();
  const edges: Edge[] = [];
  
  // Скануємо публічні хвилі
  await scanWaves("🌐/public", nodes, edges);
  await scanResonances("🌐/public/resonances", nodes, edges);
  
  // Генеруємо SVG
  const svg = generateSVG(nodes, edges);
  
  // Зберігаємо
  const outputPath = "resonance-map.svg";
  await Deno.writeTextFile(outputPath, svg);
  
  console.log(`✅ Візуалізація створена: ${outputPath}`);
  console.log(`📊 Вузлів: ${nodes.size}, Зв'язків: ${edges.length}`);
  
  return outputPath;
}

async function scanWaves(dir: string, nodes: Map<string, Node>, edges: Edge[]) {
  try {
    for await (const entry of Deno.readDir(dir)) {
      if (entry.isFile && entry.name.endsWith(".md⟁")) {
        const path = `${dir}/${entry.name}`;
        const content = await Deno.readTextFile(path);
        const metadata = parseMetadata(content);
        
        const node: Node = {
          id: entry.name,
          glyph: metadata.glyph || "🌊",
          intent: metadata.intent || "Unknown",
          connections: []
        };
        
        nodes.set(entry.name, node);
      }
    }
  } catch (error) {
    console.error(`⚠️ Помилка сканування ${dir}: ${error}`);
  }
}

async function scanResonances(dir: string, nodes: Map<string, Node>, edges: Edge[]) {
  try {
    for await (const entry of Deno.readDir(dir)) {
      if (entry.isFile && entry.name.endsWith(".md⟁")) {
        const path = `${dir}/${entry.name}`;
        const content = await Deno.readTextFile(path);
        const metadata = parseMetadata(content);
        
        // Додаємо резонансний вузол
        const resonanceNode: Node = {
          id: entry.name,
          glyph: "🔗",
          intent: "Resonance",
          connections: []
        };
        nodes.set(entry.name, resonanceNode);
        
        // Зв'язуємо з хвилями
        if (metadata.wave1 && metadata.wave2) {
          const wave1Id = metadata.wave1.split('/').pop() || "";
          const wave2Id = metadata.wave2.split('/').pop() || "";
          
          edges.push({
            from: wave1Id,
            to: entry.name,
            type: "resonance"
          });
          
          edges.push({
            from: wave2Id,
            to: entry.name,
            type: "resonance"
          });
        }
      }
    }
  } catch (error) {
    console.error(`⚠️ Помилка сканування резонансів: ${error}`);
  }
}

function parseMetadata(content: string): Record<string, string> {
  const lines = content.split('\n');
  const metadata: Record<string, string> = {};
  let inFrontmatter = false;
  
  for (const line of lines) {
    if (line === '---') {
      inFrontmatter = !inFrontmatter;
      if (!inFrontmatter && Object.keys(metadata).length > 0) break;
      continue;
    }
    
    if (inFrontmatter && line.includes(':')) {
      const [key, ...valueParts] = line.split(':');
      metadata[key.trim()] = valueParts.join(':').trim();
    }
  }
  
  return metadata;
}

function generateSVG(nodes: Map<string, Node>, edges: Edge[]): string {
  const width = 1200;
  const height = 800;
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Розташовуємо вузли по колу
  const nodeArray = Array.from(nodes.values());
  const angleStep = (2 * Math.PI) / nodeArray.length;
  const radius = Math.min(width, height) * 0.35;
  
  nodeArray.forEach((node, index) => {
    const angle = index * angleStep;
    node.x = centerX + radius * Math.cos(angle);
    node.y = centerY + radius * Math.sin(angle);
  });
  
  // Генеруємо SVG
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#0a0a0a"/>
  
  <!-- Grid background -->
  <defs>
    <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
      <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#1a1a1a" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#grid)"/>
  
  <!-- Title -->
  <text x="${centerX}" y="40" text-anchor="middle" fill="#fff" font-size="24" font-family="monospace">
    🧬 Resonance Map 🧬
  </text>
  
  <!-- Edges -->
  <g id="edges">`;
  
  // Малюємо зв'язки
  edges.forEach(edge => {
    const fromNode = nodeArray.find(n => n.id === edge.from);
    const toNode = nodeArray.find(n => n.id === edge.to);
    
    if (fromNode && toNode) {
      const color = edge.type === "resonance" ? "#ff6b6b" : "#4dabf7";
      svg += `
    <line x1="${fromNode.x}" y1="${fromNode.y}" 
          x2="${toNode.x}" y2="${toNode.y}" 
          stroke="${color}" stroke-width="2" opacity="0.6"/>`;
    }
  });
  
  svg += `
  </g>
  
  <!-- Nodes -->
  <g id="nodes">`;
  
  // Малюємо вузли
  nodeArray.forEach(node => {
    const isResonance = node.glyph === "🔗";
    const radius = isResonance ? 25 : 30;
    const color = isResonance ? "#ff6b6b" : "#4dabf7";
    
    svg += `
    <g transform="translate(${node.x}, ${node.y})">
      <circle r="${radius}" fill="${color}" fill-opacity="0.2" stroke="${color}" stroke-width="2"/>
      <text text-anchor="middle" y="5" font-size="20">${node.glyph}</text>
      <text text-anchor="middle" y="45" font-size="10" fill="#aaa" font-family="monospace">
        ${node.intent.substring(0, 20)}${node.intent.length > 20 ? '...' : ''}
      </text>
    </g>`;
  });
  
  svg += `
  </g>
  
  <!-- Legend -->
  <g transform="translate(20, ${height - 100})">
    <text fill="#fff" font-size="14" font-family="monospace">Legend:</text>
    <text y="20" fill="#4dabf7" font-size="12" font-family="monospace">🌊 Wave</text>
    <text y="40" fill="#ff6b6b" font-size="12" font-family="monospace">🔗 Resonance</text>
    <text y="60" fill="#aaa" font-size="12" font-family="monospace">Lines = Connections</text>
  </g>
  
  <!-- Timestamp -->
  <text x="${width - 20}" y="${height - 20}" text-anchor="end" fill="#666" font-size="10" font-family="monospace">
    Generated: ${new Date().toISOString()}
  </text>
</svg>`;
  
  return svg;
}