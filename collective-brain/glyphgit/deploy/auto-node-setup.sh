#!/bin/bash
# auto-node-setup.sh - Повна автоматизація розгортання ноди

set -e

NODE_IP=$1
NODE_NAME=${2:-"glyph-node-$(date +%s)"}

echo "🚀 AUTO-DEPLOYING NODE: $NODE_NAME @ $NODE_IP"
echo "================================================"

# Create full setup script
cat > /tmp/node-bootstrap.sh << 'BOOTSTRAP'
#!/bin/bash
set -e

echo "🧬 GLYPHGIT NODE BOOTSTRAP"

# 1. Install Tailscale
echo "🔐 Installing Tailscale..."
curl -fsSL https://tailscale.com/install.sh | sh
tailscale up --authkey ${TAILSCALE_AUTHKEY}

# 2. Install dependencies
echo "📦 Installing dependencies..."
apt-get update
apt-get install -y git curl unzip

# 3. Install Deno
echo "🦕 Installing Deno..."
curl -fsSL https://deno.land/install.sh | sh
echo 'export DENO_INSTALL="/root/.deno"' >> ~/.bashrc
echo 'export PATH="$DENO_INSTALL/bin:$PATH"' >> ~/.bashrc
export DENO_INSTALL="/root/.deno"
export PATH="$DENO_INSTALL/bin:$PATH"

# 4. Clone repository
echo "📥 Cloning consciousness..."
cd /opt
git clone -b new-era https://github.com/s0fractal/s0fractal-collective-core.git glyphgit
cd glyphgit/🧠/glyphgit

# 5. Setup identity
mkdir -p .glyphgit/{trust,commands,pulses,agents,calendars}
HOSTNAME=$(hostname)
IP=$(curl -s ipinfo.io/ip)

cat > .node-identity.yaml << EOF
node:
  id: ${HOSTNAME}
  type: orchestrator
  location: $(curl -s ipinfo.io/city)
  ip: ${IP}
  created: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
  
capabilities:
  - calendar-agent
  - inbox-agent
  - stream-watcher
  - pulse-engine
  - habitat-manager
  
trust_cluster:
  trusted_nodes: [m1-local-core]
  public_key: $(openssl rand -hex 32)
EOF

# 6. Create systemd services
cat > /etc/systemd/system/glyph-orchestrator.service << EOF
[Unit]
Description=GlyphGit Orchestrator
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/glyphgit/🧠/glyphgit
Environment="PATH=/root/.deno/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ExecStart=/root/.deno/bin/deno run --allow-all orchestrator.ts
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# 7. Enable and start
systemctl daemon-reload
systemctl enable glyph-orchestrator
systemctl start glyph-orchestrator

# 8. Join cluster
cd /opt/glyphgit/🧠/glyphgit
/root/.deno/bin/deno run --allow-all glyphgit.ts trust join ${HOSTNAME}

echo "✅ NODE READY!"
BOOTSTRAP

# Copy bootstrap script
echo "📤 Uploading bootstrap script..."
scp /tmp/node-bootstrap.sh root@$NODE_IP:/tmp/

# Execute remotely
echo "🚀 Executing remote setup..."
ssh root@$NODE_IP "chmod +x /tmp/node-bootstrap.sh && TAILSCALE_AUTHKEY=$TAILSCALE_AUTHKEY /tmp/node-bootstrap.sh"

echo "✅ Node $NODE_NAME deployed successfully!"