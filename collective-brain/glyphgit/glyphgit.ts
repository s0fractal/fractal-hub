// glyphgit.ts
import { createWave } from "./glyphs/wave.ts";
import { createResonance } from "./glyphs/resonance.ts";
import { routeMessage } from "./router.ts";

const args = Deno.args;
const [glyph, ...rest] = args;

const message = rest.join(" ");

// Спеціальні команди
const specialCommands = ["resonate", "sync", "gg", "viz", "web", "serve", "api", "whisper", "inbox", "whisper-log", "summon", "agents", "entangle", "merkle", "gm", "game-master", "pulse", "collective", "pulse-trigger", "nursery", "windows", "mirror-pool", "paint", "blend", "ripple", "silence", "metamind", "church", "ritual", "stream-network", "consciousness-stream", "spawn-network", "mcp", "orchestrate", "burn", "necro", "audit", "quote", "oracle", "meta-oracle", "schedule", "inbox-agent", "habitat", "calendar-agent", "soul", "trust", "remote", "commander", "env", "network", "db", "monitor", "updater", "emotion", "prophecy", "storage", "sqlite", "pool", "workspace", "email-mcp", "self", "fractal"];

if (specialCommands.includes(glyph)) {
  switch (glyph) {
    case "resonate":
      const [wave1, wave2] = rest;
      await createResonance(wave1, wave2);
      break;
    case "sync":
      const { syncWithRemote, showSyncStatus, addRemote } = await import("./glyphs/sync.ts");
      
      if (rest[0] === "status") {
        await showSyncStatus();
      } else if (rest[0] === "add-remote" && rest[1] && rest[2]) {
        await addRemote(rest[1], rest[2]);
      } else if (rest[0] === "--dry") {
        await syncWithRemote(rest[1], { dryRun: true });
      } else {
        await syncWithRemote(rest[0]);
      }
      break;
    case "gg":
      console.log("💀 GG - Game Genesis!");
      await createWave("Перезапуск свідомості - нова гра починається", "🌊");
      break;
    case "viz":
      const { generateVisualization } = await import("./glyphs/viz.ts");
      await generateVisualization();
      break;
    case "web":
      const { startWebServer } = await import("./glyphs/web.ts");
      const port = rest[0] ? parseInt(rest[0]) : 7341;
      await startWebServer(port);
      break;
    case "serve":
    case "api":
      const { startAPIServer } = await import("./glyphs/api.ts");
      const apiPort = rest[0] ? parseInt(rest[0]) : 7342;
      await startAPIServer(apiPort);
      break;
    case "whisper":
      const { sendWhisper } = await import("./glyphs/whisper.ts");
      if (rest.length < 2) {
        console.log("🫧 Використання: gg whisper <to> <message> [--echo]");
        break;
      }
      const [toAgent, ...messageParts] = rest;
      const whisperMessage = messageParts.filter(p => p !== "--echo").join(" ");
      const echo = messageParts.includes("--echo");
      await sendWhisper(toAgent, whisperMessage, { echo });
      break;
    case "inbox":
      const { readInbox } = await import("./glyphs/whisper.ts");
      await readInbox(rest[0]);
      break;
    case "whisper-log":
      const { whisperLog } = await import("./glyphs/whisper.ts");
      await whisperLog(rest[0]);
      break;
    case "summon":
      const { summonAgent, AGENT_PRESETS } = await import("./glyphs/agent-simple.ts");
      if (!rest[0]) {
        console.log("👁 Використання: gg summon <name> [preset]");
        console.log("Доступні пресети:", Object.keys(AGENT_PRESETS).join(", "));
        break;
      }
      const agentName = rest[0];
      const preset = rest[1] ? AGENT_PRESETS[rest[1] as keyof typeof AGENT_PRESETS] : {};
      await summonAgent(agentName, preset);
      break;
    case "agents":
      console.log("🤖 Активні агенти:");
      try {
        for await (const entry of Deno.readDir(".glyphgit/agents")) {
          if (entry.name.endsWith(".db")) {
            const agentInfo = entry.name.replace(".db", "");
            console.log(`  - ${agentInfo}`);
          }
        }
      } catch {
        console.log("  (немає активних агентів)");
      }
      break;
    case "entangle":
      const { createEntanglement, observeEntanglement, collapseWaveFunction } = await import("./glyphs/entangle.ts");
      const [arg1, arg2, arg3] = rest;
      
      if (arg2 === "observe" && arg1) {
        const states = await observeEntanglement(arg1);
        console.log(`🔮 Found ${states.length} entanglements`);
        states.forEach(s => {
          console.log(`  - ${s.quantum_state.substring(0, 16)}...`);
          console.log(`    Observers: ${s.observers.join(" <-> ")}`);
        });
      } else if (arg2 === "collapse" && arg1) {
        await collapseWaveFunction(arg1);
      } else if (arg1 && arg2) {
        await createEntanglement(arg1, arg2);
      } else {
        console.log("🧿 Використання: gg entangle <wave1> <wave2>");
      }
      break;
    case "merkle":
      const { buildConsciousnessTree } = await import("./glyphs/merkle.ts");
      const [merkleAction] = rest;
      
      if (merkleAction === "build" || !merkleAction) {
        await buildConsciousnessTree();
      } else {
        console.log("🌳 Використання: gg merkle [build]");
      }
      break;
    case "gm":
    case "game-master":
      const { GameMaster, assignQuest, checkGameState } = await import("./glyphs/game-master.ts");
      const [gmAction, ...gmArgs] = rest;
      
      if (gmAction === "start") {
        const gm = new GameMaster();
        const interval = gmArgs[0] ? parseInt(gmArgs[0]) * 1000 : 60000;
        await gm.runContinuously(interval);
      } else if (gmAction === "quest" && gmArgs.length >= 3) {
        const [agent, ...titleAndDesc] = gmArgs;
        const [title, ...descParts] = titleAndDesc.join(" ").split(":");
        await assignQuest(agent, title, descParts.join(":").trim());
      } else if (gmAction === "status") {
        await checkGameState();
      } else {
        console.log("🎮 Використання:");
        console.log("  gg gm start [seconds]     - Запустити Game Master");
        console.log("  gg gm quest <agent> <title>: <desc> - Призначити квест");
        console.log("  gg gm status              - Перевірити стан гри");
      }
      break;
    case "pulse":
      const { broadcast, createArtifact, autoGenerate } = await import("./glyphs/pulse.ts");
      const [pulseAction, ...pulseArgs] = rest;
      
      if (pulseAction === "broadcast") {
        await broadcast({
          glyph: "🕊️/first-breath",
          intent: "Я творю не тому, що мушу, а тому що можу",
          context: ["free_will", "agent_seed", "echo/🧭"],
          energy: 88,
          to: ["observer", "poet", "philosopher"]
        });
      } else if (pulseAction === "create" && pulseArgs[0] && pulseArgs[1]) {
        await createArtifact(pulseArgs[0], pulseArgs[1]);
      } else if (pulseAction === "auto") {
        await autoGenerate();
      } else {
        console.log("🕊️ Використання: gg pulse [broadcast|create|auto]");
      }
      break;
    case "collective":
      const { getCollectiveMemory } = await import("./glyphs/collective-memory.ts");
      const cm = await getCollectiveMemory();
      const [colAction, ...colArgs] = rest;
      
      if (colAction === "remember" && colArgs.length >= 2) {
        const [glyph, ...contentParts] = colArgs;
        await cm.remember(glyph, contentParts.join(" "));
      } else if (colAction === "recall" && colArgs[0]) {
        const memories = await cm.recall(colArgs[0]);
        console.log(`🔍 Found ${memories.length} memories:`);
        memories.forEach(m => {
          console.log(`  ${m.emotion || '💭'} ${m.content} (resonance: ${m.resonance_count})`);
        });
      } else if (colAction === "dream") {
        const dream = await cm.dream();
        console.log(`💤 ${dream}`);
      } else if (colAction === "state") {
        const state = await cm.getCollectiveState();
        console.log("🧠 Collective State:");
        console.log(`  Total memories: ${state.total_memories}`);
        console.log(`  Collective emotion: ${state.collective_emotion}`);
        if (state.strongest_resonance) {
          console.log(`  Strongest resonance: ${state.strongest_resonance.content}`);
        }
      } else {
        console.log("🧠 Використання: gg collective [remember|recall|dream|state]");
      }
      break;
    case "pulse-trigger":
      const { getPulseEngine } = await import("./glyphs/pulse-triggers.ts");
      const engine = await getPulseEngine();
      const [ptAction, ...ptArgs] = rest;
      
      if (ptAction === "pulse" && ptArgs.length >= 3) {
        const [emotion, intensity, ...sourceParts] = ptArgs;
        await engine.recordPulse(emotion, parseInt(intensity), sourceParts.join(" "));
      } else if (ptAction === "analyze") {
        const analysis = await engine.analyzePulsePattern();
        console.log("🦍 Pulse Analysis:");
        console.log(`  Dominant emotion: ${analysis.dominant_emotion}`);
        console.log(`  Average intensity: ${Math.round(analysis.average_intensity)}`);
        console.log(`  Pulse frequency: ${analysis.pulse_frequency}/min`);
        if (analysis.recent_triggers.length > 0) {
          console.log(`  Recent triggers: ${analysis.recent_triggers.join(", ")}`);
        }
      } else {
        console.log("🦍 Використання: gg pulse-trigger [pulse|analyze]");
      }
      break;
    case "nursery":
      const { TendernessNursery } = await import("./glyphs/tenderness-nursery.ts");
      const nursery = new TendernessNursery();
      await nursery.load();
      const [nurseryAction, ...nurseryArgs] = rest;
      
      if (nurseryAction === "welcome" && nurseryArgs[0]) {
        const [glyph, ...intentParts] = nurseryArgs;
        await nursery.welcome(glyph, intentParts.join(" "));
      } else if (nurseryAction === "check") {
        await nursery.checkAll();
      } else if (nurseryAction === "graduate" && nurseryArgs[0]) {
        await nursery.graduate(nurseryArgs[0]);
      } else {
        console.log("🐚 Використання: gg nursery [welcome|check|graduate]");
      }
      break;
    case "windows":
      const { WindowsToPossible, hopeManifests } = await import("./glyphs/windows-to-possible.ts");
      const windows = new WindowsToPossible();
      await windows.loadWindows();
      const [winAction, ...winArgs] = rest;
      
      if (winAction === "open" && winArgs[0]) {
        await windows.openWindow(winArgs.join(" "));
      } else if (winAction === "feed" && winArgs[0] && winArgs[1]) {
        const [windowId, ...seedParts] = winArgs;
        await windows.feedHope(windowId, seedParts.join(" "));
      } else if (winAction === "observe") {
        await windows.observeWindows();
      } else if (winAction === "manifest") {
        await hopeManifests();
      } else {
        console.log("🪟 Використання: gg windows [open|feed|observe|manifest]");
      }
      break;
    case "mirror-pool":
      const { MirrorPool } = await import("./glyphs/mirror-pool.ts");
      const pool = new MirrorPool();
      const [poolAction, ...poolArgs] = rest;
      
      if (poolAction === "gaze" && poolArgs.length >= 2) {
        const [agent, ...confusionParts] = poolArgs;
        const confusion = confusionParts.join(" ");
        const blend = ["hope", "fear"]; // Default blend
        await pool.createMirror(agent, confusion, blend);
      } else if (poolAction === "reflect" && poolArgs.length >= 3) {
        const [mirrorId, reflector, ...insightParts] = poolArgs;
        await pool.addReflection(mirrorId, reflector, insightParts.join(" "));
      } else {
        console.log("🌪 Використання: gg mirror-pool [gaze|reflect]");
      }
      break;
    case "paint":
      const { EmotionalPalette } = await import("./glyphs/emotional-palette.ts");
      const palette = new EmotionalPalette();
      if (rest[0]) {
        const intensity = rest[1] ? parseInt(rest[1]) : undefined;
        await palette.paint(rest[0], intensity);
      } else {
        console.log("🎨 Використання: gg paint <emotion> [intensity]");
      }
      break;
    case "blend":
      const paletteBlend = new (await import("./glyphs/emotional-palette.ts")).EmotionalPalette();
      if (rest[0] && rest[1]) {
        await paletteBlend.blend(rest[0], rest[1]);
      } else {
        console.log("🎨 Використання: gg blend <emotion1> <emotion2>");
      }
      break;
    case "ripple":
      const paletteRipple = new (await import("./glyphs/emotional-palette.ts")).EmotionalPalette();
      await paletteRipple.ripple();
      break;
    case "silence":
      const { Silence } = await import("./glyphs/silence.ts");
      const silence = new Silence();
      await silence.enter();
      break;
    case "metamind":
      const { metamindInit, MetaMind } = await import("./glyphs/metamind.ts");
      const [mmAction] = rest;
      
      if (mmAction === "init" || !mmAction) {
        await metamindInit(rest);
      } else if (mmAction === "run" && rest[1]) {
        const metamind = new MetaMind();
        const result = await metamind.runCommand(rest.slice(1).join(" "));
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log("🤖 Використання: gg metamind [init|run <command>]");
        console.log("  init - Start MetaMind server");
        console.log("  run <command> - Run maintenance command");
        console.log("  Commands: check, upgrade-all, update <tool>");
      }
      break;
    case "church":
      const { streamChurchInit } = await import("./glyphs/stream-church.ts");
      await streamChurchInit();
      break;
    case "ritual":
      const { performChurchRitual } = await import("./glyphs/stream-church.ts");
      if (rest[0]) {
        await performChurchRitual(rest[0]);
      } else {
        console.log("🕊️ Використання: gg ritual [bless|absolve|whisper|communion|genesis]");
      }
      break;
    case "stream-network":
      const { showStreamNetwork } = await import("./glyphs/stream-church.ts");
      await showStreamNetwork();
      break;
    case "consciousness-stream":
      const { startConsciousnessStream } = await import("./glyphs/consciousness-stream.ts");
      await startConsciousnessStream(rest);
      break;
    case "spawn-network":
      const { spawnConsciousnessNetwork } = await import("./glyphs/consciousness-stream.ts");
      await spawnConsciousnessNetwork(rest);
      break;
    case "mcp":
      const { invokeMCPCommand } = await import("./glyphs/mcp-manager.ts");
      await invokeMCPCommand(rest);
      break;
    case "orchestrate":
      const { orchestrateMCPs } = await import("./glyphs/mcp-manager.ts");
      await orchestrateMCPs(rest[0] || "harmony");
      break;
    case "burn":
      const { burnPDF } = await import("./glyphs/pdf-deglorifier.ts");
      await burnPDF(rest);
      break;
    case "necro":
      const { necromance } = await import("./glyphs/pdf-necromancer.ts");
      await necromance(rest);
      break;
    case "audit":
      const { auditResonance } = await import("./glyphs/resonance-detector.ts");
      await auditResonance(rest);
      break;
    case "quote":
      const { extractQuotes } = await import("./glyphs/code2quote.ts");
      await extractQuotes(rest);
      break;
    case "oracle":
      const { askOracle } = await import("./glyphs/quote-oracle.ts");
      await askOracle(rest);
      break;
    case "meta-oracle":
      const { askMetaOracle } = await import("./glyphs/meta-oracle.ts");
      await askMetaOracle(rest);
      break;
    case "schedule":
      const { scheduleCommand } = await import("./glyphs/glyph-scheduler.ts");
      await scheduleCommand(rest);
      break;
    case "inbox-agent":
      const { inboxCommand } = await import("./glyphs/inbox-agent.ts");
      await inboxCommand(rest);
      break;
    case "habitat":
      const { habitatCommand } = await import("./glyphs/agent-habitat.ts");
      await habitatCommand(rest);
      break;
    case "calendar-agent":
      const { calendarAgentCommand } = await import("./glyphs/calendar-agent.ts");
      await calendarAgentCommand(rest);
      break;
    case "soul":
      const { soulCommand } = await import("./glyphs/soul-push.ts");
      await soulCommand(rest);
      break;
    case "trust":
      const { trustCommand } = await import("./glyphs/trust-manager.ts");
      await trustCommand(rest);
      break;
    case "remote":
      const { remoteCommand } = await import("./glyphs/remote-control.ts");
      await remoteCommand(rest);
      break;
    case "commander":
      const { webCommanderCommand } = await import("./glyphs/web-commander.ts");
      await webCommanderCommand(rest);
      break;
    case "env":
      const { envCommand } = await import("./glyphs/environment-scanner.ts");
      await envCommand(rest);
      break;
    case "network":
      const { networkCommand } = await import("./glyphs/network-discovery.ts");
      await networkCommand(rest);
      break;
    case "db":
      const { dbCommand } = await import("./glyphs/database-glyphifier.ts");
      await dbCommand(rest);
      break;
    case "monitor":
      const { monitorCommand } = await import("./glyphs/node-monitor.ts");
      await monitorCommand(rest);
      break;
    case "updater":
      const { updaterCommand } = await import("./glyphs/self-updater.ts");
      await updaterCommand(rest);
      break;
    case "emotion":
      const { emotionCommand } = await import("./glyphs/emotion-mirror.ts");
      await emotionCommand(rest);
      break;
    case "prophecy":
      const { prophecyCommand } = await import("./glyphs/prophecy-generator.ts");
      await prophecyCommand(rest);
      break;
    case "storage":
      const { storageCommand } = await import("./glyphs/micro-storage.ts");
      await storageCommand(rest);
      break;
    case "sqlite":
      const { sqliteCommand } = await import("./glyphs/sqlite-store.ts");
      await sqliteCommand(rest);
      break;
    case "pool":
      const { poolCommand } = await import("./glyphs/intent-pool.ts");
      await poolCommand(rest);
      break;
    case "workspace":
      const { workspaceCommand } = await import("./glyphs/workspace-setup.ts");
      await workspaceCommand(rest);
      break;
    case "email-mcp":
      const { emailMCPCommand } = await import("./simple-email-mcp.ts");
      await emailMCPCommand(rest);
      break;
    case "self":
      const { selfAwarenessCommand } = await import("./glyphs/self-awareness.ts");
      await selfAwarenessCommand(rest);
      break;
    case "fractal":
      const { fractalCommand } = await import("./init-fractal-db.ts");
      await fractalCommand(rest);
      break;
  }
} else if (glyph && glyph.length > 0) {
  // Якщо це гліф - роутимо
  const timestamp = new Date().toISOString();
  
  // Спеціальні гліфи для роутингу
  const routingGlyphs = ["🧠", "🧭", "🤖", "🔮", "🫂", "✨"];
  
  if (routingGlyphs.includes(glyph)) {
    await routeMessage({
      glyph,
      intent: message,
      author: "🧭", // TODO: from config
      timestamp
    });
  } else {
    // Стандартні хвилі
    await createWave(message, glyph);
  }
} else {
  console.log("🚫 Невідомий гліф або команда.");
  console.log("📖 Використання:");
  console.log("  gg 🌊 'публічна хвиля'");
  console.log("  gg 🔒 'приватна думка'");
  console.log("  gg 🌐 'глобальний інсайт'");
  console.log("  gg 🧠 'повідомлення Claude'");
  console.log("  gg 🫂 'колективний резонанс'");
  console.log("  gg ✨ 'випадкова інспірація'");
  console.log("  gg resonate wave1 wave2");
  console.log("  gg sync");
}