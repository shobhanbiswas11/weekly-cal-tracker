#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Resetting database..."
pnpm tsx "$SCRIPT_DIR/reset-database.ts"

echo "Running Maestro tests..."
maestro test "$SCRIPT_DIR/flows/"

echo "Resetting database..."
pnpm tsx "$SCRIPT_DIR/reset-database.ts"
