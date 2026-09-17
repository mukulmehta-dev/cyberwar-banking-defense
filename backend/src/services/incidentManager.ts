import pool from '../db';
import { simulateAttack } from './attackSimulator';
import { Server } from 'socket.io';

export type AttackType = 'ransomware' | 'ddos' | 'breach' | 'supply_chain' | 'insider' | 'infrastructure';

let ioInstance: Server;

export const setIO = (io: Server) => {
  ioInstance = io;
};

export const generateRandomAttack = async (
  sessionId: string,
  roundId: number
): Promise<void> => {
  const assetsResult = await pool.query('SELECT * FROM bank_infrastructure');
  const assets = assetsResult.rows;

  const randomAsset = assets[Math.floor(Math.random() * assets.length)];

  const attackTypes: AttackType[] = [
    'ransomware', 'ddos', 'breach', 'supply_chain', 'insider', 'infrastructure'
  ];
  const randomAttack = attackTypes[Math.floor(Math.random() * attackTypes.length)];
  const attackerSkill = Math.floor(Math.random() * 100);

  const incidentResult = await pool.query(
    `INSERT INTO incidents 
     (session_id, round_id, attack_type, targeted_asset_id, attacker_skill)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [sessionId, roundId, randomAttack, randomAsset.id, attackerSkill]
  );

  const incident = incidentResult.rows[0];

  if (ioInstance) {
    ioInstance.to(sessionId).emit('attack_alert', {
      incident_id: incident.id,
      attack_type: randomAttack,
      asset_name: randomAsset.asset_name,
      asset_criticality: randomAsset.criticality,
      attacker_skill: attackerSkill,
      timestamp: new Date().toISOString()
    });
  }

  const result = await simulateAttack(
    randomAsset.id,
    randomAttack,
    attackerSkill,
    sessionId
  );

  if (ioInstance) {
    ioInstance.to(sessionId).emit('attack_result', {
      incident_id: incident.id,
      success: result.success,
      impact: result.impact,
      message: result.message,
      timestamp: new Date().toISOString()
    });
  }
};

export const getSessionSummary = async (sessionId: string): Promise<any> => {
  const incidents = await pool.query(
    `SELECT 
       COUNT(*) as total_attacks,
       SUM(CASE WHEN success = true THEN 1 ELSE 0 END) as successful_attacks,
       SUM(impact_cost) as total_losses,
       AVG(response_time_hours) as avg_response_time
     FROM incidents 
     WHERE session_id = $1`,
    [sessionId]
  );

  const measures = await pool.query(
    `SELECT COUNT(*) as total_measures, SUM(cost) as total_spent
     FROM security_measures
     WHERE session_id = $1`,
    [sessionId]
  );

  return {
    ...incidents.rows[0],
    ...measures.rows[0]
  };
};