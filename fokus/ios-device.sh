#!/bin/bash
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "› Prebuild (generating native iOS project)..."
npx expo prebuild --platform ios --no-install

echo "› Installing dependencies..."
npm install

echo "› Building and installing on device..."
npx expo run:ios --device --no-install
