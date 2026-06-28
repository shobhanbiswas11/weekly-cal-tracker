#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/../app-config.json"

APP_NAME=$(jq -r '.appName' "$CONFIG_FILE")
STAGE_COUNT=$(jq -r '.stages | length' "$CONFIG_FILE")

for (( i=0; i<STAGE_COUNT; i++ )); do
  STAGE_NAME=$(jq -r ".stages[$i].name" "$CONFIG_FILE")
  EXPECTED_KEYS=$(jq -r ".stages[$i].ssmKeys | values[]" "$CONFIG_FILE")

  PREFIX="/${APP_NAME}/${STAGE_NAME}"
  echo "=== Stage: $STAGE_NAME ==="
  echo "Deleting secrets..."

  for KEY in $EXPECTED_KEYS; do
    aws ssm delete-parameter --name "$PREFIX/$KEY" 2>/dev/null && \
      echo "  ✓ Deleted $PREFIX/$KEY" || \
      echo "  - $PREFIX/$KEY not found (skipped)"
  done

  echo ""
done

echo "Done. All secrets removed from SSM."
