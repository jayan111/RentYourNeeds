# 🌐 Microsoft Dev Tunnels Guide

## 📥 Installation

### Method 1: Automatic Install (Recommended)
```bash
curl -sL https://aka.ms/DevTunnelCliInstall | bash
```

### Method 2: Manual Download
1. Visit: **https://aka.ms/devtunnels/download**
2. Download for macOS
3. Move to PATH:
```bash
sudo mv devtunnel /usr/local/bin/
chmod +x /usr/local/bin/devtunnel
```

### Method 3: Homebrew
```bash
brew tap microsoft/devtunnels
brew install devtunnel
```

---

## 🚀 Quick Start

### 1. Login to Microsoft Account
```bash
devtunnel user login
```
This will open a browser for authentication.

### 2. Create Tunnels

#### Backend API (Port 8000)
```bash
devtunnel create backend-api --allow-anonymous
devtunnel port create backend-api --port-number 8000
```

#### Customer Frontend (Port 3000)
```bash
devtunnel create frontend --allow-anonymous
devtunnel port create frontend --port-number 3000
```

#### Admin Dashboard (Port 3001)
```bash
devtunnel create admin --allow-anonymous
devtunnel port create admin --port-number 3001
```

### 3. Start Tunnels

Open 3 separate terminals:

**Terminal 1: Backend Tunnel**
```bash
cd rent-backend
npm run dev &
devtunnel host backend-api --port 8000
```

**Terminal 2: Frontend Tunnel**
```bash
cd rent-front
npm run dev &
devtunnel host frontend --port 3000
```

**Terminal 3: Admin Tunnel**
```bash
cd rent-admin
npm run dev &
devtunnel host admin --port 3001
```

---

## 📱 Access URLs

After starting tunnels, you'll get URLs like:

```
Backend:  https://abc123-8000.usw2.devtunnels.ms
Frontend: https://xyz789-3000.usw2.devtunnels.ms
Admin:    https://def456-3001.usw2.devtunnels.ms
```

**Update .env files with these URLs:**

### rent-front/.env.local
```env
NEXT_PUBLIC_API_URL=https://abc123-8000.usw2.devtunnels.ms/api
```

### rent-admin/.env.local
```env
NEXT_PUBLIC_API_URL=https://abc123-8000.usw2.devtunnels.ms/api
```

---

## 🔧 Useful Commands

### List all tunnels
```bash
devtunnel list
```

### Show tunnel details
```bash
devtunnel show backend-api
```

### Delete a tunnel
```bash
devtunnel delete backend-api
```

### Update tunnel (make public)
```bash
devtunnel update backend-api --allow-anonymous
```

---

## 🎯 One-Command Setup

Run the setup script:
```bash
chmod +x DEV_TUNNEL_SETUP.sh
./DEV_TUNNEL_SETUP.sh
```

---

## 📋 Complete Workflow

### Step 1: Install
```bash
curl -sL https://aka.ms/DevTunnelCliInstall | bash
export PATH="$HOME/.local/bin:$PATH"
```

### Step 2: Login
```bash
devtunnel user login
```

### Step 3: Create Tunnels (One-time)
```bash
# Backend
devtunnel create backend --allow-anonymous
devtunnel port create backend -p 8000

# Frontend
devtunnel create frontend --allow-anonymous
devtunnel port create frontend -p 3000

# Admin
devtunnel create admin --allow-anonymous
devtunnel port create admin -p 3001
```

### Step 4: Start Everything
```bash
# Terminal 1: Backend
cd rent-backend && npm run dev &
devtunnel host backend -p 8000

# Terminal 2: Frontend
cd rent-front && npm run dev &
devtunnel host frontend -p 3000

# Terminal 3: Admin
cd rent-admin && npm run dev &
devtunnel host admin -p 3001
```

### Step 5: Copy URLs
Look for output like:
```
Connect via browser: https://abc123-8000.usw2.devtunnels.ms
```

### Step 6: Update Environment Variables
Update both `.env.local` files with the backend tunnel URL.

### Step 7: Access on Mobile
Open the tunnel URLs on your mobile browser!

---

## 🔐 Security Notes

- `--allow-anonymous`: Anyone with URL can access
- For private tunnels, remove this flag (requires Microsoft auth)
- Tunnels expire after inactivity
- Free tier has usage limits

---

## 🆚 Dev Tunnels vs ngrok

| Feature | Dev Tunnels | ngrok |
|---------|-------------|-------|
| **Free tier** | Yes | Yes (limited) |
| **Auth** | Microsoft account | ngrok account |
| **Persistent URLs** | No | Yes (paid) |
| **Speed** | Fast | Fast |
| **Setup** | Simple | Simple |

---

## 🐛 Troubleshooting

### "devtunnel: command not found"
```bash
export PATH="$HOME/.local/bin:$PATH"
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### "Port already in use"
```bash
lsof -ti:8000 | xargs kill -9
```

### Tunnel not accessible
- Check if `--allow-anonymous` flag is set
- Verify app is running on the port
- Check firewall settings

---

## 📚 Official Documentation

- **Main Site:** https://aka.ms/devtunnels
- **Docs:** https://learn.microsoft.com/en-us/azure/developer/dev-tunnels/
- **CLI Reference:** https://learn.microsoft.com/en-us/azure/developer/dev-tunnels/cli-commands

---

## ✅ Quick Test

After setup, test with:
```bash
# Start a simple server
python3 -m http.server 8000 &

# Create and host tunnel
devtunnel create test --allow-anonymous
devtunnel port create test -p 8000
devtunnel host test -p 8000

# You'll get a URL - open it on mobile!
```
