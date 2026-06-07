#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: .env file not found at $ENV_FILE"
  echo "Copy .env.example to .env and fill in your values."
  exit 1
fi

source "$ENV_FILE"

PREFIX="/weekly-health"

echo "Pushing secrets to SSM Parameter Store..."

aws ssm put-parameter \
  --name "$PREFIX/openai-api-key" \
  --value "$OPENAI_API_KEY" \
  --type SecureString \
  --overwrite

echo "  ✓ $PREFIX/openai-api-key"

aws ssm put-parameter \
  --name "$PREFIX/clerk-secret-key" \
  --value "$CLERK_SECRET_KEY" \
  --type SecureString \
  --overwrite

echo "  ✓ $PREFIX/clerk-secret-key"

echo ""
echo "Done. All secrets pushed to SSM."
