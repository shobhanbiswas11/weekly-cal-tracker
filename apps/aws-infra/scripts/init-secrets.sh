#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/../app-config.json"
BASE_DIR="$SCRIPT_DIR/.."

STAGE_COUNT=$(jq -r '.stages | length' "$CONFIG_FILE")

for (( i=0; i<STAGE_COUNT; i++ )); do
  STAGE_NAME=$(jq -r ".stages[$i].name" "$CONFIG_FILE")
  SECRETS_REL=$(jq -r ".stages[$i].secretsFile" "$CONFIG_FILE")
  SECRETS_FILE="$BASE_DIR/$SECRETS_REL"

  if [ -f "$SECRETS_FILE" ]; then
    echo "Skipping $SECRETS_REL (already exists)"
    continue
  fi

  # Generate a template with empty values from ssmKeys
  mkdir -p "$(dirname "$SECRETS_FILE")"
  jq -r ".stages[$i].ssmKeys | to_entries | map({(.value): \"\"}) | add" "$CONFIG_FILE" > "$SECRETS_FILE"

  echo "Created $SECRETS_REL — fill in your secret values"
done

echo "Done."
