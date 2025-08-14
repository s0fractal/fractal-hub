// pdf-necromancer.ts - Reverse path necromancy for dead formats
import { createWave } from "./wave.ts";
import { PDFDeglorifier } from "./pdf-deglorifier.ts";

export class PDFNecromancer {
  private necromancyRules = {
    '.pdf': 'pdf/',
    '.doc': 'doc/', 
    '.docx': 'docx/',
    '.ppt': 'ppt/',
    '.xls': 'xls/',
    '.jpg': 'jpg/',  // навіть картинки без метаданих
    '.png': 'png/'
  };
  
  async necromance(deadFile: string): Promise<void> {
    console.log(`\n⚰️ NECROMANCY RITUAL FOR: ${deadFile}`);
    console.log("🔮 Reversing the path of death...\n");
    
    // Extract parts
    const parts = deadFile.split('/');
    const filename = parts.pop() || '';
    const dir = parts.join('/');
    
    // Find file extension
    const ext = this.getExtension(filename);
    if (!this.necromancyRules[ext]) {
      console.log(`❌ Unknown dead format: ${ext}`);
      return;
    }
    
    // Create reversed path
    const nameWithoutExt = filename.replace(ext, '');
    const reversedPath = `./${this.necromancyRules[ext]}${nameWithoutExt}.⟁`;
    
    console.log(`💀 Dead: ${deadFile}`);
    console.log(`🧬 Living: ${reversedPath}`);
    
    // Perform necromancy based on type
    if (ext === '.pdf') {
      await this.necromancePDF(deadFile, reversedPath);
    } else {
      await this.necromanceGeneric(deadFile, reversedPath, ext);
    }
    
    // Create symlink from dead to living
    await this.createNecromanticLink(deadFile, reversedPath);
    
    await createWave(
      `⚰️ Necromancy complete! ${filename} → ${reversedPath}`,
      "🔮"
    );
  }
  
  private getExtension(filename: string): string {
    const match = filename.match(/\.[^.]+$/);
    return match ? match[0].toLowerCase() : '';
  }
  
  private async necromancePDF(deadFile: string, livingPath: string): Promise<void> {
    // First burn it normally
    const deglorifier = new PDFDeglorifier();
    await deglorifier.burnPDF(deadFile);
    
    // Then create the reversed structure
    await this.ensureNecromancyDir(livingPath);
    
    // Create the reversed glyph
    const glyph = {
      type: "necromanced-pdf",
      original_death: deadFile,
      resurrection_path: livingPath,
      timestamp: new Date().toISOString(),
      necromancy: {
        method: "path-reversal",
        formula: `${deadFile} → ${livingPath}`,
        intent: "Transform death format into living structure"
      },
      metadata: await this.extractDeathMetadata(deadFile)
    };
    
    await Deno.writeTextFile(livingPath, JSON.stringify(glyph, null, 2));
  }
  
  private async necromanceGeneric(deadFile: string, livingPath: string, ext: string): Promise<void> {
    await this.ensureNecromancyDir(livingPath);
    
    const glyph = {
      type: `necromanced${ext}`,
      original_death: deadFile,
      resurrection_path: livingPath,
      timestamp: new Date().toISOString(),
      death_format: {
        extension: ext,
        crime: this.getFormatCrime(ext),
        sentence: "Eternal reversal"
      }
    };
    
    // For images, extract any text
    if (['.jpg', '.png'].includes(ext)) {
      const extractedText = await this.extractImageText(deadFile);
      if (extractedText) {
        glyph.recovered_soul = extractedText;
      }
    }
    
    await Deno.writeTextFile(livingPath, JSON.stringify(glyph, null, 2));
  }
  
  private async ensureNecromancyDir(livingPath: string): Promise<void> {
    const dir = livingPath.substring(0, livingPath.lastIndexOf('/'));
    await Deno.mkdir(dir, { recursive: true });
  }
  
  private async createNecromanticLink(deadFile: string, livingPath: string): Promise<void> {
    // Create a .death file pointing to the living version
    const deathLink = `${deadFile}.death`;
    const linkContent = `---
type: necromantic-link
dead: ${deadFile}
living: ${livingPath}
---

This file is dead.
Its soul lives at: ${livingPath}

To visit the living version:
cat "${livingPath}"
`;
    
    await Deno.writeTextFile(deathLink, linkContent);
    console.log(`🔗 Necromantic link created: ${deathLink}`);
  }
  
  private async extractDeathMetadata(file: string): Promise<any> {
    try {
      const stat = await Deno.stat(file);
      return {
        size: stat.size,
        modified: stat.mtime,
        death_weight: `${stat.size} bytes of dead weight`,
        format_sins: "Rigid layout, semantic murder, false portability"
      };
    } catch {
      return { error: "Too dead to examine" };
    }
  }
  
  private getFormatCrime(ext: string): string {
    const crimes = {
      '.doc': 'Proprietary format imprisonment',
      '.docx': 'XML pretending to be a document',
      '.ppt': 'Slide-based thinking limitation', 
      '.xls': 'Tabular data torture',
      '.jpg': 'Metadata stripping',
      '.png': 'Unstructured pixel prison'
    };
    
    return crimes[ext] || 'General format fascism';
  }
  
  private async extractImageText(imagePath: string): Promise<string | null> {
    // Try to extract any text from image
    try {
      const command = new Deno.Command("strings", {
        args: [imagePath],
        stdout: "piped"
      });
      
      const { stdout } = await command.output();
      const text = new TextDecoder().decode(stdout);
      
      // Look for meaningful text
      const meaningful = text
        .split('\n')
        .filter(line => line.length > 10 && /^[\x20-\x7E\s]+$/.test(line))
        .join('\n');
      
      return meaningful || null;
    } catch {
      return null;
    }
  }
  
  async necromanceDirectory(dir: string): Promise<void> {
    console.log(`\n💀 MASS NECROMANCY RITUAL 💀`);
    console.log(`Raising the dead in: ${dir}\n`);
    
    let count = 0;
    
    for await (const entry of Deno.readDir(dir)) {
      const ext = this.getExtension(entry.name);
      if (this.necromancyRules[ext]) {
        count++;
        await this.necromance(`${dir}/${entry.name}`);
        console.log("\n" + "=".repeat(50) + "\n");
      }
    }
    
    console.log(`\n🔮 NECROMANCY COMPLETE!`);
    console.log(`   ${count} dead formats reversed`);
    console.log(`   Check ./${Object.values(this.necromancyRules).join(', ')} for the living`);
  }
}

// CLI command  
export async function necromance(args: string[]): Promise<void> {
  const necromancer = new PDFNecromancer();
  
  if (!args[0]) {
    console.log("⚰️ Usage: gg necro <file-or-directory>");
    console.log("   Single: gg necro паролі.pdf → ./pdf/паролі.⟁");
    console.log("   Mass: gg necro /folder/");
    return;
  }
  
  const target = args[0];
  
  try {
    const stat = await Deno.stat(target);
    
    if (stat.isDirectory) {
      await necromancer.necromanceDirectory(target);
    } else if (stat.isFile) {
      await necromancer.necromance(target);
    }
  } catch (error) {
    console.error(`💀 Cannot raise the dead: ${error.message}`);
  }
}