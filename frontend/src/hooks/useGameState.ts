import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState } from '../types';
import { getGameState } from '../api';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export const useGameState = (sessionId: string | null) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newAlert, setNewAlert] = useState<any | null>(null);

  const fetchGameState = useCallback(async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      const res = await getGameState(sessionId);
      setGameState(res.data.data);
    } catch (err) {
      setError('Failed to fetch game state');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    fetchGameState();

    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.emit('join_session', sessionId);

    newSocket.on('attack_alert', (data: any) => {
      setNewAlert({ type: 'attack', ...data });
      fetchGameState();
    });

    newSocket.on('attack_result', (data: any) => {
      setNewAlert({ type: 'result', ...data });
      fetchGameState();
    });

    newSocket.on('defense_update', (data: any) => {
      setNewAlert({ type: 'defense', ...data });
      fetchGameState();
    });

    return () => {
      newSocket.disconnect();
    };
  }, [sessionId, fetchGameState]);

  return {
    gameState,
    socket,
    loading,
    error,
    newAlert,
    fetchGameState
  };
};