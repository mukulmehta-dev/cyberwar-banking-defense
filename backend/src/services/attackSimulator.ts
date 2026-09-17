import pool from '../db';

export interface AttackResult {
  success: boolean;
  impact: number;
  recovery_time: number;
  cascading_damage: number;
  message: string;
}

export const simulateAttack = async (
  assetId: string,
  attackType: string,
  attackerSkill: number,
  sessionId: string
): Promise<AttackResult> => {
  const assetResult = await pool.query(
    'SELECT * FROM bank_infrastructure WHERE id = $1',
    [assetId]
  );

  if (assetResult.rows.length === 0) {
    throw new Error('Asset not found');
  }

  const asset = assetResult.rows[0];

  const defenseStrength = asset.security_level / 100;
  const exposureFactor = asset.exposure / 100;
  const attackerAdvantage = attackerSkill / 100;

  const compromiseProb = (exposureFactor + attackerAdvantage - defenseStrength) / 2;
  const success = Math.random() < compromiseProb;

  const impact = success
    ? asset.value_if_breached * (1 + attackerAdvantage * 0.5)
    : 0;

  const recoveryTime = success
    ? Math.floor(asset.criticality * 0.5 + Math.random() * 24)
    : 0;

  const cascadingDamage = success
    ? impact * 0.2
    : 0;

  // Update incident in DB
  await pool.query(
    `UPDATE incidents 
     SET success = $1, impact_cost = $2, response_time_hours = $3, detected = true
     WHERE session_id = $4 AND targeted_asset_id = $5 AND status = 'active'`,
    [success, impact, recoveryTime, sessionId, assetId]
  );

  // Log event
  await pool.query(
    `INSERT INTO event_log (session_id, event_type, severity, message, metadata)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      sessionId,
      success ? 'attack_succeeded' : 'attack_blocked',
      success ? 'critical' : 'low',
      success
        ? `${attackType} attack succeeded on ${asset.asset_name}! Impact: $${impact.toLocaleString()}`
        : `${attackType} attack blocked on ${asset.asset_name}`,
      JSON.stringify({ assetId, attackType, attackerSkill, impact, recoveryTime })
    ]
  );

  return {
    success,
    impact,
    recovery_time: recoveryTime,
    cascading_damage: cascadingDamage,
    message: success
      ? `Attack succeeded! Estimated damage: $${impact.toLocaleString()}`
      : 'Attack was blocked by defense systems'
  };
};