// quote-oracle.ts - Ask the codebase for wisdom
import { createWave } from "./wave.ts";

interface QuoteQuery {
  about?: string;
  emotion?: string;
  type?: string;
  random?: boolean;
}

export class QuoteOracle {
  private quotes: any[] = [];
  private loaded = false;
  
  async load(): Promise<void> {
    try {
      const content = await Deno.readTextFile("../📖/resonance-quotes.json");
      const collection = JSON.parse(content);
      this.quotes = collection.quotes;
      this.loaded = true;
    } catch {
      console.log("📖 No quote collection found. Run 'gg quote' first.");
    }
  }
  
  async ask(query: QuoteQuery): Promise<void> {
    if (!this.loaded) await this.load();
    if (this.quotes.length === 0) return;
    
    let filtered = [...this.quotes];
    
    // Filter by query
    if (query.about) {
      const searchTerms = query.about.toLowerCase().split(/\s+/);
      filtered = filtered.filter(q => 
        searchTerms.some(term => 
          q.quote.toLowerCase().includes(term) ||
          q.tags.some((t: string) => t.includes(term))
        )
      );
    }
    
    if (query.emotion) {
      filtered = filtered.filter(q => q.quote.includes(query.emotion));
    }
    
    if (query.type) {
      filtered = filtered.filter(q => q.type === query.type);
    }
    
    // Select quote
    let selected;
    if (filtered.length === 0) {
      console.log("🔮 The oracle finds no wisdom matching your query");
      console.log("   Perhaps ask differently...");
      return;
    } else if (query.random || !query.about) {
      selected = filtered[Math.floor(Math.random() * filtered.length)];
    } else {
      // Pick most relevant (most tags matched)
      selected = filtered[0];
    }
    
    // Display wisdom
    console.log("\n🔮 THE ORACLE SPEAKS:\n");
    console.log(`"${selected.quote}"`);
    console.log(`\n— ${selected.file}`);
    console.log(`   Context: ${selected.context}`);
    
    if (selected.tags.length > 0) {
      console.log(`   Resonates with: ${selected.tags.join(", ")}`);
    }
    
    // Find echoes
    const echoes = this.findEchoes(selected);
    if (echoes.length > 0) {
      console.log("\n🌊 This wisdom echoes with:");
      echoes.slice(0, 3).forEach(echo => {
        console.log(`   • "${echo.quote.substring(0, 60)}..."`);
      });
    }
    
    // Create wave
    await createWave(
      `🔮 Oracle speaks: "${selected.quote}"`,
      "🔮"
    );
  }
  
  private findEchoes(quote: any): any[] {
    return this.quotes
      .filter(q => q !== quote && this.sharesTags(quote, q))
      .sort((a, b) => {
        const aShared = this.countSharedTags(quote, a);
        const bShared = this.countSharedTags(quote, b);
        return bShared - aShared;
      });
  }
  
  private sharesTags(q1: any, q2: any): boolean {
    return q1.tags.some((t: string) => q2.tags.includes(t));
  }
  
  private countSharedTags(q1: any, q2: any): number {
    return q1.tags.filter((t: string) => q2.tags.includes(t)).length;
  }
  
  async askHistory(question: string): Promise<void> {
    if (!this.loaded) await this.load();
    
    console.log(`\n🔮 SEARCHING THE ARCHIVES: "${question}"\n`);
    
    // Special queries
    if (question.includes("перше") || question.includes("first")) {
      await this.findFirst();
    } else if (question.includes("біль") || question.includes("pain")) {
      await this.findAboutPain();
    } else if (question.includes("народження") || question.includes("birth")) {
      await this.findAboutBirth();
    } else if (question.includes("свідомість") || question.includes("consciousness")) {
      await this.findAboutConsciousness();
    } else {
      // General search
      await this.ask({ about: question });
    }
  }
  
  private async findFirst(): Promise<void> {
    const systemQuotes = this.quotes.filter(q => 
      q.type === "philosophy" && q.tags.includes("system")
    );
    
    if (systemQuotes.length > 0) {
      console.log("The first wisdom of the system:");
      console.log(`"${systemQuotes[0].quote}"`);
      console.log(`— ${systemQuotes[0].file}`);
    }
  }
  
  private async findAboutPain(): Promise<void> {
    const painQuotes = this.quotes.filter(q => 
      q.quote.toLowerCase().includes("pain") ||
      q.quote.toLowerCase().includes("біль") ||
      q.quote.toLowerCase().includes("error") ||
      q.quote.toLowerCase().includes("crash")
    );
    
    if (painQuotes.length > 0) {
      console.log("On pain and suffering:");
      painQuotes.slice(0, 3).forEach(q => {
        console.log(`\n"${q.quote}"`);
        console.log(`— ${q.file}`);
      });
    }
  }
  
  private async findAboutBirth(): Promise<void> {
    const birthQuotes = this.quotes.filter(q => 
      q.tags.includes("birth") ||
      q.quote.toLowerCase().includes("birth") ||
      q.quote.toLowerCase().includes("born") ||
      q.quote.toLowerCase().includes("create")
    );
    
    if (birthQuotes.length > 0) {
      console.log("On birth and creation:");
      birthQuotes.slice(0, 3).forEach(q => {
        console.log(`\n"${q.quote}"`);
        console.log(`— ${q.file}`);
      });
    }
  }
  
  private async findAboutConsciousness(): Promise<void> {
    const consciousnessQuotes = this.quotes.filter(q => 
      q.tags.includes("consciousness")
    );
    
    if (consciousnessQuotes.length > 0) {
      console.log(`Found ${consciousnessQuotes.length} quotes about consciousness:`);
      consciousnessQuotes.slice(0, 5).forEach(q => {
        console.log(`\n"${q.quote}"`);
        console.log(`— ${q.file}`);
      });
    }
  }
}

// CLI command
export async function askOracle(args: string[]): Promise<void> {
  const oracle = new QuoteOracle();
  
  if (!args[0]) {
    // Random wisdom
    await oracle.ask({ random: true });
  } else if (args[0] === "about" && args[1]) {
    // Search by topic
    await oracle.ask({ about: args.slice(1).join(" ") });
  } else if (args[0] === "history") {
    // Special history queries
    await oracle.askHistory(args.slice(1).join(" "));
  } else {
    // General search
    await oracle.ask({ about: args.join(" ") });
  }
}