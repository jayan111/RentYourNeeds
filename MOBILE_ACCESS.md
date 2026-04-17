# 📱 Mobile Access Guide

## Your Network IP: `192.168.1.35`

## Access URLs on Mobile (Same WiFi):

### Customer Frontend (rent-front)
- **URL:** `http://192.168.1.35:3000`
- **Port:** 3000

### Admin Dashboard (rent-admin)
- **URL:** `http://192.168.1.35:3001`
- **Port:** 3001

### Backend API (rent-backend)
- **URL:** `http://192.168.1.35:8000`
- **Health Check:** `http://192.168.1.35:8000/health`
- **Port:** 8000

---

## ✅ Setup Complete

All applications are now configured to:
- Listen on `0.0.0.0` (all network interfaces)
- Accept connections from your local network
- Use your Mac's IP address for API calls

---

## 🚀 Start Servers

```bash
# Terminal 1: Backend
cd rent-backend
npm run dev

# Terminal 2: Customer Frontend
cd rent-front
npm run dev

# Terminal 3: Admin Dashboard
cd rent-admin
npm run dev
```

---

## 📱 Test on Mobile

1. Connect your phone to the same WiFi network
2. Open browser on your phone
3. Navigate to:
   - Customer: `http://192.168.1.35:3000`
   - Admin: `http://192.168.1.35:3001`

---

## 🔧 Troubleshooting

### Can't connect from mobile?

**Check if servers are listening:**
```bash
lsof -i :3000 :3001 :8000
```

**Test from Mac first:**
```bash
curl http://192.168.1.35:3000
curl http://192.168.1.35:3001
curl http://192.168.1.35:8000/health
```

**Restart servers** if you just made changes.

---

## 🔐 Firewall (if needed)

If connection fails, allow Node.js through firewall:

1. Open **System Preferences** → **Security & Privacy** → **Firewall**
2. Click **Firewall Options**
3. Add **Node** to allowed apps
4. Or temporarily disable firewall for testing

---

## 🌐 Alternative: Public URL (ngrok)

If local network doesn't work:

```bash
# Install ngrok
brew install ngrok

# Tunnel admin panel
ngrok http 3001

# Tunnel backend
ngrok http 8000
```

You'll get public URLs like:
- `https://abc123.ngrok.io` (admin)
- `https://xyz789.ngrok.io` (backend)

Update `.env.local` files with ngrok URLs.
