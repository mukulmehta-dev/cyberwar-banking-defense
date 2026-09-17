import { useState, useEffect } from 'react';
import { getScores } from '../../api';

interface ScoreBoardProps {
  sessionId: string;
}

const ScoreBoard = ({ sessionId }: ScoreBoardProps) => {
  const [scores, setScores] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getScores(sessionId)
      .then(res => setScores(res.data.data))
      .catch(err => {
        console.error('Failed to load scores:', err);
        setScores(null);
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) return <p style={{ color: '#8892b0' }}>Loading scores...</p>;
  if (!scores) return <p style={{ color: '#8892b0' }}>No scores yet.</p>;

  const { summary, scores: playerScores } = scores;

  return (
    <div>
      <h2 style={{ color: '#64ffda', marginBottom: '20px' }}>🏆 Scoreboard</h2>

      {/* Player Scores */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        {[
          { role: 'CISO', score: playerScores.ciso, color: '#00ff88', icon: '🛡️', desc: 'Defense score based on attacks blocked and losses minimized' },
          { role: 'Attacker', score: playerScores.attacker, color: '#ff4444', icon: '💀', desc: 'Attack score based on successful breaches and damage caused' },
        ].map(player => (
          <div key={player.role} style={{
            background: '#112240', borderRadius: '12px', padding: '25px',
            border: `1px solid ${player.color}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <span style={{ fontSize: '2rem' }}>{player.icon}</span>
              <h3 style={{ color: player.color, margin: 0 }}>{player.role}</h3>
            </div>

            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: player.color, marginBottom: '10px' }}>
              {player.score}
              <span style={{ fontSize: '1rem', color: '#8892b0' }}>/100</span>
            </div>

            {/* Score bar */}
            <div style={{ height: '8px', background: '#233554', borderRadius: '4px', marginBottom: '15px' }}>
              <div style={{
                height: '100%', width: `${player.score}%`,
                background: player.color, borderRadius: '4px',
                transition: 'width 1s ease'
              }} />
            </div>

            <p style={{ color: '#8892b0', fontSize: '0.85rem', margin: 0 }}>{player.desc}</p>
          </div>
        ))}
      </div>

      {/* Game Summary */}
      <div style={{ background: '#112240', borderRadius: '12px', padding: '25px' }}>
        <h3 style={{ color: '#64ffda', marginBottom: '20px' }}>📊 Game Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {[
            { label: 'Total Attacks', value: summary.total_attacks, color: '#ff8800' },
            { label: 'Successful Attacks', value: summary.successful_attacks, color: '#ff4444' },
            { label: 'Blocked Attacks', value: summary.blocked_attacks, color: '#00ff88' },
            { label: 'Block Rate', value: summary.block_rate, color: '#64ffda' },
            { label: 'Total Losses', value: summary.total_losses, color: '#ff4444' },
            { label: 'Security Spent', value: summary.total_security_spent, color: '#00ff88' },
          ].map(item => (
            <div key={item.label} style={{
              background: '#0a0e1a', borderRadius: '8px', padding: '15px', textAlign: 'center'
            }}>
              <div style={{ color: '#8892b0', fontSize: '0.8rem', marginBottom: '8px' }}>
                {item.label}
              </div>
              <div style={{ color: item.color, fontSize: '1.4rem', fontWeight: 'bold' }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScoreBoard;