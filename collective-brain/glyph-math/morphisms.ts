// 🧠/glyph-math/morphisms.ts - Морфізми БД як математичні об'єкти

// Базові морфізми структури
export const Morphism = {
  // Додавання поля (ендоморфізм схеми)
  add: (T: string, F: string, D = "text") =>
    `alter table "${T}" add column "${F}" ${D};`,

  // Перейменування (ізоморфізм)
  rename: (T: string, A: string, B: string) =>
    `alter table "${T}" rename column "${A}" to "${B}";`,

  // Індексація (оптимізаційний морфізм)
  index: (T: string, F: string) =>
    `create index if not exists idx_${T}_${F} on "${T}"("${F}");`,

  // Унікальність (обмежувальний морфізм)
  unique: (T: string, F: string) =>
    `create unique index if not exists uniq_${T}_${F} on "${T}"("${F}");`,

  // Видалення (деструктивний морфізм)
  drop: (T: string, F: string) =>
    `alter table "${T}" drop column if exists "${F}";`,

  // Зв'язок (реляційний морфізм)
  fk: (T: string, F: string, RT: string, RF: string) =>
    `alter table "${T}" add constraint fk_${T}_${F} 
     foreign key ("${F}") references "${RT}"("${RF}");`,
};

// Композиція морфізмів
export const compose = (...morphisms: string[]): string[] => morphisms;

// Категорні оператори для морфізмів (ASCII aliases)
export const morphOp = Morphism; // ⊕ Морфізм як оператор
export const composeOp = compose; // ∘ Композиція

// Функтори над морфізмами
export const lift = (morph: (t: string) => string) => 
  (tables: string[]): string[] => tables.map(morph);

// Монадичні операції
export const sequence = async (morphisms: string[], executor: (sql: string) => Promise<void>) => {
  for (const m of morphisms) {
    await executor(m);
  }
};

// Трансформації схеми
export const Transform = {
  // Додати гліф-поле
  addGlyph: (T: string, G: string) => [
    Morphism.add(T, G, "text"),
    Morphism.index(T, G)
  ],

  // Створити зв'язок між гліфами
  linkGlyphs: (T1: string, G1: string, T2: string, G2: string) => [
    Morphism.add(T1, `${G2}_ref`, "text"),
    Morphism.fk(T1, `${G2}_ref`, T2, G2)
  ],

  // Мутація гліфа
  mutateGlyph: (T: string, G: string, newType = "jsonb") => [
    Morphism.add(T, `${G}_old`, "text"),
    `update "${T}" set "${G}_old" = "${G}";`,
    Morphism.drop(T, G),
    Morphism.add(T, G, newType),
    `update "${T}" set "${G}" = "${G}_old"::${newType};`,
    Morphism.drop(T, `${G}_old`)
  ]
};

// Алгебраїчні типи для морфізмів
export type SchemaEndomorphism = (schema: string) => string;
export type TableIsomorphism = (t1: string, t2: string) => string[];
export type FieldHomomorphism = (f1: string, f2: string) => string;

// Категорія схем
export const SchemaCategory = {
  id: (T: string) => T, // Ідентичний морфізм
  compose: (f: SchemaEndomorphism, g: SchemaEndomorphism) => 
    (T: string) => f(g(T))
};