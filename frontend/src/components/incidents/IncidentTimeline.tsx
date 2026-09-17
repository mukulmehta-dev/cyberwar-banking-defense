import { useState } from 'react';
import { EventLog, Incident } from '../../types';
import { resolveIncident } from '../../api';

interface IncidentTimelineProps {
  events: EventLog[];
  incidents: Incident[];
  sessionId: string;
  onRefresh: () => void;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return '#ff4444';
    case 'high': return '#ff8800';
    case 'medium': return '#ffaa00';
    case 'low': return '#00ff88';
    default: return '#8892b0';
  }
};

const getEventIcon = (eventType: string) => {
  switch (eventType) {
    case 'attack_started': return '🎯';
    case 'attack_succeeded': return '💥';
    case 'attack_blocked': return '🛡️';
    case 'defense_applied': return '✅';
    case 'patch_applied': return '🔧';
    case 'game_started': return '🚀';
    case 'round_started': return '⏭️';
    case 'game_ended': return '🏁';
    default: return '📋';
  }
};

const IncidentTimeline = ({ events, incidents, sessionId, onRefresh }: IncidentTimelineProps) => {
  const [resolving, setResolving] = useState<string | null>(null);

  const handleResolve = async (incidentId: string, resolutionType: string, cost: number) => {
    setResolving(incidentId);
    try {
      await resolveIncident(incidentId, {
        resolution_type: resolutionType,
        cost,
        time_to_resolve_hours: Math.floor(Math.random() * 24) + 1,
        data_recovered_percent: resolutionType === 'backup_restore' ? 85 : 100
      });
      onRefresh();
    } catch (err) {
      alert('Failed to resolve incident');
    } finally {
      setResolving(null);
    }
  };

  return (
    <div>
      <h2 style={{ color: '#64ffda', marginBottom: '20px' }}>🚨 Incident Response Center</h2>

      {/* Active Incidents */}
      {incidents.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#ff4444', marginBottom: '15px' }}>
            ⚠️ Active Incidents ({incidents.length})
          </h3>
          {incidents.map(incident => (
            <div key={incident.id} style={{
              background: '#1a0a0a', border: '1px solid #ff4444',
              borderRadius: '10px', padding: '20px', marginBottom: '15px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div>
                  <span style={{
                    background: '#ff4444', color: 'white', padding: '3px 10px',
                    borderRadius: '4px', fontSize: '0.8rem', marginRight: '10px'
                  }}>
                    {incident.attack_type?.toUpperCase()}
                  </span>
                  <span style={{ color: 'white', fontWeight: 'bold' }}>
                    {incident.asset_name}
                  </span>
                </div>
                <span style={{ color: '#8892b0', fontSize: '0.85rem' }}>
                  Attacker Skill: {incident.attacker_skill}/100
                </span>
              </div>

              <div style={{ color: '#8892b0', fontSize: '0.85rem', marginBottom: '15px' }}>
                Impact Cost: <span style={{ color: '#ff4444' }}>
                  ${Number(incident.impact_cost).toLocaleString()}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleResolve(incident.id, 'containment', 50000)}
                  disabled={resolving === incident.id}
                  style={{
                    padding: '8px 14px', background: '#00ff88', color: '#0a0e1a',
                    border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
                  }}
                >
                  🛡️ Contain ($50K)
                </button>
                <button
                  onClick={() => handleResolve(incident.id, 'backup_restore', 200000)}
                  disabled={resolving === incident.id}
                  style={{
                    padding: '8px 14px', background: '#64ffda', color: '#0a0e1a',
                    border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
                  }}
                >
                  💾 Restore Backup ($200K)
                </button>
                <button
                  onClick={() => handleResolve(incident.id, 'payment', 5000000)}
                  disabled={resolving === incident.id}
                  style={{
                    padding: '8px 14px', background: '#ff8800', color: 'white',
                    border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
                  }}
                >
                  💰 Pay Ransom ($5M)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Event Timeline */}
      <h3 style={{ color: '#64ffda', marginBottom: '15px' }}>📋 Event Timeline</h3>
      <div style={{ background: '#112240', borderRadius: '12px', padding: '20px' }}>
        {events.length === 0 ? (
          <p style={{ color: '#8892b0' }}>No events yet. Start a round to see activity.</p>
        ) : (
          events.map(event => (
            <div key={event.id} style={{
              display: 'flex', gap: '15px', paddingBottom: '15px',
              marginBottom: '15px', borderBottom: '1px solid #1a2a3a'
            }}>
              <div style={{ fontSize: '1.5rem' }}>{getEventIcon(event.event_type)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'white' }}>{event.message}</span>
                  <span style={{
                    color: getSeverityColor(event.severity),
                    fontSize: '0.8rem', fontWeight: 'bold'
                  }}>
                    {event.severity?.toUpperCase()}
                  </span>
                </div>
                <div style={{ color: '#8892b0', fontSize: '0.8rem', marginTop: '4px' }}>
                  {new Date(event.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default IncidentTimeline;