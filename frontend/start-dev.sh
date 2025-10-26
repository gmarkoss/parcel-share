#!/bin/bash

# Clean start script for Next.js dev server
echo "🧹 Cleaning up old processes..."
pkill -9 -f "next dev" 2>/dev/null || true
pkill -9 -f "node.*frontend" 2>/dev/null || true
sleep 2

echo "🗑️  Removing corrupted cache..."
rm -rf .next/.cache 2>/dev/null || true
rm -rf .next/static 2>/dev/null || true  
find .next -name "*.tmp.*" -type f -delete 2>/dev/null || true

# Fix permission issues
if [ -d .next ]; then
    echo "🔧 Fixing .next permissions..."
    chmod -R 755 .next 2>/dev/null || true
    rm -rf .next/static/development/*.tmp.* 2>/dev/null || true
fi

echo "🚀 Starting dev server on port 3004..."
PORT=3004 npm run dev
