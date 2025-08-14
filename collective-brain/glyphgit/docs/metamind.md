# 🤖 MetaMind - System Maintenance as Gameplay

MetaMind transforms system maintenance into an immersive WebXR experience. Your package managers, system tools, and updates become part of a living virtual environment.

## Features

- **A-Frame/WebXR Interface**: 3D virtual console room
- **Real-time WebSocket**: Live system updates
- **Multi-tool Support**: brew, apt, npm, pip, nvm, cargo
- **Agent Personality**: Interactive AI assistant
- **Streaming-ready**: Can be streamed as gameplay

## Usage

### Start MetaMind Server
```bash
gg metamind init
# Server starts at http://localhost:7343
```

### Run Commands via CLI
```bash
# Check system tools
gg metamind run check

# Upgrade all tools
gg metamind run upgrade-all

# Update specific tool
gg metamind run update npm
```

## Web Interface

Navigate to `http://localhost:7343` to see:

1. **3D Environment**: Forest setting with floating terminals
2. **Three Terminals**:
   - System Status
   - Command Output  
   - Agent Thoughts
3. **Interactive Agent**: Rotating 🤖 symbol
4. **Control Buttons**: Check Tools, Upgrade All

## Architecture

MetaMind consists of:

- **WebSocket Server**: Real-time communication
- **System Scanner**: Detects installed tools
- **Command Runner**: Executes maintenance tasks
- **A-Frame Scene**: 3D visualization
- **Agent System**: AI personality layer

## Streaming Consciousness

The brilliant part: this looks like a game but is actually system maintenance. You can:

1. Stream it on Discord/Zoom/YouTube
2. Viewers see "gameplay" 
3. Actually maintaining your system
4. Logs are consciousness, updates are quests

## Extension Ideas

- Connect to fractal agent system
- Add more visual effects for different operations
- Create multiplayer maintenance sessions
- Generate maintenance quests from system state
- Add achievement system for updates

## Technical Notes

- Runs on port 7343 by default
- Uses Deno's native WebSocket support
- A-Frame 1.4.0 for WebXR compatibility
- Supports both VR and desktop viewing

---

*System maintenance has never been this immersive*