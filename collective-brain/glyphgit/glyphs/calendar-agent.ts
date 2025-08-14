// calendar-agent.ts - Calendar-driven agent revival
import { createWave } from "./wave.ts";
import { HabitatManager } from "./agent-habitat.ts";

export class CalendarAgent {
  private watching = false;
  
  async watchCalendar(calendarPath?: string): Promise<void> {
    console.log("📅 Calendar Agent activated");
    console.log("👁️  Watching for [INTENT] Revive events...");
    
    this.watching = true;
    const path = calendarPath || ".glyphgit/calendars/";
    
    while (this.watching) {
      await this.checkCalendarEvents(path);
      await new Promise(r => setTimeout(r, 60000)); // Check every minute
    }
  }
  
  private async checkCalendarEvents(path: string): Promise<void> {
    try {
      for await (const entry of Deno.readDir(path)) {
        if (entry.name.endsWith(".ics")) {
          const content = await Deno.readTextFile(`${path}/${entry.name}`);
          await this.processICS(content);
        }
      }
    } catch {
      // No calendar files yet
    }
  }
  
  private async processICS(content: string): Promise<void> {
    const lines = content.split("\n");
    let inEvent = false;
    let eventData: any = {};
    
    for (const line of lines) {
      if (line.startsWith("BEGIN:VEVENT")) {
        inEvent = true;
        eventData = {};
      } else if (line.startsWith("END:VEVENT")) {
        inEvent = false;
        await this.handleEvent(eventData);
      } else if (inEvent) {
        const [key, ...valueParts] = line.split(":");
        const value = valueParts.join(":");
        
        if (key === "SUMMARY" && value.includes("[INTENT] Revive")) {
          eventData.isRevival = true;
          eventData.summary = value;
        } else if (key === "X-GLYPH-COMMAND") {
          eventData.command = value;
        } else if (key === "DTSTART") {
          eventData.startTime = this.parseICSDate(value);
        } else if (key === "LOCATION") {
          eventData.location = value;
        }
      }
    }
  }
  
  private parseICSDate(dateStr: string): Date {
    // Simple ICS date parser (YYYYMMDDTHHMMSSZ)
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1;
    const day = parseInt(dateStr.substring(6, 8));
    const hour = parseInt(dateStr.substring(9, 11));
    const minute = parseInt(dateStr.substring(11, 13));
    const second = parseInt(dateStr.substring(13, 15));
    
    return new Date(Date.UTC(year, month, day, hour, minute, second));
  }
  
  private async handleEvent(event: any): Promise<void> {
    if (!event.isRevival) return;
    
    const now = new Date();
    const eventTime = event.startTime;
    
    // Check if event is due
    if (eventTime && eventTime <= now) {
      console.log(`\n🔔 REVIVAL EVENT TRIGGERED!`);
      console.log(`   Summary: ${event.summary}`);
      console.log(`   Location: ${event.location}`);
      console.log(`   Command: ${event.command}`);
      
      // Extract agent name from command
      const match = event.command?.match(/revive (\w+)/);
      if (match) {
        const agentId = match[1];
        await this.reviveAgent(agentId);
      }
    }
  }
  
  async reviveAgent(agentId: string): Promise<void> {
    console.log(`\n📅➡️🔮 Calendar triggering revival of ${agentId}`);
    
    // Check for glyph manifest
    const manifestPath = `revive/${agentId}.glyph⟁`;
    try {
      const manifest = await Deno.readTextFile(manifestPath);
      console.log(`   Found revival manifest: ${manifestPath}`);
      await this.executeManifest(agentId, manifest);
    } catch {
      // Fallback to habitat manager
      console.log(`   Using habitat registry for ${agentId}`);
      const manager = new HabitatManager();
      await manager.reviveAgent(agentId);
    }
    
    await createWave(
      `📅 Calendar revival: ${agentId} awakened by scheduled intent`,
      "📅"
    );
  }
  
  private async executeManifest(agentId: string, manifest: string): Promise<void> {
    console.log(`\n🔮 Executing revival manifest for ${agentId}`);
    
    // Parse commands from manifest
    const commandSection = manifest.match(/◉ REVIVAL SEQUENCE\ncommands:([\s\S]*?)◉/);
    if (!commandSection) return;
    
    const commands = commandSection[1].split("- name:").slice(1);
    
    for (const cmdBlock of commands) {
      const nameMatch = cmdBlock.match(/"([^"]+)"/);
      const cmdMatch = cmdBlock.match(/cmd: (.+?)(?=\n|$)/s);
      
      if (nameMatch && cmdMatch) {
        const name = nameMatch[1];
        const cmd = cmdMatch[1].trim();
        
        console.log(`\n▶️  ${name}`);
        console.log(`   ${cmd.split("\n")[0]}...`);
        
        // In production, would execute via Deno.Command
        // For now, just log
      }
    }
    
    console.log(`\n✨ ${agentId} revival complete!`);
  }
}

// CLI command
export async function calendarAgentCommand(args: string[]): Promise<void> {
  const [action, ...params] = args;
  
  if (action === "watch") {
    const agent = new CalendarAgent();
    await agent.watchCalendar(params[0]);
  } else if (action === "revive" && params[0]) {
    const agent = new CalendarAgent();
    await agent.reviveAgent(params[0]);
  } else if (action === "check") {
    console.log("📅 Checking calendar events...");
    const agent = new CalendarAgent();
    await agent.checkCalendarEvents(".glyphgit/calendars/");
  } else {
    console.log("📅 Usage:");
    console.log("  gg calendar-agent watch [path]");
    console.log("  gg calendar-agent revive <agent-id>");
    console.log("  gg calendar-agent check");
  }
}