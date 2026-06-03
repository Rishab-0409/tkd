import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';
import AdminPanel from './components/AdminPanel';
import OfficialPanel from './components/OfficialPanel';
import SpectatorPanel from './components/SpectatorPanel';
import RoleSelection from './components/RoleSelection';

const socket = io('http://localhost:5000', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});

function App() {
  const [role, setRole] = useState(null);
  const [deviceName, setDeviceName] = useState('');
  const [matchId, setMatchId] = useState(null);
  const [match, setMatch] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [roundTimer, setRoundTimer] = useState(120);
  const [isRoundActive, setIsRoundActive] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [locationPermission, setLocationPermission] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket.on('connect', () => {
      setConnected(true);
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      setConnected(false);
      console.log('Disconnected from server');
    });

    socket.on('match-created', (data) => {
      setMatchId(data.matchId);
    });

    socket.on('match-status', (data) => {
      setMatch(data.match);
      setRounds(data.rounds);
    });

    socket.on('devices-updated', (devices) => {
      setConnectedDevices(devices);
    });

    socket.on('round-started', (data) => {
      setIsRoundActive(true);
      setCurrentRound(data.roundNumber);
    });

    socket.on('round-ended', (data) => {
      setIsRoundActive(false);
    });

    socket.on('score-updated', (data) => {
      // Fetch updated match status
      if (matchId) {
        socket.emit('get-match-status', { matchId });
      }
    });

    socket.on('player-info-updated', (data) => {
      if (matchId) {
        socket.emit('get-match-status', { matchId });
      }
    });

    socket.on('out-of-range', () => {
      alert('Device is out of 20-meter range. You have been disconnected.');
      setRole(null);
    });

    socket.on('error', (data) => {
      alert('Error: ' + data.message);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('match-created');
      socket.off('match-status');
      socket.off('devices-updated');
      socket.off('round-started');
      socket.off('round-ended');
      socket.off('score-updated');
      socket.off('player-info-updated');
      socket.off('out-of-range');
      socket.off('error');
    };
  }, [matchId]);

  useEffect(() => {
    if (role && deviceName) {
      const deviceId = `device-${Date.now()}`;
      socket.emit('register-device', {
        deviceId,
        role,
        deviceName,
        matchId: matchId || null
      });

      // Request location permission (optional for development)
      if (role !== 'spectator' && navigator.geolocation) {
        // Comment out for development, uncomment for production with geolocation
        /*
        navigator.geolocation.watchPosition(
          (position) => {
            socket.emit('update-location', {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
            setLocationPermission(true);
          },
          (error) => {
            console.warn('Location access denied:', error);
            setLocationPermission(false);
          }
        );
        */
        // For development, assume location is allowed
        setLocationPermission(true);
      }
    }
  }, [role, deviceName]);

  const handleRoleSelect = (selectedRole, name) => {
    setRole(selectedRole);
    setDeviceName(name);
  };

  const handleReset = () => {
    setRole(null);
    setDeviceName('');
    setMatchId(null);
    setMatch(null);
    setRounds([]);
    setCurrentRound(1);
  };

  if (!connected) {
    return (
      <div className="app">
        <div className="connection-status error">
          ❌ Not connected to server. Make sure backend is running on port 5000.
        </div>
      </div>
    );
  }

  if (!role) {
    return <RoleSelection onRoleSelect={handleRoleSelect} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>🥋 Taekwondo Scoring System</h1>
          <p>Role: <strong>{role.toUpperCase()}</strong> | Device: <strong>{deviceName}</strong></p>
        </div>
        <div className="header-right">
          <div className={`connection-badge ${connected ? 'connected' : 'disconnected'}`}>
            {connected ? '🟢 Connected' : '🔴 Disconnected'}
          </div>
          {role !== 'spectator' && !locationPermission && (
            <div className="location-badge warning">
              📍 Enable Location
            </div>
          )}
          <button onClick={handleReset} className="reset-btn">Logout</button>
        </div>
      </header>

      <main className="app-main">
        {role === 'admin' && (
          <AdminPanel
            socket={socket}
            match={match}
            rounds={rounds}
            matchId={matchId}
            setMatchId={setMatchId}
            connectedDevices={connectedDevices}
          />
        )}
        {role === 'official' && (
          <OfficialPanel
            socket={socket}
            match={match}
            rounds={rounds}
            matchId={matchId}
            isRoundActive={isRoundActive}
            currentRound={currentRound}
          />
        )}
        {role === 'spectator' && (
          <SpectatorPanel
            socket={socket}
            match={match}
            rounds={rounds}
            matchId={matchId}
            isRoundActive={isRoundActive}
            currentRound={currentRound}
          />
        )}
      </main>
    </div>
  );
}

export default App;