import { Request, Response } from 'express';
import pool from '../db';
import { generateRandomAttack, getSessionSummary } from '../services/incidentManager';

export const startGame = async (req: Request, res: Response) => {
  try {
    const { session_name, total_budget, max_rounds } = req.body;

    const sessionResult = await pool.query(
      `INSERT INTO game_sessions 
       (session_name, total_budget, remaining_budget, max_rounds, status)
       VALUES ($1, $2, $2, $3, 'active') RETURNING *`,
      [session_name || 'New Game', total_budget || 100000000, max_rounds || 5]
    );

    const session = sessionResult.rows[0];

    await pool.query(
      `INSERT INTO security_budgets
       (session_id, round_id, total_annual, prevention, detection, response, recovery, training)
       VALUES ($1, 1, $2, $3, $3, $3, $3, $3)`,
      [session.id, total_budget || 100000000, (total_budget || 100000000) / 5]
    );

    await pool.query(
      `INSERT INTO event_log (session_id, event_type, severity, message, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        session.id,
        'game_started',
        'low',
        `Game "${session.session_name}" started with budget $${(total_budget || 100000000).toLocaleString()}`,
        JSON.stringify({ session_id: session.id, max_rounds })
      ]
    );

    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error starting game', error });
  }
};

export const nextRound = async (req: Request, res: Response) => {
  try {
    const { session_id } = req.body;

    const sessionResult = await pool.query(
      'SELECT * FROM game_sessions WHERE id = $1',
      [session_id]
    );

    const session = sessionResult.rows[0];

    if (session.current_round >= session.max_rounds) {
      return res.json({
        success: false,
        message: 'Game is already at max rounds. End the game.'
      });
    }

    const newRound = session.current_round + 1;

    await pool.query(
      `UPDATE game_sessions SET current_round = $1, updated_at = NOW() WHERE id = $2`,
      [newRound, session_id]
    );

    const attackCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < attackCount; i++) {
      await generateRandomAttack(session_id, newRound);
    }

    await pool.query(
      `INSERT INTO event_log (session_id, event_type, severity, message, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        session_id,
        'round_started',
        'low',
        `Round ${newRound} started — ${attackCount} attack(s) incoming!`,
        JSON.stringify({ round: newRound, attack_count: attackCount })
      ]
    );

    res.json({
      success: true,
      data: {
        round: newRound,
        attacks_triggered: attackCount,
        message: `Round ${newRound} started!`
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error advancing round', error });
  }
};

export const getGameState = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const session = await pool.query(
      'SELECT * FROM game_sessions WHERE id = $1',
      [sessionId]
    );

    const assets = await pool.query(
      'SELECT * FROM bank_infrastructure ORDER BY criticality DESC'
    );

    const activeIncidents = await pool.query(
      `SELECT i.*, b.asset_name FROM incidents i
       JOIN bank_infrastructure b ON i.targeted_asset_id = b.id
       WHERE i.session_id = $1 AND i.status = 'active'
       ORDER BY i.timestamp DESC`,
      [sessionId]
    );

    const recentEvents = await pool.query(
      `SELECT * FROM event_log WHERE session_id = $1
       ORDER BY timestamp DESC LIMIT 20`,
      [sessionId]
    );

    const budget = await pool.query(
      `SELECT * FROM security_budgets WHERE session_id = $1
       ORDER BY created_at DESC LIMIT 1`,
      [sessionId]
    );

    res.json({
      success: true,
      data: {
        session: session.rows[0],
        assets: assets.rows,
        active_incidents: activeIncidents.rows,
        recent_events: recentEvents.rows,
        budget: budget.rows[0] || null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching game state', error });
  }
};

export const getScores = async (req: Request, res: Response) => {
  try {
    const  sessionId  = req.params.sessionId as string;
    const summary = await getSessionSummary(sessionId);

    const totalAttacks = parseInt(summary.total_attacks) || 0;
    const successfulAttacks = parseInt(summary.successful_attacks) || 0;
    const totalLosses = parseFloat(summary.total_losses) || 0;
    const totalSpent = parseFloat(summary.total_spent) || 0;

    const blockedAttacks = totalAttacks - successfulAttacks;
    const blockRate = totalAttacks > 0 ? (blockedAttacks / totalAttacks) * 100 : 100;

    const cisoScore = Math.max(0, Math.round(
      (blockRate * 0.4) +
      (successfulAttacks === 0 ? 30 : Math.max(0, 30 - successfulAttacks * 5)) +
      (totalLosses === 0 ? 30 : Math.max(0, 30 - (totalLosses / 1000000)))
    ));

    const attackerScore = Math.min(100, Math.round(
      (successfulAttacks * 20) +
      (totalLosses / 1000000 * 5)
    ));

    res.json({
      success: true,
      data: {
        summary: {
          total_attacks: totalAttacks,
          successful_attacks: successfulAttacks,
          blocked_attacks: blockedAttacks,
          block_rate: blockRate.toFixed(1) + '%',
          total_losses: '$' + totalLosses.toLocaleString(),
          total_security_spent: '$' + totalSpent.toLocaleString()
        },
        scores: {
          ciso: cisoScore,
          attacker: attackerScore
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error calculating scores', error });
  }
};

export const endGame = async (req: Request, res: Response) => {
  try {
    const { session_id } = req.body;

    await pool.query(
      `UPDATE game_sessions SET status = 'completed', updated_at = NOW() WHERE id = $1`,
      [session_id]
    );

    await pool.query(
      `INSERT INTO event_log (session_id, event_type, severity, message, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [session_id, 'game_ended', 'low', 'Game completed!', JSON.stringify({ session_id })]
    );

    res.json({ success: true, message: 'Game ended successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error ending game', error });
  }
};

export const triggerRandomAttack = async (req: Request, res: Response) => {
  try {
    const { session_id, round_id } = req.body;
    await generateRandomAttack(session_id, round_id);
    res.json({ success: true, message: 'Attack triggered!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error triggering attack', error });
  }
};