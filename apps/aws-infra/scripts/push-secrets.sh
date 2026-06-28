#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/../app-config.json"
BASE_DIR="$SCRIPT_DIR/.."

APP_NAME=$(jq -r '.appName' "$CONFIG_FILE")
STAGE_COUNT=$(jq -r '.stages | length' "$CONFIG_FILE")

for (( i=0; i<STAGE_COUNT; i++ )); do
  STAGE_NAME=$(jq -r ".stages[$i].name" "$CONFIG_FILE")
  SECRETS_REL=$(jq -r ".stages[$i].secretsFile" "$CONFIG_FILE")
  SECRETS_FILE="$BASE_DIR/$SECRETS_REL"
  EXPECTED_KEYS=$(jq -r ".stages[$i].ssmKeys | values[]" "$CONFIG_FILE" | sort)

  echo "=== Stage: $STAGE_NAME ==="

  if [ ! -f "$SECRETS_FILE" ]; then
    echo "Error: Secrets file not found: $SECRETS_FILE"
    echo "Create it from secrets/example.json and fill in your values."
    exit 1
  fi

  # Validate secrets file keys match ssmKeys in config
  ACTUAL_KEYS=$(jq -r 'keys[]' "$SECRETS_FILE" | sort)

  MISSING=$(comm -23 <(echo "$EXPECTED_KEYS") <(echo "$ACTUAL_KEYS"))
  EXTRA=$(comm -13 <(echo "$EXPECTED_KEYS") <(echo "$ACTUAL_KEYS"))

  if [ -n "$MISSING" ]; then
    echo "Error: $SECRETS_REL is missing keys expected by app-config.json:"
    echo "$MISSING" | sed 's/^/  - /'
    exit 1
  fi

  if [ -n "$EXTRA" ]; then
    echo "Warning: $SECRETS_REL has keys not in app-config.json:"
    echo "$EXTRA" | sed 's/^/  - /'
  fi

  # Push secrets to SSM
  PREFIX="/${APP_NAME}/${STAGE_NAME}"
  echo "Pushing secrets..."

  for KEY in $(jq -r 'keys[]' "$SECRETS_FILE"); do
    VALUE=$(jq -r ".\"${KEY}\"" "$SECRETS_FILE")

    aws ssm put-parameter \
      --name "$PREFIX/$KEY" \
      --value "$VALUE" \
      --type SecureString \
      --overwrite

    echo "  ✓ $PREFIX/$KEY"
  done

  echo ""
done

echo "Done. All secrets pushed to SSM."
