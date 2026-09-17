export interface Asset {
  id: string;
  asset_name: string;
  asset_type: string;
  criticality: number;
  exposure: number;
  security_level: number;
  data_sensitivity: number;
  value_if_breached: number;
}

export interface GameSession {
  id: string;
  session_name: string;
  status: string;
  current_round: number;
  max_rounds: number;
  total_budget: number;
  remaining_budget: number;
  total_losses: number;
  created_at: string;
}

export interface Incident {
  id: string;
  session_id: string;
  round_id: number;
  attack_type: string;
  asset_name: string;
  attacker_skill: number;
  success: boolean;
  detected: boolean;
  impact_cost: number;
  status: string;
  timestamp: string;
}

export interface EventLog {
  id: string;
  session_id: string;
  event_type: string;
  severity: string;
  message: string;
  metadata: any;
  timestamp: string;
}

export interface SecurityBudget {
  id: string;
  session_id: string;
  total_annual: number;
  prevention: number;
  detection: number;
  response: number;
  recovery: number;
  training: number;
}

export interface GameState {
  session: GameSession;
  assets: Asset[];
  active_incidents: Incident[];
  recent_events: EventLog[];
  budget: SecurityBudget;
}

export interface Score {
  ciso: number;
  attacker: number;
}

export type AttackType = 'ransomware' | 'ddos' | 'breach' | 'supply_chain' | 'insider' | 'infrastructure';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type PlayerRole = 'ciso' | 'attacker' | 'regulator' | 'insurance' | 'infrastructure';