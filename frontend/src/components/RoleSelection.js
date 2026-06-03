import React, { useState } from 'react';
import './RoleSelection.css';

function RoleSelection({ onRoleSelect }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [deviceName, setDeviceName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedRole && deviceName.trim()) {
      onRoleSelect(selectedRole, deviceName);
    }
  };

  return (
    <div className="role-selection-container">
      <div className="role-card">
        <h1>🥋 Taekwondo Scoring System</h1>
        <p className="subtitle">Select your role to continue</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Device Name</label>
            <input
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="e.g., Main Screen, Ref1, Ref2"
              required
            />
          </div>

          <div className="roles-grid">
            <div
              className={`role-option ${selectedRole === 'admin' ? 'selected' : ''}`}
              onClick={() => setSelectedRole('admin')}
            >
              <div className="role-icon">👨‍⚖️</div>
              <h3>Admin</h3>
              <p>Full Control</p>
              <ul>
                <li>Create matches</li>
                <li>Update scores & penalties</li>
                <li>Manage match flow</li>
                <li>Update player info</li>
              </ul>
            </div>

            <div
              className={`role-option ${selectedRole === 'official' ? 'selected' : ''}`}
              onClick={() => setSelectedRole('official')}
            >
              <div className="role-icon">👔</div>
              <h3>Official</h3>
              <p>Limited Control</p>
              <ul>
                <li>Vote on scores</li>
                <li>Add penalties</li>
                <li>View match status</li>
                <li>20m range required</li>
              </ul>
            </div>

            <div
              className={`role-option ${selectedRole === 'spectator' ? 'selected' : ''}`}
              onClick={() => setSelectedRole('spectator')}
            >
              <div className="role-icon">👀</div>
              <h3>Spectator</h3>
              <p>View Only</p>
              <ul>
                <li>View match status</li>
                <li>Watch scores</li>
                <li>View penalties</li>
                <li>Unlimited range</li>
              </ul>
            </div>
          </div>

          <button
            type="submit"
            disabled={!selectedRole || !deviceName.trim()}
            className="submit-btn"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}

export default RoleSelection;
