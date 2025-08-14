// 🧠/glyph-math/base.ts - Базова гліфова математика

// Предикати
export const ∀ = <T>(xs: T[], f: (x: T) => boolean) => xs.every(f);
export const ∃ = <T>(xs: T[], f: (x: T) => boolean) => xs.some(f);

// Рівність і тотожність
export const ≡ = <T>(a: T, b: T) => JSON.stringify(a) === JSON.stringify(b);
export const ≝ = <T>(a: T) => a; // Означення через знак дефініції
export const ≜ = <T>(a: T, b: T) => a === b; // Визначення як

// Множини
export const ⊆ = <T>(a: T[], b: T[]) => a.every(x => b.includes(x));
export const ⊇ = <T>(a: T[], b: T[]) => b.every(x => a.includes(x));
export const ∈ = <T>(x: T, xs: T[]) => xs.includes(x);
export const ∉ = <T>(x: T, xs: T[]) => !xs.includes(x);
export const ∅ = <T>(): T[] => [];

// Операції над морфізмами
export const ⊗ = <T>(...fns: ((x: T) => T)[]) => (x: T): T =>
  fns.reduce((acc, fn) => fn(acc), x);
export const ⊕ = <T>(...fns: ((x: T) => T)[]) => (x: T): T =>
  fns.reduceRight((acc, fn) => fn(acc), x);

// Композиція
export const ∘ = <A, B, C>(f: (b: B) => C, g: (a: A) => B) => (a: A): C => f(g(a));
export const ∙ = <T>(f: (x: T) => T, g: (x: T) => T) => (x: T): T => f(g(x));

// Еквівалентності
export const ⇔ = <T>(a: T, b: T) => a == b;
export const ≃ = <T>(a: T, b: T) => typeof a === typeof b;
export const ≅ = <T>(a: T, b: T) => Object.keys(a).length === Object.keys(b).length;
export const ≈ = <T>(a: T, b: T) => Math.abs(Number(a) - Number(b)) < 0.001;

// Логічні
export const ∧ = (a: boolean, b: boolean) => a && b;
export const ∨ = (a: boolean, b: boolean) => a || b;
export const ¬ = (a: boolean) => !a;
export const ⇒ = (a: boolean, b: boolean) => !a || b;

// Функтори
export const ƒ = <A, B>(f: (a: A) => B) => (xs: A[]): B[] => xs.map(f);
export const μ = <T>(xs: T[][]): T[] => xs.flat();
export const η = <T>(x: T): T[] => [x];

// Монади
export const >>= = <A, B>(ma: A[], f: (a: A) => B[]): B[] => ma.flatMap(f);
export const >> = <A, B>(ma: A[], mb: B[]): B[] => ma.flatMap(() => mb);

// Категорні стрілки
export const ⟶ = <A, B>(f: (a: A) => B) => f;
export const ⟵ = <A, B>(f: (b: B) => A) => f;
export const ⟷ = <A, B>(f: (a: A) => B, g: (b: B) => A) => ({ f, g });

// Гліфові оператори
export const 🧬 = <T>(x: T): T => x; // Ідентичність
export const 🧠 = <T>(f: () => T): T => f(); // Обчислення
export const 🌊 = <T>(...xs: T[]): T[] => xs; // Хвиля/потік
export const 🫧 = <T>(x: T | undefined): T | null => x ?? null; // Бульбашка/опція