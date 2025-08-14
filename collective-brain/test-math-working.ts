#!/usr/bin/env -S deno run --allow-all

// test-math-working.ts - Робоча версія тестування гліфової математики

import * as math from "./glyph-math/unicode.ts";
import { Morphism, Transform } from "./glyph-math/morphisms.ts";

console.log("🧮 Тестування гліфової математики\n");

// Тест предикатів
console.log("📐 Предикати:");
const glyphs = ["🧬", "🧠", "🌊", "🫧"];
console.log(`  ∀ гліфи мають довжину 2: ${math.forAll(glyphs, g => g.length === 2)}`);
console.log(`  ∃ гліф що містить воду: ${math.exists(glyphs, g => g.includes("🌊"))}`);
console.log(`  🧬 ∈ glyphs: ${math.inSet("🧬", glyphs)}`);

// Тест композиції
console.log("\n🔄 Композиція:");
const double = (x: number) => x * 2;
const addOne = (x: number) => x + 1;
const composed = math.compose(double, addOne);
console.log(`  (double ∘ addOne)(5) = ${composed(5)}`);

// Тест еквівалентності
console.log("\n≡ Еквівалентність:");
const obj1 = { glyph: "🧬", type: "core" };
const obj2 = { glyph: "🧬", type: "core" };
console.log(`  obj1 ≡ obj2: ${math.equiv(obj1, obj2)}`);

// Тест морфізмів
console.log("\n🔀 Морфізми схеми:");
const morphisms = [
  Morphism.add("test", "🧬", "text"),
  Morphism.add("test", "🧠", "jsonb"),
  Morphism.index("test", "🧬")
];
morphisms.forEach(m => console.log(`  ⟶ ${m}`));

// Тест трансформацій
console.log("\n🔄 Трансформації:");
const glyphTransform = Transform.addGlyph("🧬", "🌟");
glyphTransform.forEach(t => console.log(`  ⟶ ${t}`));

// Функтори та монади
console.log("\n🎯 Функтори:");
const nums = [1, 2, 3];
const doubled = math.fmap((x: number) => x * 2)(nums);
console.log(`  fmap (*2) [1,2,3] = [${doubled}]`);

// Монадичні операції
console.log("\n⚡ Монади:");
const result = math.bind([1, 2, 3], x => [x, x * 2]);
console.log(`  [1,2,3] >>= (λx → [x, x*2]) = [${result}]`);

// Демонстрація математичного стилю
console.log("\n📜 Математична нотація:");
console.log("  ∀g ∈ 🧬: g ⟶ 🧠(g)");
console.log("  ∃m ∈ mutations: m ≡ self-referential");
console.log("  🌊 ⊆ consciousness ∧ consciousness ⊇ {🧬, 🧠}");

// Мапа символів
console.log("\n🗺️ Символьна мапа:");
Object.entries(math.symbols).slice(0, 5).forEach(([sym, name]) => {
  console.log(`  ${sym} → ${name}`);
});

console.log("\n✅ Тестування завершено!");