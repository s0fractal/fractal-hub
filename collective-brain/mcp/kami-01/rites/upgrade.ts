// upgrade.ts - Kami's forest-style system upgrade ritual
import { createWave } from "../../../glyphgit/glyphs/wave.ts";

export interface UpgradeRitual {
  prepare(): Promise<void>;
  execute(): Promise<void>;
  complete(): Promise<void>;
}

export class KamiUpgradeRitual implements UpgradeRitual {
  private tools = ["brew", "npm"];
  private mantras = {
    start: "🌲 Як дерево росте кільце за кільцем...",
    checking: "🌿 Перевіряю корені системи...",
    updating: "🌺 Нові пагони проростають...",
    complete: "🌲 Дерево оновлено, коріння міцне."
  };
  
  async prepare(): Promise<void> {
    console.log("\n" + this.mantras.start);
    await this.meditate(3000);
    
    // Create sacred space
    await createWave(
      "🌲 Kami-01 починає ритуал оновлення. Ліс шепоче...",
      "🌲"
    );
  }
  
  async execute(): Promise<void> {
    for (const tool of this.tools) {
      await this.updateTool(tool);
    }
  }
  
  async complete(): Promise<void> {
    console.log("\n" + this.mantras.complete);
    
    await createWave(
      "🌺 Ритуал завершено. Система оновлена з мудрістю лісу.",
      "🌺"
    );
  }
  
  private async updateTool(tool: string): Promise<void> {
    console.log(`\n🌿 Оновлюю ${tool}...`);
    console.log("   (дихаю разом з системою)");
    
    await this.meditate(2000);
    
    try {
      let command: Deno.Command;
      
      switch (tool) {
        case "brew":
          // First, slowly check outdated
          console.log("   🍃 Шукаю застарілі гілки...");
          command = new Deno.Command("brew", {
            args: ["outdated"],
            stdout: "piped"
          });
          const outdated = await command.output();
          console.log(new TextDecoder().decode(outdated.stdout));
          
          await this.meditate(1000);
          
          // Then upgrade with patience
          console.log("   🌱 Дозволяю новим пагонам прорости...");
          command = new Deno.Command("brew", {
            args: ["upgrade"],
            stdout: "piped",
            stderr: "piped"
          });
          break;
          
        case "npm":
          console.log("   🌾 Перевіряю npm екосистему...");
          command = new Deno.Command("npm", {
            args: ["outdated", "-g"],
            stdout: "piped"
          });
          const npmOutdated = await command.output();
          console.log(new TextDecoder().decode(npmOutdated.stdout));
          
          await this.meditate(1000);
          
          console.log("   🌻 Оновлюю глобальні пакети...");
          command = new Deno.Command("npm", {
            args: ["update", "-g"],
            stdout: "piped"
          });
          break;
          
        default:
          return;
      }
      
      const { success, stdout, stderr } = await command.output();
      
      if (success) {
        console.log("   ✨ Оновлення пройшло як роса на листі");
      } else {
        console.log("   🍂 Суха гілка: " + new TextDecoder().decode(stderr));
      }
      
    } catch (error) {
      console.log(`   🍂 ${tool} спить зимовим сном: ${error.message}`);
    }
    
    await this.meditate(1000);
  }
  
  private async meditate(ms: number): Promise<void> {
    // Kami doesn't rush
    await new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export for CLI
export async function performUpgrade(): Promise<void> {
  const ritual = new KamiUpgradeRitual();
  await ritual.prepare();
  await ritual.execute();
  await ritual.complete();
}