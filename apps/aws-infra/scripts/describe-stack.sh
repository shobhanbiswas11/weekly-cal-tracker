#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CDK_DIR="$SCRIPT_DIR/.."
OUTPUT_FILE="$CDK_DIR/stack-output.json"

# List all stacks in the CDK app
echo "Discovering stacks..."
STACKS=$(cd "$CDK_DIR" && npx cdk ls 2>/dev/null)

if [ -z "$STACKS" ]; then
  echo "Error: No stacks found in CDK app"
  exit 1
fi

echo "Found stacks:"
echo "$STACKS" | sed 's/^/  - /'
echo ""

# Build a combined JSON object keyed by stack name
COMBINED="{}"

while IFS= read -r STACK_NAME; do
  echo "Describing stack: $STACK_NAME..."

  OUTPUTS=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query "Stacks[0].Outputs" \
    --output json 2>/dev/null || echo "null")

  if [ "$OUTPUTS" = "null" ] || [ -z "$OUTPUTS" ]; then
    echo "  ⚠ No outputs found (stack may not be deployed yet)"
    continue
  fi

  # Flatten outputs into {key: value} and merge into combined object
  FLAT=$(echo "$OUTPUTS" | jq 'map({(.OutputKey): .OutputValue}) | add')
  COMBINED=$(echo "$COMBINED" | jq --arg name "$STACK_NAME" --argjson outputs "$FLAT" '. + {($name): $outputs}')

  echo "  ✓ Done"
done <<< "$STACKS"

echo "$COMBINED" | jq '.' > "$OUTPUT_FILE"

echo ""
echo "Stack outputs written to $OUTPUT_FILE"
echo ""
cat "$OUTPUT_FILE"
