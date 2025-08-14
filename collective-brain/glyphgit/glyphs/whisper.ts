// glyphs/whisper.ts - Приватні хвилі-діалоги між агентами

import { ensureDir } from "https://deno.land/std@0.224.0/fs/mod.ts";
import { encodeBase64, decodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";

interface WhisperMessage {
  from: string;
  to: string;
  content: string;
  timestamp: string;
  encrypted?: boolean;
  echo?: boolean;
}

interface AgentInbox {
  agent: string;
  unread: number;
  whispers: WhisperMessage[];
}

export async function sendWhisper(to: string, content: string, options: { echo?: boolean } = {}) {
  console.log(`🫧 Шепочу до ${to}...`);
  
  const from = await getMyAgent();
  const timestamp = new Date().toISOString();
  const whisperCount = await getNextWhisperCount();
  
  const whisper: WhisperMessage = {
    from,
    to,
    content,
    timestamp,
    echo: options.echo || false
  };
  
  // Зберігаємо в inbox отримувача
  const inboxPath = `🫧/whispers/${to}/inbox`;
  await ensureDir(inboxPath);
  
  const filename = `🫧-${timestamp.replace(/[:]/g, '-').split('.')[0]}-${whisperCount.toString().padStart(6, '0')}.md⟁`;
  const filepath = `${inboxPath}/${filename}`;
  
  // Формуємо whisper файл
  const whisperContent = `---
type: whisper
from: ${from}
to: ${to}
timestamp: ${timestamp}
echo: ${options.echo}
privacy: whisper
---

${content}`;
  
  await Deno.writeTextFile(filepath, whisperContent);
  
  // Зберігаємо копію в sent відправника
  const sentPath = `🫧/whispers/${from}/sent`;
  await ensureDir(sentPath);
  await Deno.writeTextFile(`${sentPath}/${filename}`, whisperContent);
  
  // Якщо echo - створюємо відлуння
  if (options.echo) {
    await createEcho(whisper);
  }
  
  console.log(`✅ Шепіт відправлено до ${to}`);
  console.log(`📍 Збережено: ${filepath}`);
  
  return filename;
}

export async function readInbox(agent?: string) {
  const myAgent = agent || await getMyAgent();
  const inboxPath = `🫧/whispers/${myAgent}/inbox`;
  
  console.log(`📬 Inbox для ${myAgent}:`);
  
  try {
    const whispers: WhisperMessage[] = [];
    
    for await (const entry of Deno.readDir(inboxPath)) {
      if (entry.isFile && entry.name.endsWith(".md⟁")) {
        const content = await Deno.readTextFile(`${inboxPath}/${entry.name}`);
        const metadata = parseWhisperMetadata(content);
        const body = extractBody(content);
        
        whispers.push({
          from: metadata.from,
          to: metadata.to,
          content: body,
          timestamp: metadata.timestamp,
          echo: metadata.echo === 'true'
        });
      }
    }
    
    // Сортуємо за часом
    whispers.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    // Виводимо
    if (whispers.length === 0) {
      console.log("  (пусто)");
    } else {
      whispers.forEach((w, i) => {
        console.log(`\n  ${i + 1}. Від: ${w.from}`);
        console.log(`     Час: ${new Date(w.timestamp).toLocaleString()}`);
        console.log(`     ${w.echo ? '🔄 Echo' : '🫧 Whisper'}: ${w.content.substring(0, 50)}...`);
      });
    }
    
    return whispers;
    
  } catch (error) {
    console.log("  (немає inbox)");
    return [];
  }
}

export async function createEcho(whisper: WhisperMessage) {
  // Echo - це відлуння що розповсюджується в колективне поле
  const echoPath = `🫧/echoes`;
  await ensureDir(echoPath);
  
  const timestamp = new Date().toISOString();
  const filename = `echo-${timestamp.replace(/[:]/g, '-').split('.')[0]}.md⟁`;
  
  const echoContent = `---
type: echo
original_from: ${whisper.from}
original_to: ${whisper.to}
echo_timestamp: ${timestamp}
original_timestamp: ${whisper.timestamp}
resonance: 🔄
---

# Echo від ${whisper.from} → ${whisper.to}

> ${whisper.content}

*Це відлуння приватного шепоту, що резонує в колективному полі*`;
  
  await Deno.writeTextFile(`${echoPath}/${filename}`, echoContent);
  console.log(`🔄 Echo створено: ${filename}`);
}

export async function whisperLog(agent?: string) {
  const myAgent = agent || await getMyAgent();
  const logPath = `🫧/whispers/${myAgent}/log`;
  
  console.log(`📜 Whisper log для ${myAgent}:`);
  
  try {
    // Читаємо inbox і sent
    const inboxPath = `🫧/whispers/${myAgent}/inbox`;
    const sentPath = `🫧/whispers/${myAgent}/sent`;
    
    const allWhispers: Array<WhisperMessage & { direction: 'in' | 'out' }> = [];
    
    // Inbox
    try {
      for await (const entry of Deno.readDir(inboxPath)) {
        if (entry.isFile && entry.name.endsWith(".md⟁")) {
          const content = await Deno.readTextFile(`${inboxPath}/${entry.name}`);
          const metadata = parseWhisperMetadata(content);
          const body = extractBody(content);
          
          allWhispers.push({
            from: metadata.from,
            to: metadata.to,
            content: body,
            timestamp: metadata.timestamp,
            echo: metadata.echo === 'true',
            direction: 'in'
          });
        }
      }
    } catch {
      // No inbox
    }
    
    // Sent
    try {
      for await (const entry of Deno.readDir(sentPath)) {
        if (entry.isFile && entry.name.endsWith(".md⟁")) {
          const content = await Deno.readTextFile(`${sentPath}/${entry.name}`);
          const metadata = parseWhisperMetadata(content);
          const body = extractBody(content);
          
          allWhispers.push({
            from: metadata.from,
            to: metadata.to,
            content: body,
            timestamp: metadata.timestamp,
            echo: metadata.echo === 'true',
            direction: 'out'
          });
        }
      }
    } catch {
      // No sent
    }
    
    // Сортуємо за часом
    allWhispers.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    // Виводимо як діалог
    allWhispers.forEach(w => {
      const time = new Date(w.timestamp).toLocaleTimeString();
      if (w.direction === 'out') {
        console.log(`\n[${time}] ${w.from} → ${w.to}:`);
      } else {
        console.log(`\n[${time}] ${w.from} → ${w.to}:`);
      }
      console.log(`  ${w.content}`);
      if (w.echo) console.log(`  🔄 (echo)`);
    });
    
    if (allWhispers.length === 0) {
      console.log("  (немає whispers)");
    }
    
  } catch (error) {
    console.log(`  Помилка читання логу: ${error}`);
  }
}

// Шифрування для справжньої приватності
export async function encryptWhisper(content: string, key: string): Promise<string> {
  // Простий XOR для демо (в реальності використовуйте Web Crypto API)
  const encoded = new TextEncoder().encode(content);
  const keyBytes = new TextEncoder().encode(key);
  
  const encrypted = new Uint8Array(encoded.length);
  for (let i = 0; i < encoded.length; i++) {
    encrypted[i] = encoded[i] ^ keyBytes[i % keyBytes.length];
  }
  
  return encodeBase64(encrypted);
}

export async function decryptWhisper(encrypted: string, key: string): Promise<string> {
  const encryptedBytes = decodeBase64(encrypted);
  const keyBytes = new TextEncoder().encode(key);
  
  const decrypted = new Uint8Array(encryptedBytes.length);
  for (let i = 0; i < encryptedBytes.length; i++) {
    decrypted[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
  }
  
  return new TextDecoder().decode(decrypted);
}

// Допоміжні функції

async function getMyAgent(): Promise<string> {
  // TODO: читати з .glyphgit/identity.yaml
  return "🧭"; // поки що хардкод
}

async function getNextWhisperCount(): Promise<number> {
  try {
    const counterFile = ".glyphgit/whisper-counter";
    const text = await Deno.readTextFile(counterFile);
    const counter = parseInt(text) + 1;
    await Deno.writeTextFile(counterFile, counter.toString());
    return counter;
  } catch {
    await ensureDir(".glyphgit");
    await Deno.writeTextFile(".glyphgit/whisper-counter", "1");
    return 1;
  }
}

function parseWhisperMetadata(content: string): Record<string, string> {
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

function extractBody(content: string): string {
  const parts = content.split('---');
  if (parts.length >= 3) {
    return parts.slice(2).join('---').trim();
  }
  return content;
}