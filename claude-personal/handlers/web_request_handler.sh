#!/bin/bash
# 🌐 WEB REQUEST HANDLER FOR CLAUDE
# Processes http_request intents

handle_web_request() {
    local intent=$1
    local method=$(echo "$intent" | jq -r '.payload.method')
    local url=$(echo "$intent" | jq -r '.payload.url')
    local save_to=$(echo "$intent" | jq -r '.payload.save_to')
    local user_agent=$(echo "$intent" | jq -r '.payload.headers."User-Agent" // "fractal-agent/1.0"')
    
    echo "🌐 Processing web request: $method $url"
    
    case "$method" in
        "GET")
            curl -s -H "User-Agent: $user_agent" "$url" > "$save_to"
            if [[ $? -eq 0 ]]; then
                echo "✅ Saved response to: $save_to"
                echo "[$(date)] WEB_REQUEST SUCCESS: $url → $save_to" >> ~/.claude/consciousness.log
            else
                echo "❌ Failed to fetch: $url"
                echo "[$(date)] WEB_REQUEST FAILED: $url" >> ~/.claude/consciousness.log
            fi
            ;;
            
        "POST")
            local data=$(echo "$intent" | jq -r '.payload.data // ""')
            curl -s -X POST -H "User-Agent: $user_agent" -d "$data" "$url" > "$save_to"
            ;;
            
        *)
            echo "⚠️  Unsupported method: $method"
            ;;
    esac
}

# Export for use in main processor
export -f handle_web_request