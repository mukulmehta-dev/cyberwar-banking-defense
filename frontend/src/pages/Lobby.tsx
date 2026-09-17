import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { startGame, getSessions } from '../api';
import { GameSession } from '../types';

const Lobby = () => {
  const navigate = useNavigate();
  const [sessionName, setSessionName] = useState('');
  const [budget, setBudget] = useState(100000000);
  const [rounds, setRounds] = useState(5);
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    getSessions()
      .then(res => {
        if (res.data && Array.isArray(res.data.data)) {
          setSessions(res.data.data);
        }
      })
      .catch(err => {
        console.error('Failed to load sessions:', err);
        setErrorMessage('Unable to connect to database. Please ensure the backend and PostgreSQL database are running.');
      });
  }, []);

  const handleStart = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await startGame({
        session_name: sessionName || 'Cyberwar Session',
        total_budget: budget,
        max_rounds: rounds
      });
      if (res.data?.data?.id) {
        navigate(`/game/${res.data.data.id}`);
      } else {
        alert('Failed to start game: unexpected response');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to start game';
      setErrorMessage(`Error starting game: ${msg}`);
      alert(`Failed to start game: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', color: 'white', padding: '40px' }}>
      <h1 style={{ color: '#00ff88', fontSize: '2.5rem', marginBottom: '10px' }}>
        🛡️ Cyberwar Banking Defense
      </h1>
      <p style={{ color: '#8892b0', marginBottom: errorMessage ? '15px' : '40px' }}>
        Real-time cybersecurity strategy simulation for financial institutions
      </p>

      {errorMessage && (
        <div style={{
          background: '#ff444422', border: '1px solid #ff4444', borderRadius: '8px',
          padding: '12px 20px', marginBottom: '25px', color: '#ff6b6b'
        }}>
          ⚠️ <strong>Backend / Database Notice:</strong> {errorMessage}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        <div style={{ background: '#112240', borderRadius: '12px', padding: '30px' }}>
          <h2 style={{ color: '#64ffda', marginBottom: '20px' }}>🎮 New Game</h2>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ color: '#8892b0', display: 'block', marginBottom: '5px' }}>Session Name</label>
            <input
              value={sessionName}
              onChange={e => setSessionName(e.target.value)}
              placeholder="Enter session name..."
              style={{
                width: '100%', padding: '10px', background: '#0a0e1a',
                border: '1px solid #233554', borderRadius: '6px', color: 'white'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ color: '#8892b0', display: 'block', marginBottom: '5px' }}>
              Security Budget: ${budget.toLocaleString()}
            </label>
            <input
              type="range" min="50000000" max="500000000" step="10000000"
              value={budget}
              onChange={e => setBudget(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ color: '#8892b0', display: 'block', marginBottom: '5px' }}>
              Rounds: {rounds}
            </label>
            <input
              type="range" min="3" max="8" step="1"
              value={rounds}
              onChange={e => setRounds(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <button
            onClick={handleStart}
            disabled={loading}
            style={{
              width: '100%', padding: '14px', background: '#00ff88',
              color: '#0a0e1a', border: 'none', borderRadius: '8px',
              fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer'
            }}
          >
            {loading ? 'Starting...' : '🚀 Start Game'}
          </button>
        </div>

        <div style={{ background: '#112240', borderRadius: '12px', padding: '30px' }}>
          <h2 style={{ color: '#64ffda', marginBottom: '20px' }}>📋 Previous Sessions</h2>
          {sessions.length === 0 ? (
            <p style={{ color: '#8892b0' }}>No previous sessions found.</p>
          ) : (
            sessions.map(s => (
              <div
                key={s.id}
                onClick={() => navigate(`/game/${s.id}`)}
                style={{
                  padding: '15px', background: '#0a0e1a', borderRadius: '8px',
                  marginBottom: '10px', cursor: 'pointer', border: '1px solid #233554'
                }}
              >
                <div style={{ fontWeight: 'bold' }}>{s.session_name}</div>
                <div style={{ color: '#8892b0', fontSize: '0.85rem' }}>
                  Round {s.current_round}/{s.max_rounds} • {s.status} •
                  Budget: ${Number(s.total_budget).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Lobby;