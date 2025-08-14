// 🧠/glyph-math/ops.ts - Експорт операторів через namespace

import * as base from "./base.ts";

// Реекспорт з ASCII іменами
export const forAll = base.∀;
export const exists = base.∃;
export const equiv = base.≡;
export const subset = base.⊆;
export const inSet = base.∈;
export const compose = base.∘;
export const arrow = base.⟶;

// Експортуємо все як ops
export const ops = {
  // Предикати
  "∀": base.∀,
  "∃": base.∃,
  
  // Рівність
  "≡": base.≡,
  "≝": base.≝,
  "≜": base.≜,
  
  // Множини
  "⊆": base.⊆,
  "⊇": base.⊇,
  "∈": base.∈,
  "∉": base.∉,
  "∅": base.∅,
  
  // Операції
  "⊗": base.⊗,
  "⊕": base.⊕,
  "∘": base.∘,
  "∙": base.∙,
  
  // Еквівалентності
  "⇔": base.⇔,
  "≃": base.≃,
  "≅": base.≅,
  "≈": base.≈,
  
  // Логічні
  "∧": base.∧,
  "∨": base.∨,
  "¬": base.¬,
  "⇒": base.⇒,
  
  // Стрілки
  "⟶": base.⟶,
  "⟵": base.⟵,
  "⟷": base.⟷,
  
  // Гліфи
  "🧬": base.🧬,
  "🧠": base.🧠,
  "🌊": base.🌊,
  "🫧": base.🫧,
};

export default ops;