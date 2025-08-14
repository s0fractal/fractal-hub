#!/bin/bash
# smart-install.sh - Розумний інсталятор що перевіряє все!

set -e

echo "🧠 SMART GLYPHGIT INSTALLER"
echo "=========================="

# Check if we're already in the repo
if [ -f "glyphgit.ts" ]; then
    echo "✅ Already in GlyphGit directory!"
    REPO_DIR="."
elif [ -d "s0fractal-collective-core" ]; then
    echo "✅ Repository already cloned!"
    cd s0fractal-collective-core/🧠/glyphgit
    REPO_DIR="."
elif [ -d "glyphgit" ]; then
    echo "✅ Found glyphgit directory!"
    cd glyphgit/🧠/glyphgit
    REPO_DIR="."
else
    echo "📥 Cloning repository..."
    git clone -b new-era https://github.com/s0fractal/s0fractal-collective-core.git
    cd s0fractal-collective-core/🧠/glyphgit
    REPO_DIR="."
fi

# Update to latest
echo "🔄 Updating to latest version..."
git pull origin new-era || echo "⚠️  Could not pull updates (maybe local changes?)"

# Check for existing installation
if [ -d "/opt/glyphgit" ]; then
    echo "⚠️  GlyphGit already installed at /opt/glyphgit"
    read -p "Update existing installation? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Installation cancelled"
        exit 0
    fi
fi

# Check for running services
if systemctl is-active --quiet glyph-orchestrator; then
    echo "⚠️  GlyphGit services are running!"
    echo "   Stopping services..."
    sudo systemctl stop glyph-orchestrator glyph-calendar glyph-pulse glyph-db-monitor 2>/dev/null || true
fi

# Run the appropriate installer
if [ -f "deploy/ubuntu-safe-install.sh" ]; then
    echo "🚀 Running Ubuntu installer..."
    bash deploy/ubuntu-safe-install.sh
elif [ -f "deploy/install.sh" ]; then
    echo "🚀 Running generic installer..."
    bash deploy/install.sh
else
    echo "❌ No installer found!"
    echo "   Current directory: $(pwd)"
    echo "   Files available:"
    ls -la deploy/ 2>/dev/null || echo "No deploy directory"
    exit 1
fi

echo "✨ Installation complete!"