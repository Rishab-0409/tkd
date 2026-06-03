# 🥋 Taekwondo Scoring System

A modern, multi-device Taekwondo match scoring system with real-time synchronization across admin, officials, and spectator devices.

## Features

✅ **Multi-Device Support**
- Admin: Full control over match (1 device)
- Officials: Vote on scores and add penalties (max 4 devices)
- Spectators: View-only access (unlimited devices)
- Real-time synchronization via WebSocket

✅ **Match Management**
- 3 rounds of 2 minutes each
- 30-second breaks between rounds (manual resume)
- Best of 3 rounds = match winner
- Penalty system (max 5 per player per round)

✅ **Scoring System**
- Score increments: +1, +2, +3 (officials only vote, admin can set directly)
- Admin can also apply negative scores: -1, -2, -3
- Requires 2+ official approvals for score to be credited
- 5 penalties = automatic round loss

✅ **Geolocation**
- 20-meter range requirement for officials and admin
- Spectators can access from anywhere
- Automatic disconnection if out of range

✅ **Live Statistics**
- Real-time scoring display
- Penalty tracking
- Round-wise breakdown
- Match winner announcement

## System Requirements

- **Node.js** v14.0 or higher
- **npm** v6.0 or higher
- **Modern web browser** (Chrome, Firefox, Safari, Edge)
- **Geolocation-enabled devices** (for officials/admin)

## Quick Start

### Step 1: Extract the Zip File

```bash
unzip taekwondo-scoring-system.zip
cd taekwondo-scoring-system
```

### Step 2: Install Dependencies & Start

#### Option A: Automatic (Recommended)

```bash
npm install-all
npm start
```

This will:
1. Install backend dependencies
2. Install frontend dependencies
3. Start both backend and frontend automatically

#### Option B: Manual (Two Terminals)

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm start
```

### Step 3: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## Usage Guide

### Role Selection

When you first load the application, select your role:

1. **Admin** 👨‍⚖️
   - Create matches
   - Control match flow (start/end rounds)
   - Update player information
   - Set scores directly
   - Apply penalties
   - View all statistics

2. **Official** 👔
   - Vote on scores (+1, +2, +3 only)
   - Add penalties
   - View match status
   - Must be within 20 meters of venue
   - Limited to 4 devices max (with admin)

3. **Spectator** 👀
   - View-only access
   - Watch live scoring
   - See match statistics
   - Can access from anywhere

### Creating a Match (Admin)

1. Log in as **Admin**
2. Fill in:
   - Player 1 Name
   - Player 1 Weight
   - Player 2 Name
   - Player 2 Weight
3. Click "Create Match"

### Running a Match

#### Admin Controls:

1. **Start Round**: Click "Start Round" to begin 2-minute timer
2. **Score Management**:
   - Click +3, +2, +1 to increase score
   - Click -1, -2, -3 to decrease score (admin only)
3. **Penalties**: Click "Add Penalty" button
4. **End Round**: Click "End Round" to stop timer
5. **Break**: Takes automatic 30-second break between rounds
6. **Resume**: Click "Start Round" to begin next round

#### Official Actions:

1. **Vote on Scores**: Click score button (+1, +2, +3)
   - Requires 2+ officials to approve same score change
   - Score automatically credited when approved
2. **Add Penalties**: Click "Add Penalty" for either player
3. **Monitor**: Watch real-time match progress

#### Spectator View:

1. **Watch Live**: See current round score
2. **Track Penalties**: Visual penalty indicators
3. **Review Stats**: See all-round statistics
4. **Winner Announcement**: Automatic display when match ends

## File Structure

```
taekwondo-scoring-system/
├── backend/
│   ├── server.js              # Express + Socket.IO server
│   ├── package.json           # Backend dependencies
│   └── data/
│       └── taekwondo.db       # SQLite database (auto-created)
│
├── frontend/
│   ├── src/
│   │   ├── App.js             # Main component
│   │   ├── App.css            # Main styles
│   │   ├── index.js           # Entry point
│   │   ├── index.css          # Global styles
│   │   └── components/
│   │       ├── RoleSelection.js       # Role selector
│   │       ├── RoleSelection.css
│   │       ├── AdminPanel.js          # Admin interface
│   │       ├── AdminPanel.css
│   │       ├── OfficialPanel.js       # Official interface
│   │       ├── OfficialPanel.css
│   │       ├── SpectatorPanel.js      # Spectator view
│   │       └── SpectatorPanel.css
│   ├── public/
│   │   └── index.html         # HTML template
│   └── package.json           # Frontend dependencies
│
├── scripts/
│   ├── start.js               # Combined start script
│   ├── start-backend.sh       # Backend-only startup
│   └── start-frontend.sh      # Frontend-only startup
│
├── package.json               # Root package file
└── README.md                  # This file
```

## Database

The system uses **SQLite** (lightweight, file-based):
- Automatically created in `backend/data/taekwondo.db`
- No external database setup required
- Tables: matches, rounds, score_votes, devices

## Troubleshooting

### "Backend not responding"
- Ensure backend is running on port 5000
- Check: `npm start` in backend directory
- Verify firewall isn't blocking port 5000

### "Port already in use"
```bash
# Kill process on port 5000 (backend)
lsof -i :5000
kill -9 <PID>

# Kill process on port 3000 (frontend)
lsof -i :3000
kill -9 <PID>
```

### "Dependencies not installing"
```bash
# Clear npm cache
npm cache clean --force

# Reinstall
rm -rf backend/node_modules frontend/node_modules
npm install-all
```

### "Location permission denied"
- For officials/admin, ensure browser has geolocation permission
- Check browser settings
- May need HTTPS for production

### "Devices not connecting"
- All devices must be on the same network
- Check backend is running
- Verify firewall allows WebSocket connections

## Deployment Notes

### For Production:

1. **Backend**:
   - Set `NODE_ENV=production`
   - Use process manager (PM2, Forever)
   - Configure CORS for your domain

2. **Frontend**:
   - Build: `npm run build` in frontend directory
   - Serve dist folder with web server
   - Update API endpoint in socket connection

3. **HTTPS**:
   - Required for geolocation in production
   - Use SSL certificates

## System Specifications Met

✅ Multi-device application (3+ devices)
✅ 3 role types (Admin, Official, Spectator)
✅ Match flow control (3 rounds x 2 min + 30 sec breaks)
✅ Scoring system (+1, +2, +3, -1, -2, -3)
✅ 2+ approval requirement for score crediting
✅ Penalty system (5 max per round)
✅ Winner determination (best of 3)
✅ Geolocation tracking (20-meter range)
✅ Live statistics and final winner board
✅ Maximum 5 combined admin + officials
✅ Unlimited spectators
✅ WebSocket real-time synchronization
✅ SQLite database (no MongoDB)
✅ Simple setup (npm install && npm start)

## Technical Stack

- **Backend**: Node.js, Express.js, Socket.IO, SQLite3
- **Frontend**: React 18, CSS3, Socket.IO Client
- **Communication**: WebSocket (Socket.IO)
- **Database**: SQLite (file-based)
- **Geolocation**: Browser Geolocation API

## Support

For issues:
1. Check the Troubleshooting section
2. Verify all dependencies are installed
3. Ensure both backend and frontend are running
4. Check browser console for errors (F12)

## License

This project is created for SkillX submission.

---

**Ready to start?** Run `npm start` in the project directory!

🥋 Happy Scoring! 🥋
