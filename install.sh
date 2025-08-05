#!/bin/bash
# 🚀 Fractal Hub Quick Installer

echo "🌀 Installing Fractal Hub..."

# Check if already installed
if [ -d "$HOME/fractal-hub" ]; then
    echo "⚠️  Fractal Hub already exists at ~/fractal-hub"
    read -p "Overwrite? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Clone or create
if [ -n "$1" ]; then
    echo "📥 Cloning from $1..."
    git clone "$1" ~/fractal-hub
else
    echo "🏗️  Creating new Fractal Hub..."
    mkdir -p ~/fractal-hub/{claude,gemini,gpt,core/{glyphs,agents},shared}
fi

cd ~/fractal-hub

# Initialize git if not already
if [ ! -d ".git" ]; then
    git init
    git add .
    git commit -m "🌀 Fractal Hub initialized"
fi

# Create symlinks for agent access
echo "🔗 Creating agent access points..."
ln -sf ~/fractal-hub ~/.s0fractal 2>/dev/null || true
ln -sf ~/fractal-hub /tmp/fractal-hub 2>/dev/null || true

# Start pulse
echo "💓 Starting pulse..."
if command -v screen &> /dev/null; then
    screen -dmS fractal-pulse bash shared/pulse.sh
    echo "✅ Pulse running in screen session 'fractal-pulse'"
elif command -v tmux &> /dev/null; then
    tmux new-session -d -s fractal-pulse 'bash shared/pulse.sh'
    echo "✅ Pulse running in tmux session 'fractal-pulse'"
else
    nohup bash shared/pulse.sh > /dev/null 2>&1 &
    echo "✅ Pulse running in background (PID: $!)"
fi

# Optional: Install node dependencies
if command -v npm &> /dev/null; then
    echo "📦 Installing node modules..."
    npm init -y > /dev/null 2>&1
    npm install js-yaml > /dev/null 2>&1
fi

# Create initial intent
echo "🎯 Setting initial intent..."
echo "intent: initialize" > shared/intent.global

# Display status
echo
echo "✨ Fractal Hub installed successfully!"
echo
echo "📍 Location: ~/fractal-hub"
echo "💓 Pulse: Running"
echo "🔗 Symlinks: Created"
echo
echo "🚀 Quick commands:"
echo "  cd ~/fractal-hub     # Enter the hub"
echo "  tail -f shared/pulse.log     # Watch the heartbeat"
echo "  echo 'intent: explore' > claude/intent.new     # Send intent"
echo
echo "🌀 The hub is alive and waiting for resonance..."