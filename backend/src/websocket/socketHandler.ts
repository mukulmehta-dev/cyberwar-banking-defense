import { Server, Socket } from 'socket.io';

export const initializeSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join a game session room
    socket.on('join_session', (sessionId: string) => {
      socket.join(sessionId);
      console.log(`Client ${socket.id} joined session ${sessionId}`);
      socket.emit('joined', { message: `Joined session ${sessionId}` });
    });

    // Leave a game session room
    socket.on('leave_session', (sessionId: string) => {
      socket.leave(sessionId);
      console.log(`Client ${socket.id} left session ${sessionId}`);
    });

    // Attack event broadcast
    socket.on('attack_launched', (data: any) => {
      io.to(data.sessionId).emit('attack_alert', {
        type: data.attack_type,
        asset: data.targeted_asset,
        severity: data.severity,
        timestamp: new Date().toISOString()
      });
    });

    // Defense event broadcast
    socket.on('defense_applied', (data: any) => {
      io.to(data.sessionId).emit('defense_update', {
        measure: data.measure_type,
        asset: data.asset_id,
        effectiveness: data.effectiveness,
        timestamp: new Date().toISOString()
      });
    });

    // Incident resolved broadcast
    socket.on('incident_resolved', (data: any) => {
      io.to(data.sessionId).emit('incident_update', {
        incident_id: data.incident_id,
        resolution: data.resolution_type,
        cost: data.cost,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });
};