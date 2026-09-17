import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { config } from './config';

import assetsRouter from './routes/assets';
import sessionsRouter from './routes/sessions';
import incidentsRouter from './routes/incidents';
import defenseRouter from './routes/defense';
import vulnerabilitiesRouter from './routes/vulnerabilities';
import gameRouter from './routes/game';
import playersRouter from './routes/players';
import { initializeSocket } from './websocket/socketHandler';
import { setIO } from './services/incidentManager';

dotenv.config();

const allowedOrigins = [
  'http://localhost:3000',
  'https://cyberwar-banking-defense.vercel.app',
  process.env.FRONTEND_URL || ''
];

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true
}));
app.use(express.json());

app.use('/api/assets', assetsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/incidents', incidentsRouter);
app.use('/api/defense', defenseRouter);
app.use('/api/vulnerabilities', vulnerabilitiesRouter);
app.use('/api/game', gameRouter);
app.use('/api/players', playersRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Cyberwar Banking Defense API running' });
});

initializeSocket(io);
setIO(io);

httpServer.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port}`);
});

export { io };