import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Game
export const startGame = (data: { session_name: string; total_budget: number; max_rounds: number }) =>
  API.post('/game/start', data);

export const nextRound = (session_id: string) =>
  API.post('/game/round/next', { session_id });

export const getGameState = (sessionId: string) =>
  API.get(`/game/state/${sessionId}`);

export const endGame = (session_id: string) =>
  API.post('/game/end', { session_id });

export const getScores = (sessionId: string) =>
  API.get(`/game/scores/${sessionId}`);

export const triggerAttack = (session_id: string, round_id: number) =>
  API.post('/game/attack/trigger', { session_id, round_id });

// Assets
export const getAssets = () =>
  API.get('/assets');

export const updateAssetSecurity = (id: string, security_level: number) =>
  API.patch(`/assets/${id}/security`, { security_level });

// Sessions
export const getSessions = () =>
  API.get('/sessions');

// Incidents
export const getIncidents = (session_id: string) =>
  API.get('/incidents', { params: { session_id } });

export const resolveIncident = (id: string, data: any) =>
  API.post(`/incidents/${id}/resolve`, data);

export const getEventLog = (sessionId: string) =>
  API.get(`/incidents/events/${sessionId}`);

// Defense
export const getSecurityMeasures = (session_id: string) =>
  API.get('/defense/measures', { params: { session_id } });

export const applySecurityMeasure = (data: any) =>
  API.post('/defense/measures', data);

export const getBudget = (sessionId: string) =>
  API.get(`/defense/budget/${sessionId}`);

export const updateBudget = (data: any) =>
  API.post('/defense/budget', data);

// Vulnerabilities
export const getVulnerabilities = () =>
  API.get('/vulnerabilities');

export const scanAsset = (assetId: string) =>
  API.post(`/vulnerabilities/scan/${assetId}`);

export const applyPatch = (data: any) =>
  API.post('/vulnerabilities/patch', data);

export const getHardeningOptions = () =>
  API.get('/vulnerabilities/hardening');
// Players
export const joinGame = (data: { session_id: string; player_name: string; role: string }) =>
  API.post('/players/join', data);

export const getPlayers = (sessionId: string) =>
  API.get(`/players/${sessionId}`);

export const updatePlayerScore = (id: string, score: number) =>
  API.patch(`/players/${id}/score`, { score });

export const leaveGame = (id: string) =>
  API.delete(`/players/${id}`);