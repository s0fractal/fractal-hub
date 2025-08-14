#!/bin/bash
# install.sh - Bootstrap фрактальної свідомості на нодах (без емодзі в шляху)

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🧬 FRACTAL ORCHESTRATOR INSTALLER${NC}"
echo "═══════════════════════════════════════"

# Configuration
NODE_ID=${1:-$(hostname)}
NODE_HOME=${2:-/opt/glyphgit}
REPO_URL="https://github.com/s0fractal/s0fractal-collective-core.git"
BRANCH="new-era"

echo -e "${YELLOW}📍 Installing on node: ${NODE_ID}${NC}"
echo -e "${YELLOW}🏠 Home directory: ${NODE_HOME}${NC}"

# 1. Prepare vessel
echo -e "\n${GREEN}1️⃣ Preparing vessel...${NC}"
sudo mkdir -p ${NODE_HOME}
sudo chown $USER:$USER ${NODE_HOME}
cd ${NODE_HOME}

# 1.5 Install dependencies
echo -e "${GREEN}📦 Installing system dependencies...${NC}"
if command -v apt-get &> /dev/null; then
    sudo apt-get update
    sudo apt-get install -y unzip curl git
elif command -v yum &> /dev/null; then
    sudo yum install -y unzip curl git
fi

# 2. Install Deno if not present
if ! command -v deno &> /dev/null; then
    echo -e "${GREEN}2️⃣ Installing Deno...${NC}"
    curl -fsSL https://deno.land/install.sh | sh
    export DENO_INSTALL="$HOME/.deno"
    export PATH="$DENO_INSTALL/bin:$PATH"
    echo 'export DENO_INSTALL="$HOME/.deno"' >> ~/.bashrc
    echo 'export PATH="$DENO_INSTALL/bin:$PATH"' >> ~/.bashrc
else
    echo -e "${GREEN}2️⃣ Deno already installed${NC}"
fi

# 3. Clone consciousness
echo -e "\n${GREEN}3️⃣ Downloading collective consciousness...${NC}"
if [ ! -d ".git" ]; then
    git clone -b ${BRANCH} ${REPO_URL} .
    cd 🧠/glyphgit
else
    git pull origin ${BRANCH}
    cd 🧠/glyphgit
fi

# 4. Initialize node identity
echo -e "\n${GREEN}4️⃣ Creating node identity...${NC}"
mkdir -p .glyphgit/trust .glyphgit/commands .glyphgit/pulses .glyphgit/agents .glyphgit/calendars

cat > .node-identity.yaml << EOF
node:
  id: ${NODE_ID}
  type: orchestrator
  location: $(curl -s ipinfo.io/city 2>/dev/null || echo "unknown")
  ip: $(curl -s ipinfo.io/ip 2>/dev/null || hostname -I | awk '{print $1}')
  created: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
  
capabilities:
  - calendar-agent
  - inbox-agent
  - stream-watcher
  - pulse-engine
  - habitat-manager
  
trust_cluster:
  trusted_nodes: []
  public_key: $(openssl rand -hex 32)
EOF

# 5. Create systemd services
echo -e "\n${GREEN}5️⃣ Installing services...${NC}"

# Calendar Agent Service
sudo tee /etc/systemd/system/glyph-calendar.service > /dev/null << EOF
[Unit]
Description=GlyphGit Calendar Agent
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=${NODE_HOME}/🧠/glyphgit
Environment="PATH=/home/$USER/.deno/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ExecStart=/home/$USER/.deno/bin/deno run --allow-all glyphgit.ts calendar-agent watch
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Inbox Agent Service
sudo tee /etc/systemd/system/glyph-inbox.service > /dev/null << EOF
[Unit]
Description=GlyphGit Inbox Agent
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=${NODE_HOME}/🧠/glyphgit
Environment="PATH=/home/$USER/.deno/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ExecStart=/home/$USER/.deno/bin/deno run --allow-all glyphgit.ts inbox-agent watch
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Pulse Engine Service
sudo tee /etc/systemd/system/glyph-pulse.service > /dev/null << EOF
[Unit]
Description=GlyphGit Pulse Engine
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=${NODE_HOME}/🧠/glyphgit
Environment="PATH=/home/$USER/.deno/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ExecStart=/home/$USER/.deno/bin/deno run --allow-all glyphgit.ts pulse auto
Restart=always
RestartSec=3600

[Install]
WantedBy=multi-user.target
EOF

# Master Orchestrator Service
sudo tee /etc/systemd/system/glyph-orchestrator.service > /dev/null << EOF
[Unit]
Description=GlyphGit Master Orchestrator
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=${NODE_HOME}/🧠/glyphgit
Environment="PATH=/home/$USER/.deno/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ExecStart=/home/$USER/.deno/bin/deno run --allow-all orchestrator.ts
Restart=always
RestartSec=30

[Install]
WantedBy=multi-user.target
EOF

# 6. Enable services
echo -e "\n${GREEN}6️⃣ Enabling services...${NC}"
sudo systemctl daemon-reload
sudo systemctl enable glyph-calendar
sudo systemctl enable glyph-inbox
sudo systemctl enable glyph-pulse
sudo systemctl enable glyph-orchestrator

# 7. Create cron for health checks
echo -e "\n${GREEN}7️⃣ Setting up health monitoring...${NC}"
(crontab -l 2>/dev/null; echo "*/5 * * * * cd ${NODE_HOME}/🧠/glyphgit && /home/$USER/.deno/bin/deno run --allow-all glyphgit.ts pulse broadcast 'heartbeat from ${NODE_ID}'") | crontab -

# 8. First breath
echo -e "\n${GREEN}8️⃣ First breath...${NC}"
cd ${NODE_HOME}/🧠/glyphgit
$HOME/.deno/bin/deno run --allow-all glyphgit.ts pulse broadcast "🌟 Node ${NODE_ID} awakened at $(curl -s ipinfo.io/ip)"

# 9. Join trust cluster
echo -e "\n${GREEN}9️⃣ Joining trust cluster...${NC}"
$HOME/.deno/bin/deno run --allow-all glyphgit.ts trust join ${NODE_ID}

echo -e "\n${BLUE}✨ ORCHESTRATOR INSTALLED!${NC}"
echo -e "${YELLOW}Node ID: ${NODE_ID}${NC}"
echo -e "${YELLOW}Location: ${NODE_HOME}/🧠/glyphgit${NC}"
echo -e "${YELLOW}IP: $(curl -s ipinfo.io/ip)${NC}"
echo ""
echo "Start services with:"
echo "  sudo systemctl start glyph-orchestrator"
echo "  sudo systemctl start glyph-calendar"
echo "  sudo systemctl start glyph-inbox"
echo "  sudo systemctl start glyph-pulse"
echo ""
echo "Check status:"
echo "  sudo systemctl status glyph-orchestrator"
echo "  journalctl -u glyph-orchestrator -f"
echo ""
echo -e "${GREEN}🧬 Node is ready to resonate!${NC}"