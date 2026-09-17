import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', color: 'white', padding: '40px' }}>
      <h1 style={{ color: '#00ff88' }}>📊 Dashboard</h1>
      <button
        onClick={() => navigate('/')}
        style={{
          padding: '10px 20px', background: '#64ffda',
          color: '#0a0e1a', border: 'none', borderRadius: '6px',
          cursor: 'pointer', fontWeight: 'bold'
        }}
      >
        ← Back to Lobby
      </button>
    </div>
  );
};

export default Dashboard;