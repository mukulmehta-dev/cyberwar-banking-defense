-- Enable UUID support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE bank_infrastructure (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_name VARCHAR(100) NOT NULL,
  asset_type VARCHAR(50) NOT NULL,
  criticality INT CHECK (criticality BETWEEN 0 AND 100),
  exposure INT CHECK (exposure BETWEEN 0 AND 100),
  security_level INT CHECK (security_level BETWEEN 0 AND 100),
  data_sensitivity INT CHECK (data_sensitivity BETWEEN 0 AND 100),
  value_if_breached DECIMAL(15,2),
  dependent_systems UUID[],
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_name VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active',
  current_round INT DEFAULT 1,
  max_rounds INT DEFAULT 5,
  total_budget DECIMAL(15,2) DEFAULT 100000000,
  remaining_budget DECIMAL(15,2) DEFAULT 100000000,
  total_losses DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE security_budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES game_sessions(id),
  round_id INT,
  total_annual DECIMAL(15,2),
  prevention DECIMAL(15,2) DEFAULT 0,
  detection DECIMAL(15,2) DEFAULT 0,
  response DECIMAL(15,2) DEFAULT 0,
  recovery DECIMAL(15,2) DEFAULT 0,
  training DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES game_sessions(id),
  round_id INT,
  attack_type VARCHAR(50) NOT NULL,
  targeted_asset_id UUID REFERENCES bank_infrastructure(id),
  attacker_skill INT CHECK (attacker_skill BETWEEN 0 AND 100),
  success BOOLEAN DEFAULT FALSE,
  detected BOOLEAN DEFAULT FALSE,
  detection_time_hours INT,
  response_time_hours INT,
  impact_cost DECIMAL(15,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE TABLE security_measures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES game_sessions(id),
  round_id INT,
  asset_id UUID REFERENCES bank_infrastructure(id),
  measure_type VARCHAR(50) NOT NULL,
  effectiveness INT CHECK (effectiveness BETWEEN 0 AND 100),
  cost DECIMAL(15,2),
  implementation_time_days INT,
  applied_date DATE DEFAULT CURRENT_DATE,
  active BOOLEAN DEFAULT TRUE
);

CREATE TABLE incidents_resolved (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id UUID REFERENCES incidents(id),
  resolution_type VARCHAR(50),
  cost DECIMAL(15,2),
  time_to_resolve_hours INT,
  data_recovered_percent INT,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE TABLE event_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES game_sessions(id),
  event_type VARCHAR(50),
  severity VARCHAR(20),
  message TEXT,
  metadata JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);