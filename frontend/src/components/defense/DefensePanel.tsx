import { useState, useEffect } from 'react';
import { getHardeningOptions, applySecurityMeasure, getBudget } from '../../api';

interface DefensePanelProps {
  sessionId: string;
  onRefresh: () => void;
}

const DefensePanel = ({ sessionId, onRefresh }: DefensePanelProps) => {
  const [hardeningOptions, setHardeningOptions] = useState<any[]>([]);
  const [budget, setBudget] = useState<any>(null);
  const [applying, setApplying] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState('perimeter');

  const layers = ['perimeter', 'network', 'endpoint', 'data', 'operations', 'people'];

  useEffect(() => {
    getHardeningOptions()
      .then(res => {
        if (res.data && Array.isArray(res.data.data)) {
          setHardeningOptions(res.data.data);
        }
      })
      .catch(err => console.error('Failed to load hardening options:', err));

    getBudget(sessionId)
      .then(res => {
        if (res.data?.data) {
          setBudget(res.data.data);
        }
      })
      .catch(err => console.error('Failed to load budget:', err));
  }, [sessionId]);

  const handleApply = async (option: any) => {
    setApplying(option.id);
    try {
      await applySecurityMeasure({
        session_id: sessionId,
        round_id: 1,
        asset_id: null,
        measure_type: option.name,
        effectiveness: option.effectiveness,
        cost: option.cost,
        implementation_time_days: option.days
      });
      onRefresh();
      alert(`✅ ${option.name} applied successfully!`);
    } catch (err) {
      alert('Failed to apply security measure');
    } finally {
      setApplying(null);
    }
  };

  const filteredOptions = hardeningOptions.filter(o => o.layer === activeLayer);

  return (
    <div>
      <h2 style={{ color: '#64ffda', marginBottom: '20px' }}>🛡️ Defense Control Panel</h2>

      {/* Budget Overview */}
      {budget && (
        <div style={{ background: '#112240', borderRadius: '12px', padding: '20px', marginBottom: '25px' }}>
          <h3 style={{ color: '#64ffda', marginBottom: '15px' }}>💰 Security Budget Allocation</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px' }}>
            {['prevention', 'detection', 'response', 'recovery', 'training'].map(category => (
              <div key={category} style={{ textAlign: 'center' }}>
                <div style={{ color: '#8892b0', fontSize: '0.75rem', marginBottom: '5px' }}>
                  {category.toUpperCase()}
                </div>
                <div style={{ color: '#00ff88', fontWeight: 'bold' }}>
                  ${Number(budget[category]).toLocaleString()}
                </div>
                <div style={{
                  height: '4px', background: '#233554', borderRadius: '2px', marginTop: '8px'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${(budget[category] / budget.total_annual) * 100}%`,
                    background: '#00ff88', borderRadius: '2px'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Defense Layers */}
      <div style={{ display: 'flex', gap: '5px', marginBottom: '20px' }}>
        {layers.map(layer => (
          <button
            key={layer}
            onClick={() => setActiveLayer(layer)}
            style={{
              padding: '8px 16px', border: 'none', cursor: 'pointer',
              background: activeLayer === layer ? '#64ffda' : '#112240',
              color: activeLayer === layer ? '#0a0e1a' : '#8892b0',
              borderRadius: '6px', textTransform: 'capitalize', fontWeight: 'bold'
            }}
          >
            {layer}
          </button>
        ))}
      </div>

      {/* Hardening Options */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
        {filteredOptions.map(option => (
          <div key={option.id} style={{
            background: '#112240', borderRadius: '10px', padding: '20px',
            border: '1px solid #233554'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h4 style={{ color: 'white', margin: 0 }}>{option.name}</h4>
              <span style={{
                background: '#233554', color: '#64ffda',
                padding: '3px 10px', borderRadius: '4px', fontSize: '0.8rem'
              }}>
                {option.layer}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '15px' }}>
              <div>
                <div style={{ color: '#8892b0', fontSize: '0.75rem' }}>COST</div>
                <div style={{ color: '#ff4444', fontWeight: 'bold' }}>
                  ${option.cost.toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ color: '#8892b0', fontSize: '0.75rem' }}>EFFECTIVENESS</div>
                <div style={{ color: '#00ff88', fontWeight: 'bold' }}>
                  +{option.effectiveness}%
                </div>
              </div>
              <div>
                <div style={{ color: '#8892b0', fontSize: '0.75rem' }}>DAYS</div>
                <div style={{ color: '#64ffda', fontWeight: 'bold' }}>
                  {option.days}d
                </div>
              </div>
            </div>

            <button
              onClick={() => handleApply(option)}
              disabled={applying === option.id}
              style={{
                width: '100%', padding: '10px', background: '#00ff88',
                color: '#0a0e1a', border: 'none', borderRadius: '6px',
                fontWeight: 'bold', cursor: 'pointer'
              }}
            >
              {applying === option.id ? 'Applying...' : '✅ Apply Defense'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
export default DefensePanel;