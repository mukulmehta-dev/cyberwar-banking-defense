import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const migrate = async () => {
  try {
    console.log('Running migrations...');

    await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bank_infrastructure (
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
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS game_sessions (
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
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS security_budgets (
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
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS incidents (
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
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS security_measures (
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
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS incidents_resolved (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        incident_id UUID REFERENCES incidents(id),
        resolution_type VARCHAR(50),
        cost DECIMAL(15,2),
        time_to_resolve_hours INT,
        data_recovered_percent INT,
        timestamp TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS event_log (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        session_id UUID REFERENCES game_sessions(id),
        event_type VARCHAR(50),
        severity VARCHAR(20),
        message TEXT,
        metadata JSONB,
        timestamp TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✅ All tables created!');

    await pool.query(`
      INSERT INTO bank_infrastructure 
        (asset_name, asset_type, criticality, exposure, security_level, data_sensitivity, value_if_breached)
      VALUES
        ('Customer Portal', 'web_app', 85, 90, 60, 80, 50000000),
        ('Core Banking System', 'core_banking', 100, 20, 75, 100, 100000000),
        ('Payment Gateway', 'payment', 95, 70, 70, 90, 80000000),
        ('SWIFT Network Interface', 'payment', 100, 40, 80, 95, 90000000),
        ('ATM Network', 'infrastructure', 80, 60, 65, 70, 40000000),
        ('Mobile Banking App', 'web_app', 75, 95, 55, 75, 35000000),
        ('Trading System', 'trading', 90, 30, 72, 85, 70000000),
        ('Employee VPN', 'internal', 70, 50, 50, 60, 20000000),
        ('Data Warehouse', 'data', 85, 15, 68, 100, 60000000),
        ('AML/KYC Compliance System', 'compliance', 80, 10, 78, 90, 45000000)
      ON CONFLICT DO NOTHING;
    `);
await pool.query(`
  CREATE TABLE IF NOT EXISTS game_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES game_sessions(id),
    player_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    score INT DEFAULT 0,
    joined_at TIMESTAMP DEFAULT NOW()
  );
`);
console.log('✅ Players table created!');
    console.log('✅ Seed data inserted!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrate();