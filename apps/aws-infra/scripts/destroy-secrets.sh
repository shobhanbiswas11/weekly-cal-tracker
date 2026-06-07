#!/bin/bash
set -euo pipefail

PREFIX="/weekly-health"

echo "Deleting secrets from SSM Parameter Store..."

aws ssm delete-parameter --name "$PREFIX/openai-api-key" 2>/dev/null && \
  echo "  ✓ Deleted $PREFIX/openai-api-key" || \
  echo "  - $PREFIX/openai-api-key not found (skipped)"

aws ssm delete-parameter --name "$PREFIX/clerk-secret-key" 2>/dev/null && \
  echo "  ✓ Deleted $PREFIX/clerk-secret-key" || \
  echo "  - $PREFIX/clerk-secret-key not found (skipped)"

echo ""
echo "Done. All secrets removed from SSM."
