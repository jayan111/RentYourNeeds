#!/bin/bash

# Microsoft Dev Tunnels Setup Script
# Run: bash DEV_TUNNEL_SETUP.sh

echo "🌐 Setting up Microsoft Dev Tunnels..."

# Step 1: Install devtunnel CLI
echo "📥 Installing devtunnel CLI..."
curl -sL https://aka.ms/DevTunnelCliInstall | bash

# Add to PATH
export PATH="$HOME/.local/bin:$PATH"

# Step 2: Login to Microsoft account
echo "🔐 Login to your Microsoft account..."
devtunnel user login

# Step 3: Create tunnels for all ports
echo "🚇 Creating tunnels..."

# Backend tunnel (port 8000)
devtunnel create backend-api --port 8000 --allow-anonymous
devtunnel port create backend-api --port-number 8000

# Frontend tunnel (port 3000)
devtunnel create frontend --port 3000 --allow-anonymous
devtunnel port create frontend --port-number 3000

# Admin tunnel (port 3001)
devtunnel create admin --port 3001 --allow-anonymous
devtunnel port create admin --port-number 3001

# Step 4: List all tunnels
echo "📋 Your tunnels:"
devtunnel list

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start tunnels, run:"
echo "   devtunnel host backend-api --port 8000"
echo "   devtunnel host frontend --port 3000"
echo "   devtunnel host admin --port 3001"
