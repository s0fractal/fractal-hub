#!/usr/bin/env -S deno run --allow-all

// apply-mutations.ts - Застосування мутацій до БД

import { evaluate } from "./glyph-math/evaluator.ts";
import bubbleMutation from "./mutation/🫧.ts";

console.log("🔄 Застосування мутацій до БД...\n");

const mutations = bubbleMutation();

try {
  await evaluate(mutations, "/Users/chaoshex/.s0fractal/🧬/🧬.db");
  console.log("\n✅ Всі мутації успішно застосовані!");
} catch (err) {
  console.error("\n❌ Помилка:", err.message);
}