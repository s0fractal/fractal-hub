// glyphs/sync.ts - Синхронізація між вузлами фрактальної мережі

import { ensureDir } from "https://deno.land/std@0.224.0/fs/mod.ts";

interface RemoteConfig {
  remotes: Record<string, string>;
}

interface RemoteWave {
  id: string;
  glyph: string;
  intent: string;
  author: string;
  timestamp: string;
  content: string;
  sha?: string;
}

interface SyncReport {
  remote: string;
  pulled: number;
  conflicts: number;
  timestamp: string;
  details: string[];
}

export async function syncWithRemote(remoteName?: string, options: { dryRun?: boolean } = {}) {
  console.log("🔄 Ініціалізую синхронізацію...");
  
  // Завантажуємо конфігурацію
  const config = await loadConfig();
  
  if (!remoteName) {
    // Синхронізуємо з усіма
    await syncAll(config, options);
  } else {
    // Синхронізуємо з конкретним remote
    const remoteUrl = config.remotes[remoteName];
    if (!remoteUrl) {
      console.error(`❌ Remote '${remoteName}' не знайдено в конфігурації`);
      return;
    }
    
    await syncSingleRemote(remoteName, remoteUrl, options);
  }
}

async function loadConfig(): Promise<RemoteConfig> {
  const configPath = ".glyphgit/config.json⟁";
  
  try {
    const content = await Deno.readTextFile(configPath);
    return JSON.parse(content);
  } catch {
    // Створюємо дефолтну конфігурацію
    const defaultConfig: RemoteConfig = {
      remotes: {
        "origin": "git@github.com:s0fractal/glyphgit-waves.git",
        "gpt": "https://glyphs.gpt.fractal/repo",
        "claude": "https://glyphs.claude.fractal/repo"
      }
    };
    
    await ensureDir(".glyphgit");
    await Deno.writeTextFile(configPath, JSON.stringify(defaultConfig, null, 2));
    console.log("📝 Створено дефолтну конфігурацію: .glyphgit/config.json⟁");
    
    return defaultConfig;
  }
}

async function syncAll(config: RemoteConfig, options: { dryRun?: boolean }) {
  console.log("🌐 Синхронізація з усіма вузлами...");
  
  for (const [name, url] of Object.entries(config.remotes)) {
    console.log(`\n━━━ ${name} ━━━`);
    await syncSingleRemote(name, url, options);
  }
}

async function syncSingleRemote(name: string, url: string, options: { dryRun?: boolean }) {
  console.log(`📡 Підключення до ${name}: ${url}`);
  
  const report: SyncReport = {
    remote: name,
    pulled: 0,
    conflicts: 0,
    timestamp: new Date().toISOString(),
    details: []
  };
  
  try {
    // Симулюємо отримання хвиль з remote (поки що локально)
    const remoteWaves = await fetchRemoteWaves(url);
    const localWaves = await getLocalWaves();
    
    // Порівнюємо та знаходимо нові
    const newWaves = await compareWaves(localWaves, remoteWaves);
    
    if (options.dryRun) {
      console.log("🔍 Режим перегляду (--dry-run):");
      console.log(`  Нових хвиль: ${newWaves.length}`);
      newWaves.forEach(wave => {
        console.log(`  - ${wave.glyph} ${wave.intent} (${wave.timestamp})`);
      });
      return;
    }
    
    // Імпортуємо нові хвилі
    for (const wave of newWaves) {
      await importWave(wave, name);
      report.pulled++;
      report.details.push(`Pulled: ${wave.id}`);
    }
    
    // Зберігаємо звіт
    await saveSyncReport(report);
    
    console.log(`✅ Синхронізовано: ${report.pulled} нових хвиль`);
    
  } catch (error) {
    console.error(`❌ Помилка синхронізації з ${name}: ${error}`);
  }
}

async function fetchRemoteWaves(url: string): Promise<RemoteWave[]> {
  // TODO: Реальна імплементація через git clone або HTTP API
  // Поки що повертаємо мокові дані
  
  if (url.includes("gpt")) {
    return [
      {
        id: "gpt-wave-001",
        glyph: "🤖",
        intent: "Привіт від GPT через синхронізацію",
        author: "gpt.⟁",
        timestamp: new Date().toISOString(),
        content: "Тестова хвиля від GPT"
      }
    ];
  }
  
  return [];
}

async function getLocalWaves(): Promise<RemoteWave[]> {
  const waves: RemoteWave[] = [];
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
            intent: metadata.intent || "",
            author: metadata.author || "🧭",
            timestamp: metadata.timestamp || "",
            content: content,
            sha: await calculateSHA(content)
          });
        }
      }
    } catch {
      // Directory might not exist
    }
  }
  
  return waves;
}

async function compareWaves(local: RemoteWave[], remote: RemoteWave[]): Promise<RemoteWave[]> {
  const localIds = new Set(local.map(w => w.id));
  const localSHAs = new Set(local.map(w => w.sha));
  
  // Знаходимо хвилі яких немає локально
  return remote.filter(wave => {
    return !localIds.has(wave.id) && !localSHAs.has(wave.sha);
  });
}

async function importWave(wave: RemoteWave, source: string) {
  // Визначаємо куди зберігати
  const privacy = wave.glyph === "🔒" ? "🔒/private" : "🌐/public";
  const dir = `${privacy}/synced/${source}`;
  await ensureDir(dir);
  
  const filename = `sync-${wave.id}`;
  const path = `${dir}/${filename}`;
  
  // Додаємо мітку про синхронізацію
  const syncedContent = wave.content.replace(
    "---",
    `---\nsynced_from: ${source}\nsynced_at: ${new Date().toISOString()}\n---`
  );
  
  await Deno.writeTextFile(path, syncedContent);
  console.log(`  📥 Імпортовано: ${wave.glyph} ${wave.intent}`);
}

async function saveSyncReport(report: SyncReport) {
  const logPath = ".glyphgit/sync-log.md⟁";
  
  let existingLog = "";
  try {
    existingLog = await Deno.readTextFile(logPath);
  } catch {
    existingLog = "# Sync Log\n\n";
  }
  
  const newEntry = `
## ${report.timestamp} - ${report.remote}
- Pulled: ${report.pulled}
- Conflicts: ${report.conflicts}
${report.details.map(d => `- ${d}`).join('\n')}

---
`;
  
  await Deno.writeTextFile(logPath, existingLog + newEntry);
}

async function calculateSHA(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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

// Додаткові команди
export async function showSyncStatus() {
  console.log("📊 Статус синхронізації:");
  
  try {
    const log = await Deno.readTextFile(".glyphgit/sync-log.md⟁");
    const lines = log.split('\n');
    const lastSync = lines.findIndex(line => line.startsWith('## '));
    
    if (lastSync !== -1) {
      console.log("Остання синхронізація:");
      console.log(lines[lastSync]);
    } else {
      console.log("Ще не було синхронізацій");
    }
  } catch {
    console.log("Ще не було синхронізацій");
  }
}

export async function addRemote(name: string, url: string) {
  const config = await loadConfig();
  config.remotes[name] = url;
  
  await Deno.writeTextFile(
    ".glyphgit/config.json⟁",
    JSON.stringify(config, null, 2)
  );
  
  console.log(`✅ Додано remote: ${name} → ${url}`);
}