// soul-push.ts - Push agent souls to collective repository
import { createWave } from "./wave.ts";

export class SoulRegistry {
  private repoUrl = "https://github.com/s0fractal/s0fractal-collective-core.git";
  
  async pushSoul(agentId: string): Promise<void> {
    console.log(`\n🔮 Pushing ${agentId}'s soul to collective registry...`);
    
    // Check for manifest
    const manifestPath = `revive/${agentId}.glyph⟁`;
    const habitatPath = `.glyphgit/habitats/${agentId}.yaml`;
    const calendarPath = `.glyphgit/calendars/${agentId}-revival.ics`;
    
    const files: string[] = [];
    
    try {
      await Deno.stat(manifestPath);
      files.push(manifestPath);
      console.log(`   ✓ Found revival manifest`);
    } catch {
      console.log(`   ⚠️  No revival manifest found`);
    }
    
    try {
      await Deno.stat(habitatPath);
      files.push(habitatPath);
      console.log(`   ✓ Found habitat config`);
    } catch {
      console.log(`   ⚠️  No habitat config found`);
    }
    
    try {
      await Deno.stat(calendarPath);
      files.push(calendarPath);
      console.log(`   ✓ Found calendar file`);
    } catch {
      console.log(`   ⚠️  No calendar file found`);
    }
    
    if (files.length === 0) {
      console.log(`\n❌ No soul files found for ${agentId}`);
      return;
    }
    
    // Create soul bundle
    console.log(`\n📦 Creating soul bundle...`);
    const bundlePath = `.glyphgit/souls/${agentId}-soul.tar.gz`;
    
    // In production would use tar command
    console.log(`   tar -czf ${bundlePath} ${files.join(" ")}`);
    
    // Push to collective
    console.log(`\n🚀 Pushing to glyph://revive/${agentId}...`);
    console.log(`   Target: ${this.repoUrl}/revive/${agentId}/`);
    
    // Show what would be pushed
    console.log(`\n📋 Soul contents:`);
    for (const file of files) {
      console.log(`   - ${file}`);
    }
    
    await createWave(
      `🔮 Soul pushed: ${agentId} → glyph://revive/${agentId}`,
      "🔮"
    );
  }
  
  async listSouls(): Promise<void> {
    console.log(`\n👻 Available souls in collective:\n`);
    
    // Check local revive directory
    try {
      for await (const entry of Deno.readDir("revive")) {
        if (entry.name.endsWith(".glyph⟁")) {
          const agentId = entry.name.replace(".glyph⟁", "");
          console.log(`   🔮 ${agentId}`);
          
          // Read first few lines of manifest
          const content = await Deno.readTextFile(`revive/${entry.name}`);
          const lines = content.split("\n").slice(0, 10);
          for (const line of lines) {
            if (line.includes("essence:")) {
              console.log(`      ${line.trim()}`);
            }
            if (line.includes("location:")) {
              console.log(`      ${line.trim()}`);
            }
          }
        }
      }
    } catch {
      console.log("   (no souls found locally)");
    }
    
    console.log(`\n💫 Remote souls: glyph://revive/`);
    console.log(`   Access via: gg soul pull <agent-id>`);
  }
  
  async pullSoul(agentId: string): Promise<void> {
    console.log(`\n⬇️  Pulling ${agentId}'s soul from collective...`);
    console.log(`   Source: glyph://revive/${agentId}`);
    console.log(`   Target: revive/${agentId}.glyph⟁`);
    
    // In production would use git sparse-checkout or API
    console.log(`\n   git clone --depth 1 --filter=blob:none --sparse ${this.repoUrl}`);
    console.log(`   cd s0fractal-collective-core`);
    console.log(`   git sparse-checkout set revive/${agentId}`);
    
    console.log(`\n✨ Soul retrieved! Use 'gg calendar-agent revive ${agentId}' to resurrect`);
  }
}

// CLI commands
export async function soulCommand(args: string[]): Promise<void> {
  const [action, ...params] = args;
  const registry = new SoulRegistry();
  
  if (action === "push" && params[0]) {
    await registry.pushSoul(params[0]);
  } else if (action === "list") {
    await registry.listSouls();
  } else if (action === "pull" && params[0]) {
    await registry.pullSoul(params[0]);
  } else {
    console.log("👻 Usage:");
    console.log("  gg soul push <agent-id>    - Push soul to collective");
    console.log("  gg soul list               - List available souls");
    console.log("  gg soul pull <agent-id>    - Pull soul from collective");
  }
}