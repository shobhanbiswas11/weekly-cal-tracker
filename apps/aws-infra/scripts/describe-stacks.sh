#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CDK_DIR="$SCRIPT_DIR/.."
OUTPUT_FILE="$CDK_DIR/stack-output.json"

# List all stacks in the CDK app
echo "Discovering stacks..."
ALL_STACKS=$(cd "$CDK_DIR" && npx cdk ls 2>/dev/null)

if [ -z "$ALL_STACKS" ]; then
  echo "Error: No stacks found in CDK app"
  exit 1
fi

echo "Found stacks:"
echo "$ALL_STACKS" | sed 's/^/  - /'
echo ""

# Build a combined JSON object keyed by stack name
COMBINED="{}"

while IFS= read -r LINE; do
  # cdk ls outputs: "Stage/StackId (CloudFormationStackName)"
  # Extract the CloudFormation stack name from parentheses, or use the line as-is
  PATTERN='\(([^)]+)\)'
  if [[ "$LINE" =~ $PATTERN ]]; then
    STACK_NAME="${BASH_REMATCH[1]}"
  else
    STACK_NAME="$LINE"
  fi

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
done <<< "$ALL_STACKS"

echo "$COMBINED" | jq '.' > "$OUTPUT_FILE"

echo ""
echo "Stack outputs written to $OUTPUT_FILE"
echo ""
cat "$OUTPUT_FILE"
