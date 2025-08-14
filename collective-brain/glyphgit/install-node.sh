#!/bin/bash
# install-node.sh - Simple installer for GlyphGit nodes

echo "🧬 GlyphGit Node Installer"
echo "========================="

# Clone the repository first
echo "📥 Cloning repository..."
git clone -b new-era https://github.com/s0fractal/s0fractal-collective-core.git /tmp/glyphgit-install

# Run the actual installer
echo "🚀 Running installer..."
cd /tmp/glyphgit-install/🧠/glyphgit/deploy
bash install.sh $@

# Cleanup
rm -rf /tmp/glyphgit-install

echo "✅ Installation complete!"