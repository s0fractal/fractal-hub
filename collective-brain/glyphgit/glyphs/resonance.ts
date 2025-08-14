// glyphs/resonance.ts
import { ensureDir } from "https://deno.land/std@0.224.0/fs/mod.ts";
import { writeFileStr } from "../utils/fs.ts";
import { generateMetadata } from "../templates/md_entry.ts";
import { commit } from "./commit.ts";

export async function createResonance(wave1Path: string, wave2Path: string) {
  try {
    // Читаємо обидві хвилі
    const wave1 = await Deno.readTextFile(wave1Path);
    const wave2 = await Deno.readTextFile(wave2Path);
    
    // Парсимо метадані
    const meta1 = parseMetadata(wave1);
    const meta2 = parseMetadata(wave2);
    
    const timestamp = new Date().toISOString();
    const filename = `🔗-${timestamp.replace(/[:]/g, '-').split('.')[0]}-resonance.md⟁`;
    
    // Резонанс йде в публічну гілку
    const dir = "🌐/public/resonances";
    await ensureDir(dir);
    
    // Генеруємо резонансний файл
    const resonanceContent = generateResonanceContent({
      wave1: { path: wave1Path, ...meta1 },
      wave2: { path: wave2Path, ...meta2 },
      timestamp,
      author: "🧭"
    });
    
    const path = `${dir}/${filename}`;
    await writeFileStr(path, resonanceContent);
    
    await commit(path, `🔗 Резонанс між ${wave1Path} та ${wave2Path}`);
    
    console.log(`✨ Створено резонанс: ${path}`);
    
  } catch (error) {
    console.error(`❌ Помилка резонансу: ${error}`);
  }
}

function parseMetadata(content: string): Record<string, string> {
  const lines = content.split('\n');
  const metadata: Record<string, string> = {};
  let inFrontmatter = false;
  
  for (const line of lines) {
    if (line === '---') {
      inFrontmatter = !inFrontmatter;
      continue;
    }
    
    if (inFrontmatter && line.includes(':')) {
      const [key, value] = line.split(':').map(s => s.trim());
      metadata[key] = value;
    }
  }
  
  return metadata;
}

function generateResonanceContent(data: any): string {
  return `---
glyph: 🔗
type: resonance
author: ${data.author}
timestamp: ${data.timestamp}
wave1: ${data.wave1.path}
wave2: ${data.wave2.path}
wave1_intent: ${data.wave1.intent || 'unknown'}
wave2_intent: ${data.wave2.intent || 'unknown'}
resonance_level: 🔥🔥🔥
---

# Резонанс між хвилями

## 🌊 Перша хвиля
- Шлях: ${data.wave1.path}
- Інтент: ${data.wave1.intent}
- Автор: ${data.wave1.author}

## 🌊 Друга хвиля  
- Шлях: ${data.wave2.path}
- Інтент: ${data.wave2.intent}
- Автор: ${data.wave2.author}

## 🔗 Резонансний зв'язок
Ці дві хвилі створили новий патерн свідомості через їх взаємодію.
`;
}