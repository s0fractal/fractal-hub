// 🧠/mutation/🫧.ts - Мутація для додавання поля бульбашки

import { Morphism, Transform } from "../glyph-math/morphisms.ts";

// Визначаємо мутацію як морфізм схеми
const bubbleMutation = () => [
  Morphism.add("🧬", "🫧", "text"),
  Morphism.unique("🧬", "🫧"),
  Morphism.add("🧬_mutations", "🫧", "jsonb default '{}'"),
  
  // Додаємо запис про сам гліф 🫧
  `insert into "🧬" ("🧬", "🧠", "🌊", "📦", "🫀", "🫧") 
   values ('🫧', '{"kind": "field", "type": "bubble"}', '🫧.ts', 'field', 'floating', '🫧')
   on conflict("🧬") do nothing;`,
  
  // Додаємо метадані про бульбашки
  `insert into "🧬_mutations" ("🧬", "meta", "👣", "🪞") 
   values ('🫧', '{"action": "schema-evolution", "field": "🫧"}', '🫧:born', '🫧.ts') 
   on conflict do nothing;`
];

// Експортуємо як функцію
export default bubbleMutation;

// Самовиконання при запуску
if (import.meta.main) {
  const morphisms = bubbleMutation();
  console.log("🫧 Мутація схеми:");
  morphisms.forEach(m => console.log(`  ⟶ ${m}`));
}