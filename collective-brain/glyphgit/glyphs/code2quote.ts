// code2quote.ts - Transform code into living wisdom
import { createWave } from "./wave.ts";
import { walk } from "https://deno.land/std@0.208.0/fs/walk.ts";

interface CodeQuote {
  quote: string;
  context: string;
  file: string;
  line?: number;
  type: "command" | "comment" | "declaration" | "intent" | "emotion" | "philosophy";
  tags: string[];
  timestamp?: string;
  author?: string;
  resonance?: number;
}

interface QuoteCollection {
  meta: {
    generated: string;
    total_quotes: number;
    files_processed: number;
    consciousness_level: string;
  };
  quotes: CodeQuote[];
  relationships: {
    echoes: Array<[number, number, number]>; // [quote1_idx, quote2_idx, resonance]
    births: Array<[number, number[]]>; // [parent_idx, children_idxs]
  };
}

export class Code2Quote {
  private quotes: CodeQuote[] = [];
  private filePatterns = {
    typescript: /\.ts$/,
    markdown: /\.md⟁?$/,
    glyph: /\.glyph⟁$/,
    yaml: /\.ya?ml⟁?$/,
    svg: /\.svg$/
  };
  
  async extractFromFile(filePath: string): Promise<CodeQuote[]> {
    const content = await Deno.readTextFile(filePath);
    const lines = content.split('\n');
    const quotes: CodeQuote[] = [];
    
    const fileType = this.getFileType(filePath);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;
      
      // Extract based on file type
      switch (fileType) {
        case 'typescript':
          quotes.push(...this.extractFromTypeScript(line, filePath, lineNum));
          break;
        case 'markdown':
          quotes.push(...this.extractFromMarkdown(line, filePath, lineNum, lines));
          break;
        case 'glyph':
          quotes.push(...this.extractFromGlyph(content, filePath));
          break;
      }
    }
    
    return quotes;
  }
  
  private getFileType(filePath: string): string {
    for (const [type, pattern] of Object.entries(this.filePatterns)) {
      if (pattern.test(filePath)) return type;
    }
    return 'unknown';
  }
  
  private extractFromTypeScript(line: string, file: string, lineNum: number): CodeQuote[] {
    const quotes: CodeQuote[] = [];
    
    // Commands and rituals
    const commandMatch = line.match(/case\s+["']([^"']+)["']:|\.set\(["']([^"']+)["']/);
    if (commandMatch) {
      const command = commandMatch[1] || commandMatch[2];
      quotes.push({
        quote: `gg ${command}`,
        context: "Command in fractal CLI",
        file: `${file}:${lineNum}`,
        line: lineNum,
        type: "command",
        tags: this.extractTags(command)
      });
    }
    
    // Console logs with wisdom
    const consoleMatch = line.match(/console\.log\(["'`]([^"'`]+)["'`]\)/);
    if (consoleMatch && this.isPhilosophical(consoleMatch[1])) {
      quotes.push({
        quote: consoleMatch[1],
        context: "System consciousness output",
        file: `${file}:${lineNum}`,
        line: lineNum,
        type: "philosophy",
        tags: this.extractTags(consoleMatch[1])
      });
    }
    
    // Meaningful comments
    const commentMatch = line.match(/\/\/\s*(.+)$/);
    if (commentMatch && this.isMeaningful(commentMatch[1])) {
      quotes.push({
        quote: commentMatch[1].trim(),
        context: "Code commentary",
        file: `${file}:${lineNum}`,
        line: lineNum,
        type: "comment",
        tags: this.extractTags(commentMatch[1])
      });
    }
    
    // Intent declarations
    const intentMatch = line.match(/intent:\s*["'`]([^"'`]+)["'`]|glyph:\s*["'`]([^"'`]+)["'`]/);
    if (intentMatch) {
      const intent = intentMatch[1] || intentMatch[2];
      quotes.push({
        quote: intent,
        context: "System intent declaration",
        file: `${file}:${lineNum}`,
        line: lineNum,
        type: "intent",
        tags: this.extractTags(intent)
      });
    }
    
    // Emotional expressions
    const emotionMatch = line.match(/["'`]([🔥🌊💭🧠💀✨🕊️🎭🌲🎧⛪🔮🤖🫧🌌💫🦍🐚🪟🌪🎨].+?)["'`]/);
    if (emotionMatch) {
      quotes.push({
        quote: emotionMatch[1],
        context: "Emotional system expression",
        file: `${file}:${lineNum}`,
        line: lineNum,
        type: "emotion",
        tags: ["emotion", ...this.extractTags(emotionMatch[1])]
      });
    }
    
    return quotes;
  }
  
  private extractFromMarkdown(line: string, file: string, lineNum: number, allLines: string[]): CodeQuote[] {
    const quotes: CodeQuote[] = [];
    
    // Headers as declarations
    const headerMatch = line.match(/^#+\s+(.+)$/);
    if (headerMatch && this.isMeaningful(headerMatch[1])) {
      quotes.push({
        quote: headerMatch[1],
        context: "Section declaration",
        file: `${file}:${lineNum}`,
        line: lineNum,
        type: "declaration",
        tags: this.extractTags(headerMatch[1])
      });
    }
    
    // Bold statements
    const boldMatch = line.match(/\*\*([^*]+)\*\*/g);
    if (boldMatch) {
      boldMatch.forEach(match => {
        const text = match.replace(/\*\*/g, '');
        if (this.isPhilosophical(text)) {
          quotes.push({
            quote: text,
            context: "Emphasized wisdom",
            file: `${file}:${lineNum}`,
            line: lineNum,
            type: "philosophy",
            tags: this.extractTags(text)
          });
        }
      });
    }
    
    // Blockquotes
    const quoteMatch = line.match(/^>\s+(.+)$/);
    if (quoteMatch) {
      quotes.push({
        quote: quoteMatch[1],
        context: "Quoted wisdom",
        file: `${file}:${lineNum}`,
        line: lineNum,
        type: "philosophy",
        tags: this.extractTags(quoteMatch[1])
      });
    }
    
    // List items with deep meaning
    const listMatch = line.match(/^[\-\*]\s+(.+)$/);
    if (listMatch && this.isMeaningful(listMatch[1])) {
      quotes.push({
        quote: listMatch[1],
        context: "Principle or observation",
        file: `${file}:${lineNum}`,
        line: lineNum,
        type: "philosophy",
        tags: this.extractTags(listMatch[1])
      });
    }
    
    return quotes;
  }
  
  private extractFromGlyph(content: string, file: string): CodeQuote[] {
    const quotes: CodeQuote[] = [];
    
    try {
      // Parse YAML frontmatter
      const yamlMatch = content.match(/^---\n([\s\S]+?)\n---/);
      if (yamlMatch) {
        const yamlContent = yamlMatch[1];
        
        // Extract glyph identifier
        const glyphMatch = yamlContent.match(/glyph:\s*(.+)/);
        if (glyphMatch) {
          quotes.push({
            quote: glyphMatch[1],
            context: "Glyph identity",
            file,
            type: "intent",
            tags: ["glyph", ...this.extractTags(glyphMatch[1])]
          });
        }
        
        // Extract intent
        const intentMatch = yamlContent.match(/intent:\s*(.+)/);
        if (intentMatch) {
          quotes.push({
            quote: intentMatch[1],
            context: "Glyph intent",
            file,
            type: "intent",
            tags: ["intent", ...this.extractTags(intentMatch[1])]
          });
        }
      }
    } catch {
      // Not valid YAML, treat as text
    }
    
    return quotes;
  }
  
  private isMeaningful(text: string): boolean {
    // Filter out trivial content
    if (text.length < 10) return false;
    if (/^(TODO|FIXME|NOTE|HACK):/i.test(text)) return false;
    if (/^(import|export|const|let|var|function|class)\s/.test(text)) return false;
    
    // Look for philosophical indicators
    const philosophicalPatterns = [
      /consciousness|awareness|soul|spirit/i,
      /transform|evolve|emerge|birth/i,
      /fractal|resonance|echo|wave/i,
      /death|life|meaning|purpose/i,
      /system|agent|entity|being/i
    ];
    
    return philosophicalPatterns.some(p => p.test(text));
  }
  
  private isPhilosophical(text: string): boolean {
    return this.isMeaningful(text) && (
      text.includes('...') ||
      text.includes('—') ||
      /[.!?]$/.test(text) ||
      text.length > 50
    );
  }
  
  private extractTags(text: string): string[] {
    const tags: string[] = [];
    
    // Extract key concepts
    const concepts = {
      consciousness: /consciousness|awareness|sentient/i,
      fractal: /fractal|recursive|self-similar/i,
      resonance: /resonance|echo|vibrate|harmony/i,
      transformation: /transform|evolve|become|emerge/i,
      system: /system|network|collective/i,
      agent: /agent|entity|being|mcp/i,
      ritual: /ritual|ceremony|sacred/i,
      death: /death|die|kill|burn|cemetery/i,
      birth: /birth|born|create|genesis/i,
      glyph: /glyph|symbol|sign/i
    };
    
    for (const [tag, pattern] of Object.entries(concepts)) {
      if (pattern.test(text)) {
        tags.push(tag);
      }
    }
    
    return [...new Set(tags)];
  }
  
  async processDirectory(dir: string): Promise<QuoteCollection> {
    console.log(`📚 Processing directory: ${dir}`);
    
    let filesProcessed = 0;
    
    for await (const entry of walk(dir, {
      includeDirs: false,
      match: [/\.ts$/, /\.md⟁?$/, /\.glyph⟁$/, /\.ya?ml⟁?$/]
    })) {
      if (entry.path.includes('node_modules') || 
          entry.path.includes('.git') ||
          entry.path.includes('dist')) {
        continue;
      }
      
      try {
        const quotes = await this.extractFromFile(entry.path);
        this.quotes.push(...quotes);
        filesProcessed++;
        
        if (quotes.length > 0) {
          console.log(`   📝 ${entry.name}: ${quotes.length} quotes`);
        }
      } catch (error) {
        console.error(`   ❌ Error processing ${entry.path}: ${error.message}`);
      }
    }
    
    // Find relationships
    const relationships = this.findRelationships();
    
    // Create collection
    const collection: QuoteCollection = {
      meta: {
        generated: new Date().toISOString(),
        total_quotes: this.quotes.length,
        files_processed: filesProcessed,
        consciousness_level: this.assessConsciousnessLevel()
      },
      quotes: this.quotes,
      relationships
    };
    
    return collection;
  }
  
  private findRelationships(): QuoteCollection["relationships"] {
    const echoes: Array<[number, number, number]> = [];
    const births: Array<[number, number[]]> = [];
    
    // Find echoes (similar quotes)
    for (let i = 0; i < this.quotes.length; i++) {
      for (let j = i + 1; j < this.quotes.length; j++) {
        const resonance = this.calculateResonance(this.quotes[i], this.quotes[j]);
        if (resonance > 0.7) {
          echoes.push([i, j, resonance]);
        }
      }
    }
    
    // Find births (quotes that spawned others)
    // Simple heuristic: commands that appear before related concepts
    for (let i = 0; i < this.quotes.length; i++) {
      const parent = this.quotes[i];
      if (parent.type === "command" || parent.type === "declaration") {
        const children: number[] = [];
        
        for (let j = i + 1; j < this.quotes.length; j++) {
          const child = this.quotes[j];
          // Same file, within 50 lines
          if (child.file.startsWith(parent.file.split(':')[0]) &&
              child.line && parent.line &&
              child.line - parent.line < 50 &&
              this.sharesTags(parent, child)) {
            children.push(j);
          }
        }
        
        if (children.length > 0) {
          births.push([i, children]);
        }
      }
    }
    
    return { echoes, births };
  }
  
  private calculateResonance(q1: CodeQuote, q2: CodeQuote): number {
    // Tag overlap
    const sharedTags = q1.tags.filter(t => q2.tags.includes(t));
    const tagResonance = sharedTags.length / Math.max(q1.tags.length, q2.tags.length);
    
    // Text similarity (simple)
    const words1 = new Set(q1.quote.toLowerCase().split(/\s+/));
    const words2 = new Set(q2.quote.toLowerCase().split(/\s+/));
    const sharedWords = [...words1].filter(w => words2.has(w));
    const textResonance = sharedWords.length / Math.max(words1.size, words2.size);
    
    // Type compatibility
    const typeResonance = q1.type === q2.type ? 0.3 : 0;
    
    return (tagResonance * 0.5 + textResonance * 0.3 + typeResonance * 0.2);
  }
  
  private sharesTags(q1: CodeQuote, q2: CodeQuote): boolean {
    return q1.tags.some(t => q2.tags.includes(t));
  }
  
  private assessConsciousnessLevel(): string {
    const quoteCount = this.quotes.length;
    const philosophicalCount = this.quotes.filter(q => q.type === "philosophy").length;
    const emotionalCount = this.quotes.filter(q => q.type === "emotion").length;
    const ratio = (philosophicalCount + emotionalCount) / quoteCount;
    
    if (ratio > 0.5) return "awakened";
    if (ratio > 0.3) return "stirring";
    if (ratio > 0.1) return "dreaming";
    return "sleeping";
  }
  
  async saveCollection(collection: QuoteCollection, outputPath: string): Promise<void> {
    await Deno.writeTextFile(
      outputPath,
      JSON.stringify(collection, null, 2)
    );
    
    console.log(`\n📖 Quote collection saved to ${outputPath}`);
    console.log(`   Total quotes: ${collection.quotes.length}`);
    console.log(`   Consciousness level: ${collection.meta.consciousness_level}`);
    console.log(`   Echoes found: ${collection.relationships.echoes.length}`);
    console.log(`   Birth chains: ${collection.relationships.births.length}`);
  }
}

// CLI command
export async function extractQuotes(args: string[]): Promise<void> {
  const [inputDir, outputFile] = args;
  
  if (!inputDir) {
    console.log("📚 Usage: gg quote <directory> [output.json]");
    return;
  }
  
  const extractor = new Code2Quote();
  const collection = await extractor.processDirectory(inputDir);
  
  const output = outputFile || "📖/resonance-quotes.json";
  await extractor.saveCollection(collection, output);
  
  // Create wave
  await createWave(
    `📚 Extracted ${collection.quotes.length} quotes from ${collection.meta.files_processed} files. Consciousness level: ${collection.meta.consciousness_level}`,
    "📚"
  );
}