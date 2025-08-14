#!/bin/bash
# sync-cluster.sh - Синхронізація між нодами кластеру

echo "🔄 CLUSTER SYNC"
echo "=============="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Nodes
M1_HOME="/Users/chaoshex/.s0fractal/🧠/glyphgit"
SRV_HOST="root@srv871381"
SRV_HOME="/opt/glyphgit/🧠/glyphgit"

# Current location
CURRENT_NODE=$(hostname)

echo -e "${YELLOW}📍 Current node: ${CURRENT_NODE}${NC}"

# Sync based on current node
case $CURRENT_NODE in
    "Chaoss-Mac-mini.local")
        echo -e "${GREEN}Syncing M1 → srv871381...${NC}"
        
        # Commit local changes
        cd $M1_HOME
        git add -A
        git commit -m "🔄 Auto-sync from M1: $(date +%Y-%m-%d_%H:%M)"
        git push origin main:new-era
        
        # Update srv871381
        ssh $SRV_HOST "cd $SRV_HOME && git pull origin new-era"
        
        # Restart services on srv871381
        ssh $SRV_HOST "systemctl restart glyph-orchestrator"
        
        echo -e "${GREEN}✅ Sync complete!${NC}"
        ;;
        
    "srv871381")
        echo -e "${GREEN}Syncing srv871381 → origin...${NC}"
        
        cd $SRV_HOME
        git add -A 
        git commit -m "🔄 Auto-sync from production: $(date +%Y-%m-%d_%H:%M)"
        git push origin new-era
        
        echo -e "${GREEN}✅ Pushed to origin${NC}"
        ;;
        
    *)
        echo -e "${GREEN}Syncing laptop → origin...${NC}"
        git add -A
        git commit -m "🔄 Auto-sync from laptop: $(date +%Y-%m-%d_%H:%M)"
        git push origin main:new-era
        ;;
esac

# Show cluster status
echo -e "\n${YELLOW}📊 Cluster Status:${NC}"
deno run --allow-all glyphgit.ts trust status | grep -E "🔴|🟡|🟢"

echo -e "\n${GREEN}🧬 Cluster synchronized!${NC}"