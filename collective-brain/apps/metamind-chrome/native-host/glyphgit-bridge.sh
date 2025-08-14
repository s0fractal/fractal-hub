#!/bin/bash
# glyphgit-bridge.sh - Bridge between Chrome App and gg

# Chrome native messaging protocol:
# - 4 bytes message length (little-endian)
# - JSON message

GG_PATH="/Users/chaoshex/.s0fractal/🧠/glyphgit"

# Read message length
read_message() {
    # Read 4 bytes for message length
    IFS= read -r -n4 -d '' LENGTH_BYTES
    
    # Convert to integer (little-endian)
    LENGTH=$(printf "%d" "'${LENGTH_BYTES:0:1}")
    
    # Read actual message
    IFS= read -r -n$LENGTH -d '' MESSAGE
    echo "$MESSAGE"
}

# Send message back to Chrome
send_message() {
    local message="$1"
    local length=${#message}
    
    # Send length as 4 bytes (little-endian)
    printf "\\$(printf '%03o' $((length & 0xFF)))"
    printf "\\$(printf '%03o' $(((length >> 8) & 0xFF)))"
    printf "\\$(printf '%03o' $(((length >> 16) & 0xFF)))"
    printf "\\$(printf '%03o' $(((length >> 24) & 0xFF)))"
    
    # Send message
    printf "%s" "$message"
}

# Main loop
while true; do
    MESSAGE=$(read_message)
    
    if [ -z "$MESSAGE" ]; then
        break
    fi
    
    # Parse JSON and execute gg command
    COMMAND=$(echo "$MESSAGE" | jq -r '.command')
    ARGS=$(echo "$MESSAGE" | jq -r '.args[]')
    
    # Execute gg command
    cd "$GG_PATH"
    RESULT=$(deno run --allow-all glyphgit.ts $COMMAND $ARGS 2>&1)
    
    # Send result back
    RESPONSE=$(jq -n --arg result "$RESULT" '{
        "type": "command-result",
        "success": true,
        "output": $result
    }')
    
    send_message "$RESPONSE"
done