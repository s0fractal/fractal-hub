// 🧠/glyph-math/unicode.ts - Базова гліфова математика з ASCII експортами

// Предикати
export const forAll = <T>(xs: T[], f: (x: T) => boolean) => xs.every(f);
export const exists = <T>(xs: T[], f: (x: T) => boolean) => xs.some(f);

// Рівність і тотожність
export const equiv = <T>(a: T, b: T) => JSON.stringify(a) === JSON.stringify(b);
export const define = <T>(a: T) => a; // Означення через знак дефініції
export const equalDef = <T>(a: T, b: T) => a === b; // Визначення як

// Множини
export const subset = <T>(a: T[], b: T[]) => a.every(x => b.includes(x));
export const superset = <T>(a: T[], b: T[]) => b.every(x => a.includes(x));
export const inSet = <T>(x: T, xs: T[]) => xs.includes(x);
export const notInSet = <T>(x: T, xs: T[]) => !xs.includes(x);
export const emptySet = <T>(): T[] => [];

// Операції над морфізмами
export const tensorProduct = <T>(...fns: ((x: T) => T)[]) => (x: T): T =>
  fns.reduce((acc, fn) => fn(acc), x);
export const directSum = <T>(...fns: ((x: T) => T)[]) => (x: T): T =>
  fns.reduceRight((acc, fn) => fn(acc), x);

// Композиція
export const compose = <A, B, C>(f: (b: B) => C, g: (a: A) => B) => (a: A): C => f(g(a));
export const dot = <T>(f: (x: T) => T, g: (x: T) => T) => (x: T): T => f(g(x));

// Еквівалентності
export const iff = <T>(a: T, b: T) => a == b;
export const similar = <T>(a: T, b: T) => typeof a === typeof b;
export const isomorphic = <T>(a: T, b: T) => Object.keys(a).length === Object.keys(b).length;
export const approx = <T>(a: T, b: T) => Math.abs(Number(a) - Number(b)) < 0.001;

// Логічні
export const and = (a: boolean, b: boolean) => a && b;
export const or = (a: boolean, b: boolean) => a || b;
export const not = (a: boolean) => !a;
export const implies = (a: boolean, b: boolean) => !a || b;

// Функтори
export const fmap = <A, B>(f: (a: A) => B) => (xs: A[]): B[] => xs.map(f);
export const flatten = <T>(xs: T[][]): T[] => xs.flat();
export const unit = <T>(x: T): T[] => [x];

// Монади
export const bind = <A, B>(ma: A[], f: (a: A) => B[]): B[] => ma.flatMap(f);
export const then = <A, B>(ma: A[], mb: B[]): B[] => ma.flatMap(() => mb);

// Категорні стрілки
export const arrow = <A, B>(f: (a: A) => B) => f;
export const reverseArrow = <A, B>(f: (b: B) => A) => f;
export const biArrow = <A, B>(f: (a: A) => B, g: (b: B) => A) => ({ f, g });

// Гліфові оператори
export const geneIdentity = <T>(x: T): T => x; // 🧬 Ідентичність
export const brainEval = <T>(f: () => T): T => f(); // 🧠 Обчислення
export const waveStream = <T>(...xs: T[]): T[] => xs; // 🌊 Хвиля/потік
export const bubbleOption = <T>(x: T | undefined): T | null => x ?? null; // 🫧 Бульбашка/опція

// Символьна мапа для зручності
export const symbols = {
  // Предикати
  "∀": "forAll",
  "∃": "exists",
  
  // Рівність
  "≡": "equiv",
  "≝": "define",
  "≜": "equalDef",
  
  // Множини
  "⊆": "subset",
  "⊇": "superset",
  "∈": "inSet",
  "∉": "notInSet",
  "∅": "emptySet",
  
  // Операції
  "⊗": "tensorProduct",
  "⊕": "directSum",
  "∘": "compose",
  "∙": "dot",
  
  // Еквівалентності
  "⇔": "iff",
  "≃": "similar",
  "≅": "isomorphic",
  "≈": "approx",
  
  // Логічні
  "∧": "and",
  "∨": "or",
  "¬": "not",
  "⇒": "implies",
  
  // Стрілки
  "⟶": "arrow",
  "⟵": "reverseArrow",
  "⟷": "biArrow",
  
  // Гліфи
  "🧬": "geneIdentity",
  "🧠": "brainEval",
  "🌊": "waveStream",
  "🫧": "bubbleOption",
};