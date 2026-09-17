import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameState } from '../hooks/useGameState';
import { nextRound, endGame, triggerAttack } from '../api';
import NetworkMap from '../components/network/NetworkMap';
import IncidentTimeline from '../components/incidents/IncidentTimeline';
import DefensePanel from '../components/defense/DefensePanel';
import ScoreBoard from '../components/scoring/ScoreBoard';
import Navbar from '../components/layout/Navbar';
import RoleSelector from '../components/multiplayer/RoleSelector';

const Game = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { gameState, loading, newAlert, fetchGameState } = useGameState(sessionId || null);
  const [activeTab, setActiveTab] = useState<'network' | 'incidents' | 'defense' | 'scores'>('network');
  const [currentPlayer, setCurrentPlayer] = useState<any>(null);

  const handleNextRound = async () => {
    if (!sessionId) return;
    await nextRound(sessionId);
    fetchGameState();
  };

  const handleEndGame = async () => {
    if (!sessionId) return;
    await endGame(sessionId);
    navigate('/');
  };

  const handleTriggerAttack = async () => {
    if (!sessionId || !gameState) return;
    await triggerAttack(sessionId, gameState.session.current_round);
    fetchGameState();
  };

  if (loading && !gameState) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0e1a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2>Loading game...</h2>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0e1a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2>Game not found</h2>
      </div>
    );
  }

  // Show role selector if player hasn't joined yet
  if (!currentPlayer) {
    return <RoleSelector sessionId={sessionId || ''} onRoleSelected={setCurrentPlayer} />;
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ciso': return '#00ff88';
      case 'attacker': return '#ff4444';
      case 'regulator': return '#64ffda';
      case 'insurance': return '#ffaa00';
      case 'infrastructure': return '#aa88ff';
      default: return '#8892b0';
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', color: 'white' }}>
      <Navbar gameState={gameState} />

      {/* Alert Banner */}
      {newAlert && newAlert.type === 'attack' && (
        <div style={{
          background: '#ff4444', padding: '12px 40px',
          fontWeight: 'bold', textAlign: 'center'
        }}>
          🚨 ATTACK ALERT: {newAlert.attack_type?.toUpperCase()} on {newAlert.asset_name}!
        </div>
      )}

      {/* Game Controls */}
      <div style={{ padding: '15px 40px', display: 'flex', gap: '15px', alignItems: 'center', background: '#112240' }}>
        <span style={{ color: getRoleColor(currentPlayer.role), fontWeight: 'bold' }}>
          {currentPlayer.player_name} ({currentPlayer.role})
        </span>
        <span style={{ color: '#8892b0' }}>|</span>
        <span style={{ color: '#64ffda', fontWeight: 'bold' }}>
          Round {gameState.session.current_round}/{gameState.session.max_rounds}
        </span>
        <span style={{ color: '#8892b0' }}>|</span>
        <span style={{ color: '#ff4444' }}>
          Active Incidents: {gameState.active_incidents?.length || 0}
        </span>
        <span style={{ color: '#8892b0' }}>|</span>
        <span style={{ color: '#00ff88' }}>
          Budget: ${Number(gameState.session?.remaining_budget || 0).toLocaleString()}
        </span>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
          {currentPlayer.role === 'attacker' && (
            <button
              onClick={handleTriggerAttack}
              style={{
                padding: '8px 16px', background: '#ff4444',
                color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'
              }}
            >
              🎯 Launch Attack
            </button>
          )}
          {currentPlayer.role === 'ciso' && (
            <button
              onClick={handleNextRound}
              style={{
                padding: '8px 16px', background: '#64ffda',
                color: '#0a0e1a', border: 'none', borderRadius: '6px',
                fontWeight: 'bold', cursor: 'pointer'
              }}
            >
              ⏭ Next Round
            </button>
          )}
          <button
            onClick={handleEndGame}
            style={{
              padding: '8px 16px', background: '#233554',
              color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'
            }}
          >
            🏁 End Game
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '5px', padding: '0 40px', background: '#0d1b2a' }}>
        {(['network', 'incidents', 'defense', 'scores'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 24px', border: 'none', cursor: 'pointer',
              background: activeTab === tab ? '#112240' : 'transparent',
              color: activeTab === tab ? '#64ffda' : '#8892b0',
              borderBottom: activeTab === tab ? '2px solid #64ffda' : '2px solid transparent',
              textTransform: 'capitalize', fontSize: '0.95rem'
            }}
          >
            {tab === 'network' && '🗺️ '}
            {tab === 'incidents' && '🚨 '}
            {tab === 'defense' && '🛡️ '}
            {tab === 'scores' && '🏆 '}
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ padding: '30px 40px' }}>
        {activeTab === 'network' && <NetworkMap assets={gameState.assets || []} incidents={gameState.active_incidents || []} />}
        {activeTab === 'incidents' && <IncidentTimeline events={gameState.recent_events || []} incidents={gameState.active_incidents || []} sessionId={sessionId || ''} onRefresh={fetchGameState} />}
        {activeTab === 'defense' && <DefensePanel sessionId={sessionId || ''} onRefresh={fetchGameState} />}
        {activeTab === 'scores' && <ScoreBoard sessionId={sessionId || ''} />}
      </div>
    </div>
  );
};

export default Game;