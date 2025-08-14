#!/bin/bash
# Universal GlyphGit installer - handles all cases!

echo "🧬 GLYPHGIT UNIVERSAL INSTALLER"
echo "=============================="

# Function to find glyphgit
find_glyphgit() {
    # Check current directory
    if [ -f "glyphgit.ts" ]; then
        echo "."
        return 0
    fi
    
    # Check common locations
    for dir in \
        "." \
        "s0fractal-collective-core/🧠/glyphgit" \
        "glyphgit/🧠/glyphgit" \
        "../s0fractal-collective-core/🧠/glyphgit" \
        "../glyphgit/🧠/glyphgit" \
        "~/s0fractal-collective-core/🧠/glyphgit" \
        "/opt/glyphgit/🧠/glyphgit"
    do
        if [ -f "$dir/glyphgit.ts" ]; then
            echo "$dir"
            return 0
        fi
    done
    
    return 1
}

# Try to find existing installation
GLYPH_DIR=$(find_glyphgit)

if [ $? -eq 0 ]; then
    echo "✅ Found GlyphGit at: $GLYPH_DIR"
    cd "$GLYPH_DIR"
    
    # Update
    echo "🔄 Updating..."
    git pull origin new-era 2>/dev/null || echo "⚠️  Could not update (local changes?)"
else
    echo "📥 No existing installation found. Cloning..."
    
    # Clone to current directory
    if git clone -b new-era https://github.com/s0fractal/s0fractal-collective-core.git; then
        cd s0fractal-collective-core/🧠/glyphgit
    else
        echo "❌ Failed to clone repository"
        exit 1
    fi
fi

# Now we're definitely in the right place
echo "📍 Working directory: $(pwd)"

# Check Ubuntu vs other systems
if [ -f "/etc/lsb-release" ]; then
    echo "🐧 Detected Ubuntu system"
    
    if [ -f "deploy/ubuntu-safe-install.sh" ]; then
        echo "🚀 Running Ubuntu installer..."
        bash deploy/ubuntu-safe-install.sh "$@"
    else
        echo "❌ Ubuntu installer not found!"
        exit 1
    fi
else
    echo "💻 Detected non-Ubuntu system"
    
    if [ -f "deploy/install.sh" ]; then
        echo "🚀 Running generic installer..."
        bash deploy/install.sh "$@"
    else
        echo "❌ Generic installer not found!"
        exit 1
    fi
fi

echo "✨ Done!"