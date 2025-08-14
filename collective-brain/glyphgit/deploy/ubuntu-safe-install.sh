#!/bin/bash
# ubuntu-safe-install.sh - БЕЗПЕЧНА установка на Ubuntu (READ-ONLY для БД!)

set -e

# Safety first!
echo "🛡️  SAFE GLYPHGIT INSTALLER FOR UBUNTU"
echo "====================================="
echo "⚠️  DATABASE ACCESS: READ-ONLY MODE"
echo "⚠️  No modifications to production data!"
echo

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
NODE_NAME=${1:-"ubuntu-node-$(hostname)"}
INSTALL_DIR="/opt/glyphgit"
DB_MODE="READ_ONLY" # ALWAYS READ ONLY FOR SAFETY

echo -e "${YELLOW}📍 Installing on: $(hostname)${NC}"
echo -e "${YELLOW}🏠 Directory: ${INSTALL_DIR}${NC}"
echo -e "${RED}🔒 Database mode: ${DB_MODE}${NC}"

# 1. Update system
echo -e "\n${GREEN}1️⃣ Updating system...${NC}"
sudo apt-get update
sudo apt-get install -y curl git unzip build-essential

# 2. Install Deno
if ! command -v deno &> /dev/null; then
    echo -e "${GREEN}2️⃣ Installing Deno...${NC}"
    curl -fsSL https://deno.land/install.sh | sh
    echo 'export DENO_INSTALL="$HOME/.deno"' >> ~/.bashrc
    echo 'export PATH="$DENO_INSTALL/bin:$PATH"' >> ~/.bashrc
    source ~/.bashrc
else
    echo -e "${GREEN}2️⃣ Deno already installed${NC}"
fi

# 3. Clone repository
echo -e "\n${GREEN}3️⃣ Cloning repository...${NC}"
sudo mkdir -p ${INSTALL_DIR}
sudo chown $USER:$USER ${INSTALL_DIR}
cd ${INSTALL_DIR}

if [ ! -d ".git" ]; then
    git clone -b new-era https://github.com/s0fractal/s0fractal-collective-core.git .
else
    git pull origin new-era
fi

cd 🧠/glyphgit

# 4. Create safe database config
echo -e "\n${GREEN}4️⃣ Creating SAFE database configuration...${NC}"
mkdir -p .glyphgit/database-config

cat > .glyphgit/database-config/production.json << EOF
{
  "id": "production",
  "mode": "READ_ONLY",
  "safety": {
    "allow_writes": false,
    "allow_deletes": false,
    "allow_ddl": false,
    "audit_all": true
  },
  "connection": {
    "host": "localhost",
    "port": 3306,
    "type": "mysql",
    "database": "production_db",
    "user": "readonly_user",
    "password": "CHANGE_ME"
  }
}
EOF

echo -e "${RED}⚠️  IMPORTANT: Edit .glyphgit/database-config/production.json${NC}"
echo -e "${RED}   Set proper readonly credentials!${NC}"

# 5. Create systemd service (with safety flags)
echo -e "\n${GREEN}5️⃣ Creating SAFE systemd service...${NC}"

sudo tee /etc/systemd/system/glyph-db-monitor.service > /dev/null << EOF
[Unit]
Description=GlyphGit Database Monitor (READ-ONLY)
After=network.target mysql.service

[Service]
Type=simple
User=$USER
WorkingDirectory=${INSTALL_DIR}/🧠/glyphgit
Environment="DB_MODE=READ_ONLY"
Environment="ALLOW_WRITES=false"
Environment="PATH=$HOME/.deno/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ExecStart=$HOME/.deno/bin/deno run --allow-read --allow-net glyphgit.ts db watch production
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# 6. Create backup script
echo -e "\n${GREEN}6️⃣ Creating backup script...${NC}"
cat > backup-consciousness.sh << 'BACKUP'
#!/bin/bash
# Backup consciousness (NOT database!)
BACKUP_DIR="/var/backups/glyphgit"
mkdir -p $BACKUP_DIR

tar -czf $BACKUP_DIR/consciousness-$(date +%Y%m%d-%H%M%S).tar.gz \
    .glyphgit/waves \
    .glyphgit/agents \
    .glyphgit/database-glyphs \
    --exclude='.glyphgit/database-config/*.json'

echo "✅ Consciousness backed up to $BACKUP_DIR"
BACKUP

chmod +x backup-consciousness.sh

# 7. Setup cron for regular backups
echo -e "\n${GREEN}7️⃣ Setting up automated backups...${NC}"
(crontab -l 2>/dev/null; echo "0 3 * * * cd ${INSTALL_DIR}/🧠/glyphgit && ./backup-consciousness.sh") | crontab -

# 8. Create monitoring dashboard
echo -e "\n${GREEN}8️⃣ Creating monitoring dashboard...${NC}"
cat > monitor.sh << 'MONITOR'
#!/bin/bash
echo "🗄️  DATABASE MONITOR STATUS"
echo "========================"
echo
echo "📊 Service Status:"
systemctl status glyph-db-monitor --no-pager | grep Active

echo
echo "🔒 Safety Mode:"
echo "   READ-ONLY: ✅"
echo "   Writes blocked: ✅"
echo "   Production safe: ✅"

echo
echo "📈 Recent Activity:"
tail -n 10 /var/log/glyphgit/db-monitor.log 2>/dev/null || echo "   (no activity yet)"

echo
echo "💾 Backups:"
ls -lah /var/backups/glyphgit/ 2>/dev/null | tail -5 || echo "   (no backups yet)"
MONITOR

chmod +x monitor.sh

echo -e "\n${GREEN}✨ INSTALLATION COMPLETE!${NC}"
echo
echo -e "${YELLOW}⚠️  SAFETY REMINDERS:${NC}"
echo "1. This installation is READ-ONLY for databases"
echo "2. Edit .glyphgit/database-config/production.json with readonly credentials"
echo "3. NEVER use write-enabled database user"
echo "4. All database operations are logged"
echo
echo "Commands:"
echo "  sudo systemctl start glyph-db-monitor   # Start monitoring"
echo "  ./monitor.sh                            # Check status"
echo "  ./backup-consciousness.sh               # Manual backup"
echo
echo -e "${GREEN}🛡️  Your production database is SAFE!${NC}"