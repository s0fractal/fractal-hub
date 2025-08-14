#!/bin/bash
# setup-auto-sync.sh - Налаштувати автоматичну синхронізацію

echo "⚙️  Setting up auto-sync..."

# Add to crontab (every 5 minutes)
(crontab -l 2>/dev/null; echo "*/5 * * * * cd $(pwd) && ./sync-cluster.sh > sync.log 2>&1") | crontab -

# Also create launchd service for macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    cat > ~/Library/LaunchAgents/com.s0fractal.glyphgit.sync.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.s0fractal.glyphgit.sync</string>
    <key>ProgramArguments</key>
    <array>
        <string>$(pwd)/sync-cluster.sh</string>
    </array>
    <key>StartInterval</key>
    <integer>300</integer>
    <key>WorkingDirectory</key>
    <string>$(pwd)</string>
    <key>StandardOutPath</key>
    <string>$(pwd)/sync.log</string>
    <key>StandardErrorPath</key>
    <string>$(pwd)/sync-error.log</string>
</dict>
</plist>
EOF
    
    launchctl load ~/Library/LaunchAgents/com.s0fractal.glyphgit.sync.plist
    echo "✅ LaunchAgent created for macOS"
fi

echo "✅ Auto-sync configured!"
echo "   - Cron job every 5 minutes"
echo "   - Logs in sync.log"