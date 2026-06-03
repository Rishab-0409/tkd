import React, { useState, useEffect } from 'react';
import './AdminPanel.css';

function AdminPanel({ socket, match, rounds, matchId, setMatchId, connectedDevices }) {
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [player1Weight, setPlayer1Weight] = useState('');
  const [player2Weight, setPlayer2Weight] = useState('');
  const [currentRound, setCurrentRound] = useState(1);
  const [roundTimer, setRoundTimer] = useState(120);
  const [isRoundActive, setIsRoundActive] = useState(false);
  const [timerInterval, setTimerInterval] = useState(null);

  useEffect(() => {
    socket.on('round-started', () => {
      setIsRoundActive(true);
      startTimer();
    });

    socket.on('round-ended', () => {
      setIsRoundActive(false);
      if (timerInterval) clearInterval(timerInterval);
    });

    return () => {
      socket.off('round-started');
      socket.off('round-ended');
    };
  }, [socket, timerInterval]);

  const startTimer = () => {
    let time = 120;
    const interval = setInterval(() => {
      time--;
      setRoundTimer(time);
      if (time <= 0) {
        clearInterval(interval);
        setIsRoundActive(false);
      }
    }, 1000);
    setTimerInterval(interval);
  };

  const handleCreateMatch = (e) => {
    e.preventDefault();
    if (player1Name && player2Name && player1Weight && player2Weight) {
      socket.emit('create-match', {
        player1Name,
        player1Weight,
        player2Name,
        player2Weight
      });
      // Reset form
      setPlayer1Name('');
      setPlayer2Name('');
      setPlayer1Weight('');
      setPlayer2Weight('');
    }
  };

  const handleStartRound = () => {
    socket.emit('start-round', { matchId, roundNumber: currentRound });
  };

  const handleEndRound = () => {
    if (timerInterval) clearInterval(timerInterval);
    socket.emit('end-round', { matchId, roundNumber: currentRound });
    setRoundTimer(120);
  };

  const handleAddScore = (playerNumber, scoreChange) => {
    socket.emit('vote-score', {
      matchId,
      roundNumber: currentRound,
      playerNumber,
      scoreChange
    });
  };

  const handleAddPenalty = (playerNumber) => {
    socket.emit('add-penalty', {
      matchId,
      roundNumber: currentRound,
      playerNumber
    });
  };

  const handleUpdatePlayerInfo = (playerNumber, name, weight) => {
    socket.emit('update-player-info', {
      matchId,
      playerNumber,
      name,
      weight
    });
  };

  const getWinnerStats = () => {
    if (!rounds || rounds.length < 3) return null;

    let player1Wins = 0;
    let player2Wins = 0;

    rounds.forEach(round => {
      if (round.winner === 1) player1Wins++;
      if (round.winner === 2) player2Wins++;
    });

    if (player1Wins >= 2) return { winner: 1, stats: { player1Wins, player2Wins } };
    if (player2Wins >= 2) return { winner: 2, stats: { player1Wins, player2Wins } };
    return null;
  };

  const winnerStats = getWinnerStats();

  return (
    <div className="admin-panel">
      {!matchId ? (
        <div className="create-match-section">
          <h2>Create New Match</h2>
          <form onSubmit={handleCreateMatch}>
            <div className="form-row">
              <div className="form-group">
                <label>Player 1 Name</label>
                <input
                  type="text"
                  value={player1Name}
                  onChange={(e) => setPlayer1Name(e.target.value)}
                  placeholder="Enter player 1 name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Player 1 Weight</label>
                <input
                  type="text"
                  value={player1Weight}
                  onChange={(e) => setPlayer1Weight(e.target.value)}
                  placeholder="e.g., 65 kg"
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Player 2 Name</label>
                <input
                  type="text"
                  value={player2Name}
                  onChange={(e) => setPlayer2Name(e.target.value)}
                  placeholder="Enter player 2 name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Player 2 Weight</label>
                <input
                  type="text"
                  value={player2Weight}
                  onChange={(e) => setPlayer2Weight(e.target.value)}
                  placeholder="e.g., 68 kg"
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-large">
              Create Match
            </button>
          </form>
        </div>
      ) : (
        <div className="match-control-section">
          <div className="match-header">
            <h2>Match Control</h2>
            <div className="device-status">
              <p>Connected Devices: <strong>{connectedDevices.filter(d => d.connected).length}/{connectedDevices.length}</strong></p>
            </div>
          </div>

          {match && (
            <>
              {/* Match Info */}
              <div className="match-info-card">
                <div className="player-info">
                  <h3>{match.player1_name}</h3>
                  <p className="weight">{match.player1_weight}</p>
                  <input
                    type="text"
                    placeholder="Update name"
                    onBlur={(e) => {
                      if (e.target.value) {
                        handleUpdatePlayerInfo(1, e.target.value, match.player1_weight);
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
                <div className="vs">VS</div>
                <div className="player-info">
                  <h3>{match.player2_name}</h3>
                  <p className="weight">{match.player2_weight}</p>
                  <input
                    type="text"
                    placeholder="Update name"
                    onBlur={(e) => {
                      if (e.target.value) {
                        handleUpdatePlayerInfo(2, e.target.value, match.player2_weight);
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
              </div>

              {/* Round Control */}
              <div className="round-control-card">
                <h3>Round {currentRound} / 3</h3>
                <div className="timer-display">
                  <span className="timer">{Math.floor(roundTimer / 60)}:{(roundTimer % 60).toString().padStart(2, '0')}</span>
                </div>
                <div className="control-buttons">
                  <button
                    onClick={handleStartRound}
                    disabled={isRoundActive}
                    className="btn btn-success"
                  >
                    Start Round
                  </button>
                  <button
                    onClick={handleEndRound}
                    disabled={!isRoundActive}
                    className="btn btn-danger"
                  >
                    End Round
                  </button>
                </div>
              </div>

              {/* Scoring Panel */}
              {rounds && rounds[currentRound - 1] && (
                <div className="scoring-panel">
                  <h3>Round {currentRound} Scoring</h3>
                  <div className="score-row">
                    <div className="player-score">
                      <h4>{match.player1_name}</h4>
                      <p className="score">{rounds[currentRound - 1].player1_score}</p>
                      <div className="score-buttons">
                        <button onClick={() => handleAddScore(1, 3)} className="btn-score btn-plus">+3</button>
                        <button onClick={() => handleAddScore(1, 2)} className="btn-score btn-plus">+2</button>
                        <button onClick={() => handleAddScore(1, 1)} className="btn-score btn-plus">+1</button>
                        <button onClick={() => handleAddScore(1, -1)} className="btn-score btn-minus">-1</button>
                        <button onClick={() => handleAddScore(1, -2)} className="btn-score btn-minus">-2</button>
                        <button onClick={() => handleAddScore(1, -3)} className="btn-score btn-minus">-3</button>
                      </div>
                    </div>

                    <div className="player-score">
                      <h4>{match.player2_name}</h4>
                      <p className="score">{rounds[currentRound - 1].player2_score}</p>
                      <div className="score-buttons">
                        <button onClick={() => handleAddScore(2, 3)} className="btn-score btn-plus">+3</button>
                        <button onClick={() => handleAddScore(2, 2)} className="btn-score btn-plus">+2</button>
                        <button onClick={() => handleAddScore(2, 1)} className="btn-score btn-plus">+1</button>
                        <button onClick={() => handleAddScore(2, -1)} className="btn-score btn-minus">-1</button>
                        <button onClick={() => handleAddScore(2, -2)} className="btn-score btn-minus">-2</button>
                        <button onClick={() => handleAddScore(2, -3)} className="btn-score btn-minus">-3</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Penalty Panel */}
              {rounds && rounds[currentRound - 1] && (
                <div className="penalty-panel">
                  <h3>Round {currentRound} Penalties</h3>
                  <div className="penalty-row">
                    <div className="penalty-section">
                      <h4>{match.player1_name}</h4>
                      <p className="penalty-count">{rounds[currentRound - 1].player1_penalties}/5</p>
                      <button
                        onClick={() => handleAddPenalty(1)}
                        disabled={rounds[currentRound - 1].player1_penalties >= 5}
                        className="btn btn-warning"
                      >
                        Add Penalty
                      </button>
                    </div>

                    <div className="penalty-section">
                      <h4>{match.player2_name}</h4>
                      <p className="penalty-count">{rounds[currentRound - 1].player2_penalties}/5</p>
                      <button
                        onClick={() => handleAddPenalty(2)}
                        disabled={rounds[currentRound - 1].player2_penalties >= 5}
                        className="btn btn-warning"
                      >
                        Add Penalty
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Round Selector */}
              <div className="round-selector">
                {[1, 2, 3].map(round => (
                  <button
                    key={round}
                    onClick={() => setCurrentRound(round)}
                    className={`round-btn ${currentRound === round ? 'active' : ''}`}
                  >
                    Round {round}
                  </button>
                ))}
              </div>

              {/* Winner Display */}
              {winnerStats && (
                <div className="winner-display">
                  <h3>🏆 Match Winner 🏆</h3>
                  <p className="winner-name">
                    {winnerStats.winner === 1 ? match.player1_name : match.player2_name}
                  </p>
                  <p className="winner-stats">
                    {winnerStats.stats.player1Wins} : {winnerStats.stats.player2Wins}
                  </p>
                  <button onClick={() => {
                    setMatchId(null);
                    setCurrentRound(1);
                  }} className="btn btn-primary">
                    Start New Match
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
