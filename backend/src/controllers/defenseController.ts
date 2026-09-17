import { Request, Response } from 'express';
import pool from '../db';

export const getSecurityMeasures = async (req: Request, res: Response) => {
  try {
    const { session_id } = req.query;
    const result = await pool.query(
      `SELECT sm.*, b.asset_name 
       FROM security_measures sm
       JOIN bank_infrastructure b ON sm.asset_id = b.id
       WHERE sm.session_id = $1
       ORDER BY sm.applied_date DESC`,
      [session_id]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching security measures', error });
  }
};

export const applySecurityMeasure = async (req: Request, res: Response) => {
  try {
    const { session_id, round_id, asset_id, measure_type, effectiveness, cost, implementation_time_days } = req.body;

    const result = await pool.query(
      `INSERT INTO security_measures 
       (session_id, round_id, asset_id, measure_type, effectiveness, cost, implementation_time_days)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [session_id, round_id, asset_id, measure_type, effectiveness, cost, implementation_time_days]
    );

    // Update asset security level
    await pool.query(
      `UPDATE bank_infrastructure 
       SET security_level = LEAST(100, security_level + $1)
       WHERE id = $2`,
      [Math.floor(effectiveness * 0.3), asset_id]
    );

    // Log event
    await pool.query(
      `INSERT INTO event_log (session_id, event_type, severity, message, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        session_id,
        'defense_applied',
        'low',
        `Security measure ${measure_type} applied`,
        JSON.stringify({ measure_type, asset_id, effectiveness })
      ]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error applying security measure', error });
  }
};

export const getBudget = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const result = await pool.query(
      `SELECT * FROM security_budgets WHERE session_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [sessionId]
    );
    res.json({ success: true, data: result.rows[0] || null });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching budget', error });
  }
};

export const updateBudget = async (req: Request, res: Response) => {
  try {
    const { session_id, round_id, total_annual, prevention, detection, response, recovery, training } = req.body;

    const result = await pool.query(
      `INSERT INTO security_budgets 
       (session_id, round_id, total_annual, prevention, detection, response, recovery, training)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [session_id, round_id, total_annual, prevention, detection, response, recovery, training]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating budget', error });
  }
};