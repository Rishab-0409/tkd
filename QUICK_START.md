# ⚡ Quick Start Guide

## 3 Steps to Run the Application

### Step 1: Navigate to Project
```bash
cd taekwondo-scoring-system
```

### Step 2: Install & Run Everything
```bash
npm install-all
npm start
```

This command will:
- ✅ Install all backend dependencies
- ✅ Install all frontend dependencies
- ✅ Start backend server on http://localhost:5000
- ✅ Start frontend on http://localhost:3000

Wait 30-60 seconds for everything to start.

### Step 3: Open in Browser
```
http://localhost:3000
```

---

## Using the Application

### For Admin (Setup)
1. Open http://localhost:3000
2. Select **Admin** role, give it a device name (e.g., "Main Screen")
3. Create a match with player names and weights
4. Click "Start Round" when ready

### For Officials (Scoring)
1. Open http://localhost:3000 on another device/browser
2. Select **Official** role, give it a device name (e.g., "Ref1")
3. Click score buttons to vote (+1, +2, +3)
4. Needs 2+ officials voting same score to apply

### For Spectators (Viewing)
1. Open http://localhost:3000 on another device/browser
2. Select **Spectator** role
3. Watch the match in real-time

---

## Important Notes

✅ **Multiple Devices**: Open in different browser tabs or actual devices
✅ **Same Network**: All devices must be on same WiFi network
✅ **Backend Required**: Must keep terminal with `npm start` running
✅ **Port 3000 & 5000**: Make sure these ports are free

---

## Troubleshooting

### Problem: "Cannot connect to server"
```bash
# Kill processes and restart
npm start
```

### Problem: "Port already in use"
```bash
# Find and kill the process
# On Mac/Linux:
lsof -i :3000
kill -9 <PID>

# Then restart
npm start
```

### Problem: "Dependencies not installing"
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf backend/node_modules frontend/node_modules
npm install-all
npm start
```

---

## File Structure (What's What)

```
taekwondo-scoring-system/
├── backend/        ← Server (port 5000)
├── frontend/       ← UI (port 3000)
├── scripts/        ← Startup scripts
├── README.md       ← Full documentation
└── package.json    ← Main configuration
```

---

## Running Backend & Frontend Separately

If you prefer to run them in separate terminals:

**Terminal 1:**
```bash
cd backend
npm install
npm start
```

**Terminal 2:**
```bash
cd frontend
npm install
npm start
```

---

## Testing the System

### Demo Scenario:

1. **Device 1 (Admin)**: Create match with Player A vs Player B
2. **Device 2 (Official)**: Vote to add +1 score to Player A
3. **Device 3 (Official)**: Vote to add +1 score to Player A (now it's approved)
4. **Device 4 (Spectator)**: Watch scores update in real-time

---

🥋 **That's it! You're ready to go!** 🥋

For detailed documentation, see `README.md`
