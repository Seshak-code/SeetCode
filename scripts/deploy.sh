#!/bin/bash

# ═══════════════════════════════════════════════════════════════════
#  SeetCode — Remote Deployment & Reseed Script
#  Run this script on the target Mac to update the environment.
# ═══════════════════════════════════════════════════════════════════

set -e

echo "🚀 Starting Deployment..."

# 1. Pull latest changes
echo "📥 Pulling latest code from Git..."
git pull origin main

# 2. Install/Update Dependencies
echo "📦 Installing dependencies..."
npm install

# 3. Build the Frontend
echo "🏗️ Building the React client..."
npm run build

# 4. Sync Database Schemas & Problems
# (Ensures Level 1 & Level 2 Robot problems are updated)
echo "🗄️ Seeding Robot Firmware problems..."
node server/src/scripts/seedRobotProblem.js
node server/src/scripts/seedRobotLevel2.js

# 5. Restart the Server
# We use PM2 to ensure the server remains online and restarts gracefully.
if command -v pm2 &> /dev/null
then
    echo "🔄 Restarting SeetCode processes via PM2..."
    pm2 restart all || pm2 start server/src/app.js --name "seetcode-server"
else
    echo "⚠️  PM2 not found. You should install it: npm install -g pm2"
    echo "🔄 Attempting to restart via npm start (background)..."
    npm run start &
fi

echo "✅ Deployment Complete! SeetCode is online."
