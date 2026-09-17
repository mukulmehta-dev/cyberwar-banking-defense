import { Request, Response } from 'express';
import pool from '../db';

export const joinGame = async (req: Request, res: Response) => {
  try {
    const { session_id, player_name, role } = req.body;

    // Check if role already taken in this session
    const existing = await pool.query(
      `SELECT * FROM game_players WHERE session_id = $1 AND role = $2`,
      [session_id, role]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Role ${role} is already taken in this session`
      });
    }

    const result = await pool.query(
      `INSERT INTO game_players (session_id, player_name, role)
       VALUES ($1, $2, $3) RETURNING *`,
      [session_id, player_name, role]
    );

    // Log event
    await pool.query(
      `INSERT INTO event_log (session_id, event_type, severity, message, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        session_id,
        'player_joined',
        'low',
        `${player_name} joined as ${role}`,
        JSON.stringify({ player_name, role })
      ]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error joining game', error });
  }
};

export const getPlayers = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const result = await pool.query(
      `SELECT * FROM game_players WHERE session_id = $1 ORDER BY joined_at ASC`,
      [sessionId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching players', error });
  }
};

export const updatePlayerScore = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { score } = req.body;

    const result = await pool.query(
      `UPDATE game_players SET score = $1 WHERE id = $2 RETURNING *`,
      [score, id]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating score', error });
  }
};

export const leaveGame = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM game_players WHERE id = $1`, [id]);
    res.json({ success: true, message: 'Player removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error leaving game', error });
  }
};