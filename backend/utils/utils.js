const socket = require('../socket/socket');

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

const emitNotification = (receivers, message) => {
    const io = socket.getIO();
    if (!io) {
        console.error("Socket.IO instance not found.");
        return;
    }

    io.emit('send-notification', {
        receivers,
        message,
    });
};

module.exports = { calculateDate, emitNotification };