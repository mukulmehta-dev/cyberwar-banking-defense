import { useNavigate } from 'react-router-dom';
import { GameState } from '../../types';

interface NavbarProps {
  gameState: GameState;
}

const Navbar = ({ gameState }: NavbarProps) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#00ff88';
      case 'completed': return '#64ffda';
      default: return '#8892b0';
    }
  };

  return (
    <nav style={{
      background: '#112240', padding: '15px 40px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderBottom: '1px solid #233554'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <span style={{ fontSize: '1.5rem' }}>🛡️</span>
        <span style={{ color: '#00ff88', fontWeight: 'bold', fontSize: '1.1rem' }}>
          Cyberwar Banking Defense
        </span>
      </div>

      <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#8892b0', fontSize: '0.75rem' }}>SESSION</div>
          <div style={{ color: 'white', fontWeight: 'bold' }}>
            {gameState.session?.session_name || 'Session'}
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#8892b0', fontSize: '0.75rem' }}>STATUS</div>
          <div style={{ color: gameState.session?.status ? getStatusColor(gameState.session.status) : '#8892b0', fontWeight: 'bold' }}>
            {(gameState.session?.status || 'active').toUpperCase()}
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#8892b0', fontSize: '0.75rem' }}>TOTAL LOSSES</div>
          <div style={{ color: '#ff4444', fontWeight: 'bold' }}>
            ${Number(gameState.session?.total_losses || 0).toLocaleString()}
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          style={{
            padding: '8px 16px', background: 'transparent',
            color: '#8892b0', border: '1px solid #233554',
            borderRadius: '6px', cursor: 'pointer'
          }}
        >
          ← Lobby
        </button>
      </div>
    </nav>
  );
};

export default Navbar;