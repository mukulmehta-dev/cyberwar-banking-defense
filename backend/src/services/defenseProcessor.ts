import pool from '../db';

export interface DefenseStrength {
  score: number;
  prevention: number;
  detection: number;
  response: number;
  overall: string;
}

export const calculateDefenseStrength = async (
  sessionId: string
): Promise<DefenseStrength> => {
  const budgetResult = await pool.query(
    `SELECT * FROM security_budgets 
     WHERE session_id = $1 
     ORDER BY created_at DESC LIMIT 1`,
    [sessionId]
  );

  if (budgetResult.rows.length === 0) {
    return {
      score: 0,
      prevention: 0,
      detection: 0,
      response: 0,
      overall: 'critical'
    };
  }

  const budget = budgetResult.rows[0];
  const total = budget.total_annual;

  const preventionAllocation = budget.prevention / total;
  const detectionAllocation = budget.detection / total;
  const responseAllocation = budget.response / total;

  const prevention = Math.min(100, preventionAllocation * 400);
  const detection = Math.min(100, detectionAllocation * 300);
  const response = Math.min(100, responseAllocation * 300);

  const score = prevention * 0.4 + detection * 0.3 + response * 0.3;

  const overall =
    score >= 80 ? 'strong' :
    score >= 60 ? 'moderate' :
    score >= 40 ? 'weak' : 'critical';

  return { score, prevention, detection, response, overall };
};

export const calculateIncidentCost = (
  impactedRevenuePerHour: number,
  responseTimeHours: number,
  assetValue: number,
  customersExposed: number,
  assetCriticality: number
): number => {
  const businessInterruption = impactedRevenuePerHour * responseTimeHours;
  const recoveryCost = assetValue * 0.1;
  const creditMonitoring = customersExposed * 100;
  const regulatoryFines = businessInterruption * 0.2;
  const reputationDamage = assetCriticality * 1000000;

  return (
    businessInterruption +
    recoveryCost +
    creditMonitoring +
    regulatoryFines +
    reputationDamage
  );
};