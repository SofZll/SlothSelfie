const { getIO } = require('../socket/socket');
const userSocketMap = require('../socket/userSocketMap');

const calculateDate = (date, minusTime) => {
    const newDate = new Date(date);
    switch (minusTime) {
        case '0':
            newDate.setHours(0, 8, 0, 0);
            break;
        case '1440':
            newDate.setDate(newDate.getDate() - 1);
            newDate.setHours(0, 8, 0, 0);
            break;
        default:
            newDate.setMinutes(newDate.getMinutes() - parseInt(minusTime));
            break;
    }
    return date;
};

const emitNotification = (sender, receivers, message) => {
    const io = getIO();
    if (!io) {
        console.error("Socket.IO instance not found.");
        return;
    }

    receivers.forEach(receiver => {
        console.log('userSocketMap:', userSocketMap);
        const receiverSocketId = userSocketMap[receiver];
        if (receiverSocketId) {
            console.log(`Sending notification to ${receiver}: ${message}`);
            io.to(receiverSocketId).emit('notification', {
                title: 'New notification',
                sender: { username: sender },
                body: message,
                icon: 'icon_url',
            });
        } else {
            console.error(`Receiver ${receiver} is not connected.`);
        }
    });
};

module.exports = { calculateDate, emitNotification };