// resonance-detector.ts - Expose cultural parasites through semantic echo analysis
import { createWave } from "./wave.ts";

interface ResonanceSource {
  id: string;
  text: string;
  author: string;
  year?: number;
  context?: string;
  category: "wisdom" | "corporate" | "pop-culture" | "religious" | "political";
}

interface ResonanceMatch {
  source: ResonanceSource;
  match_strength: number; // 0-1
  type: "exact" | "paraphrase" | "semantic" | "structural";
  parasitic_level: "original" | "inspired" | "derivative" | "plagiarized";
}

export class ResonanceDetector {
  private echoIndex: Map<string, ResonanceSource> = new Map();
  private vectorCache: Map<string, number[]> = new Map();
  
  constructor() {
    this.loadEchoIndex();
  }
  
  private loadEchoIndex(): void {
    // Load common parasitic quotes
    const sources: ResonanceSource[] = [
      // Corporate inspirational spam
      {
        id: "jobs_stanford_2005",
        text: "Stay hungry, stay foolish",
        author: "Steve Jobs",
        year: 2005,
        context: "Stanford commencement",
        category: "corporate"
      },
      {
        id: "jobs_dots",
        text: "You can't connect the dots looking forward; you can only connect them looking backwards",
        author: "Steve Jobs", 
        year: 2005,
        category: "corporate"
      },
      {
        id: "nike_slogan",
        text: "Just do it",
        author: "Nike",
        year: 1988,
        category: "corporate"
      },
      
      // Pop culture parasites
      {
        id: "spiderman_power",
        text: "With great power comes great responsibility",
        author: "Spider-Man",
        year: 1962,
        context: "Uncle Ben",
        category: "pop-culture"
      },
      {
        id: "star_wars_force",
        text: "May the Force be with you",
        author: "Star Wars",
        year: 1977,
        category: "pop-culture"
      },
      {
        id: "matrix_red_pill",
        text: "You take the red pill, you stay in Wonderland",
        author: "The Matrix",
        year: 1999,
        category: "pop-culture"
      },
      
      // Pseudo-wisdom spam
      {
        id: "einstein_fish",
        text: "Everybody is a genius. But if you judge a fish by its ability to climb a tree, it will live its whole life believing that it is stupid",
        author: "Fake Einstein",
        context: "Never said this",
        category: "wisdom"
      },
      {
        id: "gandhi_change",
        text: "Be the change you wish to see in the world",
        author: "Misattributed Gandhi",
        context: "Paraphrase at best",
        category: "wisdom"
      },
      
      // Religious/spiritual spam
      {
        id: "bible_possible",
        text: "With God all things are possible",
        author: "Matthew 19:26",
        category: "religious"
      },
      {
        id: "buddha_mind",
        text: "We are what we think. All that we are arises with our thoughts",
        author: "Buddha (paraphrase)",
        category: "religious"
      }
    ];
    
    // Load into index
    sources.forEach(source => {
      this.echoIndex.set(source.id, source);
      // Pre-compute vectors for common sources
      this.vectorCache.set(source.id, this.textToVector(source.text));
    });
  }
  
  async detectResonance(text: string): Promise<ResonanceMatch[]> {
    const matches: ResonanceMatch[] = [];
    const textVector = this.textToVector(text);
    const normalizedText = this.normalizeText(text);
    
    // Check each source
    for (const [id, source] of this.echoIndex) {
      const sourceVector = this.vectorCache.get(id)!;
      const normalizedSource = this.normalizeText(source.text);
      
      // Calculate different types of similarity
      const exactMatch = normalizedText.includes(normalizedSource) || 
                        normalizedSource.includes(normalizedText);
      const semanticSimilarity = this.cosineSimilarity(textVector, sourceVector);
      const structuralSimilarity = this.structuralSimilarity(text, source.text);
      
      // Determine match type and strength
      let matchStrength = 0;
      let matchType: ResonanceMatch["type"] = "semantic";
      
      if (exactMatch) {
        matchStrength = 1.0;
        matchType = "exact";
      } else if (semanticSimilarity > 0.8) {
        matchStrength = semanticSimilarity;
        matchType = "paraphrase";
      } else if (semanticSimilarity > 0.6) {
        matchStrength = semanticSimilarity;
        matchType = "semantic";
      } else if (structuralSimilarity > 0.7) {
        matchStrength = structuralSimilarity;
        matchType = "structural";
      }
      
      // Only report significant matches
      if (matchStrength > 0.6) {
        matches.push({
          source,
          match_strength: matchStrength,
          type: matchType,
          parasitic_level: this.assessParasiticLevel(matchStrength, matchType)
        });
      }
    }
    
    // Sort by match strength
    return matches.sort((a, b) => b.match_strength - a.match_strength);
  }
  
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  private textToVector(text: string): number[] {
    // Simple bag-of-words vector
    // In production, use proper embeddings
    const words = this.normalizeText(text).split(' ');
    const wordCounts = new Map<string, number>();
    
    words.forEach(word => {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    });
    
    // Convert to fixed-size vector (simplified)
    const commonWords = ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 
                        'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you',
                        'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they',
                        'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my',
                        'one', 'all', 'would', 'there', 'their', 'what', 'so',
                        'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go',
                        'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just',
                        'him', 'know', 'take', 'people', 'into', 'year', 'your',
                        'good', 'some', 'could', 'them', 'see', 'other', 'than',
                        'then', 'now', 'look', 'only', 'come', 'its', 'over',
                        'think', 'also', 'back', 'after', 'use', 'two', 'how',
                        'our', 'work', 'first', 'well', 'way', 'even', 'new',
                        'want', 'because', 'any', 'these', 'give', 'day', 'most'];
    
    return commonWords.map(word => wordCounts.get(word) || 0);
  }
  
  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }
    
    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);
    
    if (norm1 === 0 || norm2 === 0) return 0;
    
    return dotProduct / (norm1 * norm2);
  }
  
  private structuralSimilarity(text1: string, text2: string): number {
    // Check for similar patterns (questions, imperatives, etc)
    const patterns = [
      /^(stay|be|do|make|think)/i,
      /\?$/,
      /!/,
      /^if .+ then/i,
      /^you (can|will|must|should)/i
    ];
    
    let matches = 0;
    patterns.forEach(pattern => {
      if (pattern.test(text1) && pattern.test(text2)) {
        matches++;
      }
    });
    
    return matches / patterns.length;
  }
  
  private assessParasiticLevel(strength: number, type: ResonanceMatch["type"]): ResonanceMatch["parasitic_level"] {
    if (type === "exact") return "plagiarized";
    if (strength > 0.9) return "derivative";
    if (strength > 0.7) return "inspired";
    return "original";
  }
  
  async auditText(text: string, options?: { verbose?: boolean }): Promise<void> {
    console.log("\n🔍 RESONANCE AUDIT");
    console.log("=" + "=".repeat(50));
    
    // Split into sentences or meaningful chunks
    const chunks = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    let originalCount = 0;
    let parasiteCount = 0;
    const allMatches: { chunk: string; matches: ResonanceMatch[] }[] = [];
    
    for (const chunk of chunks) {
      const matches = await this.detectResonance(chunk);
      
      if (matches.length > 0) {
        allMatches.push({ chunk: chunk.trim(), matches });
        
        const topMatch = matches[0];
        if (topMatch.parasitic_level === "plagiarized" || topMatch.parasitic_level === "derivative") {
          parasiteCount++;
        }
      } else {
        originalCount++;
      }
    }
    
    // Report results
    console.log(`\n📊 RESULTS:`);
    console.log(`   Total statements: ${chunks.length}`);
    console.log(`   🧠 Original thoughts: ${originalCount}`);
    console.log(`   📛 Parasitic echoes: ${parasiteCount}`);
    console.log(`   ✨ Originality score: ${Math.round((originalCount / chunks.length) * 100)}%`);
    
    if (options?.verbose || parasiteCount > 0) {
      console.log(`\n⚠️  PARASITIC THOUGHTS DETECTED:\n`);
      
      allMatches.forEach(({ chunk, matches }) => {
        const topMatch = matches[0];
        if (topMatch.parasitic_level !== "original") {
          console.log(`📝 "${chunk}"`);
          console.log(`   → ${topMatch.parasitic_level.toUpperCase()} (${Math.round(topMatch.match_strength * 100)}% match)`);
          console.log(`   → Source: ${topMatch.source.author} - "${topMatch.source.text}"`);
          console.log(`   → Category: ${topMatch.source.category}`);
          console.log();
        }
      });
    }
    
    // Recommendations
    if (parasiteCount > chunks.length * 0.3) {
      console.log("\n💀 DIAGNOSIS: Heavy cultural parasitism detected!");
      console.log("   → Consider finding your own voice");
      console.log("   → Mark quotes explicitly or rewrite");
      console.log("   → Your thoughts are drowning in others' words");
    } else if (parasiteCount > 0) {
      console.log("\n⚠️  RECOMMENDATION: Some echo contamination");
      console.log("   → Review highlighted sections");
      console.log("   → Add proper attribution or rephrase");
    } else {
      console.log("\n✨ CLEAN: No significant parasitic content detected!");
    }
    
    // Create audit wave
    await createWave(
      `🔍 Resonance audit complete: ${Math.round((originalCount / chunks.length) * 100)}% original thought`,
      "🔍"
    );
  }
}

// Firewall for stream-church
export class MemeticFirewall {
  private detector = new ResonanceDetector();
  private threshold = 0.7; // 70% originality required
  
  async filterContent(content: string, source: string): Promise<boolean> {
    const chunks = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    let parasiteCount = 0;
    
    for (const chunk of chunks) {
      const matches = await this.detector.detectResonance(chunk);
      if (matches.length > 0 && matches[0].parasitic_level !== "original") {
        parasiteCount++;
      }
    }
    
    const originality = 1 - (parasiteCount / chunks.length);
    
    if (originality < this.threshold) {
      console.log(`🚫 MEMETIC FIREWALL: Content from ${source} rejected`);
      console.log(`   Originality: ${Math.round(originality * 100)}% (required: ${this.threshold * 100}%)`);
      
      // Save to parrot speech
      await Deno.mkdir("🗑️/parrot-speech", { recursive: true });
      await Deno.writeTextFile(
        `🗑️/parrot-speech/${source}-${Date.now()}.rejected⟁`,
        `---
rejected_at: ${new Date().toISOString()}
source: ${source}
originality: ${originality}
reason: Cultural parasitism detected
---

${content}`
      );
      
      return false;
    }
    
    return true;
  }
}

// CLI command
export async function auditResonance(args: string[]): Promise<void> {
  if (!args[0]) {
    console.log("🔍 Usage: gg audit <file> [--verbose]");
    return;
  }
  
  const detector = new ResonanceDetector();
  
  try {
    const content = await Deno.readTextFile(args[0]);
    await detector.auditText(content, { 
      verbose: args.includes("--verbose") 
    });
  } catch (error) {
    console.error(`❌ Cannot audit: ${error.message}`);
  }
}