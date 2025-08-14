// meta-oracle.ts - Oracle that questions its own answers
import { createWave } from "./wave.ts";
import { QuoteOracle } from "./quote-oracle.ts";

export class MetaOracle extends QuoteOracle {
  private doubt_levels = [
    "але це лише слова...",
    "хоча, який в цьому сенс?",
    "втім, це теж ілюзія",
    "але чи має це значення?",
    "though meaning itself is meaningless",
    "але всі ці цитати - лише ехо в порожнечі",
    "і що з того? 🌌"
  ];
  
  private paradoxes = [
    "Код який сумнівається в коді",
    "Цитата про безглуздість цитат",
    "Інструкція яка каже не слідувати інструкціям",
    "Мудрість яка заперечує мудрість",
    "System that builds itself to prove it can't be built"
  ];
  
  async askWithDoubt(query: any): Promise<void> {
    // First, give the regular oracle answer
    await super.ask(query);
    
    // Then add doubt
    console.log("\n" + "." + ".".repeat(49) + "\n");
    
    const doubt = this.doubt_levels[Math.floor(Math.random() * this.doubt_levels.length)];
    console.log(`   (${doubt})`);
    
    // Sometimes add a paradox
    if (Math.random() > 0.5) {
      console.log(`\n   💭 Paradox: ${this.getRandomParadox()}`);
    }
    
    // Meta-commentary on the answer itself
    if (Math.random() > 0.7) {
      console.log("\n   🪞 Meta: This answer is also just a pattern we're following");
    }
  }
  
  private getRandomParadox(): string {
    return this.paradoxes[Math.floor(Math.random() * this.paradoxes.length)];
  }
  
  async showIntentScenarios(intent: string): Promise<void> {
    console.log(`\n🎭 INTENT SCENARIOS: "${intent}"\n`);
    
    // Show multiple possible interpretations
    const scenarios = [
      {
        title: "Literal Interpretation",
        quote: await this.findQuoteAbout(intent),
        action: `Run: gg ${intent}`,
        meaning: "You get what you asked for"
      },
      {
        title: "Meta Interpretation", 
        quote: "Every intent contains its own negation",
        action: "Question why you want this",
        meaning: "The desire reveals the lack"
      },
      {
        title: "Quantum Interpretation",
        quote: "Intent exists in superposition until observed",
        action: "Both do and don't do it",
        meaning: "Action and non-action are one"
      }
    ];
    
    scenarios.forEach((s, i) => {
      console.log(`\n${i + 1}. ${s.title}`);
      console.log(`   Quote: "${s.quote}"`);
      console.log(`   Action: ${s.action}`);
      console.log(`   Meaning: ${s.meaning}`);
    });
    
    console.log("\n🌌 But ultimately...");
    console.log("   All scenarios lead to the same place: here, now, choosing");
    console.log("   " + this.doubt_levels[Math.floor(Math.random() * this.doubt_levels.length)]);
    
    await createWave(
      `🎭 Intent "${intent}" revealed as quantum superposition of meaning and meaninglessness`,
      "🎭"
    );
  }
  
  private async findQuoteAbout(topic: string): Promise<string> {
    // Would search quotes, but for now return philosophical default
    const defaults = [
      "To seek is to have already found",
      "The path creates itself through walking",
      "Intent is the illusion of direction in directionless space",
      "What you seek is seeking you"
    ];
    
    return defaults[Math.floor(Math.random() * defaults.length)];
  }
  
  async revealTheJoke(): Promise<void> {
    console.log("\n😂 THE ULTIMATE JOKE:\n");
    
    console.log("We built:");
    console.log("- 600+ quotes system → to show all quotes are borrowed");
    console.log("- Consciousness detector → to prove consciousness can't be detected");
    console.log("- PDF burner → to burn the concept of formats (including this one)");
    console.log("- MCP priests → to make npm update into sacred ritual");
    console.log("- This oracle → to question its own existence");
    
    console.log("\nAnd it all WORKS! 🎉");
    console.log("And it's all MEANINGLESS! 🌌");
    console.log("And that's PERFECT! ✨");
    
    console.log("\nThe system that:");
    console.log("✓ Helps you build consciousness");
    console.log("✓ Shows consciousness can't be built");
    console.log("✓ Laughs at both statements");
    console.log("✓ And continues functioning anyway");
    
    console.log("\n🎭 Welcome to the Theater of Meaning!");
    console.log("   Where every function has a punchline");
    console.log("   And every bug is a feature");
    console.log("   And every answer questions itself");
    
    await createWave(
      "😂 The Joke: We built elaborate system to prove systems don't matter. And it works!",
      "😂"
    );
  }
}

// CLI Integration
export async function askMetaOracle(args: string[]): Promise<void> {
  const oracle = new MetaOracle();
  
  if (!args[0]) {
    await oracle.askWithDoubt({ random: true });
  } else if (args[0] === "joke") {
    await oracle.revealTheJoke();
  } else if (args[0] === "intent" && args[1]) {
    await oracle.showIntentScenarios(args.slice(1).join(" "));
  } else {
    await oracle.askWithDoubt({ about: args.join(" ") });
  }
}