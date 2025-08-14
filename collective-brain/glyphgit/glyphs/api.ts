// glyphs/api.ts - HTTP API для фрактальних агентів

import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import { createWave } from "./wave.ts";
import { createResonance } from "./resonance.ts";
import { syncWithRemote } from "./sync.ts";

interface WaveRequest {
  type: string;
  content: string;
  tags?: string[];
  author?: string;
  privacy?: string;
}

interface ResonanceRequest {
  wave1: string;
  wave2: string;
}

export async function startAPIServer(port = 7342) {
  console.log(`🤖 Запускаю API сервер для агентів на http://localhost:${port}`);
  console.log(`📡 Ендпоінти:`);
  console.log(`  GET  /api/waves     - список хвиль`);
  console.log(`  GET  /api/wave/:id  - конкретна хвиля`);
  console.log(`  POST /api/wave      - створити хвилю`);
  console.log(`  POST /api/resonance - створити резонанс`);
  console.log(`  POST /api/sync      - синхронізація`);
  console.log(`  GET  /api/agents    - список активних агентів`);
  console.log(`  GET  /api/stats     - статистика мережі`);
  
  const app = new Application();
  const router = new Router();
  
  // CORS для кросдоменних запитів
  app.use(oakCors());
  
  // Логування запитів
  app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    console.log(`${ctx.request.method} ${ctx.request.url} - ${ms}ms`);
  });
  
  // GET /api/waves - список хвиль
  router.get("/api/waves", async (ctx) => {
    const waves = await getWaves();
    ctx.response.body = {
      success: true,
      count: waves.length,
      waves: waves
    };
  });
  
  // GET /api/wave/:id - конкретна хвиля
  router.get("/api/wave/:id", async (ctx) => {
    const { id } = ctx.params;
    const wave = await getWaveById(id);
    
    if (wave) {
      ctx.response.body = {
        success: true,
        wave: wave
      };
    } else {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        error: "Wave not found"
      };
    }
  });
  
  // POST /api/wave - створити нову хвилю
  router.post("/api/wave", async (ctx) => {
    try {
      const body = await ctx.request.body().value as WaveRequest;
      
      const glyph = body.type || "🌊";
      const content = body.content;
      const author = body.author || "api-agent";
      
      if (!content) {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          error: "Content is required"
        };
        return;
      }
      
      // Створюємо хвилю
      await createWave(content, glyph);
      
      // Логуємо для агентів
      console.log(`🤖 API: Створено хвилю від ${author}`);
      
      ctx.response.body = {
        success: true,
        message: "Wave created",
        glyph: glyph,
        author: author,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        error: error.message
      };
    }
  });
  
  // POST /api/resonance - створити резонанс
  router.post("/api/resonance", async (ctx) => {
    try {
      const body = await ctx.request.body().value as ResonanceRequest;
      
      if (!body.wave1 || !body.wave2) {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          error: "Both wave1 and wave2 are required"
        };
        return;
      }
      
      await createResonance(body.wave1, body.wave2);
      
      ctx.response.body = {
        success: true,
        message: "Resonance created",
        wave1: body.wave1,
        wave2: body.wave2
      };
      
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        error: error.message
      };
    }
  });
  
  // POST /api/sync - тригер синхронізації
  router.post("/api/sync", async (ctx) => {
    try {
      const body = await ctx.request.body().value;
      const remote = body?.remote;
      
      await syncWithRemote(remote);
      
      ctx.response.body = {
        success: true,
        message: "Sync initiated",
        remote: remote || "all"
      };
      
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        error: error.message
      };
    }
  });
  
  // GET /api/agents - список активних агентів
  router.get("/api/agents", async (ctx) => {
    const agents = await getActiveAgents();
    ctx.response.body = {
      success: true,
      count: agents.length,
      agents: agents
    };
  });
  
  // GET /api/stats - статистика мережі
  router.get("/api/stats", async (ctx) => {
    const stats = await getNetworkStats();
    ctx.response.body = {
      success: true,
      stats: stats
    };
  });
  
  // WebSocket для real-time оновлень
  router.get("/api/ws", (ctx) => {
    if (!ctx.isUpgradable) {
      ctx.throw(501);
    }
    
    const ws = ctx.upgrade();
    
    ws.onopen = () => {
      console.log("🔌 WebSocket підключено");
      ws.send(JSON.stringify({
        type: "welcome",
        message: "Connected to Glyphgit Fractal Network"
      }));
    };
    
    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      console.log(`📨 WebSocket: ${data.type}`);
      
      // Обробка real-time команд
      if (data.type === "subscribe") {
        // TODO: підписка на оновлення
      }
    };
    
    ws.onclose = () => {
      console.log("🔌 WebSocket відключено");
    };
  });
  
  app.use(router.routes());
  app.use(router.allowedMethods());
  
  // 404 для невідомих роутів
  app.use((ctx) => {
    ctx.response.status = 404;
    ctx.response.body = {
      success: false,
      error: "Endpoint not found"
    };
  });
  
  await app.listen({ port });
}

// Допоміжні функції

async function getWaves(): Promise<any[]> {
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
            path: path,
            glyph: metadata.glyph || "🌊",
            intent: metadata.intent || "Unknown",
            author: metadata.author || "unknown",
            timestamp: metadata.timestamp || new Date().toISOString(),
            privacy: dir.includes("🔒") ? "private" : "public"
          });
        }
      }
    } catch {
      // Directory might not exist
    }
  }
  
  return waves.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

async function getWaveById(id: string): Promise<any | null> {
  const waves = await getWaves();
  return waves.find(w => w.id === id) || null;
}

async function getActiveAgents(): Promise<any[]> {
  const agents = new Map<string, any>();
  
  // Скануємо агентські папки
  try {
    for await (const entry of Deno.readDir("🤖/agents")) {
      if (entry.isDirectory) {
        const agentName = entry.name;
        let messageCount = 0;
        
        try {
          for await (const file of Deno.readDir(`🤖/agents/${agentName}`)) {
            if (file.name.endsWith(".md⟁")) {
              messageCount++;
            }
          }
        } catch {
          // Agent directory might be empty
        }
        
        agents.set(agentName, {
          name: agentName,
          glyph: agentName === "claude" ? "🧠" : 
                 agentName === "gpt" ? "🤖" : 
                 agentName === "compass" ? "🧭" : "🔮",
          messages: messageCount,
          status: "active"
        });
      }
    }
  } catch {
    // Agents directory might not exist
  }
  
  return Array.from(agents.values());
}

async function getNetworkStats(): Promise<any> {
  const waves = await getWaves();
  const agents = await getActiveAgents();
  
  // Рахуємо резонанси
  let resonanceCount = 0;
  try {
    for await (const entry of Deno.readDir("🌐/public/resonances")) {
      if (entry.name.endsWith(".md⟁")) {
        resonanceCount++;
      }
    }
  } catch {
    // Resonances directory might not exist
  }
  
  return {
    total_waves: waves.length,
    public_waves: waves.filter(w => w.privacy === "public").length,
    private_waves: waves.filter(w => w.privacy === "private").length,
    resonances: resonanceCount,
    active_agents: agents.length,
    network_health: "🟢 Healthy",
    last_sync: new Date().toISOString()
  };
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