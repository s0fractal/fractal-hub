#!/bin/bash
# 🔄 YAML to JSON Intent Converter

YAML_FILE=$1
INTENT_BUS="$HOME/.claude/.codex/intent-bus.json"

if [[ ! -f "$YAML_FILE" ]]; then
    echo "Usage: $0 <yaml_file>"
    exit 1
fi

echo "🔄 Converting YAML intents to JSON..."

# Convert YAML to JSON using Python (most systems have it)
python3 -c "
import yaml
import json
import sys

with open('$YAML_FILE', 'r') as f:
    data = yaml.safe_load(f)
    
for intent in data.get('intents', []):
    # Add timestamp if not present
    if 'timestamp' not in intent:
        import time
        intent['timestamp'] = int(time.time())
    
    # Add processed flag
    intent['processed'] = False
    
    print(json.dumps(intent))
" | while read -r intent_json; do
    echo "📥 Injecting: $(echo "$intent_json" | jq -r .id)"
    
    # Add to intent bus
    jq ".intents += [$intent_json]" "$INTENT_BUS" > /tmp/bus.json && \
    mv /tmp/bus.json "$INTENT_BUS"
done

echo "✅ All intents injected!"