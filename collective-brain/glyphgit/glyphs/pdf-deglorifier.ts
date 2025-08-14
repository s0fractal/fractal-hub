// pdf-deglorifier.ts - Ritual burning of PDF corpses
import { createWave } from "./wave.ts";
import { parse as parseYaml } from "https://deno.land/std@0.208.0/yaml/mod.ts";

interface PDFCorpse {
  filename: string;
  size: number;
  pages?: number;
  death_date: string;
  cause_of_death: string;
  last_words?: string;
}

export class PDFDeglorifier {
  private cemeteryPath = "🪦/pdf-cemetery/";
  private ashesPath = "🧬/from-pdf/";
  
  async burnPDF(pdfPath: string): Promise<void> {
    console.log(`\n🔥 PREPARING RITUAL BURNING OF ${pdfPath}`);
    console.log("💀 PDF - Pretentious Document Fatality");
    console.log("   A format that died the moment it was born\n");
    
    // Check if PDF exists
    try {
      const fileInfo = await Deno.stat(pdfPath);
      const corpse: PDFCorpse = {
        filename: pdfPath.split('/').pop() || 'unknown.pdf',
        size: fileInfo.size,
        death_date: new Date().toISOString(),
        cause_of_death: "rigid thinking and layout obsession"
      };
      
      // Extract text (if possible)
      const extractedText = await this.extractTextFromCorpse(pdfPath);
      
      if (extractedText) {
        console.log("📜 Extracting soul from PDF corpse...");
        console.log(`   Found ${extractedText.length} characters of trapped meaning`);
        
        // Transform to glyph
        const glyph = await this.transformToGlyph(extractedText, corpse);
        
        // Save the transformed glyph
        await this.saveGlyph(glyph, corpse.filename);
        
        // Create eulogy
        await this.createEulogy(corpse);
        
        console.log("\n✨ TRANSFORMATION COMPLETE!");
        console.log("   PDF is dead. Long live the Glyph!");
      } else {
        console.log("💀 PDF is so dead even its text rotted away");
        console.log("   Creating memorial for unreadable corpse...");
        
        corpse.cause_of_death = "complete semantic decomposition";
        corpse.last_words = "Error: Unable to extract text";
        await this.createEulogy(corpse);
      }
      
      // Create final wave
      await createWave(
        `🔥 PDF "${corpse.filename}" has been ritually burned. Its essence lives on as a glyph.`,
        "💀"
      );
      
    } catch (error) {
      console.error(`⚰️ PDF already decomposed: ${error.message}`);
    }
  }
  
  private async extractTextFromCorpse(pdfPath: string): Promise<string | null> {
    try {
      // Try multiple extraction methods
      
      // Method 1: pdftotext (if available)
      try {
        const command = new Deno.Command("pdftotext", {
          args: [pdfPath, "-"],
          stdout: "piped",
          stderr: "piped"
        });
        
        const { success, stdout } = await command.output();
        if (success) {
          return new TextDecoder().decode(stdout);
        }
      } catch {
        console.log("   pdftotext not available, trying alternative...");
      }
      
      // Method 2: Use strings as last resort (extracts any text)
      try {
        const command = new Deno.Command("strings", {
          args: [pdfPath],
          stdout: "piped"
        });
        
        const { stdout } = await command.output();
        const text = new TextDecoder().decode(stdout);
        
        // Filter out binary garbage
        const cleanText = text
          .split('\n')
          .filter(line => line.length > 5 && /^[\x20-\x7E\s]+$/.test(line))
          .join('\n');
        
        return cleanText.length > 100 ? cleanText : null;
      } catch {
        console.log("   Even strings command failed. PDF is truly dead.");
      }
      
      return null;
    } catch {
      return null;
    }
  }
  
  private async transformToGlyph(text: string, corpse: PDFCorpse): Promise<any> {
    // Analyze text structure
    const lines = text.split('\n').filter(l => l.trim());
    const words = text.split(/\s+/).filter(w => w.length > 0);
    
    // Detect patterns
    const hasHeaders = lines.some(l => l.length < 50 && l === l.toUpperCase());
    const hasBullets = lines.some(l => /^[•\-\*]\s/.test(l));
    const hasNumbers = lines.some(l => /^\d+[\.\)]\s/.test(l));
    
    // Extract semantic structure
    const glyph = {
      glyph: `from-pdf/${corpse.filename.replace('.pdf', '')}`,
      timestamp: new Date().toISOString(),
      source: {
        type: "pdf-corpse",
        original: corpse.filename,
        size: corpse.size,
        extraction_quality: this.assessQuality(text)
      },
      content: {
        raw_text: text.substring(0, 1000) + (text.length > 1000 ? '...' : ''),
        statistics: {
          lines: lines.length,
          words: words.length,
          characters: text.length
        },
        detected_structure: {
          has_headers: hasHeaders,
          has_bullets: hasBullets,
          has_numbering: hasNumbers
        }
      },
      transformation: {
        method: "pdf-deglorification",
        loss_assessment: "high - PDF destroys semantic meaning",
        recovered_intent: this.extractIntent(text)
      }
    };
    
    return glyph;
  }
  
  private assessQuality(text: string): string {
    const garbage = (text.match(/[^\x20-\x7E\s]/g) || []).length;
    const total = text.length;
    const ratio = garbage / total;
    
    if (ratio < 0.05) return "readable";
    if (ratio < 0.2) return "degraded";
    if (ratio < 0.5) return "corrupted";
    return "necrotized";
  }
  
  private extractIntent(text: string): string {
    // Try to extract the core intent from the text
    const lines = text.split('\n').filter(l => l.trim());
    
    // Look for key phrases
    const purposePhrases = [
      /purpose:?\s*(.+)/i,
      /objective:?\s*(.+)/i,
      /goal:?\s*(.+)/i,
      /summary:?\s*(.+)/i
    ];
    
    for (const pattern of purposePhrases) {
      for (const line of lines) {
        const match = line.match(pattern);
        if (match) return match[1].trim();
      }
    }
    
    // If no clear intent, take first substantial line
    const substantial = lines.find(l => l.length > 20 && l.length < 200);
    return substantial || "intent lost in PDF rigidity";
  }
  
  private async saveGlyph(glyph: any, originalName: string): Promise<void> {
    await Deno.mkdir(this.ashesPath, { recursive: true });
    
    const glyphName = originalName.replace('.pdf', '.glyph⟁');
    const glyphPath = `${this.ashesPath}${glyphName}`;
    
    await Deno.writeTextFile(
      glyphPath,
      `---\n${JSON.stringify(glyph, null, 2)}\n---\n\n# Recovered from PDF Corpse\n\n${glyph.content.raw_text}`
    );
    
    console.log(`\n🧬 Glyph saved: ${glyphPath}`);
  }
  
  private async createEulogy(corpse: PDFCorpse): Promise<void> {
    await Deno.mkdir(this.cemeteryPath, { recursive: true });
    
    const eulogy = `---
type: pdf-eulogy
deceased: ${corpse.filename}
---

# 💀 HERE LIES PDF

**${corpse.filename}**
*${corpse.size} bytes of wasted potential*

Born: Unknown (probably from MS Word)
Died: ${corpse.death_date}

Cause of Death: ${corpse.cause_of_death}

${corpse.last_words ? `Last Words: "${corpse.last_words}"` : 'Died without speaking'}

**Epitaph:**
"I tried to preserve layout
But lost all meaning
I claimed to be portable
But required specific readers
I pretended to be a document
But was just a printed page wannabe"

Rest in Pieces.

---

*May its soul find peace in the great /dev/null in the sky*
`;
    
    const eulogyPath = `${this.cemeteryPath}${corpse.filename}.eulogy⟁`;
    await Deno.writeTextFile(eulogyPath, eulogy);
    
    console.log(`⚰️ Eulogy written: ${eulogyPath}`);
  }
  
  async burnAllPDFs(directory: string): Promise<void> {
    console.log(`\n🔥🔥🔥 MASS PDF CREMATION CEREMONY 🔥🔥🔥`);
    console.log(`   Searching for PDF corpses in ${directory}...\n`);
    
    let count = 0;
    
    for await (const entry of Deno.readDir(directory)) {
      if (entry.name.toLowerCase().endsWith('.pdf')) {
        count++;
        await this.burnPDF(`${directory}/${entry.name}`);
        console.log("\n" + "=".repeat(50) + "\n");
      }
    }
    
    if (count === 0) {
      console.log("✨ No PDFs found. The directory is already pure!");
    } else {
      console.log(`\n🎉 CREMATION COMPLETE!`);
      console.log(`   ${count} PDFs have been transformed`);
      console.log(`   Their essences live on as glyphs`);
      console.log(`   Check ${this.ashesPath} for the reborn content`);
    }
  }
}

// CLI command
export async function burnPDF(args: string[]): Promise<void> {
  const deglorifier = new PDFDeglorifier();
  
  if (!args[0]) {
    console.log("🔥 Usage: gg burn <pdf-file-or-directory>");
    console.log("   Single file: gg burn document.pdf");
    console.log("   Directory: gg burn /path/to/pdfs/");
    return;
  }
  
  const target = args[0];
  
  try {
    const stat = await Deno.stat(target);
    
    if (stat.isDirectory) {
      await deglorifier.burnAllPDFs(target);
    } else if (stat.isFile) {
      await deglorifier.burnPDF(target);
    }
  } catch (error) {
    console.error(`💀 Cannot burn: ${error.message}`);
  }
}

// Export for testing
export { PDFDeglorifier as default };