const { Server } = require('socket.io');
const { env } = require('../config/env');
const { verifyAccessToken } = require('./jwt');

let io;

function getTokenFromHandshake(socket) {
  return (
    socket.handshake.auth?.token ||
    socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, '') ||
    ''
  );
}

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: env.clientOrigins,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = getTokenFromHandshake(socket);
    if (!token) return next();

    try {
      const payload = verifyAccessToken(token);
      socket.userId = payload.sub;
      return next();
    } catch (error) {
      return next();
    }
  });

  io.on('connection', (socket) => {
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    socket.emit('realtime:connected', {
      connectedAt: new Date().toISOString(),
      userScoped: Boolean(socket.userId),
    });
  });

  return io;
}

function emitToUser(userId, event, payload) {
  if (!io || !userId) return;
  io.to(`user:${userId}`).emit(event, payload);
}

module.exports = {
  initSocket,
  emitToUser,
};
