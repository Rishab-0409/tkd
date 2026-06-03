import React, { useState } from 'react';
import './OfficialPanel.css';

function OfficialPanel({ socket, match, rounds, matchId, isRoundActive, currentRound }) {
  const [selectedScore, setSelectedScore] = useState(null);

  const handleVoteScore = (playerNumber, scoreChange) => {
    socket.emit('vote-score', {
      matchId,
      roundNumber: currentRound,
      playerNumber,
      scoreChange
    });
    setSelectedScore(null);
  };

  const handleAddPenalty = (playerNumber) => {
    socket.emit('add-penalty', {
      matchId,
      roundNumber: currentRound,
      playerNumber
    });
  };

  return (
    <div className="official-panel">
      {!matchId ? (
        <div className="no-match-message">
          <p>⏳ Waiting for admin to create a match...</p>
        </div>
      ) : (
        <>
          {/* Match Overview */}
          {match && (
            <div className="match-overview">
              <div className="player-card">
                <h3>{match.player1_name}</h3>
                <p className="weight">{match.player1_weight}</p>
                {rounds && rounds[currentRound - 1] && (
                  <>
                    <p className="score">{rounds[currentRound - 1].player1_score}</p>
                    <p className="penalty">Penalties: {rounds[currentRound - 1].player1_penalties}/5</p>
                  </>
                )}
              </div>

              <div className="vs-info">
                <p>Round {currentRound}/3</p>
              </div>

              <div className="player-card">
                <h3>{match.player2_name}</h3>
                <p className="weight">{match.player2_weight}</p>
                {rounds && rounds[currentRound - 1] && (
                  <>
                    <p className="score">{rounds[currentRound - 1].player2_score}</p>
                    <p className="penalty">Penalties: {rounds[currentRound - 1].player2_penalties}/5</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Voting Section */}
          {isRoundActive && (
            <div className="voting-section">
              <h3>Vote for Score Increase</h3>
              <p className="voting-note">Note: Requires 2+ official approvals to apply</p>

              <div className="voting-buttons-grid">
                <div className="player-voting">
                  <h4>{match.player1_name}</h4>
                  <div className="vote-buttons">
                    <button
                      onClick={() => handleVoteScore(1, 3)}
                      className="vote-btn vote-3"
                    >
                      +3
                    </button>
                    <button
                      onClick={() => handleVoteScore(1, 2)}
                      className="vote-btn vote-2"
                    >
                      +2
                    </button>
                    <button
                      onClick={() => handleVoteScore(1, 1)}
                      className="vote-btn vote-1"
                    >
                      +1
                    </button>
                  </div>
                </div>

                <div className="player-voting">
                  <h4>{match.player2_name}</h4>
                  <div className="vote-buttons">
                    <button
                      onClick={() => handleVoteScore(2, 3)}
                      className="vote-btn vote-3"
                    >
                      +3
                    </button>
                    <button
                      onClick={() => handleVoteScore(2, 2)}
                      className="vote-btn vote-2"
                    >
                      +2
                    </button>
                    <button
                      onClick={() => handleVoteScore(2, 1)}
                      className="vote-btn vote-1"
                    >
                      +1
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Penalty Section */}
          {isRoundActive && (
            <div className="penalty-voting-section">
              <h3>Add Penalty</h3>

              <div className="penalty-buttons">
                <button
                  onClick={() => handleAddPenalty(1)}
                  disabled={rounds && rounds[currentRound - 1] && rounds[currentRound - 1].player1_penalties >= 5}
                  className="penalty-btn"
                >
                  {match.player1_name} - Penalty
                </button>

                <button
                  onClick={() => handleAddPenalty(2)}
                  disabled={rounds && rounds[currentRound - 1] && rounds[currentRound - 1].player2_penalties >= 5}
                  className="penalty-btn"
                >
                  {match.player2_name} - Penalty
                </button>
              </div>
            </div>
          )}

          {/* Round Status */}
          <div className="status-card">
            <h4>{isRoundActive ? '🟢 Round Active' : '⏸️ Round Not Active'}</h4>
            <p>Waiting for admin to control match flow</p>
          </div>
        </>
      )}
    </div>
  );
}

export default OfficialPanel;
