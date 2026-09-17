import { Request, Response } from 'express';
import pool from '../db';

export const getIncidents = async (req: Request, res: Response) => {
  try {
    const { session_id } = req.query;
    const result = await pool.query(
      `SELECT i.*, b.asset_name, b.asset_type 
       FROM incidents i 
       JOIN bank_infrastructure b ON i.targeted_asset_id = b.id
       WHERE i.session_id = $1 
       ORDER BY i.timestamp DESC`,
      [session_id]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching incidents', error });
  }
};

export const createIncident = async (req: Request, res: Response) => {
  try {
    const { session_id, round_id, attack_type, targeted_asset_id, attacker_skill } = req.body;
    const result = await pool.query(
      `INSERT INTO incidents 
       (session_id, round_id, attack_type, targeted_asset_id, attacker_skill)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [session_id, round_id, attack_type, targeted_asset_id, attacker_skill]
    );

    // Log event
    await pool.query(
      `INSERT INTO event_log (session_id, event_type, severity, message, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        session_id,
        'attack_started',
        attacker_skill > 70 ? 'critical' : attacker_skill > 40 ? 'high' : 'medium',
        `New ${attack_type} attack detected on asset`,
        JSON.stringify({ incident_id: result.rows[0].id, attack_type, targeted_asset_id })
      ]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating incident', error });
  }
};

export const resolveIncident = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { resolution_type, cost, time_to_resolve_hours, data_recovered_percent } = req.body;

    await pool.query(
      `UPDATE incidents SET status = 'resolved' WHERE id = $1`,
      [id]
    );

    const result = await pool.query(
      `INSERT INTO incidents_resolved 
       (incident_id, resolution_type, cost, time_to_resolve_hours, data_recovered_percent)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [id, resolution_type, cost, time_to_resolve_hours, data_recovered_percent]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error resolving incident', error });
  }
};

export const getEventLog = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const result = await pool.query(
      `SELECT * FROM event_log WHERE session_id = $1 ORDER BY timestamp DESC LIMIT 50`,
      [sessionId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching event log', error });
  }
};