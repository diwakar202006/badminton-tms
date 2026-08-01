const Court = require('../models/Court');

// All clients (viewer, central dashboard, court scorer) receive the same
// 'courts:update' broadcast - see matchController's broadcastCourts(). This
// handler mainly exists to send the initial snapshot on connect and to keep
// the door open for room-based scoping later (e.g. per-court rooms) without
// changing the frontend contract.
module.exports = function registerSocketHandlers(io) {
  io.on('connection', async (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    try {
      const courts = await Court.find().sort({ number: 1 }).populate('currentMatch').populate('nextMatch');
      socket.emit('courts:update', { courts });
    } catch (err) {
      console.error('Failed to send initial court snapshot:', err.message);
    }

    // Optional: clients can join a room for their specific court, useful if
    // this app grows and you want to scope emits instead of broadcasting to all.
    socket.on('court:join', (courtNumber) => {
      socket.join(`court-${courtNumber}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
