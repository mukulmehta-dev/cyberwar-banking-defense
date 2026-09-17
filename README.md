# 🛡️ Cyberwar Banking Defense

> **A real-time cybersecurity strategy simulation and war-gaming platform for financial institutions.**

[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-010101?logo=socketdotio&logoColor=white)](https://socket.io/)
[![D3.js](https://img.shields.io/badge/D3.js-7.x-F9A03C?logo=d3dotjs&logoColor=white)](https://d3js.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Ready-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![SQLite](https://img.shields.io/badge/SQLite-Built--in_Fallback-003B57?logo=sqlite&logoColor=white)](https://sqlite.org/)

---

## 📌 Table of Contents
1. [Overview](#-overview)
2. [Key Features](#-key-features)
3. [Architecture & Tech Stack](#-architecture--tech-stack)
4. [Multiplayer Roles](#-multiplayer-roles)
5. [System Requirements](#-system-requirements)
6. [Getting Started](#-getting-started)
   - [Clone & Setup](#1-clone-repository)
   - [Backend Configuration](#2-backend-setup)
   - [Frontend Configuration](#3-frontend-setup)
7. [Database Modes (Dual-Engine)](#-database-modes-dual-engine)
8. [API Reference](#-api-reference)
9. [Project Structure](#-project-structure)
10. [License](#-license)

---

## 🎯 Overview

**Cyberwar Banking Defense** is an interactive, multi-role cybersecurity simulation designed to emulate the complex challenges faced by modern financial institutions under nation-state and cybercriminal threats. 

Players navigate rounds of cyber attacks, manage multimillion-dollar defensive budgets, harden critical core banking systems, coordinate incident response, and evaluate technical and financial blast radiuses in real time.

---

## ✨ Key Features

- **🎮 Multi-Role Strategy Simulation**: Play as the **Bank CISO**, **Red Team Hacker**, **Regulator**, **Cyber Insurance Provider**, or **Infrastructure Officer**.
- **🗺️ Live D3.js Network Topology**: Interactive visual mapping of core banking, SWIFT interfaces, payment gateways, ATMs, and employee VPNs with color-coded security and incident states.
- **⚡ Real-Time WebSocket Events**: Instant incident broadcasts, attack result feeds, and defense status changes powered by **Socket.IO**.
- **💥 Realistic Attack Simulator**: Simulates multiple threat vectors—Ransomware, DDoS, Data Breach, Supply Chain, Insider Threat, and Critical Infrastructure sabotage—calculated against exposure, attacker skill, and defense posture.
- **🛡️ 6-Layer Defense Hardening**: Strategic security controls across Perimeter, Network, Endpoint, Data, Operations, and People.
- **🏆 Live Scoring Engine**: Calculates CISO resilience and Attacker compromise scores based on financial losses, block rates, and incident containment times.
- **💾 Zero-Config Built-in SQLite + PostgreSQL**: Works instantly out of the box with zero external database dependencies using embedded SQLite, while fully supporting enterprise PostgreSQL setups.

---

## 🏗️ Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                     React 19 Frontend                       │
│      MUI • D3.js Topology • Socket.IO Client • React Router  │
└──────────────────────────────┬──────────────────────────────┘
                               │  REST API & WebSockets
┌──────────────────────────────▼──────────────────────────────┐
│                    Express Backend (TS)                     │
│    Incident Manager • Attack Simulator • Defense Processor  │
└──────────────────────────────┬──────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
    [ Built-in Local SQLite ]       [ PostgreSQL (Railway/Neon) ]
        (Zero-Setup Mode)                (Production Mode)
```

### Technology Highlights:
- **Frontend**: React 19, TypeScript, Material UI (`@mui/material`), D3 (`d3`), Axios, Socket.IO Client.
- **Backend**: Node.js, Express, TypeScript, Socket.IO, `pg` (PostgreSQL Client), `sql.js` (WebAssembly SQLite).
- **Database**: Dual-engine adapter with automatic seed data and migration routines.

---

## 👥 Multiplayer Roles

| Role | Badge | Mission & Responsibilities |
| :--- | :---: | :--- |
| **Bank CISO** | 🛡️ | Allocate annual cybersecurity budgets, patch critical assets, and minimize financial damage. |
| **Red Team Hacker** | 💀 | Identify vulnerable assets, launch sophisticated cyber exploits, and maximize ransom/breach impact. |
| **Financial Regulator** | ⚖️ | Enforce industry compliance standards and assess systemic financial risk across institutions. |
| **Cyber Insurance** | 📋 | Assess cyber claims, calculate liability, and underwrite policy risk profiles. |
| **Infrastructure Officer** | 🏦 | Protect national payment systems, SWIFT interfaces, and mission-critical network gateways. |

---

## 📋 System Requirements

- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **Git**: Installed and configured

---

## 🚀 Getting Started

### 1. Clone Repository
```bash
git clone https://github.com/mukulmehta-dev/cyberwar-banking-defense.git
cd cyberwar-banking-defense
```

### 2. Backend Setup
```bash
cd backend
npm install

# Copy environment template
cp .env.example .env
```

Start the backend development server:
```bash
npm run dev
```
> The backend server will start on **`http://localhost:5000`** with the built-in SQLite database initialized and seed data ready.

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install

# Copy environment template
cp .env.example .env
```

Start the React development server:
```bash
npm start
```
> The frontend application will launch at **`http://localhost:3000`**.

---

## 💾 Database Modes (Dual-Engine)

The backend features an automatic dual-database engine:

### 1. Built-in Local Mode (Default & Instant)
- No external database installation or cloud account is required.
- Powered by an embedded SQLite engine with native UUID generation.
- Data automatically persists to `backend/cyberwar_db.sqlite`.

### 2. PostgreSQL Mode (Production & Cloud)
To connect to an external PostgreSQL database (Railway, Neon, Supabase, or local PostgreSQL):
1. Update `backend/.env` with your connection string:
   ```env
   DATABASE_URL=postgresql://postgres:password@your-host:5432/cyberwar_db
   ```
2. Run database migrations:
   ```bash
   cd backend
   npm run migrate
   ```

---

## 🔌 API Reference

### Sessions & Game Engine
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Healthcheck endpoint |
| `GET` | `/api/sessions` | Fetch all historical simulation sessions |
| `POST` | `/api/game/start` | Initialize a new session with budget & rounds |
| `GET` | `/api/game/state/:id` | Fetch current session state, assets, and events |
| `POST` | `/api/game/round/next` | Advance round and simulate incoming attacks |
| `GET` | `/api/game/scores/:id` | Calculate CISO and Attacker scores |
| `POST` | `/api/game/end` | Finalize and complete session |

### Infrastructure & Defense
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/assets` | Retrieve all banking assets and security levels |
| `PATCH` | `/api/assets/:id/security` | Update an asset's security rating |
| `GET` | `/api/defense/measures` | List active security measures for a session |
| `POST` | `/api/defense/measures` | Deploy a new defensive hardening measure |
| `GET` | `/api/defense/budget/:id` | Retrieve budget allocation |
| `POST` | `/api/defense/budget` | Update prevention, detection & response budget |

### Incidents & Vulnerabilities
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/incidents` | List active incidents for a session |
| `POST` | `/api/incidents/:id/resolve` | Resolve an incident (patching/restore) |
| `GET` | `/api/incidents/events/:id` | Fetch audit event log |
| `GET` | `/api/vulnerabilities` | List known threat vulnerabilities |
| `POST` | `/api/vulnerabilities/scan/:id` | Run a vulnerability scan on an asset |
| `POST` | `/api/vulnerabilities/patch` | Apply a security patch to a vulnerable asset |

---

## 📁 Project Structure

```text
cyberwar-banking-defense/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Route controllers (game, assets, defense, incidents, players)
│   │   ├── services/         # Incident manager, attack simulator, defense calculator
│   │   ├── websocket/        # Real-time Socket.IO handlers
│   │   ├── routes/           # Express API route declarations
│   │   ├── config.ts         # Configuration loader
│   │   ├── db.ts             # Dual-engine database adapter (SQLite / PostgreSQL)
│   │   ├── migrate.ts        # Database schema migration script
│   │   └── index.ts          # Server entry point
│   ├── .env.example          # Backend environment template
│   ├── package.json          # Backend dependencies and scripts
│   └── tsconfig.json         # TypeScript configuration
│
├── frontend/
│   ├── public/               # Public assets and HTML entry
│   ├── src/
│   │   ├── api/              # Axios REST client methods
│   │   ├── components/
│   │   │   ├── defense/      # Security hardening controls & budget allocation
│   │   │   ├── incidents/    # Live incident timeline and resolution
│   │   │   ├── layout/       # Navigation and header status bars
│   │   │   ├── multiplayer/  # Interactive role selector
│   │   │   ├── network/      # D3.js animated network topology graph
│   │   │   └── scoring/      # Real-time CISO vs Attacker leaderboard
│   │   ├── hooks/            # Custom hooks (useGameState with Socket.IO)
│   │   ├── pages/            # Views: Lobby, Game Arena, Dashboard
│   │   ├── types/            # TypeScript interfaces
│   │   ├── App.tsx           # Route mapping
│   │   └── index.tsx         # React root
│   ├── .env.example          # Frontend environment template
│   └── package.json          # Frontend dependencies and scripts
│
├── database/
│   ├── schema.sql            # PostgreSQL relational schema
│   └── seed.sql              # Core banking infrastructure seed data
├── .gitignore                # Git exclusions (.env, node_modules, sqlite)
└── README.md                 # Project documentation
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
