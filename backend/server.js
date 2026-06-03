const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Database setup
const dbDir = path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(path.join(dbDir, 'taekwondo.db'));

// Initialize database
const initDB = () => {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player1_name TEXT,
      player2_name TEXT,
      player1_weight TEXT,
      player2_weight TEXT,
      current_round INTEGER DEFAULT 1,
      match_status TEXT DEFAULT 'idle',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS rounds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id INTEGER,
      round_number INTEGER,
      player1_score INTEGER DEFAULT 0,
      player2_score INTEGER DEFAULT 0,
      player1_penalties INTEGER DEFAULT 0,
      player2_penalties INTEGER DEFAULT 0,
      winner INTEGER DEFAULT 0,
      FOREIGN KEY (match_id) REFERENCES matches(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS score_votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id INTEGER,
      round_number INTEGER,
      player_number INTEGER,
      score_change INTEGER,
      voted_by TEXT,
      device_id TEXT,
      approved_count INTEGER DEFAULT 1,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS devices (
      id TEXT PRIMARY KEY,
      role TEXT,
      match_id INTEGER,
      device_name TEXT,
      latitude REAL,
      longitude REAL,
      last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
      connected BOOLEAN DEFAULT 1
    )`);
  });
};

initDB();

// State management
const matchState = {
  currentMatch: null,
  devices: new Map(),
  scoreVotes: new Map(),
  roundTimers: new Map(),
  breakTimers: new Map()
};

// Helper functions
const getMatchById = (id) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM matches WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const getRoundsByMatchId = (matchId) => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM rounds WHERE match_id = ? ORDER BY round_number', [matchId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

const updateMatchStatus = (matchId, status) => {
  return new Promise((resolve, reject) => {
    db.run('UPDATE matches SET match_status = ? WHERE id = ?', [status, matchId], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000; // Return in meters
};

const isWithinRange = (centerLat, centerLon, deviceLat, deviceLon) => {
  const distance = calculateDistance(centerLat, centerLon, deviceLat, deviceLon);
  return distance <= 20; // 20 meters
};

// Socket.IO events
io.on('connection', (socket) => {
  console.log('New device connected:', socket.id);

  // Register device
  socket.on('register-device', (data) => {
    const { deviceId, role, deviceName, matchId } = data;
    matchState.devices.set(socket.id, {
      socketId: socket.id,
      deviceId,
      role,
      deviceName,
      matchId,
      latitude: null,
      longitude: null,
      connected: true
    });

    db.run('INSERT OR REPLACE INTO devices VALUES (?, ?, ?, ?, NULL, NULL, CURRENT_TIMESTAMP, 1)',
      [deviceId, role, matchId, deviceName]);

    io.emit('devices-updated', Array.from(matchState.devices.values()));
    console.log(`Device registered: ${deviceName} as ${role}`);
  });

  // Update device location
  socket.on('update-location', (data) => {
    const { latitude, longitude } = data;
    const device = matchState.devices.get(socket.id);

    if (device) {
      device.latitude = latitude;
      device.longitude = longitude;

      if (device.role !== 'spectator' && matchState.currentMatch) {
        // Check if device is within range (we'll use a default center for now)
        // In a real scenario, you'd have the match center coordinates
        const withinRange = isWithinRange(19.0760, 72.8777, latitude, longitude); // Mumbai coordinates as example

        if (!withinRange && device.role !== 'spectator') {
          socket.emit('out-of-range');
          device.connected = false;
        }
      }
    }
  });

  // Create new match
  socket.on('create-match', async (data) => {
    const { player1Name, player1Weight, player2Name, player2Weight } = data;

    db.run(
      'INSERT INTO matches (player1_name, player2_name, player1_weight, player2_weight, match_status) VALUES (?, ?, ?, ?, ?)',
      [player1Name, player2Name, player1Weight, player2Weight, 'idle'],
      function (err) {
        if (err) {
          socket.emit('error', { message: 'Failed to create match' });
          return;
        }

        const matchId = this.lastID;
        matchState.currentMatch = { id: matchId };

        // Create rounds
        for (let i = 1; i <= 3; i++) {
          db.run('INSERT INTO rounds (match_id, round_number) VALUES (?, ?)', [matchId, i]);
        }

        io.emit('match-created', { matchId });
      }
    );
  });

  // Start round
  socket.on('start-round', async (data) => {
    const { matchId, roundNumber } = data;
    const device = matchState.devices.get(socket.id);

    if (!device || device.role !== 'admin') {
      socket.emit('error', { message: 'Only admin can start round' });
      return;
    }

    await updateMatchStatus(matchId, 'ongoing');

    // 2 minute timer (120 seconds)
    const roundTimer = setInterval(() => {
      io.emit('round-timer', { remainingTime: 120 });
    }, 1000);

    matchState.roundTimers.set(`round-${matchId}-${roundNumber}`, roundTimer);
    io.emit('round-started', { matchId, roundNumber });
  });

  // End round
  socket.on('end-round', async (data) => {
    const { matchId, roundNumber } = data;
    const device = matchState.devices.get(socket.id);

    if (!device || device.role !== 'admin') {
      socket.emit('error', { message: 'Only admin can end round' });
      return;
    }

    const timerKey = `round-${matchId}-${roundNumber}`;
    if (matchState.roundTimers.has(timerKey)) {
      clearInterval(matchState.roundTimers.get(timerKey));
      matchState.roundTimers.delete(timerKey);
    }

    io.emit('round-ended', { matchId, roundNumber });
  });

  // Start break
  socket.on('start-break', (data) => {
    const { matchId, roundNumber } = data;
    const device = matchState.devices.get(socket.id);

    if (!device || device.role !== 'admin') {
      socket.emit('error', { message: 'Only admin can manage breaks' });
      return;
    }

    io.emit('break-started', { matchId, roundNumber, duration: 30 });
  });

  // Vote for score
  socket.on('vote-score', async (data) => {
    const { matchId, roundNumber, playerNumber, scoreChange } = data;
    const device = matchState.devices.get(socket.id);

    if (!device) {
      socket.emit('error', { message: 'Device not registered' });
      return;
    }

    if (device.role === 'spectator') {
      socket.emit('error', { message: 'Spectators cannot vote' });
      return;
    }

    if (device.role === 'admin') {
      // Admin can directly apply any score change
      db.run(
        'UPDATE rounds SET player' + playerNumber + '_score = player' + playerNumber + '_score + ? WHERE match_id = ? AND round_number = ?',
        [scoreChange, matchId, roundNumber],
        (err) => {
          if (err) {
            socket.emit('error', { message: 'Failed to update score' });
            return;
          }
          io.emit('score-updated', { matchId, roundNumber, playerNumber, scoreChange });
        }
      );
    } else {
      // Official - need 2+ approvals
      const voteKey = `${matchId}-${roundNumber}-${playerNumber}-${scoreChange}`;
      const votes = matchState.scoreVotes.get(voteKey) || { count: 0, voters: [] };

      if (!votes.voters.includes(device.deviceId)) {
        votes.count++;
        votes.voters.push(device.deviceId);
        matchState.scoreVotes.set(voteKey, votes);

        if (votes.count >= 2) {
          db.run(
            'UPDATE rounds SET player' + playerNumber + '_score = player' + playerNumber + '_score + ? WHERE match_id = ? AND round_number = ?',
            [scoreChange, matchId, roundNumber],
            (err) => {
              if (err) {
                socket.emit('error', { message: 'Failed to update score' });
                return;
              }
              io.emit('score-updated', { matchId, roundNumber, playerNumber, scoreChange });
              matchState.scoreVotes.delete(voteKey);
            }
          );
        } else {
          io.emit('vote-recorded', { matchId, roundNumber, playerNumber, scoreChange, approvalCount: votes.count });
        }
      }
    }
  });

  // Update player info
  socket.on('update-player-info', async (data) => {
    const { matchId, playerNumber, name, weight } = data;
    const device = matchState.devices.get(socket.id);

    if (!device || device.role !== 'admin') {
      socket.emit('error', { message: 'Only admin can update player info' });
      return;
    }

    const column1 = playerNumber === 1 ? 'player1_name' : 'player2_name';
    const column2 = playerNumber === 1 ? 'player1_weight' : 'player2_weight';

    db.run(
      `UPDATE matches SET ${column1} = ?, ${column2} = ? WHERE id = ?`,
      [name, weight, matchId],
      (err) => {
        if (err) {
          socket.emit('error', { message: 'Failed to update player info' });
          return;
        }
        io.emit('player-info-updated', { matchId, playerNumber, name, weight });
      }
    );
  });

  // Add penalty
  socket.on('add-penalty', (data) => {
    const { matchId, roundNumber, playerNumber } = data;
    const device = matchState.devices.get(socket.id);

    if (!device || device.role === 'spectator') {
      socket.emit('error', { message: 'Only admin and officials can add penalties' });
      return;
    }

    db.run(
      `UPDATE rounds SET player${playerNumber}_penalties = player${playerNumber}_penalties + 1 
       WHERE match_id = ? AND round_number = ?`,
      [matchId, roundNumber],
      (err) => {
        if (err) {
          socket.emit('error', { message: 'Failed to add penalty' });
          return;
        }

        db.get(
          `SELECT player${playerNumber}_penalties as penalties FROM rounds WHERE match_id = ? AND round_number = ?`,
          [matchId, roundNumber],
          (err, row) => {
            if (row && row.penalties >= 5) {
              // Other player wins the round
              const winner = playerNumber === 1 ? 2 : 1;
              db.run(
                'UPDATE rounds SET winner = ? WHERE match_id = ? AND round_number = ?',
                [winner, matchId, roundNumber],
                () => {
                  io.emit('penalty-added', { matchId, roundNumber, playerNumber, totalPenalties: row.penalties });
                  io.emit('round-winner-decided', { matchId, roundNumber, winner });
                }
              );
            } else {
              io.emit('penalty-added', { matchId, roundNumber, playerNumber, totalPenalties: row.penalties });
            }
          }
        );
      }
    );
  });

  // Get match status
  socket.on('get-match-status', async (data) => {
    const { matchId } = data;

    try {
      const match = await getMatchById(matchId);
      const rounds = await getRoundsByMatchId(matchId);

      socket.emit('match-status', { match, rounds });
    } catch (err) {
      socket.emit('error', { message: 'Failed to get match status' });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    const device = matchState.devices.get(socket.id);
    if (device) {
      device.connected = false;
      console.log(`Device disconnected: ${device.deviceName}`);
      io.emit('devices-updated', Array.from(matchState.devices.values()));
    }
    matchState.devices.delete(socket.id);
  });
});

// REST endpoints
app.get('/api/matches/:id', async (req, res) => {
  try {
    const match = await getMatchById(req.params.id);
    const rounds = await getRoundsByMatchId(req.params.id);
    res.json({ match, rounds });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
