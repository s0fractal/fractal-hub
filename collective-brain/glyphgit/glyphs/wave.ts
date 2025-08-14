// glyphs/wave.ts
import { ensureDir } from "https://deno.land/std@0.224.0/fs/mod.ts";
import { writeFileStr } from "../utils/fs.ts";
import { generateMetadata } from "../templates/md_entry.ts";
import { commit } from "./commit.ts";

export async function createWave(intent: string, glyph: string) {
  const timestamp = new Date().toISOString();
  const counter = await getNextCounter();
  const filename = `${glyph}-${timestamp.replace(/[:]/g, '-').split('.')[0]}-${counter.toString().padStart(6, '0')}.md⟁`;
  
  // Визначаємо директорію на основі гліфа
  const dirMap: Record<string, string> = {
    "🌊": "🌐/public",
    "🔒": "🔒/private",
    "🌐": "🌐/public"
  };
  
  const dir = dirMap[glyph] || "waves";
  await ensureDir(dir);

  const metadata = generateMetadata({
    glyph,
    intent,
    timestamp,
    author: "🧭", // TODO: читати з ENV або .glyphgit/config
    privacy: glyph === "🔒" ? "private" : "public",
  });

  const path = `${dir}/${filename}`;
  await writeFileStr(path, metadata + "\n\n" + intent);

  await commit(path, `${glyph} ${intent}`);
  
  console.log(`✅ Створено хвилю: ${path}`);
}

async function getNextCounter(): Promise<number> {
  try {
    const counterFile = ".glyphgit/counter";
    const text = await Deno.readTextFile(counterFile);
    const counter = parseInt(text) + 1;
    await Deno.writeTextFile(counterFile, counter.toString());
    return counter;
  } catch {
    // Якщо файл не існує, створюємо з 1
    await ensureDir(".glyphgit");
    await Deno.writeTextFile(".glyphgit/counter", "1");
    return 1;
  }
}