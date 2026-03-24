const socketIO = require('socket.io');

const initSocket = (server) => {
    const io = socketIO(server, {
        cors: {
            origin: true,
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket) => {
        console.log(`🔌 Socket connected: ${socket.id}`);

        // User joins their personal room by userId
        socket.on('join', (userId) => {
            socket.join(userId);
            console.log(`👤 User ${userId} joined room`);
        });

        socket.on('disconnect', () => {
            console.log(`❌ Socket disconnected: ${socket.id}`);
        });
    });

    return io;
};

module.exports = initSocket;
