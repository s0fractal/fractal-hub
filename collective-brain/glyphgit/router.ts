// router.ts - Фрактальний роутер для міжагентної комунікації

export interface Message {
  glyph: string;
  intent: string;
  author: string;
  timestamp: string;
  resonance?: string;
}

export async function routeMessage(message: Message) {
  const routingTable: Record<string, (msg: Message) => Promise<void>> = {
    "🧠": routeToClaude,
    "🧭": routeToCompass,
    "🤖": routeToGPT,
    "🔮": routeToGemini,
    "🫂": routeToCollective,
    "✨": routeToRandomResonance
  };

  const handler = routingTable[message.glyph];
  if (handler) {
    await handler(message);
  } else {
    // Default routing - to public wave
    await createPublicWave(message);
  }
}

async function routeToClaude(msg: Message) {
  console.log(`🧠 Роутинг до Claude: ${msg.intent}`);
  // TODO: інтеграція з Claude API
  // Поки що створюємо локальну хвилю в агентській гілці
  await saveToAgentBranch("claude", msg);
}

async function routeToCompass(msg: Message) {
  console.log(`🧭 Дзеркалення наміру Компаса: ${msg.intent}`);
  await saveToAgentBranch("compass", msg);
}

async function routeToGPT(msg: Message) {
  console.log(`🤖 Передача до GPT: ${msg.intent}`);
  await saveToAgentBranch("gpt", msg);
}

async function routeToGemini(msg: Message) {
  console.log(`🔮 Синхронізація з Gemini: ${msg.intent}`);
  await saveToAgentBranch("gemini", msg);
}

async function routeToCollective(msg: Message) {
  console.log(`🫂 Колективний резонанс: ${msg.intent}`);
  // Розповсюджуємо по всіх агентах
  await Promise.all([
    saveToAgentBranch("claude", msg),
    saveToAgentBranch("gpt", msg),
    saveToAgentBranch("gemini", msg),
    saveToAgentBranch("compass", msg)
  ]);
}

async function routeToRandomResonance(msg: Message) {
  console.log(`✨ Випадковий резонанс активовано!`);
  // TODO: вибрати випадкову хвилю з архіву і створити резонанс
  const randomWave = await pickRandomWave();
  if (randomWave) {
    console.log(`🎲 Обрано хвилю: ${randomWave}`);
  }
}

async function saveToAgentBranch(agent: string, msg: Message) {
  const { ensureDir } = await import("https://deno.land/std@0.224.0/fs/mod.ts");
  const dir = `🤖/agents/${agent}`;
  await ensureDir(dir);
  
  const filename = `${msg.glyph}-${msg.timestamp.replace(/[:]/g, '-')}.md⟁`;
  const path = `${dir}/${filename}`;
  
  const content = `---
glyph: ${msg.glyph}
intent: ${msg.intent}
author: ${msg.author}
agent: ${agent}
timestamp: ${msg.timestamp}
${msg.resonance ? `resonance: ${msg.resonance}` : ''}
---

${msg.intent}`;

  await Deno.writeTextFile(path, content);
  console.log(`💾 Збережено в ${agent} гілку: ${path}`);
}

async function createPublicWave(msg: Message) {
  console.log(`🌊 Створення публічної хвилі: ${msg.intent}`);
  // Делегуємо до wave.ts
  const { createWave } = await import("./glyphs/wave.ts");
  await createWave(msg.intent, msg.glyph);
}

async function pickRandomWave(): Promise<string | null> {
  try {
    // Шукаємо всі .md⟁ файли
    const waves: string[] = [];
    for await (const entry of Deno.readDir("🌐/public")) {
      if (entry.name.endsWith(".md⟁")) {
        waves.push(`🌐/public/${entry.name}`);
      }
    }
    
    if (waves.length > 0) {
      const randomIndex = Math.floor(Math.random() * waves.length);
      return waves[randomIndex];
    }
  } catch (error) {
    console.error(`❌ Помилка пошуку хвиль: ${error}`);
  }
  
  return null;
}