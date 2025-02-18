const { getIO } = require('../socket/socket');
const { pushNotification } = require('../services/pushNotification');
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

/**
 * La funzione per inviare la notifica, al momento viene chiamata solo dal job di Agenda
 * @param {*} sender l'utente che invia la notifica
 * @param {*} receivers gli utenti che ricevono la notifica
 * @param {*} message il messaggio della notifica
 * @param {*} type può essere 'email' o 'OS'
 */
const emitNotification = (sender, receivers, message, type) => {
    const io = getIO();
    if (!io) {
        console.error("Socket.IO instance not found.");
        return;
    }

    receivers.forEach(receiver => {
        if (type.includes('OS')) {
            console.log('userSocketMap:', userSocketMap);
            const receiverSocketIds = userSocketMap[receiver]; // se l'utente ha più dispositivi connessi
            if (receiverSocketIds && receiverSocketIds.length > 0) {
                console.log(`Sending notification to ${receiver}: ${message}`);
                receiverSocketIds.forEach(receiverSocketId => {
                    io.to(receiverSocketId).emit('notification', {
                        title: 'New notification',
                        sender: { username: sender },
                        body: message,
                    });
                });
            } else {
                pushNotification(sender, receiver, message);
            }
        } elif (type.includes('email')) {
            console.log(`Sending email notification to ${receiver}: ${message}`);

        }
    });
};

module.exports = { calculateDate, emitNotification };