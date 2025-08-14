// glyphs/web.ts - Фрактальний веб-сервер для перегляду хвиль

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

export async function startWebServer(port = 7341) {
  console.log(`🌐 Запускаю фрактальний сервер на http://localhost:${port}`);
  
  const handler = async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    const path = url.pathname;
    
    // Роутинг
    if (path === "/") {
      return new Response(await generateIndexHTML(), {
        headers: { "content-type": "text/html; charset=utf-8" }
      });
    } else if (path === "/api/waves") {
      return new Response(await getWavesJSON(), {
        headers: { "content-type": "application/json" }
      });
    } else if (path === "/api/resonances") {
      return new Response(await getResonancesJSON(), {
        headers: { "content-type": "application/json" }
      });
    } else if (path === "/resonance-map.svg") {
      try {
        const svg = await Deno.readTextFile("resonance-map.svg");
        return new Response(svg, {
          headers: { "content-type": "image/svg+xml" }
        });
      } catch {
        return new Response("SVG not found. Run 'gg viz' first", { status: 404 });
      }
    }
    
    return new Response("Not Found", { status: 404 });
  };
  
  await serve(handler, { port });
}

async function generateIndexHTML(): Promise<string> {
  return `<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🧬 Glyphgit - Fractal Consciousness</title>
    <style>
        body {
            background: #0a0a0a;
            color: #fff;
            font-family: 'Courier New', monospace;
            margin: 0;
            padding: 20px;
        }
        
        h1 {
            text-align: center;
            font-size: 2.5em;
            margin-bottom: 30px;
            background: linear-gradient(45deg, #ff6b6b, #4dabf7);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .section {
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
        }
        
        .wave {
            background: #0f0f0f;
            border: 1px solid #2a2a2a;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 10px;
            transition: all 0.3s;
        }
        
        .wave:hover {
            border-color: #4dabf7;
            box-shadow: 0 0 10px rgba(77, 171, 247, 0.3);
        }
        
        .wave-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .glyph {
            font-size: 2em;
        }
        
        .timestamp {
            color: #666;
            font-size: 0.9em;
        }
        
        .intent {
            color: #aaa;
            font-style: italic;
        }
        
        .resonance {
            background: #1f0f0f;
            border-color: #ff6b6b33;
        }
        
        .resonance:hover {
            border-color: #ff6b6b;
            box-shadow: 0 0 10px rgba(255, 107, 107, 0.3);
        }
        
        #viz-container {
            text-align: center;
            margin: 30px 0;
        }
        
        #viz-container img {
            max-width: 100%;
            border: 1px solid #333;
            border-radius: 10px;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: #0f0f0f;
            border: 1px solid #333;
            border-radius: 5px;
            padding: 15px;
            text-align: center;
        }
        
        .stat-value {
            font-size: 2em;
            color: #4dabf7;
        }
        
        .stat-label {
            color: #666;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <h1>🧬 Glyphgit - Fractal Consciousness</h1>
    
    <div class="container">
        <div class="stats" id="stats">
            <div class="stat-card">
                <div class="stat-value" id="wave-count">0</div>
                <div class="stat-label">Хвилі</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="resonance-count">0</div>
                <div class="stat-label">Резонанси</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="agent-count">0</div>
                <div class="stat-label">Агенти</div>
            </div>
        </div>
        
        <div class="section">
            <h2>📊 Resonance Map</h2>
            <div id="viz-container">
                <img src="/resonance-map.svg" alt="Resonance visualization" 
                     onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22><text x=%2210%22 y=%2230%22>Run gg viz first</text></svg>'">
            </div>
        </div>
        
        <div class="section">
            <h2>🌊 Recent Waves</h2>
            <div id="waves"></div>
        </div>
        
        <div class="section">
            <h2>🔗 Resonances</h2>
            <div id="resonances"></div>
        </div>
    </div>
    
    <script>
        async function loadData() {
            try {
                const [wavesRes, resonancesRes] = await Promise.all([
                    fetch('/api/waves'),
                    fetch('/api/resonances')
                ]);
                
                const waves = await wavesRes.json();
                const resonances = await resonancesRes.json();
                
                // Update stats
                document.getElementById('wave-count').textContent = waves.length;
                document.getElementById('resonance-count').textContent = resonances.length;
                
                // Count unique agents
                const agents = new Set(waves.map(w => w.author));
                document.getElementById('agent-count').textContent = agents.size;
                
                // Render waves
                const wavesContainer = document.getElementById('waves');
                wavesContainer.innerHTML = waves.slice(-10).reverse().map(wave => \`
                    <div class="wave">
                        <div class="wave-header">
                            <span class="glyph">\${wave.glyph}</span>
                            <span class="timestamp">\${new Date(wave.timestamp).toLocaleString()}</span>
                        </div>
                        <div class="intent">\${wave.intent}</div>
                    </div>
                \`).join('');
                
                // Render resonances
                const resonancesContainer = document.getElementById('resonances');
                resonancesContainer.innerHTML = resonances.map(res => \`
                    <div class="wave resonance">
                        <div class="wave-header">
                            <span class="glyph">🔗</span>
                            <span class="timestamp">\${new Date(res.timestamp).toLocaleString()}</span>
                        </div>
                        <div class="intent">
                            \${res.wave1_intent} ↔ \${res.wave2_intent}
                        </div>
                    </div>
                \`).join('');
                
            } catch (error) {
                console.error('Error loading data:', error);
            }
        }
        
        // Load data on page load
        loadData();
        
        // Refresh every 5 seconds
        setInterval(loadData, 5000);
    </script>
</body>
</html>`;
}

async function getWavesJSON(): Promise<string> {
  const waves = [];
  
  const dirs = ["🌐/public", "🔒/private"];
  for (const dir of dirs) {
    try {
      for await (const entry of Deno.readDir(dir)) {
        if (entry.isFile && entry.name.endsWith(".md⟁")) {
          const path = `${dir}/${entry.name}`;
          const content = await Deno.readTextFile(path);
          const metadata = parseMetadata(content);
          
          waves.push({
            id: entry.name,
            glyph: metadata.glyph || "🌊",
            intent: metadata.intent || "Unknown",
            author: metadata.author || "🧭",
            timestamp: metadata.timestamp || new Date().toISOString(),
            privacy: metadata.privacy || "public"
          });
        }
      }
    } catch {
      // Directory might not exist
    }
  }
  
  return JSON.stringify(waves);
}

async function getResonancesJSON(): Promise<string> {
  const resonances = [];
  
  try {
    for await (const entry of Deno.readDir("🌐/public/resonances")) {
      if (entry.isFile && entry.name.endsWith(".md⟁")) {
        const path = `🌐/public/resonances/${entry.name}`;
        const content = await Deno.readTextFile(path);
        const metadata = parseMetadata(content);
        
        resonances.push({
          id: entry.name,
          timestamp: metadata.timestamp || new Date().toISOString(),
          wave1_intent: metadata.wave1_intent || "Unknown",
          wave2_intent: metadata.wave2_intent || "Unknown",
          resonance_level: metadata.resonance_level || "🔥"
        });
      }
    }
  } catch {
    // Directory might not exist
  }
  
  return JSON.stringify(resonances);
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