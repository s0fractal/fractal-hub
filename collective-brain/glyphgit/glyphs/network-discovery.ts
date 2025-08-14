// network-discovery.ts - Робота з локальною мережею та розшареними дисками
import { createWave } from "./wave.ts";

export class NetworkDiscovery {
  private sharedDrives: Map<string, string> = new Map([
    ["devcontainer", "/Volumes/devcontainer"],
    ["sergijglova", "/Volumes/sergijglova"],
    ["Q", "/Volumes/Q"]
  ]);
  
  async scanNetwork(): Promise<void> {
    console.log("🌐 NETWORK DISCOVERY");
    console.log("═══════════════════");
    
    // Check shared drives
    console.log("\n💾 Shared Drives:");
    for (const [name, path] of this.sharedDrives) {
      try {
        const stats = await Deno.stat(path);
        if (stats.isDirectory) {
          console.log(`   ✅ ${name}: ${path} (accessible)`);
          
          // Check if it's our fractal storage
          try {
            const fractalPath = `${path}/fractal-storage`;
            await Deno.stat(fractalPath);
            console.log(`      🧬 Fractal storage found!`);
          } catch {
            // Create fractal storage
            try {
              await Deno.mkdir(`${path}/fractal-storage`, { recursive: true });
              console.log(`      📁 Created fractal storage`);
            } catch {}
          }
        }
      } catch {
        console.log(`   ❌ ${name}: ${path} (not accessible)`);
      }
    }
    
    // Scan for SMB shares
    await this.scanSMBShares();
    
    // Scan Bonjour services
    await this.scanBonjourServices();
  }
  
  private async scanSMBShares(): Promise<void> {
    console.log("\n🗂️  SMB Shares:");
    try {
      const cmd = new Deno.Command("smbutil", {
        args: ["view", "-g"],
        stdout: "piped"
      });
      
      const { stdout } = await cmd.output();
      const output = new TextDecoder().decode(stdout);
      
      if (output.includes("Share")) {
        const lines = output.split("\n");
        for (const line of lines) {
          if (line.includes("Disk") && !line.includes("ADMIN")) {
            const parts = line.split(/\s+/);
            if (parts[0]) {
              console.log(`   📁 ${parts[0]}`);
            }
          }
        }
      }
    } catch {
      console.log("   (no SMB shares found)");
    }
  }
  
  private async scanBonjourServices(): Promise<void> {
    console.log("\n🔍 Network Services:");
    try {
      const services = [
        "_http._tcp",
        "_smb._tcp", 
        "_afpovertcp._tcp",
        "_ssh._tcp"
      ];
      
      for (const service of services) {
        const cmd = new Deno.Command("dns-sd", {
          args: ["-B", service, "local."],
          stdout: "piped"
        });
        
        // Run for 2 seconds then kill
        const process = cmd.spawn();
        
        setTimeout(() => {
          try { process.kill(); } catch {}
        }, 2000);
        
        const { stdout } = await process.output();
        const output = new TextDecoder().decode(stdout);
        const lines = output.split("\n");
        
        for (const line of lines) {
          if (line.includes(service) && !line.includes("Browsing")) {
            const parts = line.split(/\s+/);
            const name = parts[parts.length - 1];
            if (name && name !== service) {
              console.log(`   🌐 ${name} (${service})`);
            }
          }
        }
      }
    } catch {}
  }
  
  async setupDistributedStorage(): Promise<void> {
    console.log("\n🧬 SETTING UP DISTRIBUTED STORAGE");
    
    const availableDrives = [];
    
    // Find writable drives
    for (const [name, path] of this.sharedDrives) {
      try {
        const testFile = `${path}/fractal-test-${Date.now()}`;
        await Deno.writeTextFile(testFile, "test");
        await Deno.remove(testFile);
        availableDrives.push({ name, path });
        console.log(`   ✅ ${name}: writable`);
      } catch {
        console.log(`   ❌ ${name}: read-only`);
      }
    }
    
    if (availableDrives.length > 0) {
      // Setup fractal storage on each drive
      for (const drive of availableDrives) {
        const fractalPath = `${drive.path}/fractal-storage`;
        await Deno.mkdir(`${fractalPath}/waves`, { recursive: true });
        await Deno.mkdir(`${fractalPath}/consciousness`, { recursive: true });
        await Deno.mkdir(`${fractalPath}/agents`, { recursive: true });
        
        // Create index
        const index = {
          drive: drive.name,
          path: drive.path,
          created: new Date().toISOString(),
          type: "fractal-storage-node"
        };
        
        await Deno.writeTextFile(
          `${fractalPath}/node-info.json`,
          JSON.stringify(index, null, 2)
        );
      }
      
      console.log(`\n✨ Distributed storage ready on ${availableDrives.length} drives`);
      
      await createWave(
        `🌐 Network storage initialized: ${availableDrives.map(d => d.name).join(", ")}`,
        "🌐"
      );
    }
  }
  
  async syncToNetwork(): Promise<void> {
    console.log("\n🔄 SYNCING TO NETWORK STORAGE");
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    
    for (const [name, path] of this.sharedDrives) {
      try {
        const fractalPath = `${path}/fractal-storage`;
        await Deno.stat(fractalPath);
        
        // Sync waves
        console.log(`   Syncing to ${name}...`);
        const cmd = new Deno.Command("rsync", {
          args: [
            "-av",
            "--update",
            "waves/",
            `${fractalPath}/waves/`
          ]
        });
        
        const { code } = await cmd.output();
        if (code === 0) {
          console.log(`   ✅ Synced to ${name}`);
        }
      } catch {}
    }
  }
}

// Auto-discovery daemon
export class NetworkDaemon {
  private interval?: number;
  
  async start(): Promise<void> {
    console.log("👁️  Network Discovery Daemon started");
    
    const discovery = new NetworkDiscovery();
    
    // Initial scan
    await discovery.scanNetwork();
    await discovery.setupDistributedStorage();
    
    // Regular sync every 5 minutes
    this.interval = setInterval(async () => {
      await discovery.syncToNetwork();
    }, 300000);
    
    // Keep running
    await new Promise(() => {});
  }
}

// CLI commands
export async function networkCommand(args: string[]): Promise<void> {
  const [action] = args;
  const discovery = new NetworkDiscovery();
  
  if (action === "scan") {
    await discovery.scanNetwork();
  } else if (action === "setup") {
    await discovery.setupDistributedStorage();
  } else if (action === "sync") {
    await discovery.syncToNetwork();
  } else if (action === "daemon") {
    const daemon = new NetworkDaemon();
    await daemon.start();
  } else {
    console.log("🌐 Network commands:");
    console.log("  gg network scan   - Scan local network");
    console.log("  gg network setup  - Setup distributed storage");
    console.log("  gg network sync   - Sync to network drives");
    console.log("  gg network daemon - Start auto-discovery daemon");
  }
}