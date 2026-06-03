import React, { useState, useEffect } from 'react';
import './SpectatorPanel.css';

function SpectatorPanel({ socket, match, rounds, matchId, isRoundActive, currentRound }) {
  const [allRounds, setAllRounds] = useState([]);

  useEffect(() => {
    setAllRounds(rounds);
  }, [rounds]);

  const calculateWinner = () => {
    if (!allRounds || allRounds.length < 3) return null;

    let player1Wins = 0;
    let player2Wins = 0;

    allRounds.forEach(round => {
      if (round.winner === 1) player1Wins++;
      if (round.winner === 2) player2Wins++;
    });

    if (player1Wins >= 2) {
      return { winnerId: 1, score: `${player1Wins}-${player2Wins}` };
    } else if (player2Wins >= 2) {
      return { winnerId: 2, score: `${player1Wins}-${player2Wins}` };
    }
    return null;
  };

  const winner = calculateWinner();

  return (
    <div className="spectator-panel">
      {!matchId ? (
        <div className="no-match-spectator">
          <p>⏳ No active match. Waiting for admin to start...</p>
        </div>
      ) : (
        <>
          {/* Large Match Display */}
          {match && allRounds && allRounds[currentRound - 1] && (
            <>
              <div className="live-scoreboard">
                <div className="scoreboard-header">
                  <h2>Live Score</h2>
                  <p className={`round-indicator ${isRoundActive ? 'active' : 'inactive'}`}>
                    {isRoundActive ? '🔴 LIVE' : '⏸️ BREAK'}
                  </p>
                </div>

                <div className="scoreboard-main">
                  <div className="player-display">
                    <div className="player-name">{match.player1_name}</div>
                    <div className="player-weight">{match.player1_weight}</div>
                    <div className="player-score-large">{allRounds[currentRound - 1].player1_score}</div>
                    <div className="player-penalties">
                      <span className="penalty-label">Penalties:</span>
                      <div className="penalty-display">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`penalty-dot ${i < allRounds[currentRound - 1].player1_penalties ? 'active' : ''}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="round-display">
                    <div className="round-number">Round {currentRound}/3</div>
                  </div>

                  <div className="player-display">
                    <div className="player-name">{match.player2_name}</div>
                    <div className="player-weight">{match.player2_weight}</div>
                    <div className="player-score-large">{allRounds[currentRound - 1].player2_score}</div>
                    <div className="player-penalties">
                      <span className="penalty-label">Penalties:</span>
                      <div className="penalty-display">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`penalty-dot ${i < allRounds[currentRound - 1].player2_penalties ? 'active' : ''}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Round Summary */}
              <div className="round-summary">
                <h3>Round Summary</h3>
                <div className="rounds-grid">
                  {allRounds.map((round, idx) => (
                    <div
                      key={idx}
                      className={`round-card ${idx + 1 === currentRound ? 'current' : ''}`}
                    >
                      <div className="round-title">Round {idx + 1}</div>
                      <div className="round-scores">
                        <div className="round-score-item">
                          <span className="score-label">{match.player1_name}</span>
                          <span className="score-value">{round.player1_score}</span>
                        </div>
                        <div className="vs-label">VS</div>
                        <div className="round-score-item">
                          <span className="score-label">{match.player2_name}</span>
                          <span className="score-value">{round.player2_score}</span>
                        </div>
                      </div>
                      <div className="round-penalties">
                        <span>P1: {round.player1_penalties}/5</span>
                        <span>P2: {round.player2_penalties}/5</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Statistics */}
              <div className="statistics-section">
                <h3>Match Statistics</h3>
                <div className="stats-grid">
                  <div className="stat-card">
                    <h4>{match.player1_name}</h4>
                    <div className="stat-item">
                      <span>Total Score</span>
                      <span className="stat-value">{allRounds.reduce((sum, r) => sum + r.player1_score, 0)}</span>
                    </div>
                    <div className="stat-item">
                      <span>Total Penalties</span>
                      <span className="stat-value">{allRounds.reduce((sum, r) => sum + r.player1_penalties, 0)}</span>
                    </div>
                    <div className="stat-item">
                      <span>Rounds Won</span>
                      <span className="stat-value">{allRounds.filter(r => r.winner === 1).length}</span>
                    </div>
                  </div>

                  <div className="stat-card">
                    <h4>{match.player2_name}</h4>
                    <div className="stat-item">
                      <span>Total Score</span>
                      <span className="stat-value">{allRounds.reduce((sum, r) => sum + r.player2_score, 0)}</span>
                    </div>
                    <div className="stat-item">
                      <span>Total Penalties</span>
                      <span className="stat-value">{allRounds.reduce((sum, r) => sum + r.player2_penalties, 0)}</span>
                    </div>
                    <div className="stat-item">
                      <span>Rounds Won</span>
                      <span className="stat-value">{allRounds.filter(r => r.winner === 2).length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Winner Announcement */}
              {winner && (
                <div className="winner-announcement">
                  <div className="winner-content">
                    <h2>🏆 MATCH WINNER 🏆</h2>
                    <p className="winner-name">
                      {winner.winnerId === 1 ? match.player1_name : match.player2_name}
                    </p>
                    <p className="winner-score">
                      Match Score: {winner.score}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default SpectatorPanel;
