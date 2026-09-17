import { Request, Response } from 'express';
import pool from '../db';

export const createSession = async (req: Request, res: Response) => {
  try {
    const { session_name, total_budget, max_rounds } = req.body;
    const result = await pool.query(
      `INSERT INTO game_sessions (session_name, total_budget, remaining_budget, max_rounds)
       VALUES ($1, $2, $2, $3) RETURNING *`,
      [session_name, total_budget || 100000000, max_rounds || 5]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating session', error });
  }
};

export const getAllSessions = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM game_sessions ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching sessions', error });
  }
};

export const getSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM game_sessions WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching session', error });
  }
};

export const updateSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, current_round, remaining_budget, total_losses } = req.body;
    const result = await pool.query(
      `UPDATE game_sessions 
       SET status = COALESCE($1, status),
           current_round = COALESCE($2, current_round),
           remaining_budget = COALESCE($3, remaining_budget),
           total_losses = COALESCE($4, total_losses),
           updated_at = NOW()
       WHERE id = $5 RETURNING *`,
      [status, current_round, remaining_budget, total_losses, id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating session', error });
  }
};