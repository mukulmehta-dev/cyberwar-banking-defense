import { useState, useEffect } from 'react';
import { joinGame, getPlayers } from '../../api';

interface RoleSelectorProps {
  sessionId: string;
  onRoleSelected: (player: any) => void;
}

const ROLES = [
  {
    id: 'ciso',
    name: 'Bank CISO',
    icon: '🛡️',
    description: 'Chief Information Security Officer. Allocate security budget and defend bank infrastructure.',
    color: '#00ff88'
  },
  {
    id: 'attacker',
    name: 'Red Team Hacker',
    icon: '💀',
    description: 'Launch sophisticated cyber attacks against the bank. Maximize damage and ransom payments.',
    color: '#ff4444'
  },
  {
    id: 'regulator',
    name: 'Regulator',
    icon: '⚖️',
    description: 'Enforce compliance standards and maintain financial system stability.',
    color: '#64ffda'
  },
  {
    id: 'insurance',
    name: 'Insurance Provider',
    icon: '📋',
    description: 'Manage cyber insurance policies and handle claims from incidents.',
    color: '#ffaa00'
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure Officer',
    icon: '🏦',
    description: 'Protect national payment systems and critical banking infrastructure.',
    color: '#aa88ff'
  }
];

const RoleSelector = ({ sessionId, onRoleSelected }: RoleSelectorProps) => {
  const [playerName, setPlayerName] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [takenRoles, setTakenRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    getPlayers(sessionId)
      .then(res => {
        if (res.data && Array.isArray(res.data.data)) {
          setPlayers(res.data.data);
          setTakenRoles(res.data.data.map((p: any) => p.role));
        }
      })
      .catch(err => {
        console.error('Failed to load players:', err);
      });
  }, [sessionId]);

  const handleJoin = async () => {
    if (!playerName || !selectedRole) {
      alert('Please enter your name and select a role');
      return;
    }
    setLoading(true);
    try {
      const res = await joinGame({ session_id: sessionId, player_name: playerName, role: selectedRole });
      onRoleSelected(res.data.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to join game');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', color: 'white', padding: '40px' }}>
      <h1 style={{ color: '#00ff88', marginBottom: '10px' }}>🎮 Join Game</h1>
      <p style={{ color: '#8892b0', marginBottom: '30px' }}>
        Select your role to join the cybersecurity simulation
      </p>

      {/* Current Players */}
      {players.length > 0 && (
        <div style={{ background: '#112240', borderRadius: '10px', padding: '15px', marginBottom: '25px' }}>
          <h3 style={{ color: '#64ffda', marginBottom: '10px' }}>👥 Players in Session ({players.length}/5)</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {players.map(p => {
              const role = ROLES.find(r => r.id === p.role);
              return (
                <div key={p.id} style={{
                  background: '#0a0e1a', padding: '8px 15px',
                  borderRadius: '6px', border: `1px solid ${role?.color || '#233554'}`
                }}>
                  <span style={{ marginRight: '8px' }}>{role?.icon}</span>
                  <span style={{ color: role?.color }}>{p.player_name}</span>
                  <span style={{ color: '#8892b0', fontSize: '0.8rem', marginLeft: '8px' }}>({p.role})</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Player Name */}
      <div style={{ marginBottom: '25px' }}>
        <label style={{ color: '#8892b0', display: 'block', marginBottom: '8px' }}>Your Name</label>
        <input
          value={playerName}
          onChange={e => setPlayerName(e.target.value)}
          placeholder="Enter your name..."
          style={{
            padding: '12px', background: '#112240', border: '1px solid #233554',
            borderRadius: '8px', color: 'white', width: '300px', fontSize: '1rem'
          }}
        />
      </div>

      {/* Role Selection */}
      <h3 style={{ color: '#64ffda', marginBottom: '15px' }}>Select Your Role</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '30px' }}>
        {ROLES.map(role => {
          const isTaken = takenRoles.includes(role.id);
          const isSelected = selectedRole === role.id;

          return (
            <div
              key={role.id}
              onClick={() => !isTaken && setSelectedRole(role.id)}
              style={{
                background: isSelected ? '#1a2a4a' : '#112240',
                border: `2px solid ${isSelected ? role.color : isTaken ? '#333' : '#233554'}`,
                borderRadius: '12px', padding: '20px',
                cursor: isTaken ? 'not-allowed' : 'pointer',
                opacity: isTaken ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{role.icon}</div>
              <h4 style={{ color: isSelected ? role.color : 'white', marginBottom: '8px' }}>
                {role.name}
                {isTaken && <span style={{ color: '#ff4444', fontSize: '0.8rem', marginLeft: '8px' }}>(Taken)</span>}
              </h4>
              <p style={{ color: '#8892b0', fontSize: '0.85rem', margin: 0 }}>{role.description}</p>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleJoin}
        disabled={loading || !playerName || !selectedRole}
        style={{
          padding: '14px 40px', background: selectedRole ? '#00ff88' : '#233554',
          color: '#0a0e1a', border: 'none', borderRadius: '8px',
          fontSize: '1rem', fontWeight: 'bold',
          cursor: loading || !playerName || !selectedRole ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Joining...' : '🚀 Join Game'}
      </button>
    </div>
  );
};

export default RoleSelector;