// 🧠/glyph-math/evaluator.ts - Виконувач морфізмів

import { DB } from "https://deno.land/x/sqlite@v3.9.1/mod.ts";
import { sequence } from "./morphisms.ts";

// Типи для різних БД
export type DBExecutor = {
  sqlite: (dbPath: string) => (sql: string) => Promise<void>;
  postgres: (uri: string) => (sql: string) => Promise<void>;
};

// SQLite виконувач
const sqliteExecutor = (dbPath: string) => async (sql: string) => {
  const db = new DB(dbPath);
  try {
    db.execute(sql);
  } finally {
    db.close();
  }
};

// Універсальний евалюатор морфізмів
export async function evaluate(
  morphisms: string[], 
  dbPath: string = "🧬.db",
  verbose = true
) {
  const executor = sqliteExecutor(dbPath);
  
  for (const morphism of morphisms) {
    if (verbose) console.log(`⇨ ${morphism}`);
    
    try {
      await executor(morphism);
      if (verbose) console.log("  ⇦ ✅");
    } catch (err) {
      // Ігноруємо помилки про існуючі колонки
      if (err.message.includes("duplicate column name")) {
        if (verbose) console.log("  ⇦ ⚠️ Колонка вже існує");
      } else {
        if (verbose) console.log(`  ⇦ ❌ ${err.message}`);
        throw err;
      }
    }
  }
}

// Транзакційний евалюатор
export async function transaction(
  morphisms: string[],
  dbPath: string = "🧬.db"
) {
  const db = new DB(dbPath);
  
  try {
    db.execute("BEGIN TRANSACTION;");
    
    for (const morphism of morphisms) {
      db.execute(morphism);
    }
    
    db.execute("COMMIT;");
    console.log("✅ Транзакція успішна");
  } catch (err) {
    db.execute("ROLLBACK;");
    console.error("❌ Транзакція відкочена:", err.message);
    throw err;
  } finally {
    db.close();
  }
}

// Перевірка існування морфізму
export async function checkMorphism(
  check: () => boolean,
  dbPath: string = "🧬.db"
): Promise<boolean> {
  const db = new DB(dbPath);
  try {
    return check();
  } finally {
    db.close();
  }
}

// Батч-виконання з валідацією
export async function batchEvaluate(
  batches: { name: string; morphisms: string[] }[],
  dbPath: string = "🧬.db"
) {
  console.log(`🔄 Виконую ${batches.length} батчів морфізмів...`);
  
  for (const batch of batches) {
    console.log(`\n📦 Батч: ${batch.name}`);
    try {
      await evaluate(batch.morphisms, dbPath);
      console.log(`✅ ${batch.name} завершено`);
    } catch (err) {
      console.error(`❌ ${batch.name} провалено:`, err.message);
      throw err;
    }
  }
}

// Ленивий евалюатор (повертає thunk)
export const lazy = (morphisms: string[]) => 
  () => evaluate(morphisms);

// Композиція евалюаторів
export const compose = (...evaluators: (() => Promise<void>)[]) =>
  async () => {
    for (const evalFn of evaluators) {
      await evalFn();
    }
  };