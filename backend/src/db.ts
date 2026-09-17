import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import dotenv from 'dotenv';
dotenv.config();

const DB_FILE = path.join(__dirname, '..', 'cyberwar_db.sqlite');

let sqlJsInstance: SqlJsStatic | null = null;
let sqliteDb: Database | null = null;
let dbReadyPromise: Promise<void> | null = null;

const eventHandlers: { [key: string]: ((...args: any[]) => void)[] } = {};

function emit(event: string, ...args: any[]) {
  if (eventHandlers[event]) {
    eventHandlers[event].forEach(fn => fn(...args));
  }
}

async function initLocalDb(): Promise<Database> {
  if (sqliteDb) return sqliteDb;

  if (!sqlJsInstance) {
    sqlJsInstance = await initSqlJs();
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE);
      sqliteDb = new sqlJsInstance.Database(fileBuffer);
    } catch (e) {
      console.warn('⚠️ Could not load existing SQLite file, creating fresh database');
      sqliteDb = new sqlJsInstance.Database();
    }
  } else {
    sqliteDb = new sqlJsInstance.Database();
  }

  // Register custom SQL functions (both lower and upper case for case-insensitivity)
  const nowFn = () => new Date().toISOString();
  const dateFn = () => new Date().toISOString().split('T')[0];
  const uuidFn = () => crypto.randomUUID();
  const leastFn = (a: number, b: number) => Math.min(a, b);

  sqliteDb.create_function('now', nowFn);
  sqliteDb.create_function('NOW', nowFn);
  sqliteDb.create_function('current_date', dateFn);
  sqliteDb.create_function('CURRENT_DATE', dateFn);
  sqliteDb.create_function('uuid_generate_v4', uuidFn);
  sqliteDb.create_function('UUID_GENERATE_V4', uuidFn);
  sqliteDb.create_function('least', leastFn);
  sqliteDb.create_function('LEAST', leastFn);

  const UUID_DEFAULT = `(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))), 2) || '-a' || substr(lower(hex(randomblob(2))), 2) || '-' || lower(hex(randomblob(6))))`;

  // Initialize schema
  sqliteDb.run(`
    CREATE TABLE IF NOT EXISTS bank_infrastructure (
      id TEXT PRIMARY KEY DEFAULT ${UUID_DEFAULT},
      asset_name TEXT NOT NULL,
      asset_type TEXT NOT NULL,
      criticality INT,
      exposure INT,
      security_level INT,
      data_sensitivity INT,
      value_if_breached REAL,
      dependent_systems TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS game_sessions (
      id TEXT PRIMARY KEY DEFAULT ${UUID_DEFAULT},
      session_name TEXT,
      status TEXT DEFAULT 'active',
      current_round INT DEFAULT 1,
      max_rounds INT DEFAULT 5,
      total_budget REAL DEFAULT 100000000,
      remaining_budget REAL DEFAULT 100000000,
      total_losses REAL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS security_budgets (
      id TEXT PRIMARY KEY DEFAULT ${UUID_DEFAULT},
      session_id TEXT,
      round_id INT,
      total_annual REAL,
      prevention REAL DEFAULT 0,
      detection REAL DEFAULT 0,
      response REAL DEFAULT 0,
      recovery REAL DEFAULT 0,
      training REAL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS incidents (
      id TEXT PRIMARY KEY DEFAULT ${UUID_DEFAULT},
      session_id TEXT,
      round_id INT,
      attack_type TEXT NOT NULL,
      targeted_asset_id TEXT,
      attacker_skill INT,
      success BOOLEAN DEFAULT 0,
      detected BOOLEAN DEFAULT 0,
      detection_time_hours INT,
      response_time_hours INT,
      impact_cost REAL DEFAULT 0,
      status TEXT DEFAULT 'active',
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS security_measures (
      id TEXT PRIMARY KEY DEFAULT ${UUID_DEFAULT},
      session_id TEXT,
      round_id INT,
      asset_id TEXT,
      measure_type TEXT NOT NULL,
      effectiveness INT,
      cost REAL,
      implementation_time_days INT,
      applied_date TEXT DEFAULT CURRENT_DATE,
      active BOOLEAN DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS incidents_resolved (
      id TEXT PRIMARY KEY DEFAULT ${UUID_DEFAULT},
      incident_id TEXT,
      resolution_type TEXT,
      cost REAL,
      time_to_resolve_hours INT,
      data_recovered_percent INT,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS event_log (
      id TEXT PRIMARY KEY DEFAULT ${UUID_DEFAULT},
      session_id TEXT,
      event_type TEXT,
      severity TEXT,
      message TEXT,
      metadata TEXT,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS game_players (
      id TEXT PRIMARY KEY DEFAULT ${UUID_DEFAULT},
      session_id TEXT,
      player_name TEXT NOT NULL,
      role TEXT NOT NULL,
      score INT DEFAULT 0,
      joined_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Check if bank_infrastructure needs seed data
  const checkStmt = sqliteDb.prepare('SELECT COUNT(*) as count FROM bank_infrastructure');
  let count = 0;
  if (checkStmt.step()) {
    count = (checkStmt.getAsObject() as any).count || 0;
  }
  checkStmt.free();

  if (count === 0) {
    sqliteDb.run(`
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
        ('AML/KYC Compliance System', 'compliance', 80, 10, 78, 90, 45000000);
    `);
  }

  saveDatabase();
  console.log('✅ Local SQLite database initialized & seed data ready');
  emit('connect');
  return sqliteDb;
}

function saveDatabase() {
  if (sqliteDb) {
    try {
      const data = sqliteDb.export();
      fs.writeFileSync(DB_FILE, Buffer.from(data));
    } catch (err) {
      console.error('Error saving SQLite database file:', err);
    }
  }
}

// Start database initialization immediately
dbReadyPromise = initLocalDb()
  .then(() => {})
  .catch(err => {
    console.error('❌ Failed to initialize local database:', err);
    emit('error', err);
  });

export const pool = {
  async query(sqlText: string, params: any[] = []): Promise<{ rows: any[]; rowCount: number }> {
    if (!sqliteDb) {
      await dbReadyPromise;
    }
    if (!sqliteDb) {
      throw new Error('Database not initialized');
    }

    // Normalize PostgreSQL-specific syntax to standard SQLite equivalents
    const normalizedSql = sqlText.replace(/\bNOW\(\)/gi, 'CURRENT_TIMESTAMP');

    try {
      const stmt = sqliteDb.prepare(normalizedSql);
      if (params && params.length > 0) {
        stmt.bind(params);
      }

      const rows: any[] = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();

      // If this was a modifying query (INSERT, UPDATE, DELETE), persist to disk
      const upperSql = sqlText.trim().toUpperCase();
      if (
        upperSql.startsWith('INSERT') ||
        upperSql.startsWith('UPDATE') ||
        upperSql.startsWith('DELETE') ||
        upperSql.startsWith('CREATE') ||
        upperSql.startsWith('DROP')
      ) {
        saveDatabase();
      }

      return { rows, rowCount: rows.length };
    } catch (err) {
      console.error(`Database Query Error on [${sqlText}]:`, err);
      throw err;
    }
  },

  on(event: string, callback: (...args: any[]) => void) {
    if (!eventHandlers[event]) {
      eventHandlers[event] = [];
    }
    eventHandlers[event].push(callback);
    if (event === 'connect' && sqliteDb) {
      callback();
    }
  }
};

export default pool;