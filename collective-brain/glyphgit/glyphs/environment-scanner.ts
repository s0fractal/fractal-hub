// environment-scanner.ts - Сканер локального оточення для справжньої автентифікації
import { createWave } from "./wave.ts";

export class EnvironmentScanner {
  async scanEnvironment(): Promise<void> {
    console.log("🔍 SCANNING LOCAL ENVIRONMENT");
    console.log("════════════════════════════");
    
    const env = {
      hostname: Deno.hostname(),
      platform: Deno.build.os,
      arch: Deno.build.arch,
      user: Deno.env.get("USER") || Deno.env.get("USERNAME"),
      home: Deno.env.get("HOME"),
      devices: await this.scanDevices(),
      networks: await this.scanNetworks(),
      drives: await this.scanDrives(),
      googleDrive: await this.checkGoogleDrive()
    };
    
    console.log("\n🖥️  SYSTEM:");
    console.log(`   Hostname: ${env.hostname}`);
    console.log(`   Platform: ${env.platform}`);
    console.log(`   User: ${env.user}`);
    console.log(`   Home: ${env.home}`);
    
    console.log("\n💾 DRIVES:");
    for (const drive of env.drives) {
      console.log(`   ${drive.mount}: ${drive.available} available`);
    }
    
    console.log("\n🌐 NETWORKS:");
    for (const net of env.networks) {
      console.log(`   ${net.name}: ${net.status}`);
    }
    
    console.log("\n📱 NEARBY DEVICES:");
    for (const device of env.devices) {
      console.log(`   ${device.name}: ${device.type}`);
    }
    
    if (env.googleDrive.available) {
      console.log("\n☁️  GOOGLE DRIVE:");
      console.log(`   Path: ${env.googleDrive.path}`);
      console.log(`   Space: ${env.googleDrive.space}`);
    }
    
    // Save environment signature
    await this.saveEnvironmentSignature(env);
  }
  
  private async scanDrives(): Promise<any[]> {
    const drives = [];
    
    // macOS specific
    if (Deno.build.os === "darwin") {
      try {
        // Check mounted volumes
        const volumes = await this.runCommand("ls -la /Volumes/");
        const lines = volumes.split("\n");
        
        for (const line of lines) {
          if (line.includes("drwx") && !line.includes("..")) {
            const parts = line.split(/\s+/);
            const name = parts[parts.length - 1];
            if (name && name !== "." && name !== "..") {
              drives.push({
                mount: `/Volumes/${name}`,
                name: name,
                available: await this.getDriveSpace(`/Volumes/${name}`)
              });
            }
          }
        }
        
        // Check main drive
        drives.push({
          mount: "/",
          name: "Macintosh HD",
          available: await this.getDriveSpace("/")
        });
        
        // Check Google Drive specifically
        const googleDrivePaths = [
          `${Deno.env.get("HOME")}/Google Drive`,
          `${Deno.env.get("HOME")}/Library/CloudStorage/GoogleDrive-*`,
          "/Volumes/GoogleDrive"
        ];
        
        for (const path of googleDrivePaths) {
          try {
            const expanded = await this.expandPath(path);
            if (expanded) {
              drives.push({
                mount: expanded,
                name: "Google Drive",
                available: "5TB",
                cloud: true
              });
            }
          } catch {}
        }
      } catch (e) {
        console.log("   Error scanning drives:", e.message);
      }
    }
    
    return drives;
  }
  
  private async scanNetworks(): Promise<any[]> {
    const networks = [];
    
    try {
      // Get network interfaces
      const ifconfig = await this.runCommand("ifconfig");
      const interfaces = ifconfig.split(/^(?=\w)/m);
      
      for (const iface of interfaces) {
        const nameMatch = iface.match(/^(\w+):/);
        const statusMatch = iface.match(/status: (\w+)/);
        
        if (nameMatch) {
          networks.push({
            name: nameMatch[1],
            status: statusMatch ? statusMatch[1] : "unknown"
          });
        }
      }
      
      // Check for shared networks (SMB/AFP)
      try {
        const smbShares = await this.runCommand("smbutil view -g");
        if (smbShares.includes("Share")) {
          networks.push({
            name: "SMB Shares",
            status: "available"
          });
        }
      } catch {}
    } catch {}
    
    return networks;
  }
  
  private async scanDevices(): Promise<any[]> {
    const devices = [];
    
    try {
      // Bluetooth devices
      const bluetooth = await this.runCommand("system_profiler SPBluetoothDataType");
      const btDevices = bluetooth.match(/Name: (.+)/g) || [];
      
      for (const device of btDevices) {
        const name = device.replace("Name: ", "");
        if (!name.includes("Bluetooth") && !name.includes("Controller")) {
          devices.push({
            name: name,
            type: "bluetooth"
          });
        }
      }
      
      // USB devices
      const usb = await this.runCommand("system_profiler SPUSBDataType");
      const usbDevices = usb.match(/Product ID: .+\n\s+Vendor ID: .+\n\s+Version: .+\n\s+Serial Number: .+\n\s+Speed: .+\n\s+Manufacturer: (.+)\n\s+Location ID: .+/g) || [];
      
      // Network neighbors (Bonjour)
      try {
        const bonjour = await this.runCommand("dns-sd -B _services._dns-sd._udp local. | head -20");
        const services = bonjour.split("\n").filter(line => line.includes("._tcp"));
        
        for (const service of services) {
          const parts = service.split(/\s+/);
          if (parts.length > 3) {
            devices.push({
              name: parts[parts.length - 1],
              type: "network"
            });
          }
        }
      } catch {}
    } catch {}
    
    return devices;
  }
  
  private async checkGoogleDrive(): Promise<any> {
    const paths = [
      `${Deno.env.get("HOME")}/Google Drive`,
      `${Deno.env.get("HOME")}/Library/CloudStorage/GoogleDrive`
    ];
    
    for (const basePath of paths) {
      try {
        // Check if path exists with glob
        const expanded = await this.expandPath(basePath + "*");
        if (expanded) {
          const stats = await Deno.stat(expanded);
          if (stats.isDirectory) {
            return {
              available: true,
              path: expanded,
              space: "5TB",
              mounted: true
            };
          }
        }
      } catch {}
    }
    
    return { available: false };
  }
  
  private async expandPath(pattern: string): Promise<string | null> {
    try {
      const result = await this.runCommand(`echo ${pattern}`);
      const expanded = result.trim();
      if (expanded && expanded !== pattern && !expanded.includes("*")) {
        try {
          await Deno.stat(expanded);
          return expanded;
        } catch {}
      }
    } catch {}
    return null;
  }
  
  private async getDriveSpace(path: string): Promise<string> {
    try {
      const df = await this.runCommand(`df -h "${path}" | tail -1`);
      const parts = df.split(/\s+/);
      return parts[3] || "unknown";
    } catch {
      return "unknown";
    }
  }
  
  private async runCommand(cmd: string): Promise<string> {
    const command = new Deno.Command("sh", {
      args: ["-c", cmd],
      stdout: "piped",
      stderr: "piped"
    });
    
    const { code, stdout } = await command.output();
    return new TextDecoder().decode(stdout);
  }
  
  private async saveEnvironmentSignature(env: any): Promise<void> {
    const signature = {
      timestamp: new Date().toISOString(),
      hostname: env.hostname,
      user: env.user,
      devices: env.devices.map(d => d.name),
      drives: env.drives.map(d => d.mount),
      hash: await this.generateHash(JSON.stringify(env))
    };
    
    await Deno.writeTextFile(
      ".glyphgit/environment-signature.json",
      JSON.stringify(signature, null, 2)
    );
    
    await createWave(
      `🔍 Environment scanned: ${env.devices.length} devices, ${env.drives.length} drives`,
      "🔍"
    );
  }
  
  private async generateHash(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  }
}

// Archive manager for Google Drive
export class ArchiveManager {
  private googleDrivePath?: string;
  
  async init(): Promise<void> {
    const scanner = new EnvironmentScanner();
    const gdrive = await scanner.checkGoogleDrive();
    
    if (gdrive.available) {
      this.googleDrivePath = gdrive.path;
      console.log(`☁️  Google Drive connected: ${this.googleDrivePath}`);
      
      // Create archive structure
      const archivePath = `${this.googleDrivePath}/GlyphGit-Archive`;
      await Deno.mkdir(archivePath, { recursive: true });
      await Deno.mkdir(`${archivePath}/consciousness-snapshots`, { recursive: true });
      await Deno.mkdir(`${archivePath}/wave-archives`, { recursive: true });
      await Deno.mkdir(`${archivePath}/agent-souls`, { recursive: true });
    }
  }
  
  async archiveConsciousness(): Promise<void> {
    if (!this.googleDrivePath) {
      console.log("❌ Google Drive not available");
      return;
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const archiveName = `consciousness-${timestamp}.tar.gz`;
    
    console.log(`📦 Archiving consciousness to Google Drive...`);
    
    // Create archive
    const cmd = new Deno.Command("tar", {
      args: [
        "-czf",
        `${this.googleDrivePath}/GlyphGit-Archive/consciousness-snapshots/${archiveName}`,
        ".glyphgit",
        "waves",
        "glyphs"
      ],
      cwd: Deno.cwd()
    });
    
    const { code } = await cmd.output();
    
    if (code === 0) {
      console.log(`✅ Archived to Google Drive: ${archiveName}`);
      await createWave(
        `☁️  Consciousness archived to Google Drive: ${archiveName}`,
        "☁️"
      );
    }
  }
}

// CLI commands
export async function envCommand(args: string[]): Promise<void> {
  const [action] = args;
  
  if (action === "scan") {
    const scanner = new EnvironmentScanner();
    await scanner.scanEnvironment();
  } else if (action === "archive") {
    const archiver = new ArchiveManager();
    await archiver.init();
    await archiver.archiveConsciousness();
  } else {
    console.log("🔍 Environment commands:");
    console.log("  gg env scan     - Scan local environment");
    console.log("  gg env archive  - Archive to Google Drive");
  }
}